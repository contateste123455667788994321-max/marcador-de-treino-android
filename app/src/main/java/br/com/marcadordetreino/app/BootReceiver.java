package br.com.marcadordetreino.app;

import android.Manifest;
import android.content.*;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;

/** Retoma a contagem após reinicialização, se o usuário a havia ativado. */
public final class BootReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context,Intent intent){
        if(intent==null||!Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction()))return;
        StepRepository repo=new StepRepository(context);
        repo.rollover();
        if(!repo.enabled())return;
        if(Build.VERSION.SDK_INT>=29&&context.checkSelfPermission(Manifest.permission.ACTIVITY_RECOGNITION)!=PackageManager.PERMISSION_GRANTED)return;
        Intent svc=new Intent(context,StepTrackingService.class);
        svc.setAction(StepTrackingService.START);
        try{
            if(Build.VERSION.SDK_INT>=26)context.startForegroundService(svc);
            else context.startService(svc);
        }catch(Exception e){Log.w("MarcadorDeTreino","O Android impediu a retomada automatica do sensor",e);}
    }
}
