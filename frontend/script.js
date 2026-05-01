/* ═════════════════════════════════════════
   MATHBLITZ – script.js
   ═════════════════════════════════════════ */

// ── Global State ──────────────────────────
const state = {
  mode: null,        // 'addition' | 'subtraction' | 'multiplication' | 'division'
  difficulty: null,  // 'easy' | 'medium' | 'hard'
  score: 0,
  streak: 0,
  highScore: 0,
  questionCount: 0,
  currentQuestion: null,  // { num1, num2, answer }
  musicEnabled: false,
  musicPromptShown: false,
  timeLeft: 10,
  timerInterval: null,
  isGameOver: false
};

const BASE_URL = 'https://your-backend.onrender.com';
const API_URL = `${BASE_URL}/api/scores`;

// ── DOM References ─────────────────────────
const screens = {
  landing:    document.getElementById('landing-screen'),
  mode:       document.getElementById('mode-screen'),
  difficulty: document.getElementById('difficulty-screen'),
  game:       document.getElementById('game-screen'),
  gameover:   document.getElementById('gameover-screen')
};

const el = {
  // Landing
  musicPromptCard:  document.getElementById('music-prompt-card'),
  btnMusicYes:      document.getElementById('btn-music-yes'),
  btnMusicNo:       document.getElementById('btn-music-no'),
  btnStart:         document.getElementById('btn-start'),
  btnMusicToggle:   document.getElementById('btn-music-toggle'),

  // Mode
  modeCards:        document.querySelectorAll('.mode-card'),
  btnBackToLanding: document.getElementById('btn-back-to-landing'),

  // Difficulty
  diffCards:        document.querySelectorAll('.diff-card'),
  diffSubLabel:     document.getElementById('diff-sub-label'),
  btnBackToMode:    document.getElementById('btn-back-to-mode'),

  // Game
  currentScore:     document.getElementById('current-score'),
  currentStreak:    document.getElementById('current-streak'),
  modeBadge:        document.getElementById('mode-badge'),
  questionNum:      document.getElementById('question-num'),
  questionText:     document.getElementById('question-text'),
  answersGrid:      document.getElementById('answers-grid'),
  answerBtns:       document.querySelectorAll('.answer-btn'),
  btnMusicToggleGame: document.getElementById('btn-music-toggle-game'),
  timeLeftDisplay:  document.getElementById('time-left'),
  timerBar:         document.getElementById('timer-bar'),

  // Game Over
  gameoverEmoji:    document.getElementById('gameover-emoji'),
  gameoverTitle:    document.getElementById('gameover-title'),
  gameoverMsg:      document.getElementById('gameover-msg'),
  finalScore:       document.getElementById('final-score'),
  finalHighScore:   document.getElementById('final-high-score'),
  newRecordBadge:   document.getElementById('new-record-badge'),
  btnPlayAgain:     document.getElementById('btn-play-again'),
  btnMainMenu:      document.getElementById('btn-main-menu'),
  
  // Leaderboard
  playerNameInput:  document.getElementById('player-name'),
  btnSubmitScore:   document.getElementById('btn-submit-score'),
  leaderboardList:  document.getElementById('leaderboard-list'),
  leaderboardLoading: document.getElementById('leaderboard-loading')
};

// ── Audio ──────────────────────────────────
const audio = {
  correct: document.getElementById('audio-correct'),
  wrong:   document.getElementById('audio-wrong'),
  music:   document.getElementById('audio-music'),
  easy:    document.getElementById('audio-easy')
};

// ── Difficulty Ranges & Time ──────────────────────
const RANGES = { easy: 10, medium: 50, hard: 100 };
const TIMER_DURATIONS = { easy: 10, medium: 7, hard: 5 };

// ── Mode Display Names ─────────────────────
const MODE_LABELS = {
  addition: 'Addition',
  subtraction: 'Subtraction',
  multiplication: 'Multiplication',
  division: 'Division'
};

const MODE_SYMBOLS = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '÷'
};

/* ══════════════════════════════════════════
   SCREEN NAVIGATION
══════════════════════════════════════════ */
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

/* ══════════════════════════════════════════
   STAR FIELD
══════════════════════════════════════════ */
function createStars() {
  const container = document.getElementById('stars');
  for (let i = 0; i < 80; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    star.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      --dur: ${Math.random() * 3 + 2}s;
      --delay: ${Math.random() * 4}s;
      opacity: ${Math.random() * 0.6 + 0.1};
    `;
    container.appendChild(star);
  }
}

/* ══════════════════════════════════════════
   SOUND
══════════════════════════════════════════ */
function playSound(type) {
  try {
    const clip = audio[type];
    if (clip) {
      clip.currentTime = 0;
      clip.play().catch(() => {});
    }
  } catch (e) {}
}

function toggleMusic() {
  state.musicEnabled = !state.musicEnabled;
  if (state.musicEnabled) {
    audio.music.play().catch(() => {});
  } else {
    audio.music.pause();
  }
  updateMusicFabUI();
}

function updateMusicFabUI() {
  const fabs = [el.btnMusicToggle, el.btnMusicToggleGame];
  fabs.forEach(fab => {
    if (!fab) return;
    fab.textContent = state.musicEnabled ? '🎵' : '🔇';
    fab.classList.toggle('muted', !state.musicEnabled);
  });
}

/* ══════════════════════════════════════════
   HIGH SCORE
══════════════════════════════════════════ */
function loadHighScore() {
  return parseInt(localStorage.getItem('mathblitz_highscore') || '0', 10);
}

function saveHighScore(score) {
  localStorage.setItem('mathblitz_highscore', String(score));
}

/* ══════════════════════════════════════════
   TIMER LOGIC
══════════════════════════════════════════ */
function startTimer() {
  clearInterval(state.timerInterval);
  const maxTime = TIMER_DURATIONS[state.difficulty] || 10;
  state.timeLeft = maxTime;
  
  el.timeLeftDisplay.textContent = state.timeLeft;
  el.timerBar.style.width = '100%';
  el.timerBar.style.transition = 'none';
  
  // Trigger reflow
  void el.timerBar.offsetWidth;
  el.timerBar.style.transition = `width ${maxTime}s linear`;
  el.timerBar.style.width = '0%';

  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    el.timeLeftDisplay.textContent = state.timeLeft;
    
    if (state.timeLeft <= 0) {
      clearInterval(state.timerInterval);
      if (!state.isGameOver) {
        playSound('wrong');
        endGame();
      }
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(state.timerInterval);
  el.timerBar.style.transition = 'none';
}

/* ══════════════════════════════════════════
   QUESTION GENERATION
══════════════════════════════════════════ */
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion() {
  const max = RANGES[state.difficulty];
  let num1, num2, answer, display;

  switch (state.mode) {
    case 'addition':
      num1 = rand(1, max);
      num2 = rand(1, max);
      answer = num1 + num2;
      display = `${num1} + ${num2} = ?`;
      break;

    case 'subtraction':
      num1 = rand(1, max);
      num2 = rand(1, num1); // ensure non-negative result
      answer = num1 - num2;
      display = `${num1} − ${num2} = ?`;
      break;

    case 'multiplication':
      num1 = rand(1, Math.min(max, 20));
      num2 = rand(1, Math.min(max, 20));
      answer = num1 * num2;
      display = `${num1} × ${num2} = ?`;
      break;

    case 'division': {
      num2 = rand(1, Math.min(max, 20));          // divisor
      const quotient = rand(1, Math.min(max, 20)); // result
      num1 = num2 * quotient;                       // dividend
      answer = quotient;
      display = `${num1} ÷ ${num2} = ?`;
      break;
    }
  }

  state.currentQuestion = { num1, num2, answer, display };
}

function generateOptions(correctAnswer) {
  const options = new Set([correctAnswer]);
  const variance = Math.max(10, Math.floor(correctAnswer * 0.5));

  while (options.size < 4) {
    let wrong = correctAnswer + rand(-variance, variance);
    if (wrong !== correctAnswer && wrong >= 0) {
      options.add(wrong);
    }
  }

  return [...options].sort(() => Math.random() - 0.5);
}

/* ══════════════════════════════════════════
   RENDER QUESTION
══════════════════════════════════════════ */
function renderQuestion() {
  const { display, answer } = state.currentQuestion;

  el.questionNum.textContent = `Question ${state.questionCount}`;
  el.questionText.textContent = display;

  el.questionText.style.opacity = '0';
  el.questionText.style.transform = 'translateY(-10px)';
  requestAnimationFrame(() => {
    el.questionText.style.transition = 'all 0.35s ease';
    el.questionText.style.opacity = '1';
    el.questionText.style.transform = 'translateY(0)';
  });

  const options = generateOptions(answer);

  el.answerBtns.forEach((btn, i) => {
    btn.textContent = options[i];
    btn.dataset.value = options[i];
    btn.classList.remove('correct', 'wrong');
    btn.disabled = false;
    btn.style.opacity = '1';
  });
  
  startTimer();
}

/* ══════════════════════════════════════════
   GAME LIFECYCLE
══════════════════════════════════════════ */
function startGame() {
  state.score = 0;
  state.streak = 0;
  state.questionCount = 0;
  state.highScore = loadHighScore();
  state.isGameOver = false;

  el.currentScore.textContent = '0';
  el.currentStreak.textContent = '0';
  el.modeBadge.textContent = MODE_LABELS[state.mode];

  showScreen('game');
  nextQuestion();
}

function nextQuestion() {
  if (state.isGameOver) return;
  state.questionCount++;
  generateQuestion();
  renderQuestion();
}

function checkAnswer(selected) {
  if (state.isGameOver) return;
  stopTimer();
  
  const correct = state.currentQuestion.answer;
  const isCorrect = selected === correct;

  el.answerBtns.forEach(btn => {
    btn.disabled = true;
    if (Number(btn.dataset.value) === selected) {
      btn.classList.add(isCorrect ? 'correct' : 'wrong');
    }
    // Also highlight correct answer if wrong
    if (!isCorrect && Number(btn.dataset.value) === correct) {
      btn.classList.add('correct');
    }
  });

  if (isCorrect) {
    playSound('correct');
    state.score += 10 + (state.streak * 2); // bonus for streak
    state.streak++;
    
    el.currentScore.textContent = state.score;
    el.currentStreak.textContent = state.streak;

    el.currentScore.classList.remove('score-pop');
    void el.currentScore.offsetWidth;
    el.currentScore.classList.add('score-pop');

    setTimeout(nextQuestion, 600);
  } else {
    playSound('wrong');
    state.streak = 0;
    el.currentStreak.textContent = state.streak;
    setTimeout(endGame, 1000);
  }
}

function endGame() {
  state.isGameOver = true;
  stopTimer();
  
  const isNewRecord = state.score > state.highScore;

  if (isNewRecord) {
    state.highScore = state.score;
    saveHighScore(state.highScore);
  }

  if (state.score === 0) {
    el.gameoverEmoji.textContent = '😵';
    el.gameoverTitle.textContent = 'Oops!';
    el.gameoverMsg.textContent = 'No points this time. Give it another shot!';
  } else if (state.score < 50) {
    el.gameoverEmoji.textContent = '🙁';
    el.gameoverTitle.textContent = 'Game Over!';
    el.gameoverMsg.textContent = "Keep practicing, you'll get there!";
  } else if (state.score < 150) {
    el.gameoverEmoji.textContent = '😎';
    el.gameoverTitle.textContent = 'Not Bad!';
    el.gameoverMsg.textContent = 'Solid effort! Can you beat your score?';
  } else {
    el.gameoverEmoji.textContent = '🏆';
    el.gameoverTitle.textContent = 'Amazing!';
    el.gameoverMsg.textContent = "You're a Math Blitz legend!";
  }

  el.finalScore.textContent = state.score;
  el.finalHighScore.textContent = state.highScore;
  el.newRecordBadge.style.display = isNewRecord ? 'inline-block' : 'none';
  
  // Reset UI for leaderboard
  el.playerNameInput.value = '';
  el.playerNameInput.disabled = false;
  el.btnSubmitScore.disabled = false;
  el.btnSubmitScore.textContent = 'Submit';
  fetchLeaderboard();

  showScreen('gameover');
}

/* ══════════════════════════════════════════
   LEADERBOARD API
══════════════════════════════════════════ */
async function fetchLeaderboard() {
  el.leaderboardLoading.textContent = 'Loading...';
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    renderLeaderboard(data);
    el.leaderboardLoading.textContent = '';
  } catch (error) {
    el.leaderboardLoading.textContent = 'Failed to load';
    console.error(error);
  }
}

function renderLeaderboard(scores) {
  el.leaderboardList.innerHTML = '';
  if (scores.length === 0) {
    el.leaderboardList.innerHTML = '<li style="padding:5px 0; color:rgba(255,255,255,0.5);">No scores yet!</li>';
    return;
  }
  
  scores.forEach((scoreObj, index) => {
    const li = document.createElement('li');
    li.style.padding = '8px 0';
    li.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    
    // Highlight top 3
    let icon = '';
    if (index === 0) icon = '🥇 ';
    else if (index === 1) icon = '🥈 ';
    else if (index === 2) icon = '🥉 ';
    
    li.innerHTML = `
      <span>${icon}<strong>${scoreObj.name}</strong> <span style="opacity:0.6;font-size:0.8rem">(${scoreObj.difficulty})</span></span>
      <span style="color:var(--primary); font-weight:bold;">${scoreObj.score} pts</span>
    `;
    el.leaderboardList.appendChild(li);
  });
}

async function submitScore() {
  const name = el.playerNameInput.value.trim();
  if (!name) return alert('Please enter your name!');
  
  el.btnSubmitScore.disabled = true;
  el.playerNameInput.disabled = true;
  el.btnSubmitScore.textContent = 'Saving...';
  
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        score: state.score,
        mode: state.mode,
        difficulty: state.difficulty
      })
    });
    
    if (res.ok) {
      el.btnSubmitScore.textContent = 'Saved!';
      fetchLeaderboard();
    } else {
      throw new Error('Failed to save');
    }
  } catch (error) {
    console.error(error);
    el.btnSubmitScore.disabled = false;
    el.playerNameInput.disabled = false;
    el.btnSubmitScore.textContent = 'Try Again';
  }
}

/* ══════════════════════════════════════════
   EVENT LISTENERS
══════════════════════════════════════════ */

el.btnMusicYes.addEventListener('click', () => {
  state.musicEnabled = true;
  audio.music.volume = 0.4;
  audio.music.play().catch(() => {});
  updateMusicFabUI();
  revealStartButton();
});

el.btnMusicNo.addEventListener('click', () => {
  state.musicEnabled = false;
  revealStartButton();
});

function revealStartButton() {
  el.musicPromptCard.style.display = 'none';
  el.btnStart.style.display = 'flex';
  el.btnMusicToggle.style.display = 'flex';
}

el.btnStart.addEventListener('click', () => {
  showScreen('mode');
});

el.btnMusicToggle.addEventListener('click', toggleMusic);
el.btnMusicToggleGame.addEventListener('click', toggleMusic);

el.modeCards.forEach(card => {
  card.addEventListener('click', () => {
    state.mode = card.dataset.mode;
    const modeLabel = MODE_LABELS[state.mode];
    el.diffSubLabel.textContent = `${modeLabel} – pick your challenge level`;
    showScreen('difficulty');
  });
});

el.btnBackToLanding.addEventListener('click', () => showScreen('landing'));
el.btnBackToMode.addEventListener('click', () => showScreen('mode'));

el.diffCards.forEach(card => {
  card.addEventListener('click', () => {
    state.difficulty = card.dataset.diff;
    if (state.difficulty === 'easy') {
      playSound('easy');
      setTimeout(() => {
        startGame();
      }, 1200);
    } else {
      startGame();
    }
  });
});

el.answerBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const val = Number(btn.dataset.value);
    checkAnswer(val);
  });
});

el.btnPlayAgain.addEventListener('click', () => {
  startGame();
});

el.btnMainMenu.addEventListener('click', () => {
  showScreen('landing');
  el.btnMusicToggle.style.display = state.musicPromptShown ? 'flex' : 'none';
  el.musicPromptCard.style.display  = 'none';
  el.btnStart.style.display = 'flex';
  el.btnMusicToggle.style.display = 'flex';
});

el.btnSubmitScore.addEventListener('click', submitScore);

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
function init() {
  createStars();
  state.highScore = loadHighScore();
  audio.music.volume = 0.4;
  showScreen('landing');
}

init();
