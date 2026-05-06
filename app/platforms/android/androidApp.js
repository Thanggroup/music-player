import { processSongBatch } from '../../service/songProcessor.js';
/**
 * androidMock.js
 * 
 * Simulates device song retrieval.
 * Mock data for testing Android-style song loading.
 */

const mockDeviceSongs = [
  {
    title: "Song A",
    file: "./assets/Kobe Mane - VIOLENTO.mp3"
  },
  {
    title: null,
    file: "./assets/Kobe Mane - VIOLENTO.mp3"
  },
  {
    title: "",
    file: "./assets/LazuLight - Diamond City Lights (Official Music Video)   NIJISANJI EN.mp3"
  },
  {
    title: "No File Song",
    file: null
  },
  {
    title: "",
    file: null
  }
];

function loadDeviceSongs(core) {
  // Process and normalize songs (validation, title cleanup, playable flag)
  const processedSongs = processSongBatch(mockDeviceSongs);
  
  // Load playlist into core
  core.setPlaylist(processedSongs);
}

export function initAndroidApp(core, { syncUI }) {
  // load mock automatically
  loadDeviceSongs(core);
  syncUI();

  // optional: keep button for testing
  deviceBtn.addEventListener("click", () => {
    loadDeviceSongs(core);
    syncUI();
  });
}

