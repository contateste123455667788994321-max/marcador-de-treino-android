package br.com.marcadordetreino.app;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONObject;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/** Persiste passos, meta e historico por dia. */
final class StepRepository {
    private final SharedPreferences prefs;
    StepRepository(Context context) {
        prefs=context.getApplicationContext().getSharedPreferences("native_steps_v1",Context.MODE_PRIVATE);
        if(!prefs.contains("day")) prefs.edit().putString("day",today()).apply();
    }
    private String today(){return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());}
    synchronized void rollover(){
        String current=today(),before=prefs.getString("day",current);
        if(before.equals(current))return;
        JSONArray old;
        try{old=new JSONArray(prefs.getString("history","[]"));}catch(Exception e){old=new JSONArray();}
        JSONArray result=new JSONArray();
        for(int i=0;i<old.length();i++){
            JSONObject rec=old.optJSONObject(i);
            if(rec!=null&&!before.equals(rec.optString("date")))result.put(rec);
        }
        JSONObject record=new JSONObject();
        try{
            record.put("date",before);
            record.put("steps",prefs.getInt("steps",0));
            record.put("goal",goal());
            record.put("weight",weight());
            record.put("kcal",kcal(prefs.getInt("steps",0),weight()));
            record.put("reached",prefs.getInt("steps",0)>=goal());
            result.put(record);
        }catch(Exception ignored){}
        JSONArray tail=new JSONArray();
        for(int i=Math.max(0,result.length()-180);i<result.length();i++)tail.put(result.opt(i));
        // Keep the sensor baseline across midnight to avoid losing or double-counting the first steps.
        prefs.edit().putString("day",current).putInt("steps",0).putBoolean("alerted",false).putString("history",tail.toString()).apply();
    }
    synchronized int steps(){rollover();return prefs.getInt("steps",0);}
    synchronized int goal(){return prefs.getInt("goal",10000);}
    synchronized double weight(){return Double.longBitsToDouble(prefs.getLong("weight",Double.doubleToLongBits(70.0)));}
    synchronized boolean enabled(){return prefs.getBoolean("enabled",false);}
    synchronized boolean alerted(){return prefs.getBoolean("alerted",false);}
    synchronized void alerted(boolean value){prefs.edit().putBoolean("alerted",value).apply();}
    synchronized void enabled(boolean value){
        SharedPreferences.Editor e=prefs.edit().putBoolean("enabled",value);
        if(!value)e.remove("lastSensorTotal");
        e.apply();
    }
    synchronized void goal(int value){
        if(value<100||value>100000)return;
        prefs.edit().putInt("goal",value).putBoolean("alerted",steps()>=value).apply();
    }
    synchronized void weight(double value){
        if(value<30||value>300)return;
        prefs.edit().putLong("weight",Double.doubleToLongBits(value)).apply();
    }
    synchronized int sensorUpdate(long sensorTotal){
        rollover();
        long previous=prefs.getLong("lastSensorTotal",-1);
        long difference=previous<0||sensorTotal<previous?0:Math.min(sensorTotal-previous,100000);
        int now=(int)Math.min(1000000,(long)steps()+difference);
        prefs.edit().putLong("lastSensorTotal",sensorTotal).putInt("steps",now).apply();
        return now;
    }
    static int kcal(int steps,double kg){return (int)Math.round(Math.max(0,steps)*.05*kg/70.);}
    synchronized String json(boolean sensorAvailable){
        rollover();
        JSONObject out=new JSONObject();
        try{
            out.put("day",today());
            out.put("steps",steps());
            out.put("goal",goal());
            out.put("weight",weight());
            out.put("enabled",enabled());
            out.put("status",!sensorAvailable?"unsupported":enabled()?"active":"inactive");
            out.put("history",new JSONArray(prefs.getString("history","[]")));
        }catch(Exception ignored){}
        return out.toString();
    }
}
