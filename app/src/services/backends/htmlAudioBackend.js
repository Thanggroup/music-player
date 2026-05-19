export function createHtmlAudioBackend(player) {

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

    on(event, handler) {
      player.addEventListener(event, handler);
    },

    getElement() {
      return player;
    }

  };

}