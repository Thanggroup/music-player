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

const songs = [{
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
  currentSong = getPrevSong();
  loadSong();

}

function togglePlay() {

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

  saveState();
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

  repeatMode++;

  if (repeatMode > 2) {
    repeatMode = 0;
  }
  updateRepeatButton();
}

function handlePlaylistClick(index) {
  currentSong = index;
  loadSong();
}

function renderPlaylist() {
  songs.forEach((song, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${song.title}`;

    li.addEventListener("click", () => handlePlaylistClick(index));

    playlist.appendChild(li);
    playlistItems.push(li);
  });
}

function handleShuffleToggle() {
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

//Initialization Layer (Setup Initial State)
renderPlaylist();
loadState();
applyState();
loadSong(false);