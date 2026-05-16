// Android platform integration layer
import { processSongBatch } from '../../services/songProcessor.js';

const MusicPlugin = window.Capacitor.Plugins.MusicPlugin;

async function loadDeviceSongs(core) {

  try {

    const result = await MusicPlugin.getSongs();

    const rawSongs = result.songs || [];
    const convertedSongs = rawSongs.map(song => ({
      ...song,
      file: window.Capacitor.convertFileSrc(song.file)
    }));

    const processedSongs = processSongBatch(convertedSongs);

    core.setPlaylist(processedSongs);

  } catch (err) {
    console.error('Native songs error:', err);
  }
}

export function initAndroidApp(core) {
    loadDeviceSongs(core);
  
  // optional: keep button for testing
  deviceBtn.addEventListener("click", () => {
    loadDeviceSongs(core);
    });
  };

