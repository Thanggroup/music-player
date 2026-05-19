import { createPlayerCore } from './core/playerCore.js';

import { createAudioService } from './services/audioService.js';
import { createStorageService } from './services/storageService.js';

import { initUI } from './ui/initUI.js';

import { initAndroidApp } from './platforms/android/androidApp.js';

import { createHtmlAudioBackend } from './services/backends/htmlAudioBackend.js';

const player = document.getElementById('player');

const backend = createHtmlAudioBackend(player);

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
