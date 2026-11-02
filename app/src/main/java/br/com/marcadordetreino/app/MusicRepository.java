package br.com.marcadordetreino.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.Uri;
import android.provider.OpenableColumns;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.List;

/** Biblioteca de audios selecionados voluntariamente pelo dono do celular. */
final class MusicRepository {
    static final class Track {
        final String uri, name;
        Track(String uri,String name){this.uri=uri;this.name=name;}
    }
    private final SharedPreferences prefs;
    MusicRepository(Context context){prefs=context.getApplicationContext().getSharedPreferences("mt_music_library",Context.MODE_PRIVATE);}
    synchronized List<Track> list(){
        List<Track> result=new ArrayList<>();
        try{
            JSONArray arr=new JSONArray(prefs.getString("tracks","[]"));
            for(int i=0;i<arr.length();i++){
                JSONObject obj=arr.optJSONObject(i);
                if(obj==null)continue;
                String uri=obj.optString("uri",""),name=obj.optString("name","Música");
                if(uri.startsWith("content://"))result.add(new Track(uri,name));
            }
        }catch(Exception ignored){}
        return result;
    }
    synchronized int add(Context context,List<Uri> added){
        List<Track> tracks=list();
        int count=0;
        for(Uri uri:added){
            if(uri==null||!"content".equalsIgnoreCase(uri.getScheme()))continue;
            boolean found=false;
            for(Track t:tracks){if(t.uri.equals(uri.toString())){found=true;break;}}
            if(found)continue;
            String name="Música "+(tracks.size()+1);
            try(Cursor cursor=context.getContentResolver().query(uri,new String[]{OpenableColumns.DISPLAY_NAME},null,null,null)){
                if(cursor!=null&&cursor.moveToFirst())name=cursor.getString(0);
            }catch(Exception ignored){}
            name=name.replaceAll("(?i)\\.(mp3|m4a|aac|wav|ogg|flac|opus)$","");
            tracks.add(new Track(uri.toString(),name));
            count++;
        }
        store(tracks);
        return count;
    }
    synchronized void remove(int index){
        List<Track> data=list();
        if(index>=0&&index<data.size()){data.remove(index);store(data);}
    }
    private synchronized void store(List<Track> tracks){
        JSONArray arr=new JSONArray();
        for(Track t:tracks){JSONObject row=new JSONObject();try{row.put("uri",t.uri);row.put("name",t.name);}catch(Exception ignored){}arr.put(row);}
        prefs.edit().putString("tracks",arr.toString()).apply();
    }
    synchronized JSONArray jsonTracks(){
        JSONArray arr=new JSONArray();int i=0;
        for(Track t:list()){JSONObject row=new JSONObject();try{row.put("index",i);row.put("name",t.name);}catch(Exception ignored){}arr.put(row);i++;}
        return arr;
    }
}
