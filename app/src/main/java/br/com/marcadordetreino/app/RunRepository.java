package br.com.marcadordetreino.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.location.Location;
import android.os.SystemClock;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.Locale;

/**
 * Offline-only running sessions; lat/long never uploaded by this class.
 * Elapsed time excludes pauses. The session is saved on every accepted location.
 */
final class RunRepository {
    private final SharedPreferences pref;
    RunRepository(Context c){pref=c.getApplicationContext().getSharedPreferences("mt_running_native_v1",Context.MODE_PRIVATE);}
    private JSONObject session(){
        try{return new JSONObject(pref.getString("session","{}"));}catch(Exception ex){return new JSONObject();}
    }
    private JSONArray history(){
        try{return new JSONArray(pref.getString("history","[]"));}catch(Exception ex){return new JSONArray();}
    }
    private void save(JSONObject state){pref.edit().putString("session",state.toString()).commit();}
    private static long now(){return SystemClock.elapsedRealtime();}
    private static void put(JSONObject json,String key,Object value){try{json.put(key,value);}catch(Exception ignored){}}
    private static double finite(double n){return Double.isFinite(n)?n:0;}
    synchronized boolean isActive(){return session().optBoolean("active",false);}
    synchronized boolean isRunning(){JSONObject s=session();return s.optBoolean("active",false)&&s.optBoolean("running",false);}
    synchronized boolean isPaused(){JSONObject s=session();return s.optBoolean("active",false)&&!s.optBoolean("running",false);}
    synchronized void start(double weight){
        if(isActive())return;
        JSONObject s=new JSONObject();
        put(s,"active",true);put(s,"running",true);
        put(s,"startWall",System.currentTimeMillis());
        put(s,"sinceElapsed",now());put(s,"sinceWall",System.currentTimeMillis());
        put(s,"elapsedSaved",0);put(s,"distanceMeters",0);
        put(s,"lastLat",JSONObject.NULL);put(s,"lastLon",JSONObject.NULL);
        put(s,"lastAcceptedElapsed",0);put(s,"hasFix",false);
        put(s,"lastAccuracy",0);
        put(s,"weight",weight>=30&&weight<=300?weight:70);
        put(s,"route",new JSONArray());put(s,"receivedLocations",0);
        save(s);
    }
    private static long elapsed(JSONObject s){
        long base=Math.max(0,s.optLong("elapsedSaved",0));
        if(!s.optBoolean("running"))return base;
        long since=s.optLong("sinceElapsed",now());
        long extra=now()-since;
        if(extra<0||extra>24L*60*60*1000){
            // Possible system reboot; use wall-clock fallback capped to a reasonable duration.
            extra=Math.min(24L*60*60*1000,Math.max(0,System.currentTimeMillis()-s.optLong("sinceWall",System.currentTimeMillis())));
        }
        return base+Math.max(0,extra);
    }
    synchronized void pause(){
        JSONObject s=session();
        if(!s.optBoolean("active")||!s.optBoolean("running"))return;
        put(s,"elapsedSaved",elapsed(s));put(s,"running",false);
        put(s,"lastLat",JSONObject.NULL);put(s,"lastLon",JSONObject.NULL);
        save(s);
    }
    synchronized void resume(){
        JSONObject s=session();if(!s.optBoolean("active")||s.optBoolean("running"))return;
        put(s,"running",true);put(s,"sinceElapsed",now());put(s,"sinceWall",System.currentTimeMillis());
        put(s,"lastLat",JSONObject.NULL);put(s,"lastLon",JSONObject.NULL);
        save(s);
    }
    synchronized boolean location(Location loc){
        JSONObject s=session();
        if(!s.optBoolean("active")||!s.optBoolean("running"))return false;
        if(loc==null||!loc.hasAccuracy()||loc.getAccuracy()>45)return false;
        if(loc.getLatitude()<-90||loc.getLatitude()>90||loc.getLongitude()<-180||loc.getLongitude()>180)return false;
        long age=now()-(loc.getElapsedRealtimeNanos()/1_000_000L);
        if(age>18000||age< -3000)return false;
        double lat=loc.getLatitude(),lon=loc.getLongitude();
        long lastElapsed=s.optLong("lastAcceptedElapsed",0);
        JSONArray route=s.optJSONArray("route");if(route==null)route=new JSONArray();
        double meters=0;
        if(!s.isNull("lastLat")&&!s.isNull("lastLon")){
            float[] arr=new float[1];
            Location.distanceBetween(s.optDouble("lastLat"),s.optDouble("lastLon"),lat,lon,arr);
            meters=finite(arr[0]);
            long gap=Math.max(0,now()-lastElapsed);
            // Ignore GPS jitter below 3 m, giant jumps and implausibly fast fixes.
            if(meters<3)return false;
            if(gap<800||gap>0&&meters/(gap/1000.0)>11.5||meters>300)return false;
            put(s,"distanceMeters",s.optDouble("distanceMeters",0)+meters);
        }
        put(s,"lastLat",lat);put(s,"lastLon",lon);
        put(s,"lastAcceptedElapsed",now());put(s,"lastAccuracy",loc.getAccuracy());
        put(s,"hasFix",true);put(s,"receivedLocations",s.optInt("receivedLocations",0)+1);
        JSONArray point=new JSONArray();
        try{point.put(Math.round(lat*1e6)/1e6);point.put(Math.round(lon*1e6)/1e6);}catch(org.json.JSONException e){return false;}
        point.put(System.currentTimeMillis());point.put(Math.round(loc.getAccuracy()));
        if(route.length()<8000)route.put(point);
        put(s,"route",route);
        save(s);
        return true;
    }
    static double calories(double distanceMeters,double weight){
        // Approximate net running energy: ~1 kcal per kg per km.
        return Math.max(0,distanceMeters)/1000.0*Math.max(30,weight);
    }
    static JSONObject summary(JSONObject s,boolean includeRoute){
        JSONObject out=new JSONObject();
        long duration=elapsed(s);
        double dist=Math.max(0,s.optDouble("distanceMeters",0)),weight=s.optDouble("weight",70);
        put(out,"active",s.optBoolean("active",false));put(out,"running",s.optBoolean("running",false));
        put(out,"durationMs",duration);put(out,"distanceMeters",Math.round(dist*10)/10.0);
        put(out,"calories",Math.round(calories(dist,weight)));
        put(out,"paceSecKm",dist>=50?Math.round(duration/1000.0/(dist/1000.0)):0);
        put(out,"startWall",s.optLong("startWall",0));
        put(out,"weight",weight);put(out,"gpsFix",s.optBoolean("hasFix",false));
        put(out,"gpsAccuracy",s.optDouble("lastAccuracy",0));
        put(out,"points",s.optJSONArray("route")==null?0:s.optJSONArray("route").length());
        if(includeRoute)put(out,"route",s.optJSONArray("route")==null?new JSONArray():s.optJSONArray("route"));
        return out;
    }
    synchronized String json(boolean gpsOn,boolean permission){
        JSONObject out=summary(session(),true);
        put(out,"gpsEnabled",gpsOn);
        put(out,"permissionGranted",permission);
        return out.toString();
    }
    synchronized String finish(){
        JSONObject s=session();
        if(!s.optBoolean("active",false))return "{}";
        if(s.optBoolean("running",false)){put(s,"elapsedSaved",elapsed(s));put(s,"running",false);}
        put(s,"active",false);
        JSONObject result=summary(s,true);
        put(result,"endedAt",System.currentTimeMillis());
        JSONArray hist=history();
        hist.put(result);
        JSONArray tail=new JSONArray();
        for(int i=Math.max(0,hist.length()-80);i<hist.length();i++)tail.put(hist.opt(i));
        pref.edit().putString("history",tail.toString()).putString("session","{}").commit();
        return result.toString();
    }
    synchronized String historyJson(){
        JSONArray hist=history();
        JSONObject result=new JSONObject();
        put(result,"history",hist);
        double bestDist=0;long bestTime=0,bestPace=Long.MAX_VALUE;
        for(int i=0;i<hist.length();i++){
            JSONObject row=hist.optJSONObject(i);if(row==null)continue;
            bestDist=Math.max(bestDist,row.optDouble("distanceMeters",0));
            bestTime=Math.max(bestTime,row.optLong("durationMs",0));
            long p=row.optLong("paceSecKm",0);
            if(p>0&&row.optDouble("distanceMeters",0)>=500)bestPace=Math.min(bestPace,p);
        }
        put(result,"bestDistance",bestDist);put(result,"bestDuration",bestTime);
        put(result,"bestPace",bestPace==Long.MAX_VALUE?0:bestPace);
        return result.toString();
    }
}
