package br.com.marcadordetreino.app;

import android.Manifest;
import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.content.pm.ServiceInfo;
import android.graphics.Color;
import android.location.*;
import android.os.*;

/** Collects GPS fixes in a foreground service after the user starts a run. */
public final class RunTrackingService extends Service implements LocationListener {
    static final String START="br.com.marcadordetreino.run.START";
    static final String PAUSE="br.com.marcadordetreino.run.PAUSE";
    static final String RESUME="br.com.marcadordetreino.run.RESUME";
    static final String FINISH="br.com.marcadordetreino.run.FINISH";
    private static final String CHANNEL="mt_running_gps";
    private static final int NOTIFICATION_ID=4104;
    private RunRepository data;
    private LocationManager manager;
    private NotificationManager notificationManager;
    private Handler handler;
    private boolean listening=false;
    private long lastNotice=0;
    private final Runnable ticker=new Runnable(){
        @Override public void run(){
            if(data!=null&&data.isActive())updateNotice();
            if(handler!=null)handler.postDelayed(this,12000);
        }
    };
    @Override public void onCreate(){
        super.onCreate();
        data=new RunRepository(this);
        manager=(LocationManager)getSystemService(LOCATION_SERVICE);
        notificationManager=(NotificationManager)getSystemService(NOTIFICATION_SERVICE);
        if(Build.VERSION.SDK_INT>=26){
            NotificationChannel channel=new NotificationChannel(CHANNEL,"Corrida por GPS",NotificationManager.IMPORTANCE_LOW);
            channel.setDescription("Mapa, distância e cronômetro da corrida em segundo plano");
            notificationManager.createNotificationChannel(channel);
        }
        handler=new Handler(Looper.getMainLooper());
        handler.postDelayed(ticker,12000);
    }
    private boolean permitted(){
        return checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)==PackageManager.PERMISSION_GRANTED;
    }
    @Override public int onStartCommand(Intent intent,int flags,int startId){
        String action=intent==null?START:intent.getAction();
        if(FINISH.equals(action)){
            data.finish();
            stopListening();
            stopForeground(STOP_FOREGROUND_REMOVE);
            stopSelf();
            return START_NOT_STICKY;
        }
        if(PAUSE.equals(action)){
            data.pause();stopListening();
            if(data.isActive())startOrUpdateForeground();
            return START_STICKY;
        }
        if(!permitted()){
            stopListening();stopSelf();
            return START_NOT_STICKY;
        }
        if(RESUME.equals(action))data.resume();
        if(START.equals(action)&&!data.isActive()){
            // Initial session must be created by MainActivity on a direct user action.
            stopSelf();return START_NOT_STICKY;
        }
        if(!data.isActive()){stopSelf();return START_NOT_STICKY;}
        try{
            startOrUpdateForeground();
            if(data.isRunning())startListening();
            else stopListening();
        }catch(Exception e){
            data.pause();stopListening();stopSelf();
            return START_NOT_STICKY;
        }
        return START_STICKY;
    }
    private void startListening(){
        if(listening||manager==null||!permitted())return;
        try{
            boolean requested=false;
            if(manager.isProviderEnabled(LocationManager.GPS_PROVIDER)){
                manager.requestLocationUpdates(LocationManager.GPS_PROVIDER,1200,2f,this,Looper.getMainLooper());
                requested=true;
            }
            if(manager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)){
                manager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER,2800,4f,this,Looper.getMainLooper());
                requested=true;
            }
            listening=requested;
        }catch(SecurityException ignored){listening=false;}
    }
    private void stopListening(){
        if(manager!=null)try{manager.removeUpdates(this);}catch(SecurityException ignored){}
        listening=false;
    }
    @Override public void onLocationChanged(Location location){
        if(!data.isRunning())return;
        if(data.location(location)&&SystemClock.elapsedRealtime()-lastNotice>12000)updateNotice();
    }
    @Override public void onProviderEnabled(String provider){if(data.isRunning())startListening();}
    @Override public void onProviderDisabled(String provider){stopListening();if(data.isRunning())startListening();}
    private PendingIntent openApp(){
        Intent intent=new Intent(this,MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP|Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(this,170,intent,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
    }
    private PendingIntent action(String name,int code){
        Intent i=new Intent(this,RunTrackingService.class).setAction(name);
        return PendingIntent.getService(this,code,i,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
    }
    private Notification notification(){
        boolean running=data.isRunning();
        String raw=data.json(true,permitted());
        double dist=0;long elapsed=0;
        try{
            org.json.JSONObject s=new org.json.JSONObject(raw);
            dist=s.optDouble("distanceMeters",0);
            elapsed=s.optLong("durationMs",0);
        }catch(Exception ignored){}
        String content=String.format(java.util.Locale.forLanguageTag("pt-BR"),"%.2f km • %02d:%02d • %s",
            dist/1000,elapsed/60000,(elapsed/1000)%60,running?"GPS registrando":"Pausada");
        Notification.Builder b=new Notification.Builder(this,CHANNEL)
            .setContentTitle(running?"Corrida em andamento":"Corrida pausada")
            .setContentText(content).setContentIntent(openApp()).setSmallIcon(R.drawable.app_icon)
            .setOngoing(true).setOnlyAlertOnce(true).setColor(Color.rgb(166,255,0))
            .setVisibility(Notification.VISIBILITY_PUBLIC)
            .addAction(new Notification.Action.Builder(
                running?android.R.drawable.ic_media_pause:android.R.drawable.ic_media_play,
                running?"Pausar":"Retomar",action(running?PAUSE:RESUME,171)).build())
            .addAction(new Notification.Action.Builder(
                android.R.drawable.ic_menu_close_clear_cancel,"Finalizar",action(FINISH,172)).build());
        return b.build();
    }
    private void startOrUpdateForeground(){
        Notification n=notification();
        if(Build.VERSION.SDK_INT>=29)startForeground(NOTIFICATION_ID,n,ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        else startForeground(NOTIFICATION_ID,n);
        lastNotice=SystemClock.elapsedRealtime();
    }
    private void updateNotice(){
        if(!data.isActive())return;
        try{notificationManager.notify(NOTIFICATION_ID,notification());lastNotice=SystemClock.elapsedRealtime();}
        catch(Exception ignored){}
    }
    @Override public void onDestroy(){
        stopListening();
        if(handler!=null)handler.removeCallbacks(ticker);
        super.onDestroy();
    }
    @Override public IBinder onBind(Intent intent){return null;}
}
