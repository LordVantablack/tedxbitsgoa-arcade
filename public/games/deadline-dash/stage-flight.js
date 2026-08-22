(() => {
  "use strict";

  const canvas = document.getElementById("stage-flight");
  const restartButton = document.getElementById("stage-flight-restart");
  const status = document.getElementById("stage-flight-status");
  const context = canvas.getContext("2d");
  const query = new URLSearchParams(window.location.search);
  const scoreable = Boolean(query.get("run") && query.get("run") !== "preview");
  const personalBest = Math.max(0, Number.parseInt(query.get("pb") || "0", 10) || 0);
  const WIDTH = 480;
  const HEIGHT = 720;
  const LOWER_COLUMN_CROP = { x: 319, y: 42, width: 437, height: 1382 };
  const UPPER_COLUMN_CROP = { x: 440, y: 60, width: 196, height: 1344 };
  const gravity = 1050;
  const flapVelocity = -360;
  const gateWidth = 78;
  const UPPER_COLUMN_WIDTH = Math.round(gateWidth * 0.75);
  // Score-tiered pace adapted from Serkan Bayraktar's MIT-licensed Canvas
  // game reference. The cap keeps later gates demanding but fair.
  const DIFFICULTY = {
    // Change this one value to make the pace rise every X cleared gates.
    scoreInterval: 5,
    maxTier: 4,
    baseSpeed: 178,
    speedPerTier: 17,
    maxSpeed: 248,
    baseGap: 208,
    gapReductionPerTier: 10,
    minGap: 174,
    baseInterval: 1450,
    intervalReductionPerTier: 55,
    minInterval: 1230,
    labels: ["OPENING ACT", "LIGHTS UP", "FULL HOUSE", "HEADLINE SET", "ENCORE"],
  };
  const player = { x: 124, y: HEIGHT / 2, radius: 19, velocity: 0, tilt: 0 };
  const artwork = {
    background: loadArtwork("assets/stage-flight-bdome-background.png"),
    lowerColumns: [
      loadArtwork("assets/stage-flight-column-posters-a.png"),
      loadArtwork("assets/stage-flight-column-posters-b.png"),
    ],
    upperColumn: loadArtwork("assets/stage-flight-upper-rect-light.png"),
    // Pixel cutout based on the supplied photo. It preserves the real pose,
    // face, glasses, hair, and hand rather than substituting a generic avatar.
    parhawk: loadArtwork("assets/parhawk-cutout-pixel-v2.png"),
  };
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let mode = "ready";
  let gates = [];
  let score = 0;
  let flapCount = 0;
  let startedAt = 0;
  let lastFrame = performance.now();
  let nextGateAt = 0;
  let sentResult = false;
  let announcedTier = 0;
  let seedState = hash(query.get("seed") || "stage-flight");

  function loadArtwork(source) {
    const image = new Image();
    image.src = source;
    return image;
  }

  function hash(value) {
    let result = 2166136261;
    for (let index = 0; index < value.length; index += 1) result = Math.imul(result ^ value.charCodeAt(index), 16777619);
    return result >>> 0;
  }

  function random() {
    seedState += 0x6D2B79F5;
    let value = seedState;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }

  function resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    scale = Math.min(width / WIDTH, height / HEIGHT);
    offsetX = (width - WIDTH * scale) / 2;
    offsetY = (height - HEIGHT * scale) / 2;
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function reset() {
    mode = "ready";
    gates = [];
    score = 0;
    flapCount = 0;
    startedAt = 0;
    nextGateAt = 0;
    sentResult = false;
    announcedTier = 0;
    player.y = HEIGHT / 2;
    player.velocity = 0;
    player.tilt = 0;
    seedState = hash(query.get("seed") || `stage-flight-${Date.now()}`);
    if (restartButton) restartButton.hidden = true;
    announce("Sober Parhawk ready. Press space or tap to begin.");
  }

  function start() {
    mode = "playing";
    if (restartButton) restartButton.hidden = true;
    startedAt = Date.now();
    nextGateAt = performance.now() + 900;
    flap();
    announce("Run started.");
  }

  function flap() {
    player.velocity = flapVelocity;
    player.tilt = -0.48;
    flapCount += 1;
  }

  function addGate() {
    const difficulty = difficultyFor(score);
    const minTop = 112;
    const maxTop = HEIGHT - difficulty.gap - 142;
    const topHeight = minTop + Math.floor(random() * (maxTop - minTop));
    gates.push({ x: WIDTH + 40, topHeight, gap: difficulty.gap, columnVariant: Math.floor(random() * artwork.lowerColumns.length), counted: false });
  }

  function difficultyFor(currentScore) {
    const tier = Math.min(Math.floor(currentScore / DIFFICULTY.scoreInterval), DIFFICULTY.maxTier);
    return {
      tier,
      speed: Math.min(DIFFICULTY.baseSpeed + tier * DIFFICULTY.speedPerTier, DIFFICULTY.maxSpeed),
      gap: Math.max(DIFFICULTY.baseGap - tier * DIFFICULTY.gapReductionPerTier, DIFFICULTY.minGap),
      interval: Math.max(DIFFICULTY.baseInterval - tier * DIFFICULTY.intervalReductionPerTier, DIFFICULTY.minInterval),
      label: DIFFICULTY.labels[tier],
    };
  }

  function finish() {
    if (mode === "over") return;
    mode = "over";
    player.velocity = Math.max(player.velocity, 120);
    if (restartButton) restartButton.hidden = false;
    announce(`Run closed. Score ${score}.`);
    if (!scoreable || sentResult) return;
    sentResult = true;
    window.parent.postMessage({
      type: "tedx:game-over",
      gameId: "deadline-dash",
      score,
      durationMs: Math.max(1000, Date.now() - startedAt),
      metadata: { flaps: flapCount, gatesCleared: score },
      evidence: { flaps: flapCount, gatesCleared: score, seed: query.get("seed") || null },
    }, window.location.origin);
  }

  function update(delta, time) {
    if (mode === "playing") {
      const difficulty = difficultyFor(score);
      player.velocity += gravity * delta;
      player.y += player.velocity * delta;
      player.tilt = Math.min(1.05, player.tilt + 1.75 * delta);
      if (time >= nextGateAt) {
        addGate();
        nextGateAt += difficulty.interval;
      }
      gates.forEach((gate) => {
        gate.x -= difficulty.speed * delta;
        if (!gate.counted && gate.x + gateWidth < player.x) {
          gate.counted = true;
          score += 1;
          announce(`Score ${score}.`);
          const newTier = difficultyFor(score).tier;
          if (newTier > announcedTier) {
            announcedTier = newTier;
            announce(`${difficultyFor(score).label}. Score ${score}.`);
          }
        }
        if (hitsGate(gate)) finish();
      });
      gates = gates.filter((gate) => gate.x + gateWidth > -24);
      if (player.y - player.radius < 56 || player.y + player.radius > HEIGHT - 42) finish();
    } else if (mode === "over") {
      player.velocity += gravity * delta;
      player.y = Math.min(HEIGHT - 42 - player.radius, player.y + player.velocity * delta);
      player.tilt = Math.min(1.45, player.tilt + 1.7 * delta);
    }
  }

  function hitsGate(gate) {
    const insideX = player.x + player.radius > gate.x && player.x - player.radius < gate.x + gateWidth;
    if (!insideX) return false;
    return player.y - player.radius < gate.topHeight || player.y + player.radius > gate.topHeight + gate.gap;
  }

  function draw(time) {
    context.save();
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.translate(offsetX, offsetY);
    context.scale(scale, scale);
    drawBackground(time);
    gates.forEach(drawGate);
    drawPlayer(time);
    drawHud();
    if (mode === "ready") drawReadyCard();
    if (mode === "over") drawOverCard();
    context.restore();
  }

  function drawBackground(time) {
    if (artwork.background.complete && artwork.background.naturalWidth) {
      drawCover(artwork.background, 0, 0, WIDTH, HEIGHT);
      context.fillStyle = "rgba(21, 9, 2, .12)";
      context.fillRect(0, 0, WIDTH, HEIGHT);
      const lanternPulse = 0.025 + Math.sin(time / 700) * 0.012;
      context.fillStyle = `rgba(255, 205, 117, ${lanternPulse})`;
      context.fillRect(0, 0, WIDTH, HEIGHT * 0.36);
      return;
    }
    context.fillStyle = "#090909";
    context.fillRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = "#151111";
    context.fillRect(0, HEIGHT - 42, WIDTH, 42);
    context.fillStyle = "#e62b1e";
    context.fillRect(0, HEIGHT - 42, WIDTH, 4);
    context.globalAlpha = 0.18;
    context.strokeStyle = "#e62b1e";
    context.lineWidth = 2;
    for (let x = -120; x < WIDTH + 160; x += 72) {
      context.beginPath();
      context.moveTo(x + (time / 16 % 72), HEIGHT - 42);
      context.lineTo(x + 190 + (time / 16 % 72), 70);
      context.stroke();
    }
    context.globalAlpha = 1;
    context.fillStyle = "#f1eee8";
    context.font = "12px monospace";
    context.fillText("TEDxBITSGoa / SOBER PARHAWK", 24, HEIGHT - 17);
  }

  function drawCover(image, x, y, width, height) {
    const scaleToCover = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const drawnWidth = image.naturalWidth * scaleToCover;
    const drawnHeight = image.naturalHeight * scaleToCover;
    context.drawImage(image, x + (width - drawnWidth) / 2, y + (height - drawnHeight) / 2, drawnWidth, drawnHeight);
  }

  function drawGate(gate) {
    const bottomY = gate.topHeight + gate.gap;
    const lowerColumn = artwork.lowerColumns[gate.columnVariant] || artwork.lowerColumns[0];
    if (artwork.upperColumn.complete && lowerColumn.complete && artwork.upperColumn.naturalWidth && lowerColumn.naturalWidth) {
      const upperX = gate.x + (gateWidth - UPPER_COLUMN_WIDTH) / 2;
      context.imageSmoothingEnabled = false;
      context.drawImage(artwork.upperColumn, UPPER_COLUMN_CROP.x, UPPER_COLUMN_CROP.y, UPPER_COLUMN_CROP.width, UPPER_COLUMN_CROP.height, upperX, 0, UPPER_COLUMN_WIDTH, gate.topHeight);
      context.drawImage(lowerColumn, LOWER_COLUMN_CROP.x, LOWER_COLUMN_CROP.y, LOWER_COLUMN_CROP.width, LOWER_COLUMN_CROP.height, gate.x, bottomY, gateWidth, HEIGHT - bottomY);
      context.imageSmoothingEnabled = true;
      return;
    }
    drawTruss(gate.x, 56, gateWidth, gate.topHeight - 56);
    drawTruss(gate.x, bottomY, gateWidth, HEIGHT - 42 - bottomY);
  }

  function drawTruss(x, y, width, height) {
    context.fillStyle = "#1f1b1a";
    context.fillRect(x, y, width, height);
    context.strokeStyle = "#e62b1e";
    context.lineWidth = 4;
    for (let row = y; row < y + height; row += 34) {
      context.beginPath();
      context.moveTo(x + 7, row);
      context.lineTo(x + width - 7, Math.min(row + 34, y + height));
      context.moveTo(x + width - 7, row);
      context.lineTo(x + 7, Math.min(row + 34, y + height));
      context.stroke();
    }
    context.strokeStyle = "#f1eee8";
    context.lineWidth = 3;
    context.strokeRect(x + 3, y, width - 6, height);
  }

  function drawFlightCard(y = player.y, tilt = player.tilt, wingOffset = 0) {
    context.save();
    context.translate(player.x, y);
    context.rotate(tilt);
    if (artwork.parhawk.complete && artwork.parhawk.naturalWidth) {
      context.imageSmoothingEnabled = false;
      context.drawImage(artwork.parhawk, -42, -42 + wingOffset, 84, 84);
      context.imageSmoothingEnabled = true;
      context.restore();
      return;
    }
    context.fillStyle = "#e62b1e";
    context.fillRect(-20, -14, 40, 28);
    context.fillStyle = "#f1eee8";
    context.fillRect(-13, -7, 25, 4);
    context.fillRect(-13, 2, 17, 4);
    context.fillStyle = "#080808";
    context.fillRect(11, -14, 9, 28);
    context.fillStyle = "#f1eee8";
    context.fillRect(-25, -6 + wingOffset, 5, 12);
    context.restore();
  }

  function drawPlayer(time) {
    if (mode === "ready") {
      drawFlightCard(HEIGHT / 2 - 125 + Math.sin(time / 310) * 8, Math.sin(time / 850) * 0.06, Math.sin(time / 155) * 3);
      return;
    }
    drawFlightCard(player.y, player.tilt, Math.sin(time / 85) * 2);
  }

  function drawHud() {
    context.fillStyle = "rgba(20, 8, 2, .78)";
    context.fillRect(WIDTH / 2 - 49, 19, 98, 58);
    context.strokeStyle = "#fff0d5";
    context.lineWidth = 3;
    context.strokeRect(WIDTH / 2 - 49, 19, 98, 58);
    context.fillStyle = "#642411";
    context.fillRect(WIDTH / 2 - 46, 22, 92, 15);
    context.fillStyle = "#fff0d5";
    context.font = "8px 'Raster Forge', monospace";
    context.textAlign = "center";
    context.fillText("GATES", WIDTH / 2, 33);
    context.font = "28px 'Raster Forge', monospace";
    context.textAlign = "center";
    context.fillText(String(score).padStart(2, "0"), WIDTH / 2, 66);
    if (personalBest) {
      context.fillStyle = "rgba(20, 8, 2, .78)";
      context.fillRect(16, 20, 92, 25);
      context.strokeStyle = "#fff0d5";
      context.lineWidth = 2;
      context.strokeRect(16, 20, 92, 25);
      context.fillStyle = "#fff0d5";
      context.font = "8px 'Raster Forge', monospace";
      context.fillText(`PB ${String(personalBest).padStart(2, "0")}`, 62, 36);
    }
    context.textAlign = "left";
  }

  function drawReadyCard() {
    drawPanel("SOBER PARHAWK", "TAP / SPACE TO FLY", "SOAR THROUGH THE B-DOME PORTICO.");
  }

  function drawOverCard() {
    const finalLine = scoreable ? "SCORE SENT. USE FLY AGAIN FOR A FRESH RUN" : "TAP OR SPACE TO FLY AGAIN";
    drawPanel("RUN CLOSED", `SCORE ${String(score).padStart(2, "0")}`, finalLine);
  }

  function drawPanel(title, lineOne, lineTwo) {
    const panelWidth = 386;
    const panelHeight = 174;
    const x = (WIDTH - panelWidth) / 2;
    const y = HEIGHT / 2 - panelHeight / 2;
    context.fillStyle = "rgba(20, 8, 2, .82)";
    context.fillRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = "#120906";
    context.fillRect(x + 7, y + 8, panelWidth, panelHeight);
    context.fillStyle = "#fff0d5";
    context.fillRect(x, y, panelWidth, panelHeight);
    context.fillStyle = "#5d2110";
    context.fillRect(x + 8, y + 8, panelWidth - 16, 48);
    context.fillStyle = "#f47531";
    context.fillRect(x + 8, y + 55, panelWidth - 16, 5);
    context.strokeStyle = "#1b0b05";
    context.lineWidth = 5;
    context.strokeRect(x, y, panelWidth, panelHeight);
    context.fillStyle = "#fff0d5";
    context.textAlign = "center";
    context.font = "22px 'Raster Forge', monospace";
    context.fillText(title, WIDTH / 2, y + 40);
    context.fillStyle = "#251006";
    context.font = "18px 'Raster Forge', monospace";
    context.fillText(lineOne, WIDTH / 2, y + 101);
    context.fillStyle = "#7b4325";
    context.font = "10px 'Raster Forge', monospace";
    context.fillText(lineTwo, WIDTH / 2, y + 133);
    context.fillStyle = "#f47531";
    context.fillRect(x + 33, y + 151, panelWidth - 66, 4);
    context.textAlign = "left";
  }

  function announce(message) {
    if (status) status.textContent = message;
  }

  function handleAction(event) {
    if (event) event.preventDefault();
    if (mode === "ready") start();
    else if (mode === "playing") flap();
    else if (!scoreable) reset();
  }

  function restartRun(event) {
    if (event) event.preventDefault();
    if (scoreable && window.parent !== window) {
      window.parent.postMessage({ type: "tedx:restart-game", gameId: "deadline-dash" }, window.location.origin);
      return;
    }
    reset();
  }

  window.addEventListener("resize", resize);
  canvas.addEventListener("pointerdown", handleAction);
  if (restartButton) restartButton.addEventListener("click", restartRun);
  window.addEventListener("keydown", (event) => {
    if (event.code === "Space" || event.code === "ArrowUp") handleAction(event);
  });
  reset();
  resize();
  requestAnimationFrame(function frame(time) {
    const delta = Math.min((time - lastFrame) / 1000, 0.05);
    lastFrame = time;
    update(delta, time);
    draw(time);
    requestAnimationFrame(frame);
  });
})();
