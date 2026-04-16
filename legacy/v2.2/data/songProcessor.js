/**
 * songProcessor.js
 * 
 * Handles ALL data validation and normalization for songs.
 * Single entry point: processSongBatch(rawSongs)
 * 
 * - Normalizes titles (filenames, empty strings, etc.)
 * - Validates file existence
 * - Detects playability issues
 * - Returns array with .playable property on each song
 */

/**
 * Main entry point - process a batch of raw songs
 * @param {Array} rawSongs - Array of song objects { title, file, ... }
 * @returns {Array} Processed songs with .playable property
 */
function processSongBatch(rawSongs) {
  if (!Array.isArray(rawSongs) || rawSongs.length === 0) {
    return [];
  }

  const internalFlags = buildFlagsArray(rawSongs);

  const processedSongs = rawSongs.map((song, index) => {
    const flags = internalFlags[index];
    const normalizedTitle = normalizeSongTitle(song);

    let fileForPlayback = song.file;

    // Only convert if it's a File AND not already converted
    if (song.file instanceof File) {
      fileForPlayback = URL.createObjectURL(song.file);
    }

    return {
      title: normalizedTitle,
      file: fileForPlayback || null,
      playable: !shouldBlockPlayback(flags),
      original: song
    };
  });

  return processedSongs;
}

/**
 * Normalize song title:
 * 1. Use existing title if valid
 * 2. Fall back to filename if title is missing/empty
 * 3. Clean filename (remove extension, separators, etc.)
 * 4. Default to "Unknown Title" as last resort
 */
function normalizeSongTitle(song) {
  // internal cleaner (combined here)
  function clean(name) {
    let decoded = name;

    // Step 1: try decode URI (safe)
    try {
      decoded = decodeURIComponent(name);
    } catch (e) {
      // ignore if not encoded
    }

    return decoded
      .replace(/\.[^/.]+$/, "")   // remove extension
      .replace(/\+/g, " ")        // + → space (important for URLs)
      .replace(/[_\-]/g, " ")     // separators
      .replace(/\d+$/, "")        // trailing numbers
      .trim();
  }

  // Case 1: use existing title
  if (song.title && typeof song.title === "string" && song.title.trim() !== "") {
    return clean(song.title);
  }

  // Case 2: fallback to file name
  if (song.file && song.file.name) {
    return clean(song.file.name);
  }

  // Case 3: safe fallback
  return "Unknown";
}

/**
 * Extract filename from file path or URL
 * Examples:
 *   "/path/to/song.mp3" → "song.mp3"
 *   "blob:http://..." → "song" (from title or Unknown)
 */
function extractFilenameFromPath(filePath) {
  const parts = filePath.split('/');
  return parts[parts.length - 1] || "";
}

/**
 * Clean song name from filename:
 * - Remove file extension
 * - Replace underscores, hyphens, plus signs with spaces
 * - Remove trailing numbers (e.g., "Song 1" → "Song ")
 * - Trim whitespace
 */
function cleanSongName(fileName) {
  return fileName
    .replace(/\.[^/.]+$/, "")        // remove extension
    .replace(/[_\-+]/g, " ")         // replace separators with space
    .replace(/\s+\d+$/, "")          // remove trailing numbers with spaces
    .trim();                         // clean spaces
}

/**
 * INTERNAL: Build flags for each song
 * Detects playability issues
 */
function buildFlagsArray(songs) {
  return songs.map(song => detectFlags(song));
}

/**
 * INTERNAL: Detect flags for a single song
 * Flags:
 *   - MISSING_FILE: file is null/undefined
 *   - INVALID_DURATION: duration exists but is <= 0
 */
function detectFlags(song) {
  const flags = [];

  if (!song.file) {
    flags.push("MISSING_FILE");
  }

  if (song.duration && song.duration <= 0) {
    flags.push("INVALID_DURATION");
  }

  return flags;
}

/**
 * INTERNAL: Determine if song should be blocked from playback
 * Currently blocks only: MISSING_FILE
 */
function shouldBlockPlayback(flags) {
  if (!flags || !Array.isArray(flags)) return false;
  return flags.includes("MISSING_FILE") || flags.includes("INVALID_DURATION");
}