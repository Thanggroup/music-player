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

//Play the song func 
function loadSong(play = true) {

  player.src = songs[currentSong].file;

  songTitle.textContent = "Now Playing: " + songs[currentSong].title;

  playlistItems.forEach(function(item) {
    item.classList.remove("active");
  });

  playlistItems[currentSong].classList.add("active");

  if (play) {
    player.play();
  }
}

//play btn 
playBtn.addEventListener("click", function() {
  player.play();
});

//pause btn 
pauseBtn.addEventListener("click", function() {
  player.pause();
});

//next song btn 
nextBtn.addEventListener("click", function nextSong() {
  currentSong++;

  if (currentSong >= songs.length) {
    currentSong = 0;
  }
  loadSong();
});

//prev song btn 
prevBtn.addEventListener("click", function prevSong() {
  currentSong--;
  if (currentSong < 0) {
    currentSong = songs.length - 1;
  }
  loadSong();
});

//when song end 
player.addEventListener("ended", function() {
  currentSong++;
  if (currentSong >= songs.length) {
    currentSong = 0;
  }
  loadSong();
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

function formatTime(seconds) {

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return minutes + ":" + (secs < 10 ? "0" + secs : secs);
}

loadSong(false);