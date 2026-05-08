package com.mondijack.mondiplayer;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "MusicPlugin")
public class MusicPlugin extends Plugin {

    @PluginMethod
    public void ping(PluginCall call) {
        call.resolve();
    }
}