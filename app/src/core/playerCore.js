// Playback orchestration + persistence layer
import { createPlaylistManager } from './playlist.js';

export function createPlayerCore({
  audioService,
  storageService
}) {
  
  const playlist = createPlaylistManager();
  let repeatMode = 0;
  let playerState = {
    currentIndex: 0,
    currentTime: 0,
    volume: 1
  };
  let lastSaveTime = 0;
  let loadVersion = 0;
  let activeLoadSongIndex = 0;
  let isRepeating = false;
  let listeners = [];

  function saveState() {
    playerState.currentIndex = playlist.getCurrentIndex();;
    playerState.currentTime = audioService.getCurrentTime();
    playerState.volume = audioService.getVolume();
    playerState.repeatMode = repeatMode;

    playerState.shuffleMode = playlist.getShuffleMode();
    playerState.shuffleOrder = playlist.getShuffleOrder();
    playerState.shuffleIndex = playlist.getShuffleIndex();

    storageService.save("playerState", playerState);
  }

  function loadState() {
    const saved = storageService.load("playerState");

    if (saved) {
      playerState = saved;

      playlist.restoreState(playerState);

      audioService.setVolume(playerState.volume);
      repeatMode = playerState.repeatMode ?? 0;
    }
  }

  function notifyChange() {
  listeners.forEach(listener => listener());
  }

  function subscribe(listener) {
    listeners.push(listener);

    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }

  function loadSong(play = true) {

    let attempts = 0;
    let foundValid = false;

    while (attempts < playlist.getSongs().length) {
      if (playlist.getSongs()[playlist.getCurrentIndex()] && playlist.getSongs()[playlist.getCurrentIndex()].playable !== false) {
        foundValid = true;
        break;
      }

      if (!foundValid || !playlist.getSongs()[playlist.getCurrentIndex()] || !playlist.getSongs()[playlist.getCurrentIndex()].file) {
        console.warn("No valid song to load");
        return;
      } 

      playlist.setCurrentIndex((playlist.getCurrentIndex() + 1) % playlist.getSongs().length);
      attempts++;
    }

    syncQueueMirror();

    loadVersion++;

    console.log(
      `[PlayerCore] loadSong version advance newLoadVersion=${loadVersion} currentIndex=${playlist.getCurrentIndex()}`
    );

    const currentLoadVersion = loadVersion;
    activeLoadSongIndex = playlist.getCurrentIndex();
    audioService.setLoadVersion(currentLoadVersion);

    if (foundValid) {
      const currentSong =
        playlist.getSongs()[playlist.getCurrentIndex()];

      const source =
        window.Capacitor.getPlatform() === "android"
          ? currentSong.nativeFile || currentSong.file
          : currentSong.file;

      audioService.setSource(source);
      audioService.load();
    }

    if (play && foundValid) {
      audioService.play();
    }
  }

function nextSong() {
  audioService.next();
}

function prevSong() {
  audioService.prev();
}

  function togglePlay() {

      if (audioService.isPaused()) {
        audioService.play();
      } else {
        audioService.pause();
      }

    saveState();
  }

  function processSongEnd(endedLoadVersion) {

    console.log(
      `[PlayerCore] processSongEnd endedLoadVersion=${endedLoadVersion} currentLoadVersion=${loadVersion} repeatMode=${repeatMode} currentIndex=${playlist.getCurrentIndex()}`
    );

    if (endedLoadVersion !== loadVersion) {

      console.log(
        "[PlayerCore] stale ended ignored",
        {
          endedLoadVersion,
          currentLoadVersion: loadVersion,
        }
      );

      return;
    }

    if (repeatMode === 2) {
      isRepeating = true;
      loadSong();
      return;
    }

    if (repeatMode === 1) {
      nextSong();
      return;
    }

    if (
      playlist.getCurrentIndex() ===
      playlist.getSongs().length - 1
    ) {
      audioService.pause();
    } else {
      nextSong();
    }
  }

  function handleLoadedMetadata() {
    console.log(
      "[PlayerCore] loadedmetadata",
      {
        audioLoadVersion: audioService.getLoadVersion(),
        loadVersion,
        activeLoadSongIndex
      }
    );

    if (audioService.getLoadVersion() !== loadVersion) {

      console.log(
        "[PlayerCore] loadedmetadata rejected"
      );

      return;
    }

    // ONLY cache sync — NO seeking
    playerState.duration = audioService.getDuration();

    // optional: keep index tracking only
    playerState.currentIndex = activeLoadSongIndex;
  }

  function handleTimeUpdate(event) {

    if (!event) return;

    if (event.loadVersion !== loadVersion) {

      console.log(
        `[PlayerCore] stale timeupdate eventLoadVersion=${event.loadVersion} currentLoadVersion=${loadVersion}`
      );

      return;
    }

    if (!audioService.getDuration()) return;

    const now = Date.now();

    if (now - lastSaveTime > 1000) {
      saveState();
      lastSaveTime = now;
    }
  }

  function handleSeek(seekValue) {

    const time = (seekValue / 100) * audioService.getDuration();

    audioService.setCurrentTime(time);
  }

  function handleVolumeChange(volume) {

    audioService.setVolume(volume);
    saveState();

  }

  function handleRepeatToggle() {

    repeatMode++;

    if (repeatMode > 2) {
      repeatMode = 0;
    }

    syncQueueMirror();

    saveState();
  }

  function handlePlaylistClick(index) {
    playlist.setCurrentIndex(index);
    loadSong();
  }

  function handleShuffleToggle() {

    playlist.toggleShuffle();

    syncQueueMirror();
    saveState();
  }

  function setPlaylist(newSongs) {
      audioService.pause();

      playlist.getSongs().forEach(song => {
        if (song.file?.startsWith("blob:")) {
          URL.revokeObjectURL(song.file);
        }
      });

      playlist.setSongs(newSongs);
      playlist.setCurrentIndex(0);

      if (playlist.getShuffleMode()) {
      }

      // Only load if songs exist
      if (playlist.getSongs().length > 0) {
        loadSong(false);
      }

      notifyChange();
    }

    function syncQueueMirror() {

      const snapshot = {
        songs: playlist.getSongs().map(song => ({
          file: song.file,
          nativeFile: song.nativeFile,
          playable: song.playable !== false
        })),

        currentIndex: playlist.getCurrentIndex(),

        repeatMode,

        shuffleMode: playlist.getShuffleMode(),
        shuffleOrder: playlist.getShuffleOrder(),
        shuffleIndex: playlist.getShuffleIndex()
      };

      console.log(
        `[QUEUE_MIRROR] songs=${snapshot.songs.length}` +
        ` currentIndex=${snapshot.currentIndex}` +
        ` repeat=${snapshot.repeatMode}` +
        ` shuffle=${snapshot.shuffleMode}` +
        ` shuffleIndex=${snapshot.shuffleIndex}`
      );

      audioService.setQueueState(snapshot);

    }

    audioService.on("queuechange", (data) => {

      playlist.setCurrentIndex(data.currentIndex);

      playerState.currentTime = 0;

      saveState();
      notifyChange();

    });

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
    setPlaylist,
    getSongs: playlist.getSongs,
    getCurrentSong: playlist.getCurrentSong,
    getCurrentIndex: playlist.getCurrentIndex,
    getRepeatMode: () => repeatMode,
    getShuffleMode: playlist.getShuffleMode,
    getState: () => ({
      ...playerState,
      repeatMode,
      shuffleMode: playlist.getShuffleMode()
    }),
    subscribe
  };
}
