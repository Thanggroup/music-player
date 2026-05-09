package com.mondijack.mondiplayer;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
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
                MediaStore.Audio.Media.TITLE
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

                while (cursor.moveToNext()) {

                    long id = cursor.getLong(idCol);
                    String title = cursor.getString(titleCol);

                    Uri contentUri = ContentUris.withAppendedId(
                        MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
                        id
                    );

                    JSObject song = new JSObject();
                    song.put("title", title != null ? title : "");
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