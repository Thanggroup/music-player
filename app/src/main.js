import { createPlayerCore } from './core/playerCore.js';

import { createAudioService } from './services/audioService.js';
import { createStorageService } from './services/storageService.js';

import { initUI } from './ui/initUI.js';

import { initAndroidApp } from './platforms/android/androidApp.js';

const player = document.getElementById('player');

const audioService = createAudioService(player);
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
