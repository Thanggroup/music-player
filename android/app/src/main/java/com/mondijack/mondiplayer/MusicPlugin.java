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

import androidx.media3.common.MediaItem;
import androidx.media3.common.Player;
import androidx.media3.exoplayer.ExoPlayer;

import android.os.Handler;
import android.os.Looper;

import android.util.Log;

import org.json.JSONException;

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
    // fields
    private static final String TAG = "MusicPlugin";
    private String currentSource = "";
    private double currentTime = 0;
    private double duration = 0;
    private double volume = 1;

    private JSArray queueSongs = new JSArray();

    private int currentIndex = 0;

    private int repeatMode = 0;

    private boolean shuffleMode = false;
    private JSArray shuffleOrder = new JSArray();
    private int shuffleIndex = 0;

    private ExoPlayer player;

    private Handler progressHandler;
    private Runnable progressRunnable;

    private ExoPlayer getPlayer() {

        if (player == null) {

            player = new ExoPlayer.Builder(getContext()).build();

            player.addListener(new Player.Listener() {

                @Override
                public void onPlaybackStateChanged(int playbackState) {


                    if (playbackState == Player.STATE_READY) {

                        duration = player.getDuration() / 1000.0;

                        JSObject data = new JSObject();
                        data.put("duration", duration);

                        notifyListeners("playback:loadedmetadata", data);
                    }
                    
                    if (playbackState == Player.STATE_ENDED) {

                        Log.d(
                            "MusicPlugin",
                            "[ENDED] emit STATE_ENDED position=" +
                            player.getCurrentPosition() +
                            " duration=" +
                            player.getDuration()
                        );

                        notifyListeners("playback:ended", new JSObject());
                        
                    }
                }

                @Override
                public void onIsPlayingChanged(boolean isPlaying) {

                    JSObject data = new JSObject();
                    data.put("currentTime", player.getCurrentPosition() / 1000.0);

                    Log.d(
                        "MusicPlugin",
                        "[PLAY_STATE] isPlaying=" + isPlaying +
                        " position=" + player.getCurrentPosition()
                    );

                    notifyListeners(
                        isPlaying ? "playback:play" : "playback:pause",
                        data
                    );
                }
            });
        }

        return player;
    }

    private void startProgressUpdates() {

            stopProgressUpdates();

            progressHandler =
                new Handler(player.getApplicationLooper());

            progressRunnable = new Runnable() {

                @Override
                public void run() {

                    if (player == null) {
                        return;
                    }

                    currentTime =
                        player.getCurrentPosition() / 1000.0;

                    duration =
                        player.getDuration() / 1000.0;

                    JSObject data = new JSObject();
                    data.put("currentTime", currentTime);
                    data.put("duration", duration);

                    notifyListeners("playback:timeupdate", data);

                    progressHandler.postDelayed(this, 250);
                }
            };

            progressHandler.post(progressRunnable);
        }

    private void stopProgressUpdates() {

        if (progressRunnable != null) {
                progressHandler.removeCallbacks(progressRunnable);
        }

    }   

    @PluginMethod
    public void play(PluginCall call) {

    android.util.Log.d(TAG, "play()");

    ExoPlayer player = getPlayer();

    player.play();

    startProgressUpdates();

    call.resolve();

    }

    @PluginMethod
    public void pause(PluginCall call) {

    android.util.Log.d(TAG, "pause()");

    ExoPlayer player = getPlayer();

    player.pause();

    stopProgressUpdates();

    call.resolve();

    }

    @PluginMethod
    public void load(PluginCall call) {

        if (currentSource == null || currentSource.isEmpty()) {
            call.reject("No source set");
            return;
        }

        MediaItem mediaItem = MediaItem.fromUri(currentSource);

        ExoPlayer player = getPlayer();

        player.setMediaItem(mediaItem);
        player.prepare();

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

    currentTime = call.getDouble("time", 0.0);

    ExoPlayer player = getPlayer();
    player.seekTo((long)(currentTime * 1000));

    android.util.Log.d(TAG, "seekTo(): " + currentTime);

    JSObject data = new JSObject();
    data.put("currentTime", currentTime);
    data.put("duration", duration);

    notifyListeners("playback:timeupdate", data);

    call.resolve();

    }

    @PluginMethod
    public void setVolume(PluginCall call) {

    volume = call.getDouble("volume", 1.0);

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

    @PluginMethod
    public void getPlaybackState(PluginCall call) {

        ExoPlayer player = getPlayer();

        JSObject data = new JSObject();

        data.put("source", currentSource);

        data.put(
            "currentTime",
            player.getCurrentPosition() / 1000.0
        );

        data.put(
            "duration",
            player.getDuration() / 1000.0
        );

        data.put(
            "paused",
            !player.isPlaying()
        );

        call.resolve(data);
    }

    @PluginMethod
    public void setQueueState(PluginCall call) {

        JSObject data = call.getData();

        Log.d(
            "MusicPlugin",
            "[QUEUE_MIRROR] " + data.toString()
        );

        queueSongs =
            call.getArray("songs", new JSArray());

        currentIndex =
            call.getInt("currentIndex", 0);

        repeatMode =
            call.getInt("repeatMode", 0);

        shuffleMode =
            call.getBoolean("shuffleMode", false);

        shuffleOrder =
            call.getArray("shuffleOrder", new JSArray());

        shuffleIndex =
            call.getInt("shuffleIndex", 0);

        call.resolve();

        Log.d(
            TAG,
            "[QUEUE_STATE] songs=" +
            queueSongs.length() +
            " currentIndex=" +
            currentIndex +
            " repeatMode=" +
            repeatMode +
            " shuffleMode=" +
            shuffleMode +
            " shuffleIndex=" +
            shuffleIndex
        );
    }

    private int getNextIndex() {

        int songCount = queueSongs.length();

        if (songCount == 0) {
            return 0;
        }

        if (!shuffleMode) {
            return (currentIndex + 1) % songCount;
        }

        int nextShuffleIndex = shuffleIndex + 1;

        if (nextShuffleIndex >= shuffleOrder.length()) {
            nextShuffleIndex = 0;
        }

        return shuffleOrder.optInt(
            nextShuffleIndex,
            currentIndex
        );
    }

    private int getPrevIndex() {

        int songCount = queueSongs.length();

        if (songCount == 0) {
            return 0;
        }

        if (!shuffleMode) {
            return (
                currentIndex - 1 + songCount
            ) % songCount;
        }

        int prevShuffleIndex = shuffleIndex - 1;

        if (prevShuffleIndex < 0) {
            prevShuffleIndex =
                shuffleOrder.length() - 1;
        }

        return shuffleOrder.optInt(
            prevShuffleIndex,
            currentIndex
        );
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