// imports
import { createPlayerCore } from './core/playerCore.js';

import { createAudioService } from './services/audioService.js';
import { createStorageService } from './services/storageService.js';

import { createHtmlAudioBackend } from './services/backends/htmlAudioBackend.js';
import { createAndroidAudioBackend } from './services/backends/androidAudioBackend.js';

import { initUI } from './ui/initUI.js';

import { initAndroidApp } from './platforms/android/androidApp.js';

const player = document.getElementById('player');

const isAndroid =
  window.Capacitor &&
  window.Capacitor.Plugins &&
  window.Capacitor.Plugins.MusicPlugin;

const backend = isAndroid
  ? createAndroidAudioBackend()
  : createHtmlAudioBackend(player);

if (isAndroid) {
  backend.attachNativeListeners();
}

const audioService = createAudioService(backend);

const storageService = createStorageService();

const core = createPlayerCore({
  audioService,
  storageService
});

// Load initial state
core.loadState();

initUI({
  core,
  audioService
});

initAndroidApp(core);