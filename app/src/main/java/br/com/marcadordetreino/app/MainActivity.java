package br.com.marcadordetreino.app;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.*;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.hardware.*;
import android.net.Uri;
import android.os.*;
import android.webkit.*;
import org.json.JSONObject;

/** Aplicativo Android que usa a interface do Marcador de Treino no WebView. */
public final class MainActivity extends Activity {
    private static final String SITE="marcador-de-treino-ckcg.hatchable.site";
    private static final int PHYSICAL_PERMISSION=1901,NOTIFICATION_PERMISSION=1902;
    private WebView web;
    private StepRepository steps;
    private boolean available;
    private boolean startAfterPermission;
    private boolean onboardingScheduled;

    @Override public void onCreate(Bundle b){
        super.onCreate(b);
        getWindow().setStatusBarColor(Color.rgb(8,11,8));
        getWindow().setNavigationBarColor(Color.rgb(8,11,8));
        steps=new StepRepository(this);
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
            @Override public boolean onJsPrompt(WebView view,String originUrl,String message,String defaultValue,JsPromptResult result){
                Uri uri=Uri.parse(originUrl==null?"":originUrl);
                if(!"https".equals(uri.getScheme())||!SITE.equals(uri.getHost())||
                   message==null||!message.startsWith("mt-native:"))
                    return super.onJsPrompt(view,originUrl,message,defaultValue,result);
                String action=message.substring("mt-native:".length()),answer="";
                try{
                    if("getState".equals(action))answer=steps.json(available);
                    else if("start".equals(action))requestStart();
                    else if("stop".equals(action))stopService();
                    else if("requestNotifications".equals(action))requestNotifications();
                    else if(action.startsWith("setGoal:"))steps.goal(Integer.parseInt(action.substring(8)));
                    else if(action.startsWith("setWeight:"))steps.weight(Double.parseDouble(action.substring(10)));
                }catch(Exception ex){answer="error";}
                result.confirm(answer);
                return true;
            }
        });
        setContentView(web);
        web.loadUrl("https://"+SITE+"/?native=1");
        if(steps.enabled()&&hasPhysicalPermission())startServiceTracking();
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
        if(request==PHYSICAL_PERMISSION){
            if(startAfterPermission&&results.length>0&&results[0]==PackageManager.PERMISSION_GRANTED){
                startServiceTracking();requestNotifications();
            }
            startAfterPermission=false;
        }
        updateBrowser();
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
    @Override protected void onResume(){super.onResume();if(web!=null)updateBrowser();}
    @Override public void onBackPressed(){if(web!=null&&web.canGoBack())web.goBack();else super.onBackPressed();}
}
