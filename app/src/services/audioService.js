// Playback service wrapper layer
export function createAudioService(backend) {

  let loadVersion = 0;

  return {

    play() {
      return backend.play();
    },

    pause() {
      backend.pause();
    },

    load() {
      backend.load();
    },

    setSource(src) {
      backend.setSource(src);
    },

    getCurrentTime() {
      return backend.getCurrentTime();
    },

    setCurrentTime(time) {
      backend.setCurrentTime(time);
    },

    getDuration() {
      return backend.getDuration();
    },

    getVolume() {
      return backend.getVolume();
    },

    setVolume(volume) {
      backend.setVolume(volume);
    },

    isPaused() {
      return backend.isPaused();
    },

    setLoadVersion(version) {
      loadVersion = version;
    },

    getLoadVersion() {
      return loadVersion;
    },

    on(event, handler) {
      backend.on(event, handler);
    }

  };

}