(() => {
  const canvas = document.getElementById('tetris-board');
  const nextCanvas = document.getElementById('next-board');
  if (!canvas || !nextCanvas) return;
  const ctx = canvas.getContext('2d');
  const nextCtx = nextCanvas.getContext('2d');
  const scoreEl = document.getElementById('score-value');
  const bestEl = document.getElementById('best-value');
  const levelEl = document.getElementById('level-value');
  const stateEl = document.getElementById('game-state');
  const overlay = document.getElementById('game-overlay');
  const overlayTitle = document.getElementById('overlay-title');
  const overlayCopy = document.getElementById('overlay-copy');
  const startButton = document.getElementById('game-start');
  const pauseButton = document.getElementById('game-pause');
  const restartButton = document.getElementById('game-restart');

  const COLS = 10;
  const ROWS = 20;
  const SIZE = 30;
  const COLORS = { I: '#7be0d3', O: '#f3c86b', T: '#ad9bff', S: '#83d3a2', Z: '#ff8297', J: '#6ea9ff', L: '#ffad72' };
  const SHAPES = {
    I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    O: [[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]],
    T: [[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]],
    S: [[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]],
    Z: [[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]],
    J: [[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]],
    L: [[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]
  };

  let board = createBoard();
  let player = null;
  let nextType = randomType();
  let score = 0;
  let lines = 0;
  let level = 1;
  let best = readBest();
  let running = false;
  let paused = false;
  let gameOver = false;
  let lastTime = 0;
  let dropCounter = 0;
  let dropInterval = 850;
  let animationId = null;

  function createBoard() { return Array.from({ length: ROWS }, () => Array(COLS).fill(null)); }
  function randomType() { return Object.keys(SHAPES)[Math.floor(Math.random() * 7)]; }
  function readBest() { try { return Number(localStorage.getItem('classverse-tetris-best')) || 0; } catch (_) { return 0; } }
  function saveBest() { try { localStorage.setItem('classverse-tetris-best', String(best)); } catch (_) { /* storage can be unavailable */ } }
  function updateStats() {
    scoreEl.textContent = String(score).padStart(6, '0');
    bestEl.textContent = String(best).padStart(6, '0');
    levelEl.textContent = String(level).padStart(2, '0');
  }
  function makePlayer(type) {
    return { type, matrix: SHAPES[type].map((row) => row.slice()), pos: { x: Math.floor(COLS / 2) - 2, y: 0 } };
  }
  function collide(arena, piece) {
    const { matrix, pos } = piece;
    for (let y = 0; y < matrix.length; y += 1) {
      for (let x = 0; x < matrix[y].length; x += 1) {
        if (!matrix[y][x]) continue;
        const px = x + pos.x;
        const py = y + pos.y;
        if (px < 0 || px >= COLS || py >= ROWS) return true;
        if (py >= 0 && arena[py][px]) return true;
      }
    }
    return false;
  }
  function merge() {
    player.matrix.forEach((row, y) => row.forEach((value, x) => {
      if (value) {
        const py = y + player.pos.y;
        if (py >= 0) board[py][x + player.pos.x] = player.type;
      }
    }));
  }
  function rotateMatrix(matrix) {
    const result = matrix.map((_, index) => matrix.map((row) => row[index]).reverse());
    return result;
  }
  function rotatePlayer() {
    if (!running || paused || gameOver) return;
    const previous = player.matrix;
    player.matrix = rotateMatrix(player.matrix);
    let offset = 1;
    while (collide(board, player)) {
      player.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (Math.abs(offset) > player.matrix[0].length + 1) {
        player.matrix = previous;
        return;
      }
    }
  }
  function spawnPlayer() {
    player = makePlayer(nextType);
    nextType = randomType();
    drawNext();
    if (collide(board, player)) endGame();
  }
  function clearLines() {
    let cleared = 0;
    outer: for (let y = board.length - 1; y >= 0; y -= 1) {
      for (let x = 0; x < COLS; x += 1) if (!board[y][x]) continue outer;
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(null));
      cleared += 1;
      y += 1;
    }
    if (cleared) {
      const points = [0, 100, 300, 500, 800][cleared] || cleared * 250;
      score += points * level;
      lines += cleared;
      level = Math.floor(lines / 10) + 1;
      dropInterval = Math.max(110, 850 - (level - 1) * 65);
      if (score > best) { best = score; saveBest(); }
      updateStats();
    }
  }
  function drop() {
    if (!running || paused || gameOver) return;
    player.pos.y += 1;
    if (collide(board, player)) {
      player.pos.y -= 1;
      merge();
      clearLines();
      spawnPlayer();
    }
    dropCounter = 0;
  }
  function movePlayer(direction) {
    if (!running || paused || gameOver) return;
    player.pos.x += direction;
    if (collide(board, player)) player.pos.x -= direction;
  }
  function softDrop() {
    if (!running || paused || gameOver) return;
    const before = player.pos.y;
    drop();
    if (player.pos.y > before) { score += 1; updateStats(); }
  }
  function hardDrop() {
    if (!running || paused || gameOver) return;
    let distance = 0;
    while (!collide(board, player)) { player.pos.y += 1; distance += 1; }
    player.pos.y -= 1;
    score += Math.max(0, distance - 1) * 2;
    merge();
    clearLines();
    spawnPlayer();
    updateStats();
  }
  function drawCell(context, x, y, color, size) {
    context.fillStyle = color;
    context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
    context.fillStyle = 'rgba(255,255,255,.18)';
    context.fillRect(x * size + 3, y * size + 3, size - 6, 3);
    context.strokeStyle = 'rgba(5,12,24,.35)';
    context.strokeRect(x * size + 1.5, y * size + 1.5, size - 3, size - 3);
  }
  function drawBoard() {
    ctx.fillStyle = '#0b1425';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255,255,255,.045)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x += 1) { ctx.beginPath(); ctx.moveTo(x * SIZE, 0); ctx.lineTo(x * SIZE, canvas.height); ctx.stroke(); }
    for (let y = 0; y <= ROWS; y += 1) { ctx.beginPath(); ctx.moveTo(0, y * SIZE); ctx.lineTo(canvas.width, y * SIZE); ctx.stroke(); }
    board.forEach((row, y) => row.forEach((type, x) => { if (type) drawCell(ctx, x, y, COLORS[type], SIZE); }));
    if (player) {
      player.matrix.forEach((row, y) => row.forEach((value, x) => {
        if (value) {
          const py = y + player.pos.y;
          if (py >= 0) drawCell(ctx, x + player.pos.x, py, COLORS[player.type], SIZE);
        }
      }));
    }
  }
  function drawNext() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    nextCtx.fillStyle = '#101b30';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    const matrix = SHAPES[nextType];
    const size = 20;
    const filled = [];
    matrix.forEach((row, y) => row.forEach((value, x) => { if (value) filled.push({ x, y }); }));
    if (!filled.length) return;
    const minX = Math.min(...filled.map((p) => p.x));
    const maxX = Math.max(...filled.map((p) => p.x));
    const minY = Math.min(...filled.map((p) => p.y));
    const maxY = Math.max(...filled.map((p) => p.y));
    const offsetX = (nextCanvas.width - (maxX - minX + 1) * size) / 2;
    const offsetY = (nextCanvas.height - (maxY - minY + 1) * size) / 2;
    filled.forEach(({ x, y }) => {
      nextCtx.fillStyle = COLORS[nextType];
      nextCtx.fillRect(offsetX + (x - minX) * size + 1, offsetY + (y - minY) * size + 1, size - 2, size - 2);
    });
  }
  function draw() { drawBoard(); }
  function update(time = 0) {
    if (!running || paused || gameOver) return;
    const delta = time - lastTime;
    lastTime = time;
    dropCounter += delta;
    if (dropCounter > dropInterval) drop();
    draw();
    animationId = requestAnimationFrame(update);
  }
  function showOverlay(title, copy) {
    overlayTitle.textContent = title;
    overlayCopy.textContent = copy;
    overlay.classList.remove('is-hidden');
  }
  function hideOverlay() { overlay.classList.add('is-hidden'); }
  function startGame() {
    if (paused && running && !gameOver) { resumeGame(); return; }
    if (animationId) cancelAnimationFrame(animationId);
    board = createBoard();
    score = 0; lines = 0; level = 1; dropInterval = 850;
    running = true; paused = false; gameOver = false;
    nextType = randomType();
    spawnPlayer();
    lastTime = 0; dropCounter = 0;
    stateEl.textContent = 'IN SESSION';
    startButton.textContent = 'New game ↗';
    pauseButton.disabled = false;
    pauseButton.textContent = 'Pause';
    hideOverlay();
    updateStats();
    draw();
    animationId = requestAnimationFrame(update);
  }
  function pauseGame() {
    if (!running || gameOver) return;
    paused = true;
    stateEl.textContent = 'PAUSED';
    pauseButton.textContent = 'Resume';
    startButton.textContent = 'Resume game ↗';
    showOverlay('PAUSED', 'Take a breath. Resume when ready.');
    if (animationId) cancelAnimationFrame(animationId);
  }
  function resumeGame() {
    if (!running || gameOver) return;
    paused = false;
    stateEl.textContent = 'IN SESSION';
    pauseButton.textContent = 'Pause';
    startButton.textContent = 'New game ↗';
    hideOverlay();
    lastTime = 0;
    animationId = requestAnimationFrame(update);
  }
  function endGame() {
    running = false; paused = false; gameOver = true;
    stateEl.textContent = 'GAME OVER';
    pauseButton.disabled = true;
    startButton.textContent = 'Play again ↗';
    showOverlay('GAME OVER', `Final score: ${score}. Try one more round.`);
    if (score > best) { best = score; saveBest(); }
    updateStats();
    draw();
    if (animationId) cancelAnimationFrame(animationId);
  }
  function togglePause() { if (paused) resumeGame(); else pauseGame(); }
  function control(action) {
    if (action === 'left') movePlayer(-1);
    if (action === 'right') movePlayer(1);
    if (action === 'down') softDrop();
    if (action === 'rotate') rotatePlayer();
    if (action === 'drop') hardDrop();
    draw();
  }

  startButton.addEventListener('click', startGame);
  pauseButton.addEventListener('click', togglePause);
  restartButton.addEventListener('click', startGame);
  document.querySelectorAll('[data-control]').forEach((button) => {
    button.addEventListener('click', () => control(button.dataset.control));
    button.addEventListener('contextmenu', (event) => event.preventDefault());
  });
  document.addEventListener('keydown', (event) => {
    const tag = event.target && event.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(event.key) && running && !paused) event.preventDefault();
    if (event.key.toLowerCase() === 'p') { if (running && !gameOver) togglePause(); return; }
    if (!running || paused || gameOver) return;
    if (event.key === 'ArrowLeft') control('left');
    else if (event.key === 'ArrowRight') control('right');
    else if (event.key === 'ArrowDown') control('down');
    else if (event.key === 'ArrowUp') control('rotate');
    else if (event.code === 'Space') control('drop');
  });

  updateStats();
  drawNext();
  draw();
  showOverlay('READY?', 'Press start when you\'re ready.');
})();
