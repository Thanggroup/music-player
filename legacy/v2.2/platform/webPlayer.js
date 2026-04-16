/**
 * webPlayer.js
 * 
 * Handles file upload and playlist loading.
 * No validation, no UI manipulation - pure file→playlist pipeline.
 */

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