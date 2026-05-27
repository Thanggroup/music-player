// Android platform integration layer
import { processSongBatch } from '../../services/songProcessor.js';

const MusicPlugin = window.Capacitor.Plugins.MusicPlugin;

const App = window.Capacitor.Plugins.App;

async function loadDeviceSongs(core) {

  try {

    const result = await MusicPlugin.getSongs();

    const rawSongs = result.songs || [];
    const convertedSongs = rawSongs.map(song => ({
      ...song,
      file: window.Capacitor.convertFileSrc(song.file),
      nativeFile: song.file
    }));

    const processedSongs = processSongBatch(convertedSongs);

    core.setPlaylist(processedSongs);

  } catch (err) {
    console.error('Native songs error:', err);
  }
}

  export function initAndroidApp(
    core,
    audioService
  ) {
    loadDeviceSongs(core);

    App.addListener(
      "appStateChange",
      async ({ isActive }) => {

        if (!isActive) return;

        console.log(
          "[AndroidApp] resume → syncState()"
        );

        await audioService.syncState();
      }
    );
  
  // optional: keep button for testing
  deviceBtn.addEventListener("click", () => {
    loadDeviceSongs(core);
    });
  };

