const player = document.getElementById("player");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");

playBtn.addEventListener("click", function () {
  player.play();
});

pauseBtn.addEventListener("click", function () {
  player.pause();
});