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

let currentSong = 0;

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

function nextSong() {

  currentSong++;

  if (currentSong >= songs.length) {
    currentSong = 0;
  }

  loadSong();

}

function prevSong() {

  currentSong--;

  if (currentSong < 0) {
    currentSong = songs.length - 1;
  }

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

playBtn.addEventListener("click", togglePlay);

nextBtn.addEventListener("click", nextSong);

prevBtn.addEventListener("click", prevSong);

player.addEventListener("ended", nextSong);

player.addEventListener("loadedmetadata", function () {
  durationDisplay.textContent = formatTime(player.duration);
});

//song slider bar
player.addEventListener("timeupdate", function () {

  if (!player.duration) return;

  const progress = (player.currentTime / player.duration) * 100;
  progressBar.value = progress;

  currentTimeDisplay.textContent = formatTime(player.currentTime);
  durationDisplay.textContent = formatTime(player.duration);

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