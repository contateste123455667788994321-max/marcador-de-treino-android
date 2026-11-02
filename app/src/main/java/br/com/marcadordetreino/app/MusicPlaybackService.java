package br.com.marcadordetreino.app;

import android.app.*;
import android.content.*;
import android.content.pm.ServiceInfo;
import android.graphics.Color;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.*;
import org.json.JSONObject;
import java.util.List;
import java.util.Random;

/** MediaPlayer em foreground: continua durante o treino e com a tela apagada. */
public final class MusicPlaybackService extends Service {
    static final String PLAY="br.com.marcadordetreino.MUSIC_PLAY";
    static final String PAUSE="br.com.marcadordetreino.MUSIC_PAUSE";
    static final String TOGGLE="br.com.marcadordetreino.MUSIC_TOGGLE";
    static final String NEXT="br.com.marcadordetreino.MUSIC_NEXT";
    static final String PREVIOUS="br.com.marcadordetreino.MUSIC_PREVIOUS";
    static final String STOP="br.com.marcadordetreino.MUSIC_STOP";
    static final String SHUFFLE="br.com.marcadordetreino.MUSIC_SHUFFLE";
    static final String REPEAT="br.com.marcadordetreino.MUSIC_REPEAT";
    private static final String CHANNEL="mt_music_playback";
    private static final int NOTIFICATION_ID=3020;
    private static volatile MusicPlaybackService instance;
    private final Random random=new Random();
    private MusicRepository library;
    private SharedPreferences preferences;
    private MediaPlayer player;
    private AudioManager audio;
    private AudioManager.OnAudioFocusChangeListener focusListener;
    private AudioFocusRequest focusRequest;
    private boolean ready=false,playing=false;
    private String error="";
    private int index=-1;
    private int lastPosition=0;

    @Override public void onCreate(){
        super.onCreate();
        library=new MusicRepository(this);
        preferences=getSharedPreferences("mt_music_state",MODE_PRIVATE);
        audio=(AudioManager)getSystemService(AUDIO_SERVICE);
        index=preferences.getInt("index",-1);
        focusListener=change->{
            if(change==AudioManager.AUDIOFOCUS_LOSS||change==AudioManager.AUDIOFOCUS_LOSS_TRANSIENT)pausePlayback();
            else if(change==AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK&&player!=null)player.setVolume(.25f,.25f);
            else if(change==AudioManager.AUDIOFOCUS_GAIN&&player!=null)player.setVolume(1f,1f);
        };
        if(Build.VERSION.SDK_INT>=26){
            NotificationChannel channel=new NotificationChannel(CHANNEL,"Música durante o treino",NotificationManager.IMPORTANCE_LOW);
            channel.setDescription("Reprodução de música mesmo com o celular bloqueado");
            ((NotificationManager)getSystemService(NOTIFICATION_SERVICE)).createNotificationChannel(channel);
        }
        instance=this;
    }

    static String getState(Context context){
        MusicPlaybackService live=instance;
        return live!=null?live.snapshot():offlineSnapshot(context);
    }
    private static String offlineSnapshot(Context context){
        SharedPreferences prefs=context.getSharedPreferences("mt_music_state",MODE_PRIVATE);
        JSONObject o=new JSONObject();
        try{
            o.put("tracks",new MusicRepository(context).jsonTracks());
            o.put("index",prefs.getInt("index",-1));
            o.put("playing",false);
            o.put("ready",false);
            o.put("position",0);
            o.put("duration",0);
            o.put("shuffle",prefs.getBoolean("shuffle",false));
            o.put("repeat",prefs.getBoolean("repeat",false));
            o.put("error","");
        }catch(Exception ignored){}
        return o.toString();
    }
    private synchronized String snapshot(){
        JSONObject o=new JSONObject();
        try{
            o.put("tracks",library.jsonTracks());
            o.put("index",index);
            o.put("playing",playing&&player!=null&&player.isPlaying());
            o.put("ready",ready);
            o.put("position",player!=null&&ready?player.getCurrentPosition():lastPosition);
            o.put("duration",player!=null&&ready?player.getDuration():0);
            o.put("shuffle",preferences.getBoolean("shuffle",false));
            o.put("repeat",preferences.getBoolean("repeat",false));
            o.put("error",error);
        }catch(Exception ignored){}
        return o.toString();
    }
    @Override public int onStartCommand(Intent intent,int flags,int startId){
        String action=intent==null?TOGGLE:intent.getAction();
        if(STOP.equals(action)){
            releasePlayer();
            stopForeground(STOP_FOREGROUND_REMOVE);
            stopSelf();
            return START_NOT_STICKY;
        }
        try {
            if(PLAY.equals(action)||TOGGLE.equals(action)){
                int selected=intent!=null?intent.getIntExtra("index",-1):-1;
                if(selected>=0&&(index!=selected||player==null))playTrack(selected);
                else if(playing)pausePlayback();
                else resumePlayback();
            }else if(PAUSE.equals(action))pausePlayback();
            else if(NEXT.equals(action))step(1);
            else if(PREVIOUS.equals(action))step(-1);
            else if(SHUFFLE.equals(action))preferences.edit().putBoolean("shuffle",!preferences.getBoolean("shuffle",false)).apply();
            else if(REPEAT.equals(action))preferences.edit().putBoolean("repeat",!preferences.getBoolean("repeat",false)).apply();
            startOrUpdateForeground();
        }catch(Exception e){error="Não foi possível reproduzir este arquivo.";playing=false;startOrUpdateForeground();}
        return START_NOT_STICKY;
    }
    private void takeAudioFocus(){
        if(audio==null)return;
        if(Build.VERSION.SDK_INT>=26){
            if(focusRequest==null)focusRequest=new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                .setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build())
                .setOnAudioFocusChangeListener(focusListener).build();
            audio.requestAudioFocus(focusRequest);
        }else audio.requestAudioFocus(focusListener,AudioManager.STREAM_MUSIC,AudioManager.AUDIOFOCUS_GAIN);
    }
    private void releasePlayer(){
        if(player!=null){try{player.stop();}catch(Exception ignored){}player.release();player=null;}
        ready=false;playing=false;lastPosition=0;
        if(audio!=null){
            if(Build.VERSION.SDK_INT>=26&&focusRequest!=null)audio.abandonAudioFocusRequest(focusRequest);
            else audio.abandonAudioFocus(focusListener);
        }
    }
    private void playTrack(int newIndex){
        List<MusicRepository.Track> tracks=library.list();
        if(newIndex<0||newIndex>=tracks.size()){error="Música não encontrada";return;}
        releasePlayer();
        index=newIndex;
        preferences.edit().putInt("index",index).apply();
        error="";
        try{
            Uri uri=Uri.parse(tracks.get(index).uri);
            player=new MediaPlayer();
            player.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA)
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build());
            player.setWakeMode(getApplicationContext(),PowerManager.PARTIAL_WAKE_LOCK);
            player.setDataSource(this,uri);
            player.setOnCompletionListener(mp->{playing=false;step(1);});
            player.setOnErrorListener((mp,what,extra)->{error="Falha ao ler o áudio";playing=false;ready=false;startOrUpdateForeground();return false;});
            player.prepare();
            ready=true;takeAudioFocus();player.start();playing=true;
        }catch(Exception e){releasePlayer();error="Arquivo indisponível. Escolha novamente o áudio.";}
    }
    private void resumePlayback(){
        if(player!=null&&ready){takeAudioFocus();player.start();playing=true;error="";}
        else if(index>=0)playTrack(index);
        else if(!library.list().isEmpty())playTrack(0);
    }
    private void pausePlayback(){
        if(player!=null&&ready&&playing){lastPosition=player.getCurrentPosition();player.pause();}
        playing=false;startOrUpdateForeground();
    }
    private void step(int direction){
        List<MusicRepository.Track> tracks=library.list();if(tracks.isEmpty())return;
        boolean shuffle=preferences.getBoolean("shuffle",false);
        boolean repeat=preferences.getBoolean("repeat",false);
        int target;
        if(shuffle&&tracks.size()>1){do{target=random.nextInt(tracks.size());}while(target==index);}
        else{target=index+direction;if(target<0||target>=tracks.size()){
            if(!repeat){pausePlayback();return;}
            target=(target+tracks.size())%tracks.size();
        }}
        playTrack(target);
        startOrUpdateForeground();
    }
    private PendingIntent activityIntent(){
        Intent open=new Intent(this,MainActivity.class);
        open.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP|Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(this,80,open,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
    }
    private PendingIntent action(String command,int request){
        Intent intent=new Intent(this,MusicPlaybackService.class).setAction(command);
        return PendingIntent.getService(this,request,intent,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
    }
    private Notification notification(){
        List<MusicRepository.Track> tracks=library.list();
        String title=index>=0&&index<tracks.size()?tracks.get(index).name:"Marcador de Treino";
        Notification.Builder b=new Notification.Builder(this,CHANNEL)
            .setSmallIcon(R.drawable.app_icon).setColor(Color.rgb(166,255,0))
            .setContentTitle(title)
            .setContentText(playing?"Tocando durante o treino":"Música pausada")
            .setContentIntent(activityIntent()).setOnlyAlertOnce(true)
            .setVisibility(Notification.VISIBILITY_PUBLIC)
            .setOngoing(playing)
            .addAction(new Notification.Action.Builder(android.R.drawable.ic_media_previous,"Anterior",action(PREVIOUS,81)).build())
            .addAction(new Notification.Action.Builder(playing?android.R.drawable.ic_media_pause:android.R.drawable.ic_media_play,
                playing?"Pausar":"Tocar",action(playing?PAUSE:PLAY,82)).build())
            .addAction(new Notification.Action.Builder(android.R.drawable.ic_media_next,"Próxima",action(NEXT,83)).build())
            .setStyle(new Notification.MediaStyle().setShowActionsInCompactView(0,1,2));
        return b.build();
    }
    private void startOrUpdateForeground(){
        Notification n=notification();
        try{
            if(Build.VERSION.SDK_INT>=29)startForeground(NOTIFICATION_ID,n,ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
            else startForeground(NOTIFICATION_ID,n);
        }catch(Exception e){((NotificationManager)getSystemService(NOTIFICATION_SERVICE)).notify(NOTIFICATION_ID,n);}
    }
    @Override public void onDestroy(){releasePlayer();instance=null;super.onDestroy();}
    @Override public IBinder onBind(Intent intent){return null;}
}
