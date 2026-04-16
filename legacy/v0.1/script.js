const player = document.getElementById("player");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");

playBtn.addEventListener("click", () => {
  player.play();
});

pauseBtn.addEventListener("click", () => {
  player.pause();
});