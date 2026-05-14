import { processSongBatch } from '../../service/songProcessor.js';
/**
 * androidMock.js
 * 
 * Simulates device song retrieval.
 * Mock data for testing Android-style song loading.
 */

const MusicPlugin = window.Capacitor.Plugins.MusicPlugin;

async function loadDeviceSongs(core, syncUI) {

  try {

    const result = await MusicPlugin.getSongs();

    const rawSongs = result.songs || [];
    const convertedSongs = rawSongs.map(song => ({
      ...song,
      file: window.Capacitor.convertFileSrc(song.file)
    }));

    const processedSongs = processSongBatch(convertedSongs);

    core.setPlaylist(processedSongs);
    syncUI();

  } catch (err) {
    console.error('Native songs error:', err);
  }
}

export function initAndroidApp(core, { syncUI }) {
    loadDeviceSongs(core, syncUI);
  
  // optional: keep button for testing
  deviceBtn.addEventListener("click", () => {
    loadDeviceSongs(core, syncUI);

    });
  };

