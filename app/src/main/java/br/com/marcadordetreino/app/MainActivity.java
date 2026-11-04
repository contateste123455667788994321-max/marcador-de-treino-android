package br.com.marcadordetreino.app;

import android.Manifest;
import android.app.Activity;
import android.app.DownloadManager;
import android.database.Cursor;
import android.os.Environment;
import android.app.AlertDialog;
import android.content.*;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.hardware.*;
import android.location.LocationManager;
import android.location.Location;
import android.location.LocationListener;
import android.net.Uri;
import android.os.*;
import android.webkit.*;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.List;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import android.provider.Settings;
import android.widget.EditText;

/** Aplicativo Android que usa a interface do Marcador de Treino no WebView. */
public final class MainActivity extends Activity {
    private static final String SITE="marcador-de-treino-ckcg.hatchable.site";
    private static final int PHYSICAL_PERMISSION=1901,NOTIFICATION_PERMISSION=1902,PICK_AUDIO=1903,FILE_CHOOSER=1904,RUN_GPS_PERMISSION=1905;
    private WebView web;
    private StepRepository steps;
    private RunRepository running;
    private boolean startRunAfterPermission=false;
    private boolean previewRunAfterPermission=false;
    private Location previewRunLocation=null;
    private boolean available;
    private boolean startAfterPermission;
    private boolean onboardingScheduled;
    private ValueCallback<Uri[]> webFileChooser;
    private final Handler apkHandler=new Handler(Looper.getMainLooper());
    private long apkDownloadId=-1L;
    private Uri apkReadyUri=null;
    private boolean apkPermissionPending=false;
    private final Runnable apkDownloadPolling=new Runnable(){
        @Override public void run(){pollApkDownload();}
    };

    @Override public void onCreate(Bundle b){
        super.onCreate(b);
        getWindow().setStatusBarColor(Color.rgb(8,11,8));
        getWindow().setNavigationBarColor(Color.rgb(8,11,8));
        steps=new StepRepository(this);
        running=new RunRepository(this);
        SensorManager mgr=(SensorManager)getSystemService(Context.SENSOR_SERVICE);
        available=mgr!=null&&mgr.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)!=null;
        web=new WebView(this);
        web.setBackgroundColor(Color.rgb(8,11,8));
        WebSettings config=web.getSettings();
        config.setJavaScriptEnabled(true);
        config.setDomStorageEnabled(true);
        config.setMediaPlaybackRequiresUserGesture(true);
        config.setJavaScriptCanOpenWindowsAutomatically(false);
        config.setAllowFileAccess(false);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web,true);
        web.setWebViewClient(new WebViewClient(){
            @Override public void onPageFinished(WebView view,String url){
                super.onPageFinished(view,url);
                Uri uri=Uri.parse(url);
                if(!"https".equals(uri.getScheme())||!SITE.equals(uri.getHost()))return;
                installBridge();
                installNativeUi();
                updateBrowser();
                if(!onboardingScheduled){
                    onboardingScheduled=true;
                    web.postDelayed(()->firstRunDialog(),1200);
                }
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){
                if(!request.isForMainFrame())return false;
                Uri uri=request.getUrl();
                if("https".equals(uri.getScheme())&&SITE.equals(uri.getHost()))return false;
                try{startActivity(new Intent(Intent.ACTION_VIEW,uri));}catch(Exception ignored){}
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient(){
            @Override public boolean onShowFileChooser(WebView w, ValueCallback<Uri[]> callback, FileChooserParams params){
                if(webFileChooser!=null)webFileChooser.onReceiveValue(null);
                webFileChooser=callback;
                try{
                    Intent intent=params.createIntent();
                    startActivityForResult(intent,FILE_CHOOSER);
                    return true;
                }catch(Exception e){webFileChooser.onReceiveValue(null);webFileChooser=null;return false;}
            }
            @Override public boolean onJsPrompt(WebView view,String originUrl,String message,String defaultValue,JsPromptResult result){
                Uri uri=Uri.parse(originUrl==null?"":originUrl);
                if(!"https".equals(uri.getScheme())||!SITE.equals(uri.getHost())||message==null
                    ||(!message.startsWith("mt-native:")&&!message.startsWith("mt-music:")&&!message.startsWith("mt-run:")))
                    return super.onJsPrompt(view,originUrl,message,defaultValue,result);
                if(message.startsWith("mt-run:")){
                    String cmd=message.substring("mt-run:".length()),response="";
                    try{
                        if("state".equals(cmd))response=runState();
                        else if("history".equals(cmd))response=running.historyJson();
                        else if(cmd.startsWith("delete:")){
                            long startWall=Long.parseLong(cmd.substring("delete:".length()));
                            response=new JSONObject().put("deleted",running.deleteRun(startWall)).toString();
                        }
                        else if(cmd.startsWith("import:")){org.json.JSONObject backup=new org.json.JSONObject(cmd.substring(7));response=new org.json.JSONObject().put("imported",running.importRun(backup)).toString();}
                        else if("start".equals(cmd)){startRunWithPermission();response=runState();}
                        else if("locate".equals(cmd)){requestRunPreview();response=runState();}
                        else if("pause".equals(cmd)){running.pause();sendRunService(RunTrackingService.PAUSE);response=runState();}
                        else if("resume".equals(cmd)){resumeRunWithPermission();response=runState();}
                        else if("finish".equals(cmd)){response=running.finish();sendRunService(RunTrackingService.FINISH);}
                    }catch(Exception e){android.util.Log.w("MarcadorDeTreino","Comando de corrida",e);response="{}";}
                    result.confirm(response);
                    return true;
                }
                if(message.startsWith("mt-music:")){
                    String command=message.substring("mt-music:".length()),answer="";
                    try{
                        if("getState".equals(command))answer=MusicPlaybackService.getState(MainActivity.this);
                        else if("pick".equals(command))pickAudio();
                        else if(command.startsWith("play:"))sendMusic(MusicPlaybackService.PLAY,Integer.parseInt(command.substring(5)));
                        else if("play".equals(command))sendMusic(MusicPlaybackService.PLAY,-1);
                        else if("pause".equals(command))sendMusic(MusicPlaybackService.PAUSE,-1);
                        else if("toggle".equals(command))sendMusic(MusicPlaybackService.TOGGLE,-1);
                        else if("next".equals(command))sendMusic(MusicPlaybackService.NEXT,-1);
                        else if("previous".equals(command))sendMusic(MusicPlaybackService.PREVIOUS,-1);
                        else if("shuffle".equals(command))sendMusic(MusicPlaybackService.SHUFFLE,-1);
                        else if("repeat".equals(command))sendMusic(MusicPlaybackService.REPEAT,-1);
                        else if("stop".equals(command))sendMusic(MusicPlaybackService.STOP,-1);
                        else if(command.startsWith("remove:")){new MusicRepository(MainActivity.this).remove(Integer.parseInt(command.substring(7)));updateMusicBrowser();}
                    }catch(Exception e){answer="error";}
                    result.confirm(answer);
                    return true;
                }
                String action=message.substring("mt-native:".length()),answer="";
                try{
                    if("appInfo".equals(action))answer=nativeAppInfo();
                    else if("getState".equals(action))answer=steps.json(available);
                    else if("start".equals(action))requestStart();
                    else if("stop".equals(action))stopService();
                    else if("requestNotifications".equals(action))requestNotifications();
                    else if(action.startsWith("downloadApk:")){
                        String url=action.substring("downloadApk:".length());
                        if(officialApkUrl(url)){
                            web.post(()->startApkDownload(url));
                            answer="started";
                        }else answer="invalid-url";
                    }
                    else if("installApk".equals(action)){
                        if(apkReadyUri!=null){web.post(this::installApk);answer="ready";}
                        else answer="not-ready";
                    }
                    else if(action.startsWith("setGoal:"))steps.goal(Integer.parseInt(action.substring(8)));
                    else if(action.startsWith("setWeight:"))steps.weight(Double.parseDouble(action.substring(10)));
                }catch(Exception ex){answer="error";}
                result.confirm(answer);
                return true;
            }
        });
        setContentView(web);
        web.loadUrl("https://"+SITE+"/?native=1&build="+installedBuildCode()+"&version="+Uri.encode(installedVersionName()));
        if(steps.enabled()&&hasPhysicalPermission())startServiceTracking();
    }

    private void installNativeUi(){
        loadJavascriptAsset("android-ui.js");
        loadJavascriptAsset("android-extras.js");
        loadJavascriptAsset("android-polish.js");
        loadJavascriptAsset("android-service-visuals.js");
        loadJavascriptAsset("android-library-consult.js");
        loadJavascriptAsset("android-running.js");
        loadJavascriptAsset("android-run-cloud.js");
        loadJavascriptAsset("android-account-profile.js");
        loadJavascriptAsset("android-profile-photo.js");
        loadJavascriptAsset("android-notices.js");
        loadJavascriptAsset("android-owner-panel.js");
        loadJavascriptAsset("android-owner-tools.js");
        loadJavascriptAsset("android-back.js");
    }
    private void loadJavascriptAsset(String filename){
        try(InputStream is=getAssets().open(filename)){
            byte[] bytes=new byte[is.available()];
            int read=0;
            while(read<bytes.length){int count=is.read(bytes,read,bytes.length-read);if(count<0)break;read+=count;}
            String script=new String(bytes,0,read,StandardCharsets.UTF_8);
            web.evaluateJavascript(script,null);
        }catch(Exception e){android.util.Log.w("MarcadorDeTreino","Falha ao carregar "+filename,e);}
    }

    /** Identificação real da versão instalada; nunca depende dos dados do usuário. */
    private long installedBuildCode(){
        try{
            android.content.pm.PackageInfo info=getPackageManager().getPackageInfo(getPackageName(),0);
            return Build.VERSION.SDK_INT>=28?info.getLongVersionCode():info.versionCode;
        }catch(Exception e){return 0L;}
    }
    private String installedVersionName(){
        try{
            android.content.pm.PackageInfo info=getPackageManager().getPackageInfo(getPackageName(),0);
            return info.versionName==null?"":info.versionName;
        }catch(Exception e){return "";}
    }
    private String nativeAppInfo(){
        try{
            return new org.json.JSONObject()
                .put("versionCode",installedBuildCode())
                .put("versionName",installedVersionName())
                .put("packageName",getPackageName()).toString();
        }catch(Exception e){return "{}";}
    }

    private boolean hasRunPermission(){
        return checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)==PackageManager.PERMISSION_GRANTED;
    }
    private boolean gpsEnabled(){
        LocationManager mgr=(LocationManager)getSystemService(LOCATION_SERVICE);
        try{return mgr!=null&&(mgr.isProviderEnabled(LocationManager.GPS_PROVIDER)||mgr.isProviderEnabled(LocationManager.NETWORK_PROVIDER));}
        catch(Exception e){return false;}
    }
    private String runState(){
        org.json.JSONObject json;
        try{json=new org.json.JSONObject(running.json(gpsEnabled(),hasRunPermission()));}
        catch(Exception e){return "{}";}
        if(hasRunPermission()){
            Location loc=previewRunLocation;
            if(loc==null){
                try{
                    LocationManager mgr=(LocationManager)getSystemService(LOCATION_SERVICE);
                    Location gps=mgr.getLastKnownLocation(LocationManager.GPS_PROVIDER);
                    Location network=mgr.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
                    loc=gps!=null&&network!=null?(gps.getTime()>network.getTime()?gps:network):gps!=null?gps:network;
                }catch(Exception ignored){}
            }
            if(loc!=null&&System.currentTimeMillis()-loc.getTime()<5*60*1000L&&
              loc.hasAccuracy()&&loc.getAccuracy()<180f){
                try{
                    json.put("previewLat",loc.getLatitude());
                    json.put("previewLon",loc.getLongitude());
                    json.put("previewAccuracy",loc.getAccuracy());
                }catch(Exception ignored){}
            }
        }
        return json.toString();
    }
    private void requestRunPreview(){
        if(!hasRunPermission()){
            previewRunAfterPermission=true;
            requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION,Manifest.permission.ACCESS_COARSE_LOCATION},RUN_GPS_PERMISSION);
            return;
        }
        try{
            LocationManager mgr=(LocationManager)getSystemService(LOCATION_SERVICE);
            if(mgr==null)return;
            String provider=mgr.isProviderEnabled(LocationManager.GPS_PROVIDER)?LocationManager.GPS_PROVIDER:
                mgr.isProviderEnabled(LocationManager.NETWORK_PROVIDER)?LocationManager.NETWORK_PROVIDER:null;
            if(provider==null)return;
            mgr.requestSingleUpdate(provider,new LocationListener(){
                @Override public void onLocationChanged(Location location){
                    if(location!=null)previewRunLocation=location;
                }
                @Override public void onProviderEnabled(String p){}
                @Override public void onProviderDisabled(String p){}
            },getMainLooper());
        }catch(Exception e){android.util.Log.w("MarcadorDeTreino","GPS para visualização do mapa",e);}
    }
    private void startRunWithPermission(){
        if(running.isActive()){sendRunService(RunTrackingService.START);return;}
        if(!hasRunPermission()){
            startRunAfterPermission=true;
            requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION,Manifest.permission.ACCESS_COARSE_LOCATION},RUN_GPS_PERMISSION);
            return;
        }
        running.start(steps.weight());
        sendRunService(RunTrackingService.START);
    }
    private void resumeRunWithPermission(){
        if(!running.isActive())return;
        if(!hasRunPermission()){
            startRunAfterPermission=true;
            requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION,Manifest.permission.ACCESS_COARSE_LOCATION},RUN_GPS_PERMISSION);
            return;
        }
        running.resume();sendRunService(RunTrackingService.RESUME);
    }
    private void sendRunService(String action){
        Intent service=new Intent(this,RunTrackingService.class).setAction(action);
        try{
            if(RunTrackingService.FINISH.equals(action))startService(service);
            else if(Build.VERSION.SDK_INT>=26)startForegroundService(service);
            else startService(service);
        }catch(Exception ex){android.util.Log.w("MarcadorDeTreino","Não foi possível iniciar GPS da corrida",ex);}
    }
    private void pickAudio(){
        Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.setType("audio/*");
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE,true);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION|Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        try{startActivityForResult(intent,PICK_AUDIO);}
        catch(Exception e){new AlertDialog.Builder(this).setTitle("Arquivos indisponíveis")
            .setMessage("Não foi possível abrir a biblioteca de músicas neste celular.")
            .setPositiveButton("OK",null).show();}
    }
    private void sendMusic(String command,int index){
        Intent service=new Intent(this,MusicPlaybackService.class).setAction(command);
        if(index>=0)service.putExtra("index",index);
        try{
            if(MusicPlaybackService.STOP.equals(command)){
                startService(service);
            }else if(Build.VERSION.SDK_INT>=26)startForegroundService(service);
            else startService(service);
        }catch(Exception e){android.util.Log.w("MarcadorDeTreino","Falha ao enviar comando ao player",e);}
        web.postDelayed(this::updateMusicBrowser,450);
    }
    private void updateMusicBrowser(){
        if(web==null)return;
        String data=MusicPlaybackService.getState(this);
        web.post(()->web.evaluateJavascript("window.MTAndroidMusicUpdate&&window.MTAndroidMusicUpdate("+JSONObject.quote(data)+")",null));
    }
    @Override protected void onActivityResult(int request,int code,Intent data){
        super.onActivityResult(request,code,data);
        if(request==FILE_CHOOSER){
            if(webFileChooser!=null){webFileChooser.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(code,data));webFileChooser=null;}
            return;
        }
        if(request!=PICK_AUDIO)return;
        if(code==RESULT_OK&&data!=null){
            List<Uri> uris=new ArrayList<>();
            if(data.getClipData()!=null){
                for(int i=0;i<data.getClipData().getItemCount();i++)uris.add(data.getClipData().getItemAt(i).getUri());
            }else if(data.getData()!=null)uris.add(data.getData());
            List<Uri> persisted=new ArrayList<>();
            for(Uri uri:uris){
                try{getContentResolver().takePersistableUriPermission(uri,Intent.FLAG_GRANT_READ_URI_PERMISSION);persisted.add(uri);}
                catch(SecurityException ignored){}
            }
            if(!persisted.isEmpty())new MusicRepository(this).add(this,persisted);
        }
        updateMusicBrowser();
    }
    private boolean hasPhysicalPermission(){
        return Build.VERSION.SDK_INT<29||checkSelfPermission(Manifest.permission.ACTIVITY_RECOGNITION)==PackageManager.PERMISSION_GRANTED;
    }
    private void firstRunDialog(){
        if(isFinishing()||!available||steps.enabled())return;
        SharedPreferences prefs=getSharedPreferences("onboarding",MODE_PRIVATE);
        if(prefs.getBoolean("done",false))return;
        prefs.edit().putBoolean("done",true).apply();
        new AlertDialog.Builder(this)
            .setTitle("Contar passos com a tela apagada?")
            .setMessage("Com sua autorização de atividade física, o Marcador de Treino pode contar seus passos usando o sensor do Android, mesmo com a tela bloqueada. Uma notificação mostra que a contagem está ativa. Você pode pausar quando quiser.")
            .setPositiveButton("Autorizar e ativar",(d,w)->requestStart())
            .setNegativeButton("Agora não",(d,w)->{}).show();
    }
    private void requestStart(){
        if(!available){updateBrowser();return;}
        if(!hasPhysicalPermission()){
            startAfterPermission=true;
            requestPermissions(new String[]{Manifest.permission.ACTIVITY_RECOGNITION},PHYSICAL_PERMISSION);
            return;
        }
        startServiceTracking();
        requestNotifications();
    }
    private void startServiceTracking(){
        if(!available||!hasPhysicalPermission())return;
        Intent service=new Intent(this,StepTrackingService.class);
        service.setAction(StepTrackingService.START);
        try{
            if(Build.VERSION.SDK_INT>=26)startForegroundService(service);
            else startService(service);
        }catch(Exception ignored){}
        web.postDelayed(()->updateBrowser(),900);
    }
    private void stopService(){
        steps.enabled(false);
        Intent service=new Intent(this,StepTrackingService.class);
        service.setAction(StepTrackingService.STOP);
        try{startService(service);}catch(Exception ignored){}
        updateBrowser();
    }
    private void requestNotifications(){
        if(Build.VERSION.SDK_INT>=33&&checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},NOTIFICATION_PERMISSION);
    }
    @Override public void onRequestPermissionsResult(int request,String[] perms,int[] results){
        super.onRequestPermissionsResult(request,perms,results);
        if(request==RUN_GPS_PERMISSION){
            if(previewRunAfterPermission&&hasRunPermission())requestRunPreview();
            previewRunAfterPermission=false;
            if(startRunAfterPermission&&hasRunPermission()){
                if(running.isActive()){running.resume();sendRunService(RunTrackingService.RESUME);}
                else {running.start(steps.weight());sendRunService(RunTrackingService.START);}
            }
            startRunAfterPermission=false;
            updateBrowser();return;
        }
        if(request==PHYSICAL_PERMISSION){
            if(startAfterPermission&&results.length>0&&results[0]==PackageManager.PERMISSION_GRANTED){
                startServiceTracking();requestNotifications();
            }
            startAfterPermission=false;
        }
        updateBrowser();
    }

    /** Only accept official release URLs, never arbitrary APK addresses from web content. */
    private boolean officialApkUrl(String url){
        try{
            Uri uri=Uri.parse(url);
            String path=uri.getPath();
            return "https".equals(uri.getScheme())&&"github.com".equals(uri.getHost())
              &&path!=null&&path.startsWith("/contateste123455667788994321-max/marcador-de-treino-android/releases/download/")
              &&path.endsWith(".apk")&&url.length()<700;
        }catch(Exception e){return false;}
    }

    private void apkProgress(String phase,int percent,String message){
        if(web==null)return;
        try{
            String event=new JSONObject().put("phase",phase).put("percent",percent).put("message",message).toString();
            web.post(()->web.evaluateJavascript(
              "window.MTNativeUpdateProgress&&window.MTNativeUpdateProgress("+JSONObject.quote(event)+")",null));
        }catch(Exception ignored){}
    }

    private void startApkDownload(String url){
        if(apkDownloadId>0){apkProgress("downloading",-1,"O download já está em andamento.");return;}
        if(!officialApkUrl(url)){apkProgress("error",0,"Endereço de atualização inválido.");return;}
        try{
            DownloadManager dm=(DownloadManager)getSystemService(Context.DOWNLOAD_SERVICE);
            if(dm==null)throw new IllegalStateException("Serviço de downloads indisponível");
            DownloadManager.Request request=new DownloadManager.Request(Uri.parse(url));
            request.setTitle("Gold Trainer - atualização");
            request.setDescription("Atualização oficial do aplicativo");
            request.setMimeType("application/vnd.android.package-archive");
            request.setAllowedOverMetered(true);
            request.setAllowedOverRoaming(false);
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setDestinationInExternalFilesDir(this,Environment.DIRECTORY_DOWNLOADS,
                "Gold_Trainer_Atualizacao_"+System.currentTimeMillis()+".apk");
            apkReadyUri=null;
            apkDownloadId=dm.enqueue(request);
            apkHandler.removeCallbacks(apkDownloadPolling);
            apkProgress("downloading",0,"Baixando atualização no Gold Trainer...");
            apkHandler.postDelayed(apkDownloadPolling,750);
        }catch(Exception e){
            apkDownloadId=-1L;
            android.util.Log.w("GoldTrainer","Falha no download",e);
            apkProgress("error",0,"Não foi possível baixar agora. Confira a conexão.");
        }
    }

    private void pollApkDownload(){
        if(apkDownloadId<=0)return;
        DownloadManager dm=(DownloadManager)getSystemService(Context.DOWNLOAD_SERVICE);
        if(dm==null){apkDownloadId=-1L;apkProgress("error",0,"Serviço de downloads indisponível.");return;}
        try(Cursor cursor=dm.query(new DownloadManager.Query().setFilterById(apkDownloadId))){
            if(cursor==null||!cursor.moveToFirst()){
                apkDownloadId=-1L;apkProgress("error",0,"Não foi possível encontrar o download.");return;
            }
            int status=cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS));
            if(status==DownloadManager.STATUS_SUCCESSFUL){
                apkReadyUri=dm.getUriForDownloadedFile(apkDownloadId);
                apkDownloadId=-1L;
                if(apkReadyUri==null){apkProgress("error",0,"Arquivo não encontrado após o download.");return;}
                apkProgress("ready",100,"Download concluído. Toque em Instalar.");
                return;
            }
            if(status==DownloadManager.STATUS_FAILED){
                apkDownloadId=-1L;apkProgress("error",0,"Download interrompido. Tente novamente.");return;
            }
            long total=cursor.getLong(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_TOTAL_SIZE_BYTES));
            long done=cursor.getLong(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR));
            int pct=total>0?(int)Math.min(99,(done*100L)/total):-1;
            apkProgress("downloading",pct,status==DownloadManager.STATUS_PAUSED?"Aguardando a conexão...":"Baixando atualização...");
        }catch(Exception e){
            android.util.Log.w("GoldTrainer","Progresso do download",e);
            apkDownloadId=-1L;apkProgress("error",0,"Erro ao acompanhar o download.");
            return;
        }
        apkHandler.postDelayed(apkDownloadPolling,850);
    }

    private void installApk(){
        if(apkReadyUri==null){apkProgress("error",0,"Baixe a atualização antes de instalar.");return;}
        try{
            if(Build.VERSION.SDK_INT>=Build.VERSION_CODES.O&&!getPackageManager().canRequestPackageInstalls()){
                apkPermissionPending=true;
                apkProgress("permission",100,"Autorize instalar apps desta fonte e volte ao Gold Trainer.");
                Intent settings=new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                    Uri.parse("package:"+getPackageName()));
                startActivity(settings);
                return;
            }
            apkPermissionPending=false;
            Intent install=new Intent(Intent.ACTION_VIEW);
            install.setDataAndType(apkReadyUri,"application/vnd.android.package-archive");
            install.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_GRANT_READ_URI_PERMISSION);
            startActivity(install);
            apkProgress("installer",100,"Confirme a instalação na tela do Android.");
        }catch(Exception e){
            android.util.Log.w("GoldTrainer","Falha ao iniciar instalador",e);
            apkProgress("error",100,"Não foi possível abrir a instalação. Confira as permissões.");
        }
    }

    private void installBridge(){
        String js="(function(){window.AndroidSteps={"+
            "getState:function(){return prompt('mt-native:getState','')},"+
            "start:function(){return prompt('mt-native:start','')},"+
            "stop:function(){return prompt('mt-native:stop','')},"+
            "setGoal:function(x){return prompt('mt-native:setGoal:'+Number(x),'')},"+
            "setWeight:function(x){return prompt('mt-native:setWeight:'+Number(x),'')},"+
            "requestNotifications:function(){return prompt('mt-native:requestNotifications','')}"+
            "};window.dispatchEvent(new Event('mt-native-bridge-ready'));})();";
        web.evaluateJavascript(js,null);
    }
    private void updateBrowser(){
        if(web==null)return;
        final String data=steps.json(available);
        web.post(()->web.evaluateJavascript("window.MTStepsNativeUpdate&&window.MTStepsNativeUpdate("+JSONObject.quote(data)+")",null));
    }
    @Override protected void onResume(){
        super.onResume();
        if(web!=null){updateBrowser();updateMusicBrowser();}
        if(apkPermissionPending&&apkReadyUri!=null&&Build.VERSION.SDK_INT>=Build.VERSION_CODES.O
            &&getPackageManager().canRequestPackageInstalls()){
            apkPermissionPending=false;
            apkHandler.postDelayed(this::installApk,400);
        }
    }
    @Override protected void onDestroy(){
        apkHandler.removeCallbacks(apkDownloadPolling);
        super.onDestroy();
    }
    private long lastHomeBackMs=0L;
    @Override public void onBackPressed(){
        if(web==null){super.onBackPressed();return;}
        web.evaluateJavascript("(function(){try{return window.MTAndroidBack?window.MTAndroidBack():'home'}catch(e){return 'home'}})()",result->{
            if(isFinishing())return;
            if("\"handled\"".equals(result))return;
            long now=android.os.SystemClock.elapsedRealtime();
            if(now-lastHomeBackMs<2200){
                finish();
            }else{
                lastHomeBackMs=now;
                android.widget.Toast.makeText(this,"Pressione Voltar novamente para sair",android.widget.Toast.LENGTH_SHORT).show();
            }
        });
    }
}
