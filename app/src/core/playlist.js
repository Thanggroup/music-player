// Playlist state + navigation manager
export function createPlaylistManager() {

  let songs = [];
  let currentSong = 0;

  let shuffleMode = false;
  let shuffleOrder = [];
  let shuffleIndex = 0;

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

  function getNextIndex() {

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

  function getPrevIndex() {

    if (!shuffleMode) {
      return (currentSong - 1 + songs.length) % songs.length;
    }

    shuffleIndex--;

    if (shuffleIndex < 0) {
      shuffleIndex = shuffleOrder.length - 1;
    }

    return shuffleOrder[shuffleIndex];

  }

  function setSongs(newSongs) {
    songs = newSongs;
  }

  function setCurrentIndex(index) {
    currentSong = index;
  }

  function toggleShuffle() {
    shuffleMode = !shuffleMode;

    if (shuffleMode && shuffleOrder.length === 0) {
      createShuffle();
    }
  }

  function restoreState(state) {
    currentSong = state.currentIndex ?? 0;

    shuffleMode = state.shuffleMode ?? false;
    shuffleOrder = state.shuffleOrder ?? [];
    shuffleIndex = state.shuffleIndex ?? 0;
  }

  return {
    getSongs: () => songs,
    getCurrentSong: () => songs[currentSong] || null,
    getCurrentIndex: () => currentSong,

    setSongs,
    setCurrentIndex,

    getNextIndex,
    getPrevIndex,

    getShuffleMode: () => shuffleMode,
    toggleShuffle,

    getShuffleOrder: () => shuffleOrder,
    getShuffleIndex: () => shuffleIndex,

    restoreState
  };

}