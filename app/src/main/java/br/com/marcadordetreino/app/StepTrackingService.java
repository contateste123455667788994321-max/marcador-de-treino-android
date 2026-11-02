package br.com.marcadordetreino.app;

import android.Manifest;
import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.content.pm.ServiceInfo;
import android.graphics.Color;
import android.hardware.*;
import android.os.*;
import java.util.Locale;

public final class StepTrackingService extends Service implements SensorEventListener {
    static final String START="br.com.marcadordetreino.START_STEPS";
    static final String STOP="br.com.marcadordetreino.STOP_STEPS";
    private static final String TRACK_CHANNEL="step_tracking",GOAL_CHANNEL="step_goal";
    private static final int TRACK_ID=2001,GOAL_ID=2002;
    private SensorManager manager;
    private Sensor stepSensor;
    private StepRepository repository;
    private NotificationManager notifications;
    private Handler handler;
    private boolean registered=false;
    private long lastNotification=0L;
    private final Runnable ticker=new Runnable(){
        @Override public void run(){
            if(repository!=null&&repository.enabled()){repository.rollover();updateNotification();}
            if(handler!=null)handler.postDelayed(this,60_000);
        }
    };
    @Override public void onCreate(){
        super.onCreate();
        repository=new StepRepository(this);
        manager=(SensorManager)getSystemService(Context.SENSOR_SERVICE);
        if(manager!=null)stepSensor=manager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
        notifications=(NotificationManager)getSystemService(Context.NOTIFICATION_SERVICE);
        handler=new Handler(Looper.getMainLooper());
        if(Build.VERSION.SDK_INT>=26){
            NotificationChannel tracking=new NotificationChannel(TRACK_CHANNEL,"Contador de passos ativo",NotificationManager.IMPORTANCE_LOW);
            tracking.setDescription("Conta os passos com o celular bloqueado");
            notifications.createNotificationChannel(tracking);
            NotificationChannel goal=new NotificationChannel(GOAL_CHANNEL,"Metas de passos",NotificationManager.IMPORTANCE_DEFAULT);
            notifications.createNotificationChannel(goal);
        }
        handler.postDelayed(ticker,60_000);
    }
    @Override public int onStartCommand(Intent intent,int flags,int startId){
        if(intent!=null&&STOP.equals(intent.getAction())){
            repository.enabled(false);
            stopSensor();
            stopForeground(STOP_FOREGROUND_REMOVE);
            stopSelf();
            return START_NOT_STICKY;
        }
        if(stepSensor==null||Build.VERSION.SDK_INT>=29&&checkSelfPermission(Manifest.permission.ACTIVITY_RECOGNITION)!=PackageManager.PERMISSION_GRANTED){
            repository.enabled(false);stopSelf();return START_NOT_STICKY;
        }
        repository.enabled(true);
        try{
            if(Build.VERSION.SDK_INT>=34)startForeground(TRACK_ID,trackingNotification(),ServiceInfo.FOREGROUND_SERVICE_TYPE_HEALTH);
            else startForeground(TRACK_ID,trackingNotification());
            if(!registered)registered=manager.registerListener(this,stepSensor,SensorManager.SENSOR_DELAY_NORMAL);
            if(!registered){repository.enabled(false);stopForeground(STOP_FOREGROUND_REMOVE);stopSelf();return START_NOT_STICKY;}
            updateNotification();
        }catch(Exception ex){repository.enabled(false);stopSensor();stopSelf();return START_NOT_STICKY;}
        return START_STICKY;
    }
    @Override public void onSensorChanged(SensorEvent event){
        if(event.sensor.getType()!=Sensor.TYPE_STEP_COUNTER||event.values.length==0)return;
        int before=repository.steps(),after=repository.sensorUpdate((long)event.values[0]);
        if(after!=before){
            if(after>=repository.goal()&&!repository.alerted())goalNotification(after);
            if(SystemClock.elapsedRealtime()-lastNotification>12000)updateNotification();
        }
    }
    @Override public void onAccuracyChanged(Sensor sensor,int accuracy){}
    private PendingIntent appIntent(){
        Intent open=new Intent(this,MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP|Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(this,11,open,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
    }
    private Notification trackingNotification(){
        String body=String.format(Locale.forLanguageTag("pt-BR"),"%d de %d passos hoje · %d kcal estimadas",
            repository.steps(),repository.goal(),StepRepository.kcal(repository.steps(),repository.weight()));
        return new Notification.Builder(this,TRACK_CHANNEL)
            .setContentTitle("Marcador de Treino · contando passos").setContentText(body)
            .setSmallIcon(R.drawable.app_icon).setContentIntent(appIntent()).setOngoing(true)
            .setOnlyAlertOnce(true).setColor(Color.rgb(166,255,0)).build();
    }
    private void updateNotification(){
        lastNotification=SystemClock.elapsedRealtime();
        if(notifications!=null)notifications.notify(TRACK_ID,trackingNotification());
    }
    private void goalNotification(int steps){
        if(Build.VERSION.SDK_INT>=33&&checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)return;
        Notification n=new Notification.Builder(this,GOAL_CHANNEL)
            .setContentTitle("Meta de passos alcançada! 💚")
            .setContentText("Parabéns! Você fez "+steps+" passos hoje. Continue evoluindo!")
            .setSmallIcon(R.drawable.app_icon).setContentIntent(appIntent()).setAutoCancel(true).build();
        notifications.notify(GOAL_ID,n);
        repository.alerted(true);
    }
    private void stopSensor(){if(registered&&manager!=null)manager.unregisterListener(this);registered=false;}
    @Override public void onDestroy(){if(handler!=null)handler.removeCallbacks(ticker);stopSensor();super.onDestroy();}
    @Override public IBinder onBind(Intent intent){return null;}
}
