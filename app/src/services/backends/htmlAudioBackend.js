// services/backends/htmlAudioBackend.js

export function createHtmlAudioBackend(player) {

  const listeners = {};

  function on(event, handler) {
    if (!listeners[event]) {
      listeners[event] = new Set();
    }

    listeners[event].add(handler);
  }

  function off(event, handler) {
    listeners[event]?.delete(handler);
  }

  function emit(event, payload) {
    listeners[event]?.forEach((handler) => {
      handler(payload);
    });
  }

  const domEvents = [
    "play",
    "pause",
    "loadedmetadata",
    "timeupdate",
    "ended"
  ];

  domEvents.forEach((event) => {
    player.addEventListener(event, () => {
      emit(event);
    });
  });

  return {

    play() {
      return player.play();
    },

    pause() {
      player.pause();
    },

    load() {
      player.load();
    },

    setSource(src) {
      player.src = src;
    },

    getCurrentTime() {
      return player.currentTime;
    },

    setCurrentTime(time) {
      player.currentTime = time;
    },

    getDuration() {
      return player.duration;
    },

    getVolume() {
      return player.volume;
    },

    setVolume(volume) {
      player.volume = volume;
    },

    isPaused() {
      return player.paused;
    },

    on,

    off,

    emit

  };

}