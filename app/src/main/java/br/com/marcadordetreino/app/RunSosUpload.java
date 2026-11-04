package br.com.marcadordetreino.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.location.Location;
import android.os.SystemClock;
import android.util.Log;
import org.json.JSONObject;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * SOS pilot: uploads a recent GPS fix from the already-running foreground
 * tracking service only after explicit administrator consent.
 * Does not contact emergency services or send text messages.
 */
final class RunSosUpload {
    private static final String STORAGE="gold_trainer_sos_private";
    private static final String ENDPOINT="https://marcador-de-treino-ckcg.hatchable.site/api/sos/background-upload";
    private static final ExecutorService WORKER=Executors.newSingleThreadExecutor();
    private static final AtomicBoolean IN_FLIGHT=new AtomicBoolean(false);
    private static long lastAttempt=0;
    private RunSosUpload(){}

    private static SharedPreferences prefs(Context c){
        return c.getApplicationContext().getSharedPreferences(STORAGE,Context.MODE_PRIVATE);
    }
    static boolean activate(Context c,JSONObject params){
        try{
            long id=params.getLong("id"),expires=params.getLong("expiresAt");
            String secret=params.getString("secret");
            if(id<1 || secret==null || !secret.matches("[0-9a-f]{64}") ||
               expires<=System.currentTimeMillis() ||
               expires>System.currentTimeMillis()+4L*3600L*1000L+120000L)return false;
            prefs(c).edit().putLong("id",id).putString("secret",secret).putLong("expires",expires).commit();
            lastAttempt=0;
            return true;
        }catch(Exception e){return false;}
    }
    static void deactivate(Context c){
        prefs(c).edit().clear().commit();
    }
    static void maybeSend(Context context,Location loc){
        if(loc==null||!loc.hasAccuracy()||loc.getAccuracy()>100f||
           Math.abs(System.currentTimeMillis()-loc.getTime())>30000L ||
           loc.getLatitude()<-90||loc.getLatitude()>90 ||
           loc.getLongitude()<-180||loc.getLongitude()>180)return;
        SharedPreferences p=prefs(context);
        long id=p.getLong("id",-1),expires=p.getLong("expires",0);
        String secret=p.getString("secret","");
        if(id<1||secret.length()!=64)return;
        if(System.currentTimeMillis()>expires){
            deactivate(context);
            return;
        }
        long now=SystemClock.elapsedRealtime();
        if(now-lastAttempt<6500L||!IN_FLIGHT.compareAndSet(false,true))return;
        lastAttempt=now;
        final double latitude=loc.getLatitude(),longitude=loc.getLongitude(),accuracy=loc.getAccuracy();
        final long timestamp=loc.getTime();
        final Context app=context.getApplicationContext();
        WORKER.execute(()->{
            HttpURLConnection connection=null;
            try{
                JSONObject point=new JSONObject();
                point.put("lat",latitude);point.put("lon",longitude);
                point.put("accuracy",accuracy);point.put("timestamp",timestamp);
                JSONObject body=new JSONObject();
                body.put("id",id);body.put("secret",secret);body.put("position",point);
                connection=(HttpURLConnection)new URL(ENDPOINT).openConnection();
                connection.setRequestMethod("POST");
                connection.setConnectTimeout(5000);
                connection.setReadTimeout(5000);
                connection.setDoOutput(true);
                connection.setRequestProperty("Content-Type","application/json; charset=utf-8");
                connection.setRequestProperty("Cache-Control","no-store");
                try(OutputStream out=connection.getOutputStream()){
                    out.write(body.toString().getBytes(StandardCharsets.UTF_8));
                }
                int status=connection.getResponseCode();
                if(status==401||status==403||status==410)deactivate(app);
            }catch(Exception e){
                Log.w("GoldTrainerSOS","GPS não enviado; conexão indisponível");
            }finally{
                if(connection!=null)connection.disconnect();
                IN_FLIGHT.set(false);
            }
        });
    }
}
