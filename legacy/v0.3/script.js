const player = document.getElementById("player");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const songTitle = document.getElementById("songTitle");

const songs = [
  { title: "Get On Up", file: "Get+on+Up_Tyrone+Briggs_1543070911.mp3" },
  { title: "Fucking Bullshit", file: "Fucking_Bullshit.mp3" },
  { title: "Capsule", file: "Capsule-MixSpeakersInc-4750976.mp3" }
];

let currentSong = 0;

function loadSong() {
  player.src = songs[currentSong].file;
  songTitle.textContent = "Now Playing: " + songs[currentSong].title;
  player.play();
}

playBtn.addEventListener("click", function () {
  player.play();
});

pauseBtn.addEventListener("click", function () {
  player.pause();
});

nextBtn.addEventListener("click", function nextSong() {
  currentSong++;

  if (currentSong >= songs.length) {
    currentSong = 0;
  }

  loadSong();
});

prevBtn.addEventListener("click", function prevSong() {
  currentSong--;

  if (currentSong < 0) {
    currentSong = songs.length - 1;
  }

  loadSong();
});

loadSong();