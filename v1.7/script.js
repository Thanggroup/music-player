//Setup Layer
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

let songs = [{
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

// MOCK: Android-style device storage
const mockDeviceSongs = [
  {
    title: "Capsule Mix Speakers Inc",
    artist: "Unknown",
    uri: "../assets/Capsule-MixSpeakersInc-4750976.mp3"
  },
  {
    title: "Fucking Bullshit",
    artist: "Unknown",
    uri: "../assets/Fucking_Bullshit.mp3"
  },
  {
    title: "Get on Up Tyrone Briggs",
    artist: "Unknown",
    uri: "../assets/Get+on+Up_Tyrone+Briggs_1543070911.mp3"
  },
  {
    title: "Kobe Mane VIOLENTO",
    artist: "Kobe Mane",
    uri: "../assets/Kobe Mane - VIOLENTO.mp3"
  }
];

let playlistItems = [];

let currentSong = 0;

let repeatMode = 0;

let shuffleMode = false;

let shuffleOrder = [];
let shuffleIndex = 0;

let isRepeating = false;

let playerState = {
  currentIndex: 0,
  currentTime: 0,
  volume: 1
};

let lastSaveTime = 0;

let isLoading = false;

//Logic Layer (Core Functionality)
function loadSong(play = true) {

  player.src = songs[currentSong].file;
  player.load();
  songTitle.textContent = "Now Playing: " + songs[currentSong].title;

  playlistItems.forEach(function(item) {
    item.classList.remove("active");
  });

  playlistItems[currentSong].classList.add("active");

  if (play) {
    player.play();
  }
}

function createShuffle() {

  shuffleOrder = songs.map((_, i) => i);

  shuffleOrder = shuffleOrder.filter(i => i !== currentSong);

  for (let i = shuffleOrder.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));

    [shuffleOrder[i], shuffleOrder[j]] =
    [shuffleOrder[j], shuffleOrder[i]];

  }

  shuffleOrder.unshift(currentSong);

  shuffleIndex = 0;

}

function getNextSong() {

  if (!shuffleMode) {
    return (currentSong + 1) % songs.length;
  }

  shuffleIndex++;

  if (shuffleIndex >= shuffleOrder.length) {

    createShuffle();
    shuffleIndex = 0;

  }

  return shuffleOrder[shuffleIndex];

}

function nextSong() {
  if (isBusy()) return;
  currentSong = getNextSong();
  loadSong();
}

function getPrevSong() {

  if (!shuffleMode) {
    return (currentSong - 1 + songs.length) % songs.length;
  }

  shuffleIndex--;

  if (shuffleIndex < 0) {
    shuffleIndex = shuffleOrder.length - 1;
  }

  return shuffleOrder[shuffleIndex];

}

function prevSong() {
  if (isBusy()) return;
  currentSong = getPrevSong();
  loadSong();
}

function togglePlay() {
  if (isBusy()) return;

  if (player.paused) {
    player.play();
  } else {
    player.pause();
  }

}

function processSongEnd() {
  if (repeatMode === 2) {
    isRepeating = true;
    loadSong();
    return;
  }

  if (repeatMode === 1) {
    nextSong();
    return;
  }

  // repeatMode === 0
  if (currentSong === songs.length - 1) {
    player.pause();
  } else {
    nextSong();
  }
}

function handleLoadedMetadata() {
  durationDisplay.textContent = formatTime(player.duration);

    if (isRepeating) {
    player.currentTime = 0; // force restart
    isRepeating = false;
    return;
  }

// Only restore time if loading the SAME song
    if (currentSong === playerState.currentIndex) {
    player.currentTime = playerState.currentTime || 0;
  } else {
    player.currentTime = 0;  // Reset to start if different song
  }
}

function handleTimeUpdate() {
  if (!player.duration) return;

  const progress = (player.currentTime / player.duration) * 100;
  progressBar.value = progress;

  currentTimeDisplay.textContent = formatTime(player.currentTime);
  durationDisplay.textContent = formatTime(player.duration);

  const now = Date.now();

  if (now - lastSaveTime > 1000) { // Save state at most once per second
    saveState();
    lastSaveTime = now;
  }
}

function handleSeek() {

  const time = (progressBar.value / 100) * player.duration;

  player.currentTime = time;
}

function handlePlay() {
  playBtn.textContent = "⏸";
  playBtn.classList.add("playing");
}

function handlePause() {
  playBtn.textContent = "▶";
  playBtn.classList.remove("playing");
}

function handleKeydown(event) {

  if (event.code === "Space") {
    event.preventDefault();
    togglePlay();
  }

  if (event.code === "ArrowRight") {
    nextSong();
  }

  if (event.code === "ArrowLeft") {
    prevSong();
  }

}

function handleVolumeChange() {

  player.volume = volumeSlider.value;
  saveState();

}

function handleRepeatToggle() {
  if (isBusy()) return;

  repeatMode++;

  if (repeatMode > 2) {
    repeatMode = 0;
  }
  updateRepeatButton();
}

function handlePlaylistClick(index) {
  if (isBusy()) return;
  currentSong = index;
  loadSong();
}

function renderPlaylist() {
  playlist.innerHTML = "";   // ✅ clear DOM
  playlistItems = [];        // ✅ reset array

  songs.forEach((song, index) => {
    const li = document.createElement("li");
    li.textContent = song.title;

    li.addEventListener("click", () => handlePlaylistClick(index));

    playlist.appendChild(li);
    playlistItems.push(li);
  });
}

function handleShuffleToggle() {
  if (isBusy()) return;
  shuffleMode = !shuffleMode;

  updateShuffleUI();

  if (shuffleMode && shuffleOrder.length === 0) {
    createShuffle();
  }
}

function updateShuffleUI() {
  if (shuffleMode) {
    shuffleBtn.textContent = "Shuffle: On 🔀";
  } else {
    shuffleBtn.textContent = "Shuffle: Off";
  }
}

function formatTime(seconds) {

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return minutes + ":" + (secs < 10 ? "0" + secs : secs);
}

function updateRepeatButton() {

  if (repeatMode === 0) {
    repeatBtn.textContent = "Repeat: Off";
  }

  if (repeatMode === 1) {
    repeatBtn.textContent = "Repeat: All 🔁";
  }

  if (repeatMode === 2) {
    repeatBtn.textContent = "Repeat: One 🔂";
  }

}

function saveState() {
  playerState.currentIndex = currentSong;
  playerState.currentTime = player.currentTime;
  playerState.volume = player.volume;
  playerState.repeatMode = repeatMode;

  playerState.shuffleMode = shuffleMode;
  playerState.shuffleOrder = shuffleOrder;
  playerState.shuffleIndex = shuffleIndex;

  localStorage.setItem("playerState", JSON.stringify(playerState));
}

function loadState() {
  const saved = localStorage.getItem("playerState");

  if (saved) {
    playerState = JSON.parse(saved);

    currentSong = playerState.currentIndex;

    volumeSlider.value = playerState.volume;
    player.volume = playerState.volume;
    repeatMode = playerState.repeatMode ?? 0;

    shuffleMode = playerState.shuffleMode ?? false;
    shuffleOrder = playerState.shuffleOrder ?? [];
    shuffleIndex = playerState.shuffleIndex ?? 0;
  }
}

function applyState() {
  updateRepeatButton();
  updateShuffleUI();
  // later: shuffle, volume UI, etc.
}

function handleFileUpload(e) {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  loadLocalSongs(files);
}

function cleanSongName(fileName) {
  return fileName
    .replace(/\.[^/.]+$/, "")   // remove extension
    .replace(/[_\-+]/g, " ")    // replace separators with space
    .replace(/\d+$/, "")        // remove trailing numbers
    .trim();                    // clean spaces
}

function createSongObject({ title, file }) {
  return {
    title,
    file
  };
}

function setPlaylist(newSongs) {
  // 1. Stop playback
  player.pause();

  // 2. Clean old blob URLs
  songs.forEach(song => {
    if (song.file?.startsWith("blob:")) {
      URL.revokeObjectURL(song.file);
    }
  });

  // 3. Replace songs
  songs = newSongs;

  // 4. Reset index
  currentSong = 0;

  // 5. Shuffle handling
  if (shuffleMode) {
    createShuffle();
    shuffleIndex = 0;
  }

  // 6. UI + play
  renderPlaylist();
  loadSong(true);
}

function loadLocalSongs(files) {
  const newSongs = files.map(file =>
    createSongObject({
      title: cleanSongName(file.name),
      file: URL.createObjectURL(file)
    })
  );

  setPlaylist(newSongs);
}

function loadDeviceSongs(deviceSongs) {
  const newSongs = deviceSongs.map(song =>
    createSongObject({
      title: song.title,
      file: song.uri  // Maps Android uri → player file
    })
  );

  setPlaylist(newSongs);
}

async function requestDeviceSongs() {
  if (isLoading) {
    console.warn("Already loading device songs");
    return;
  }

  isLoading = true;

  try {
    // Step 1: Simulate permission request
    const hasPermission = await new Promise(resolve => {
      setTimeout(() => resolve(true), 1000); // change to false to test denial
    });

    if (!hasPermission) {
      console.warn("Permission denied");
      return;
    }

    // Step 2: Simulate fetching songs
    const deviceSongs = await new Promise(resolve => {
      setTimeout(() => resolve(mockDeviceSongs), 1000);
    });

    if (!deviceSongs || deviceSongs.length === 0) {
      console.warn("No songs found on device");
      return;
    }

    // Step 3: Pass into your pipeline
    loadDeviceSongs(deviceSongs);

    console.log("Device songs loaded");
  } catch (error) {
    console.error("Failed to load device songs:", error);
  } finally {
    isLoading = false;
  }
}

function isBusy() {
  return isLoading;
}

//Event Layer (User Interaction)
playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);
repeatBtn.addEventListener("click", handleRepeatToggle);
shuffleBtn.addEventListener("click", handleShuffleToggle);

player.addEventListener("loadedmetadata", handleLoadedMetadata);
player.addEventListener("timeupdate", handleTimeUpdate);
player.addEventListener("play", handlePlay);
player.addEventListener("pause", handlePause);
player.addEventListener("ended", processSongEnd);

progressBar.addEventListener("input", handleSeek);
volumeSlider.addEventListener("input", handleVolumeChange);

document.addEventListener("keydown", handleKeydown);

fileInput.addEventListener("change", handleFileUpload);

//Initialization Layer (Setup Initial State)
renderPlaylist();
loadState();
applyState();
loadSong(false);