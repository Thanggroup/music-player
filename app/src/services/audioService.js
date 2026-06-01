// Playback service wrapper layer
export function createAudioService(backend) {

  let loadVersion = 0;

  const listeners = {};

  const backendWrappers = {};

  function emit(event, payload = {}) {
    listeners[event]?.forEach((handler) => {
      handler(payload);
    });
  }

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

      if (!listeners[event]) {
        listeners[event] = new Set();
      }

      listeners[event].add(handler);

      if (!backendWrappers[event]) {

        backendWrappers[event] = (payload = {}) => {

          const eventLoadVersion =
            loadVersion;

          emit(event, {
            ...payload,
            loadVersion: eventLoadVersion
          });

        };

        backend.on(
          event,
          backendWrappers[event]
        );
      }

      return () => {

        listeners[event]?.delete(handler);

        if (listeners[event]?.size === 0) {

          backend.off(
            event,
            backendWrappers[event]
          );

          delete backendWrappers[event];
        }
      };
    },

    syncState() {
      return backend.syncState();
    },

    setQueueState(snapshot) {
      return backend.setQueueState(snapshot);
    }

  };

}