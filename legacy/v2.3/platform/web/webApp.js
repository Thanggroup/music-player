/**
 * webPlayer.js
 * 
 * Handles file upload and playlist loading.
 * No validation, no UI manipulation - pure file→playlist pipeline.
 */

// Set up default playlist
const initialSongs = [
  {
    title: "TIKI TIKI",
    file: "../assets/TIKI TIKI (Slowed).mp3"
  },
  {
    title: "VIOLENTO",
    file: "../assets/Kobe Mane - VIOLENTO.mp3"
  },
  {
    title: "Diamond City Lights",
    file: "../assets/LazuLight - Diamond City Lights (Official Music Video)   NIJISANJI EN.mp3"
  },
  {
    title: "Rumors",
    file: "../assets/Nightcore - Rumors.mp3"
  }
];

function handleFileUpload(event, core) {
  const files = Array.from(event.target.files);
  
  if (!files.length) return;
  
  // Create raw song objects from files
  const rawSongs = files.map(file => ({
    title: file.name,
    file: file
  }));
  
  // Process and normalize songs (validation, title cleanup, playable flag)
  const processedSongs = processSongBatch(rawSongs);
  
  // Load playlist into core
  core.setPlaylist(processedSongs);
}

function initWebApp(core) {
  // enable upload
  fileInput.addEventListener("change", (e) => {
    handleFileUpload(e, core);
    syncUI();
  });
}

window.initApp = function(core) {
  initWebApp(core);
};