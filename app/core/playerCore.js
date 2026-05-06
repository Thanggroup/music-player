export function createPlayerCore({ player }) {
  
  let songs = [];
  let currentSong = 0;
  let repeatMode = 0;
  let shuffleMode = false;
  let shuffleOrder = [];
  let shuffleIndex = 0;
  let playerState = {
    currentIndex: 0,
    currentTime: 0,
    volume: 1
  };
  let lastSaveTime = 0;
  let isLoading = false;
  let loadVersion = 0;
  let activeLoadSongIndex = 0;
  let isRepeating = false;

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

      player.volume = playerState.volume;
      repeatMode = playerState.repeatMode ?? 0;

      shuffleMode = playerState.shuffleMode ?? false;
      shuffleOrder = playerState.shuffleOrder ?? [];
      shuffleIndex = playerState.shuffleIndex ?? 0;
    }
  }

  function applyState() {
  }

  function isBusy() {
    return isLoading;
  }

  function loadSong(play = true) {

    let attempts = 0;
    let foundValid = false;

    while (attempts < songs.length) {
      if (songs[currentSong] && songs[currentSong].playable !== false) {
        foundValid = true;
        break;
      }

      if (!foundValid || !songs[currentSong] || !songs[currentSong].file) {
        console.warn("No valid song to load");
        return;
      } 

      currentSong = (currentSong + 1) % songs.length;
      attempts++;
    }

    loadVersion++;
    const currentLoadVersion = loadVersion;
    activeLoadSongIndex = currentSong;
    player._loadVersion = currentLoadVersion;

    if (foundValid) {
      player.src = songs[currentSong].file;
      player.load();
    }

    if (play && foundValid) {
      player.play();
    }
  }

  function nextSong() {
    if (isBusy()) return;
    currentSong = getNextSong();
    loadSong();
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

    saveState();
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

    if (currentSong === songs.length - 1) {
      player.pause();
    } else {
      nextSong();
    }
  }

  function handleLoadedMetadata() {
    if (player._loadVersion !== loadVersion) return;

    if (isRepeating) {
      player.currentTime = 0;
      isRepeating = false;
      return;
    }

    if (activeLoadSongIndex === playerState.currentIndex) {
      player.currentTime = playerState.currentTime || 0;
    } else {
      player.currentTime = 0;
    }
  }

  function handleTimeUpdate() {
    if (!player.duration) return;

    const now = Date.now();

    if (now - lastSaveTime > 1000) {
      saveState();
      lastSaveTime = now;
    }
  }

  function handleSeek(seekValue) {

    const time = (seekValue / 100) * player.duration;

    player.currentTime = time;
  }

  function handleVolumeChange(volume) {

    player.volume = volume;
    saveState();

  }

  function handleRepeatToggle() {
    if (isBusy()) return;

    repeatMode++;

    if (repeatMode > 2) {
      repeatMode = 0;
    }

    saveState();
  }

  function handlePlaylistClick(index) {
    if (isBusy()) return;
    currentSong = index;
    loadSong();
  }

  function handleShuffleToggle() {
    if (isBusy()) return;
    shuffleMode = !shuffleMode;

    if (shuffleMode && shuffleOrder.length === 0) {
      createShuffle();
    }
    saveState();
  }

function setPlaylist(newSongs) {
    player.pause();

    songs.forEach(song => {
      if (song.file?.startsWith("blob:")) {
        URL.revokeObjectURL(song.file);
      }
    });

    songs = newSongs;
    currentSong = 0;

    if (shuffleMode) {
      createShuffle();
      shuffleIndex = 0;
    }

    // Only load if songs exist
    if (songs.length > 0) {
      loadSong(false);
    }
  }

  return {
    loadSong,
    nextSong,
    prevSong,
    togglePlay,
    processSongEnd,
    handleLoadedMetadata,
    handleTimeUpdate,
    handleSeek,
    handleVolumeChange,
    handleRepeatToggle,
    handlePlaylistClick,
    handleShuffleToggle,
    saveState,
    loadState,
    applyState,
    isBusy,
    setPlaylist,
    getSongs: () => songs,
    getCurrentSong: () => songs[currentSong] || null,
    getCurrentIndex: () => currentSong,
    getRepeatMode: () => repeatMode,
    getShuffleMode: () => shuffleMode,
    getState: () => ({ ...playerState, repeatMode, shuffleMode })
  };
}
