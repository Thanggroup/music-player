import { createPlayerCore } from './core/playerCore.js';
import { processSongBatch } from './service/songProcessor.js';
import { initAndroidApp } from './platforms/android/androidApp.js';
// Setup Layer: DOM References
const player = document.getElementById("player");
const playBtn = document.getElementById("playBtn");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const songTitle = document.getElementById("songTitle");
const playlist = document.getElementById("playlist");
const progressBar = document.getElementById("progressBar");
const currentTimeDisplay = document.getElementById("currentTime");
const durationDisplay = document.getElementById("duration");
const volumeSlider = document.getElementById("volumeSlider");
const repeatBtn = document.getElementById("repeatBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const fileInput = document.getElementById("fileInput");
const deviceBtn = document.getElementById("deviceBtn");

// Initialize Core
const core = createPlayerCore({ player });


// UI Helper Functions

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return minutes + ":" + (secs < 10 ? "0" + secs : secs);
}

function renderPlaylist() {
  playlist.innerHTML = "";
  const songs = core.getSongs();
  const currentIndex = core.getCurrentIndex();
  
  songs.forEach((song, index) => {
    const li = document.createElement("li");
    li.textContent = song.title;
    
    if (index === currentIndex) {
      li.classList.add("active");
    }
    
    li.addEventListener("click", () => {
      core.handlePlaylistClick(index);
      syncUI();
    });
    
    playlist.appendChild(li);
  });
}

function updateSongTitle() {
  const song = core.getCurrentSong();
  if (song) {
    songTitle.textContent = "Now Playing: " + song.title;
  }
}

function updateRepeatButton() {
  const repeatMode = core.getRepeatMode();
  
  if (repeatMode === 0) {
    repeatBtn.textContent = "Repeat: Off";
  } else if (repeatMode === 1) {
    repeatBtn.textContent = "Repeat: All 🔁";
  } else if (repeatMode === 2) {
    repeatBtn.textContent = "Repeat: One 🔂";
  }
}

function updateShuffleUI() {
  const shuffleMode = core.getShuffleMode();
  
  if (shuffleMode) {
    shuffleBtn.textContent = "Shuffle: On 🔀";
  } else {
    shuffleBtn.textContent = "Shuffle: Off";
  }
}

function handlePlay() {
  playBtn.textContent = "⏸";
  playBtn.classList.add("playing");
}

function handlePause() {
  playBtn.textContent = "▶";
  playBtn.classList.remove("playing");
}

function handleLoadedMetadata() {
  durationDisplay.textContent = formatTime(player.duration);
  core.handleLoadedMetadata();
}

function handleTimeUpdate() {
  if (!player.duration) return;
  
  const progress = (player.currentTime / player.duration) * 100;
  progressBar.value = progress;
  
  currentTimeDisplay.textContent = formatTime(player.currentTime);
  
  core.handleTimeUpdate();
}

function syncUI() {
  updateSongTitle();
  renderPlaylist();
  updateRepeatButton();
  updateShuffleUI();
}

function handleKeydown(event) {
  if (event.code === "Space") {
    event.preventDefault();
    core.togglePlay();
  }
  
  if (event.code === "ArrowRight") {
    core.nextSong();
    syncUI();
  }
  
  if (event.code === "ArrowLeft") {
    core.prevSong();
    syncUI();
  }
}

// Event Layer: Wiring

// Control buttons
playBtn.addEventListener("click", () => {
  core.togglePlay();
  // UI will update via play/pause event → OK
});

nextBtn.addEventListener("click", () => {
  core.nextSong();
  syncUI();
});

prevBtn.addEventListener("click", () => {
  core.prevSong();
  syncUI();
});

repeatBtn.addEventListener("click", () => {
  core.handleRepeatToggle();
  updateRepeatButton();
});

shuffleBtn.addEventListener("click", () => {
  core.handleShuffleToggle();
  updateShuffleUI();
});

// Progress and volume
volumeSlider.addEventListener("input", (e) => {
  core.handleVolumeChange(Number(e.target.value));
});

progressBar.addEventListener("input", (e) => {
  core.handleSeek(e.target.value);
});

// Audio player events
player.addEventListener("play", handlePlay);
player.addEventListener("pause", handlePause);
player.addEventListener("loadedmetadata", handleLoadedMetadata);
player.addEventListener("timeupdate", handleTimeUpdate);
player.addEventListener("ended", () => {
  core.processSongEnd();
  syncUI();
});


// Keyboard controls
document.addEventListener("keydown", handleKeydown);

// Initialization Layer

// Load initial state
core.loadState();
core.applyState();

// Initialize UI
updateRepeatButton();
updateShuffleUI();
volumeSlider.value = player.volume;

//core.setPlaylist(initialSongs);
// Load songs from "device" (mocked)
// loadDeviceSongs(core);
syncUI();

initAndroidApp(core, { syncUI });
const MusicPlugin = window.Capacitor.Plugins.MusicPlugin;

async function testPlugin() {
  try {
    await MusicPlugin.ping();
    console.log('Native plugin connected');
  } catch (err) {
    console.error('Plugin error:', err);
  }
}

testPlugin();

async function testGetSongs() {
  try {
    const result = await MusicPlugin.getSongs();

    console.log(JSON.stringify(result));
    console.log(JSON.stringify(result.songs));

  } catch (err) {
    console.error('getSongs error:', err);
  }
}

testGetSongs();