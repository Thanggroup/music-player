import { processSongBatch } from '../../service/songProcessor.js';
/**
 * androidMock.js
 * 
 * Simulates device song retrieval.
 * Mock data for testing Android-style song loading.
 */

const MusicPlugin = window.Capacitor.Plugins.MusicPlugin;

async function loadDeviceSongs(core) {

  try {

    const result = await MusicPlugin.getSongs();

    const rawSongs = result.songs || [];

    console.log(JSON.stringify(rawSongs));

    const processedSongs = processSongBatch(rawSongs);

    core.setPlaylist(processedSongs);

  } catch (err) {
    console.error('Native songs error:', err);
  }
}

export function initAndroidApp(core, { syncUI }) {
  // load mock automatically
  loadDeviceSongs(core).then(() => {
    syncUI();
  });
  
  // optional: keep button for testing
  deviceBtn.addEventListener("click", () => {
    loadDeviceSongs(core).then(() => {
      syncUI();
    });
  });
}

