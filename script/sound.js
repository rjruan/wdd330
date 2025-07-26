(() => {
  if (!window.soundLibrary) window.soundLibrary = {};
  if (!window.sounds) window.sounds = [];

  async function loadSounds() {
    try {
      const response = await fetch("sounds.json");
      const data = await response.json();

      data.forEach(sound => {
        const audio = new Audio(sound.url);
        audio.loop = true;
        window.soundLibrary[sound.id] = audio;
      });

      window.sounds = data;
    } catch (err) {
      console.error("Failed to load sounds:", err);
    }
  }

  function playLoops(loops) {
    pauseAllLoops();
    loops.forEach(id => {
      const audio = window.soundLibrary[id];
      if (audio) {
        audio.play().catch(err => console.warn("Failed to play:", err));
      }
    });
  }

  function pauseAllLoops() {
    Object.values(window.soundLibrary).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  window.loadSounds = loadSounds;
  window.playLoops = playLoops;
  window.pauseAllLoops = pauseAllLoops;
})();
