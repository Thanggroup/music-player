// HTMLAudioElement adapter layer
export function createAudioService(player) {

  let loadVersion = 0;

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

    setLoadVersion(version) {
      loadVersion = version;
    },

    getLoadVersion() {
      return loadVersion;
    },

    on(event, handler) {
      player.addEventListener(event, handler);
    },

    getElement() {
      return player;
    }

  };

}