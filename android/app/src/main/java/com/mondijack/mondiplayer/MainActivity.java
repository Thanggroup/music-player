package com.mondijack.mondiplayer;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(MusicPlugin.class);
        super.onCreate(savedInstanceState);
    }
}