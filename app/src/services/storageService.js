export function createStorageService() {

  return {

    save(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },

    load(key) {
      const raw = localStorage.getItem(key);

      if (!raw) {
        return null;
      }

      try {
        return JSON.parse(raw);
      } catch (err) {
        console.error("Storage parse error:", err);
        return null;
      }
    }

  };

}