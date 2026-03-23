const player = document.getElementById("player");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
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
let repeatMode = false;
let shuffleMode = false;
let shuffleOrder = [];
let shuffleIndex = 0;
let recentSongs = [];
let savedTime = 0;
let timeRestored = false;

//player state for local storage
let playerState = {
  currentIndex: 0,
  currentTime: 0,
  volume: 1
};

function loadSong(play = true) {
  player.src = songs[currentSong].file;
  player.load();
  songTitle.textContent = "Now Playing: " + songs[currentSong].title;
  playlistItems.forEach(function(item) {
    item.classList.remove("active");
  });
  playlistItems[currentSong].classList.add("active");
  if (autoPlay) {
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
  if (shuffleMode) {
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

//local storage
function loadState() {
  const saved = localStorage.getItem("playerState");

  if (saved) {
    playerState = JSON.parse(saved);
  }
}

function saveState() {
  localStorage.setItem("playerState", JSON.stringify(playerState));
}

playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);
player.addEventListener("ended", function () {
  if (repeatMode === 2) {
    loadSong();
    return;
  }
  if (repeatMode === 1) {
    nextSong();
    return;
  }
  if (repeatMode === 0) {
    if (currentSong === songs.length - 1) {
      player.pause();
    } else {
      nextSong();
    }
  }
});

player.addEventListener("loadedmetadata", function () {
  if (!timeRestored) {
    player.currentTime = savedTime || 0;
    timeRestored = true;
  }
});

//Playlist 
songs.forEach(function(song, index) {
  const li = document.createElement("li");
  li.textContent = (index + 1) + ". " + song.title;
  li.addEventListener("click", function() {
    currentSong = index;
    loadSong();
  });
  playlist.appendChild(li);
  playlistItems.push(li);
});

//song slider bar
player.addEventListener("timeupdate", function () {
  if (!player.duration) return;
  const progress = (player.currentTime / player.duration) * 100;
  progressBar.value = progress;
  currentTimeDisplay.textContent = formatTime(player.currentTime);
  durationDisplay.textContent = formatTime(player.duration);
  savePlayerState();
});

//user drag song slider bar to play
progressBar.addEventListener("input", function () {
  const time = (progressBar.value / 100) * player.duration;
  player.currentTime = time;
});

//play and pause icon
player.addEventListener("play", function () {
  playBtn.textContent = "⏸";
  playBtn.classList.add("playing");
});

player.addEventListener("pause", function () {
  playBtn.textContent = "▶";
  playBtn.classList.remove("playing");
});

loadSong(false);

//use arrow key to change song
document.addEventListener("keydown", function(event) {
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
});

//volume Slider
volumeSlider.addEventListener("input", function () {
  player.volume = volumeSlider.value;
});

//repeat btn
repeatBtn.addEventListener("click", function () {
  repeatMode++;
  if (repeatMode > 2) {
    repeatMode = 0;
  }
  updateRepeatButton();
});

//shuffle btn
shuffleBtn.addEventListener("click", function () {
  shuffleMode = !shuffleMode;
  if (shuffleMode) {
    shuffleBtn.textContent = "Shuffle: On 🔀";
    createShuffle();
  } else {
    shuffleBtn.textContent = "Shuffle: Off";
  }
  savePlayerState();
});
loadState();
loadSong(playerState.currentIndex);