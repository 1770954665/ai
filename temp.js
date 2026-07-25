
// ===== Word Bank =====
const WORDS = {
  '动物': ['猫', '狗', '兔子', '大象', '老虎', '狮子', '长颈鹿', '企鹅', '海豚', '蝴蝶',
           '乌龟', '蛇', '老鹰', '熊猫', '猴子', '青蛙', '鱼', '螃蟹', '蜗牛', '蜜蜂',
           '猫头鹰', '孔雀', '骆驼', '北极熊', '鲨鱼'],
  '食物': ['苹果', '西瓜', '香蕉', '蛋糕', '冰淇淋', '披萨', '汉堡', '面条', '饺子', '火锅',
           '寿司', '巧克力', '葡萄', '草莓', '玉米', '鸡蛋', '牛奶', '面包', '螃蟹', '龙虾'],
  '物品': ['手机', '电脑', '闹钟', '雨伞', '眼镜', '钥匙', '相机', '台灯', '剪刀', '杯子',
           '背包', '手表', '地球仪', '蜡烛', '锁'],
  '动作': ['跑步', '游泳', '跳舞', '唱歌', '睡觉', '吃饭', '看书', '踢球', '滑雪', '钓鱼',
           '骑自行车', '跳绳', '打伞', '拍照', '刷牙'],
  '职业': ['医生', '警察', '消防员', '厨师', '老师', '画家', '宇航员', '农民', '司机', '歌手'],
  '自然': ['太阳', '月亮', '星星', '山', '河流', '大海', '彩虹', '云', '闪电', '雪花',
           '火山', '沙漠', '瀑布', '森林', '花园'],
  '建筑': ['城堡', '金字塔', '灯塔', '教堂', '摩天大楼', '风车', '桥', '房子', '学校', '医院'],
  '其他': ['爱心', '笑脸', '圣诞树', '国旗', '礼物', '气球', '风筝', '火箭', '机器人', '钢琴']
};

// ===== Game State =====
let state = {
  player1: '画手', player2: '猜手',
  score1: 0, score2: 0,
  round: 1, totalRounds: 8,
  currentDrawer: 1, // 1 or 2
  currentWord: '', currentCategory: '',
  usedWords: new Set(),
  timer: 60, timerInterval: null,
  isRevealed: false,
  isDrawing: false, isGameOver: false,
  guesses: [],
};

// ===== Canvas =====
const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let currentColor = '#333333';
let currentSize = 3;
let undoStack = [];
const MAX_UNDO = 30;

function initCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = 600 * dpr;
  canvas.height = 400 * dpr;
  ctx.scale(dpr, dpr);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  clearCanvas();
}

function getCanvasPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = 600 / rect.width;
  const scaleY = 400 / rect.height;
  let x, y;
  if (e.touches) {
    x = (e.touches[0].clientX - rect.left) * scaleX;
    y = (e.touches[0].clientY - rect.top) * scaleY;
    e.preventDefault();
  } else {
    x = (e.clientX - rect.left) * scaleX;
    y = (e.clientY - rect.top) * scaleY;
  }
  return { x: Math.min(600, Math.max(0, x)), y: Math.min(400, Math.max(0, y)) };
}

function startDraw(e) {
  if (state.isGameOver) return;
  e.preventDefault();
  drawing = true;
  saveState();
  const pos = getCanvasPos(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}

function draw(e) {
  if (!drawing || state.isGameOver) return;
  e.preventDefault();
  const pos = getCanvasPos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.strokeStyle = currentColor;
  ctx.lineWidth = currentSize;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}

function endDraw(e) {
  if (e) e.preventDefault();
  drawing = false;
  ctx.beginPath();
}

function saveState() {
  if (undoStack.length >= MAX_UNDO) undoStack.shift();
  undoStack.push(canvas.toDataURL());
}

function undo() {
  if (undoStack.length === 0) return;
  const img = new Image();
  img.onload = () => {
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  img.src = undoStack.pop();
}

function clearCanvas() {
  undoStack = [];
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

// Canvas events
canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', endDraw);
canvas.addEventListener('mouseleave', endDraw);
canvas.addEventListener('touchstart', startDraw, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', endDraw, { passive: false });

// ===== UI Setup =====
function setupTools() {
  const colors = ['#333333','#e74c3c','#e67e22','#f1c40f','#27ae60','#1abc9c',
                  '#3498db','#2980b9','#9b59b6','#e91e63','#795548','#ecf0f1'];
  const palette = document.getElementById('colorPalette');
  palette.innerHTML = '';
  colors.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.className = 'color-btn' + (i === 0 ? ' active' : '');
    btn.style.background = c;
    if (c === '#ecf0f1') btn.style.border = '2px solid #ccc';
    btn.onclick = () => {
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentColor = c;
    };
    palette.appendChild(btn);
  });

  const sizes = [2, 4, 8, 16];
  const sizeSel = document.getElementById('sizeSelector');
  sizeSel.innerHTML = '';
  sizes.forEach((s, i) => {
    const btn = document.createElement('button');
    btn.className = 'size-btn' + (i === 0 ? ' active' : '');
    const dot = document.createElement('div');
    dot.className = 'dot s' + (i + 1);
    btn.appendChild(dot);
    btn.onclick = () => {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSize = s;
    };
    sizeSel.appendChild(btn);
  });
}

// ===== Game Logic =====
function startGame() {
  const p1 = document.getElementById('player1Input').value.trim() || '画手';
  const p2 = document.getElementById('player2Input').value.trim() || '猜手';
  state.player1 = p1;
  state.player2 = p2;
  state.score1 = 0;
  state.score2 = 0;
  state.round = 1;
  state.usedWords = new Set();
  state.currentDrawer = 1;
  state.isGameOver = false;

  document.getElementById('score1').querySelector('.name').textContent = p1;
  document.getElementById('score2').querySelector('.name').textContent = p2;

  showScreen('gameScreen');
  newRound();
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function getRandomWord() {
  const categories = Object.keys(WORDS);
  const available = [];
  for (const cat of categories) {
    for (const word of WORDS[cat]) {
      if (!state.usedWords.has(word)) available.push({ word, category: cat });
    }
  }
  if (available.length === 0) state.usedWords.clear(); // reset if exhausted
  // retry
  for (const cat of categories) {
    for (const word of WORDS[cat]) {
      if (!state.usedWords.has(word)) available.push({ word, category: cat });
    }
  }
  const pick = available[Math.floor(Math.random() * available.length)];
  state.usedWords.add(pick.word);
  return pick;
}

function newRound() {
  if (state.round > state.totalRounds) {
    showResult();
    return;
  }

  const pick = getRandomWord();
  state.currentWord = pick.word;
  state.currentCategory = pick.category;
  state.isRevealed = false;
  state.guesses = [];
  state.timer = 60;

  // Update UI
  document.getElementById('roundNum').textContent = state.round;
  const drawer = state.currentDrawer === 1 ? state.player1 : state.player2;
  const guesser = state.currentDrawer === 1 ? state.player2 : state.player1;
  document.getElementById('wordHint').textContent = `🎭 ${drawer} 来画，🔍 ${guesser} 来猜！`;
  document.getElementById('wordText').textContent = state.currentWord;
  document.getElementById('wordText').classList.remove('revealed');
  document.getElementById('wordCategory').textContent = `📂 ${state.currentCategory}`;
  document.getElementById('revealBtn').style.display = 'inline-block';
  document.getElementById('revealBtn').textContent = '👀 查看词语';

  clearCanvas();
  updateScores();
  updateTimer();

  document.getElementById('guessInput').value = '';
  document.getElementById('guessInput').disabled = false;
  document.getElementById('guessBtn').disabled = false;
  addMessage(`🎯 第 ${state.round} 轮开始！${drawer} 画画，${guesser} 来猜`, 'info');

  // Start timer
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    state.timer--;
    updateTimer();
    if (state.timer <= 0) {
      clearInterval(state.timerInterval);
      addMessage(`⏰ 时间到！答案是：${state.currentWord}`, 'error');
      setTimeout(nextRound, 2000);
    }
  }, 1000);

  // Focus guess input
  document.getElementById('guessInput').focus();
}

function revealWord() {
  const wordText = document.getElementById('wordText');
  const revealBtn = document.getElementById('revealBtn');
  if (wordText.classList.contains('revealed')) {
    wordText.classList.remove('revealed');
    revealBtn.textContent = '👀 查看词语';
    state.isRevealed = false;
    document.getElementById('wordHint').textContent = '词语已隐藏 👀';
  } else {
    wordText.classList.add('revealed');
    revealBtn.textContent = '🙈 隐藏词语';
    state.isRevealed = true;
    document.getElementById('wordHint').textContent = `🎨 画吧！（词在 ${state.currentCategory}）`;
  }
}

function submitGuess() {
  const input = document.getElementById('guessInput');
  const guess = input.value.trim();
  if (!guess) return;

  // Check if already guessed
  if (state.guesses.includes(guess)) {
    addMessage(`⏳ "${guess}" 已经猜过了`, 'error');
    input.value = '';
    return;
  }
  state.guesses.push(guess);

  if (guess === state.currentWord) {
    // Correct!
    clearInterval(state.timerInterval);
    addMessage(`🎉🎉🎉 猜对了！答案是「${state.currentWord}」！`, 'correct');
    // Award points
    if (state.currentDrawer === 1) {
      state.score1++; state.score2++;
    } else {
      state.score2++; state.score1++;
    }
    updateScores();
    setTimeout(nextRound, 2000);
  } else {
    addMessage(`❌ "${guess}" 不对，再试试！`, 'error');
  }
  input.value = '';
  input.focus();
}

function nextRound() {
  if (state.isGameOver) return;
  state.round++;
  state.currentDrawer = state.currentDrawer === 1 ? 2 : 1;
  newRound();
}

function updateScores() {
  document.querySelectorAll('.score-item .pts')[0].textContent = state.score1;
  document.querySelectorAll('.score-item .pts')[1].textContent = state.score2;
}

function updateTimer() {
  const el = document.getElementById('timer');
  el.textContent = `⏱ ${state.timer}`;
  el.classList.toggle('warning', state.timer <= 10);
}

function addMessage(text, type) {
  const container = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = 'msg msg-' + type;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function showResult() {
  state.isGameOver = true;
  clearInterval(state.timerInterval);
  showScreen('resultScreen');

  let winner, trophy;
  if (state.score1 > state.score2) {
    winner = state.player1; trophy = '🏆';
  } else if (state.score2 > state.score1) {
    winner = state.player2; trophy = '🏆';
  } else {
    winner = '平局！'; trophy = '🤝';
  }

  document.getElementById('trophy').textContent = trophy;
  document.getElementById('resultTitle').textContent = winner === '平局！' ? '🤝 平局！' : `🎉 ${winner} 获胜！`;

  const finalScores = document.getElementById('finalScores');
  finalScores.innerHTML = `
    <div class="final-score-item ${state.score1 >= state.score2 ? 'winner' : ''}">
      <span>🎭 ${state.player1}</span>
      <span class="pts">${state.score1} 分</span>
    </div>
    <div class="final-score-item ${state.score2 >= state.score1 ? 'winner' : ''}">
      <span>🔍 ${state.player2}</span>
      <span class="pts">${state.score2} 分</span>
    </div>
  `;
}

function endGame() {
  if (confirm('确定要结束当前游戏吗？')) {
    state.isGameOver = true;
    clearInterval(state.timerInterval);
    showResult();
  }
}

function backToSetup() {
  clearInterval(state.timerInterval);
  showScreen('setupScreen');
  document.getElementById('messages').innerHTML = '';
}

// Enter key to submit guess
document.getElementById('guessInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitGuess();
});

// Instructions
function showInstructions() {
  document.getElementById('instructionsModal').classList.add('active');
}
function hideInstructions() {
  document.getElementById('instructionsModal').classList.remove('active');
}

// Close modal on overlay click
document.getElementById('instructionsModal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) hideInstructions();
});

// ===== Init =====
initCanvas();
setupTools();
