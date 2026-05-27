// services/backends/androidAudioBackend.js

export function createAndroidAudioBackend() {

  const MusicPlugin = window.Capacitor?.Plugins?.MusicPlugin;

  const listeners = {};

  const nativeListenerHandles = [];

  let listenersAttached = false;
  let isSeeking = false;

  const state = {
    source: "",
    currentTime: 0,
    duration: 0,
    volume: 1,
    paused: true
  };

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

  async function attachNativeListeners() {
    if (listenersAttached || !MusicPlugin) return;

    listenersAttached = true;

    console.log("[AndroidBackend] attachNativeListeners()");

    const playHandle = await MusicPlugin.addListener(
      "playback:play",
      (data) => {
        state.paused = false;

        if (typeof data.currentTime === "number") {
          state.currentTime = data.currentTime;
        }

        emit("play");
      }
    );

    nativeListenerHandles.push(playHandle);

    const pauseHandle = await MusicPlugin.addListener(
      "playback:pause",
      (data) => {
        state.paused = true;

        if (typeof data.currentTime === "number") {
          state.currentTime = data.currentTime;
        }

        emit("pause");
      }
    );

    nativeListenerHandles.push(pauseHandle);

    const metadataHandle = await MusicPlugin.addListener(
      "playback:loadedmetadata",
      (data) => {
        if (typeof data.duration === "number") {
          state.duration = data.duration;
        }

        emit("loadedmetadata");
      }
    );

    nativeListenerHandles.push(metadataHandle);

    const timeupdateHandle = await MusicPlugin.addListener(
      "playback:timeupdate",
      (data) => {
        if (!isSeeking && typeof data.currentTime === "number") {
          state.currentTime = data.currentTime;
        }

        if (typeof data.duration === "number") {
          state.duration = data.duration;
        }

        emit("timeupdate");
      }
    );

    nativeListenerHandles.push(timeupdateHandle);

    const endedHandle = await MusicPlugin.addListener(
      "playback:ended",
      () => {
        emit("ended");
      }
    );

    nativeListenerHandles.push(endedHandle);
    
  }

  async function detachNativeListeners() {
    for (const handle of nativeListenerHandles) {
      await handle.remove();
    }

    nativeListenerHandles.length = 0;

    listenersAttached = false;

    console.log("[AndroidBackend] detachNativeListeners()");
  }

  async function destroy() {
    await detachNativeListeners();

    Object.keys(listeners).forEach((event) => {
      listeners[event].clear();
    });

    console.log("[AndroidBackend] destroy()");
  }

  return {

    async play() {

      console.log("[AndroidBackend] play()");

      await MusicPlugin.play();
    },

    async pause() {

      console.log("[AndroidBackend] pause()");

      await MusicPlugin.pause();
    },

    async load() {
      console.log("[AndroidBackend] load()");

      await MusicPlugin.load();
    },

    async setSource(src) {
      state.source = src;

      await MusicPlugin.setSource({ src });

      console.log("[AndroidBackend] setSource()", src);
    },

    getCurrentTime() {
      return state.currentTime;
    },

    async setCurrentTime(time) {

      state.currentTime = time;

      isSeeking = true;

      await MusicPlugin.seekTo({
        time
      });

      console.log("[AndroidBackend] setCurrentTime()", time);

      // release guard after native stabilizes
      setTimeout(() => {
        isSeeking = false;
      }, 300);
    },

    getDuration() {
      return state.duration;
    },

    getVolume() {
      return state.volume;
    },

    async setVolume(volume) {
      state.volume = volume;

      console.log("[AndroidBackend] setVolume()", volume);
    },

    isPaused() {
      return state.paused;
    },

    on,

    off,

    emit,

    attachNativeListeners,

    detachNativeListeners,

    destroy

  };

}