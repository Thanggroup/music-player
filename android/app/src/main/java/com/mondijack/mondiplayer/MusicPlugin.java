package com.mondijack.mondiplayer;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import android.content.ContentUris;
import android.database.Cursor;
import android.net.Uri;
import android.provider.MediaStore;

import android.Manifest;

import com.getcapacitor.PermissionState;

import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
        name = "MusicPlugin",
    permissions = {
        @Permission(
            strings = { Manifest.permission.READ_MEDIA_AUDIO },
            alias = "audio"
        )
    }
)
public class MusicPlugin extends Plugin {

    private static final String TAG = "MusicPlugin";
    private String currentSource = "";
    private double currentTime = 0;
    private double duration = 0;
    private double volume = 1;

    @PluginMethod
    public void play(PluginCall call) {

    android.util.Log.d(TAG, "play()");

    JSObject data = new JSObject();
    data.put("currentTime", currentTime);

    notifyListeners("playback:play", data);

    call.resolve();

    }

    @PluginMethod
    public void pause(PluginCall call) {

    android.util.Log.d(TAG, "pause()");

    JSObject data = new JSObject();
    data.put("currentTime", currentTime);

    notifyListeners("playback:pause", data);

    call.resolve();

    }

    @PluginMethod
    public void load(PluginCall call) {

    android.util.Log.d(TAG, "load()");

    duration = 180;

    JSObject data = new JSObject();
    data.put("duration", duration);

    notifyListeners("playback:loadedmetadata", data);

    call.resolve();

    }

    @PluginMethod
    public void setSource(PluginCall call) {

    currentSource = call.getString("src", "");

    android.util.Log.d(TAG, "setSource(): " + currentSource);

    call.resolve();

    }

    @PluginMethod
    public void seekTo(PluginCall call) {

    currentTime = call.getDouble("time", 0);

    android.util.Log.d(TAG, "seekTo(): " + currentTime);

    JSObject data = new JSObject();
    data.put("currentTime", currentTime);
    data.put("duration", duration);

    notifyListeners("playback:timeupdate", data);

    call.resolve();

    }

    @PluginMethod
    public void setVolume(PluginCall call) {

    volume = call.getDouble("volume", 1);

    android.util.Log.d(TAG, "setVolume(): " + volume);

    call.resolve();

    }

    @PluginMethod
    public void ping(PluginCall call) {
        call.resolve();
    }
    @PluginMethod
    public void getSongs(PluginCall call){

        if (getPermissionState("audio") != PermissionState.GRANTED) {
            requestPermissionForAlias("audio", call, "audioPermsCallback");
            return;
        }

        try {

            JSArray songs = new JSArray();

            String[] projection = new String[] {
                MediaStore.Audio.Media._ID,
                MediaStore.Audio.Media.TITLE,
                MediaStore.Audio.Media.ARTIST,
                MediaStore.Audio.Media.ALBUM,
                MediaStore.Audio.Media.DURATION
            };

            String selection = MediaStore.Audio.Media.IS_MUSIC + " != 0";

            Cursor cursor = getContext().getContentResolver().query(
                MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
                projection,
                selection,
                null,
                null
            );

            if (cursor != null) {

                int idCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID);
                int titleCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE);
                int artistCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST);
                int albumCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM);
                int durationCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION);

                while (cursor.moveToNext()) {

                    long id = cursor.getLong(idCol);
                    String title = cursor.getString(titleCol);
                    String artist = cursor.getString(artistCol);
                    String album = cursor.getString(albumCol);
                    long duration = cursor.getLong(durationCol);

                    Uri contentUri = ContentUris.withAppendedId(
                        MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
                        id
                    );

                    JSObject song = new JSObject();
                    song.put("title", title != null ? title : "");
                    song.put("artist", artist != null ? artist : "");
                    song.put("album", album != null ? album : "");
                    song.put("duration", duration);
                    song.put("file", contentUri.toString());

                    songs.put(song);
                }

                cursor.close();
            }

            JSObject result = new JSObject();
            result.put("songs", songs);

            call.resolve(result);

        } catch (Exception e) {
            call.reject("Failed to load songs", e);
        }
    }

    @PermissionCallback
    private void audioPermsCallback(PluginCall call) {

        if (getPermissionState("audio") == PermissionState.GRANTED) {
            getSongs(call);
        } else {
            call.reject("Audio permission denied");
        }
    }
}