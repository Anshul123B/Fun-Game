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
  currentQuestion: null,  // { answer, display }
  musicEnabled: false,
  musicPromptShown: false,
  timeLeft: 10,
  timerInterval: null,
  isGameOver: false
};

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
  leaderboardList:  document.getElementById('leaderboard-list')
};

// ── Audio ──────────────────────────────────
const audio = {
  correct: document.getElementById('audio-correct'),
  wrong:   document.getElementById('audio-wrong'),
  music:   document.getElementById('audio-music'),
  easy:    document.getElementById('audio-easy'),
  medium:  document.getElementById('audio-medium'),
  hard:    document.getElementById('audio-hard'),
  highscore: document.getElementById('audio-highscore'),
  skip:    document.getElementById('audio-skip')
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
  let answer, display;

  switch (state.mode) {
    case 'addition':
      if (state.difficulty === 'easy') {
        const n1 = rand(1, max), n2 = rand(1, max);
        answer = n1 + n2;
        display = `${n1} + ${n2} = ?`;
      } else if (state.difficulty === 'medium') {
        const n1 = rand(1, max), n2 = rand(1, max), n3 = rand(1, max);
        answer = n1 + n2 + n3;
        display = `${n1} + ${n2} + ${n3} = ?`;
      } else {
        const n1 = rand(1, max), n2 = rand(1, max), n3 = rand(1, max), n4 = rand(1, max);
        answer = n1 + n2 + n3 + n4;
        display = `${n1} + ${n2} + ${n3} + ${n4} = ?`;
      }
      break;

    case 'subtraction':
      if (state.difficulty === 'easy') {
        const n1 = rand(1, max), n2 = rand(1, n1);
        answer = n1 - n2;
        display = `${n1} − ${n2} = ?`;
      } else if (state.difficulty === 'medium') {
        const n1 = rand(max, Math.floor(max * 1.5)), n2 = rand(1, Math.floor(n1/2)), n3 = rand(1, Math.floor((n1-n2)/2));
        answer = n1 - n2 - n3;
        display = `${n1} − ${n2} − ${n3} = ?`;
      } else {
        const n1 = rand(max, max * 2), n2 = rand(1, Math.floor(n1/3)), n3 = rand(1, Math.floor(n1/3)), n4 = rand(1, Math.floor(n1/3));
        answer = n1 - n2 - n3 - n4;
        display = `${n1} − ${n2} − ${n3} − ${n4} = ?`;
      }
      break;

    case 'multiplication':
      if (state.difficulty === 'easy') {
        const n1 = rand(1, 10), n2 = rand(1, 10);
        answer = n1 * n2;
        display = `${n1} × ${n2} = ?`;
      } else if (state.difficulty === 'medium') {
        const n1 = rand(2, 10), n2 = rand(2, 10), n3 = rand(2, 10);
        answer = n1 * n2 * n3;
        display = `${n1} × ${n2} × ${n3} = ?`;
      } else {
        const n1 = rand(5, 12), n2 = rand(5, 12), n3 = rand(2, 10), n4 = rand(2, 5);
        answer = n1 * n2 * n3 * n4;
        display = `${n1} × ${n2} × ${n3} × ${n4} = ?`;
      }
      break;

    case 'division': {
      if (state.difficulty === 'easy') {
        const n2 = rand(1, 10), q = rand(1, 10);
        const n1 = n2 * q; answer = q;
        display = `${n1} ÷ ${n2} = ?`;
      } else if (state.difficulty === 'medium') {
        const q = rand(2, 10), n3 = rand(2, 5), n2 = rand(2, 5);
        const n1 = q * n2 * n3;
        answer = q;
        display = `${n1} ÷ ${n2} ÷ ${n3} = ?`;
      } else {
        const q = rand(2, 20), n3 = rand(2, 10), n2 = rand(2, 10);
        const n1 = q * n2 * n3;
        answer = q;
        display = `${n1} ÷ ${n2} ÷ ${n3} = ?`;
      }
      break;
    }
  }

  state.currentQuestion = { answer, display };
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
  
  const isNewRecord = state.score > state.highScore && state.score > 0;

  if (isNewRecord) {
    state.highScore = state.score;
    saveHighScore(state.highScore);
    playSound('highscore');
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
  
  saveScore(state.score);
  displayLeaderboard();

  showScreen('gameover');
}

/* ══════════════════════════════════════════
   LOCAL LEADERBOARD
══════════════════════════════════════════ */
function getLeaderboard() {
  const scoresStr = localStorage.getItem('scores');
  if (!scoresStr) return [];
  try {
    return JSON.parse(scoresStr);
  } catch (e) {
    return [];
  }
}

function saveScore(score) {
  if (score === 0) return; // Don't save zero scores
  
  const scores = getLeaderboard();
  
  // Format with date
  const newScore = {
    score,
    date: new Date().toISOString()
  };
  
  scores.push(newScore);
  
  // Sort descending and keep top 5
  scores.sort((a, b) => b.score - a.score);
  const topScores = scores.slice(0, 5);
  
  localStorage.setItem('scores', JSON.stringify(topScores));
}

function displayLeaderboard() {
  const scores = getLeaderboard();
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
    li.style.alignItems = 'center';
    
    let icon = '';
    if (index === 0) icon = '🥇';
    else if (index === 1) icon = '🥈';
    else if (index === 2) icon = '🥉';
    else icon = `<span style="display:inline-block; width:20px; text-align:center;">${index + 1}.</span>`;
    
    // Format date beautifully
    const d = new Date(scoreObj.date);
    const dateStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    li.innerHTML = `
      <span style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:1.2rem;">${icon}</span>
        <span style="opacity:0.6;font-size:0.75rem">${dateStr}</span>
      </span>
      <span style="color:var(--primary); font-weight:bold; font-size:1.1rem;">${scoreObj.score} pts</span>
    `;
    el.leaderboardList.appendChild(li);
  });
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
  playSound('skip');
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
    } else if (state.difficulty === 'medium') {
      playSound('medium');
      setTimeout(() => {
        startGame();
      }, 1200);
    } else if (state.difficulty === 'hard') {
      playSound('hard');
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
