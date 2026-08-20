import { Runner } from './resources/dino_game/offline.js';

window.addEventListener('load', () => {
  const trexGameContainer = document.querySelector('.trex-game');
  const configContainer = document.querySelector('.config-box');
  const spirit1xFileInput = document.getElementById('sprite-1x');
  const spirit2xFileInput = document.getElementById('sprite-2x');

  // Clear the spirit file input value on load
  spirit1xFileInput.value = '';
  spirit2xFileInput.value = '';

  let runner = new Runner(trexGameContainer);
  let runStartedAt = 0;
  let jumps = 0;

  const sendScoreToArcade = () => {
    if (window.parent === window || !runStartedAt) return;
    window.parent.postMessage({
      type: 'tedx:game-over',
      gameId: 'deadline-dash',
      score: Math.ceil(runner.distanceRan || 0),
      durationMs: Date.now() - runStartedAt,
      metadata: { jumps },
      evidence: { jumps, finalDistance: Math.ceil(runner.distanceRan || 0) }
    }, window.location.origin);
  };

  const originalGameOver = runner.gameOver.bind(runner);
  runner.gameOver = () => {
    originalGameOver();
    sendScoreToArcade();
  };

  const markRunStarted = event => {
    if (!runStartedAt && (event.type === 'pointerdown' || event.code === 'Space' || event.code === 'ArrowUp')) {
      runStartedAt = Date.now();
    }
    if (event.code === 'Space' || event.code === 'ArrowUp') jumps += 1;
  };
  document.addEventListener('keydown', markRunStarted, true);
  document.addEventListener('pointerdown', markRunStarted, true);

  //   On keypress 'F' enable Arcade mode
  document.addEventListener('keydown', event => {
    if (event.key === 'f') {
      runner.setArcadeMode();

      // hide advance configs
      configContainer.style.display = 'none';
    }
  });

  // Handle sprite file selection and update assets
  spirit1xFileInput.addEventListener('change', event => {
    const file = event.target.files[0];
    if (file) {
      const imgUrl = URL.createObjectURL(file);
      document.getElementById('offline-resources-1x').src = imgUrl;

      // Destroy the existing instance and initialize game new a new spirit file
      runner.destroy();
      runner = new Runner(trexGameContainer);
    }
  });

  spirit2xFileInput.addEventListener('change', event => {
    const file = event.target.files[0];
    if (file) {
      const imgUrl = URL.createObjectURL(file);
      document.getElementById('offline-resources-2x').src = imgUrl;

      // Destroy the existing instance and initialize game new a new spirit file
      runner.destroy();
      runner = new Runner(trexGameContainer);
    }
  });
});
