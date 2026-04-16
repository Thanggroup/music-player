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

//Play the song func
function loadSong() {
  player.src = songs[currentSong].file;
  songTitle.textContent = "Now Playing: " + songs[currentSong].title;
  player.play();
}

//play btn
playBtn.addEventListener("click", function () {
  player.play();
});

//pause btn
pauseBtn.addEventListener("click", function () {
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
player.addEventListener("ended", function () {
  currentSong++;

  if (currentSong >= songs.length) {
    currentSong = 0;
  }

  loadSong();
});

loadSong();