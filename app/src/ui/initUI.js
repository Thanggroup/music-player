// UI rendering + event wiring layer
import { formatTime } from '../utils/formatTime.js';
export function initUI({
  core,
  audioService
}) {

  // DOM References
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

  // Helper Functions


  function renderPlaylist() {
    playlist.innerHTML = "";

    const songs = core.getSongs();
    const currentIndex = core.getCurrentIndex();

    songs.forEach((song, index) => {
      const li = document.createElement("li");

      const durationText = song.duration
        ? formatTime(song.duration / 1000)
        : "--:--";

      const rawArtist = song.artist?.trim();

      const artistText =
        rawArtist &&
        rawArtist !== "<unknown>"
          ? rawArtist
          : "Unknown Artist";

      const metaParts = [artistText];

      if (durationText) {
        metaParts.push(durationText);
      }

      li.innerHTML = `
        <strong>${song.title}</strong><br>
        <small>${metaParts.join(" • ")}</small>
      `;

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
    const songs = core.getSongs();
    const song = core.getCurrentSong();

    if (!songs || songs.length === 0) {
      songTitle.textContent = "No songs found";
      return;
    }

    if (!song || song.playable === false) {
      songTitle.textContent = "No playable songs";
      return;
    }

    songTitle.textContent = "Now Playing: " + song.title;
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
    durationDisplay.textContent = formatTime(
      audioService.getDuration()
    );

    core.handleLoadedMetadata();
  }

  function handleTimeUpdate() {
    const duration = audioService.getDuration();

    if (!duration) return;

    const currentTime = audioService.getCurrentTime();

    const progress = (currentTime / duration) * 100;

    progressBar.value = progress;

    currentTimeDisplay.textContent = formatTime(currentTime);

    core.handleTimeUpdate();
  }

  function syncUI() {
    updateSongTitle();
    renderPlaylist();
    updateRepeatButton();
    updateShuffleUI();
  }

  core.subscribe(syncUI);

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

  // Event Wiring

  playBtn.addEventListener("click", () => {
    core.togglePlay();
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

  volumeSlider.addEventListener("input", (e) => {
    core.handleVolumeChange(Number(e.target.value));
  });

  progressBar.addEventListener("input", (e) => {
    core.handleSeek(e.target.value);
  });

  audioService.on("play", handlePlay);
  audioService.on("pause", handlePause);
  audioService.on("loadedmetadata", handleLoadedMetadata);
  audioService.on("timeupdate", handleTimeUpdate);

  audioService.on("ended", () => {
    core.processSongEnd();
    syncUI();
  });

  document.addEventListener("keydown", handleKeydown);

  // Initial UI State

  updateRepeatButton();
  updateShuffleUI();

  volumeSlider.value = audioService.getVolume();

  syncUI();

  return {
    syncUI
  };

}