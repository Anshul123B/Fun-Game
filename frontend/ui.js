const UI = {
    screens: {
        landing: document.getElementById('landing-screen'),
        mode: document.getElementById('mode-screen'),
        difficulty: document.getElementById('difficulty-screen'),
        game: document.getElementById('game-screen'),
        gameover: document.getElementById('gameover-screen')
    },
    el: {
         btnMusicToggle: document.getElementById('btn-music-toggle'),
         btnMusicToggleGame: document.getElementById('btn-music-toggle-game'),
         btnStart: document.getElementById('btn-start'),
         musicPromptCard: document.getElementById('music-prompt-card'),
         btnMusicYes: document.getElementById('btn-music-yes'),
         btnMusicNo: document.getElementById('btn-music-no'),
         
         currentScore: document.getElementById('current-score'),
         currentStreak: document.getElementById('current-streak'),
         modeBadge: document.getElementById('mode-badge'),
         questionNum: document.getElementById('question-num'),
         questionText: document.getElementById('question-text'),
         answersGrid: document.getElementById('answers-grid'),
         answerBtns: document.querySelectorAll('.answer-btn'),
         timeLeftDisplay: document.getElementById('time-left'),
         timerBar: document.getElementById('timer-bar'),
         flashOverlay: document.getElementById('flash-overlay'),

         finalScore: document.getElementById('final-score'),
         finalHighScore: document.getElementById('final-high-score'),
         accuracyStat: document.getElementById('accuracy-stat'),
         questionsStat: document.getElementById('questions-stat'),
         bestStreakStat: document.getElementById('best-streak-stat'),
         avgTimeStat: document.getElementById('avg-time-stat'),
         leaderboardList: document.getElementById('leaderboard-list'),
    },
    showScreen: function(name) {
        Object.values(this.screens).forEach(s => s.classList.remove('active'));
        if (this.screens[name]) this.screens[name].classList.add('active');
    },
    updateSoundBtn: function(enabled) {
        const txt = enabled ? '🎵' : '🔇';
        if (this.el.btnMusicToggle) this.el.btnMusicToggle.textContent = txt;
        if (this.el.btnMusicToggleGame) this.el.btnMusicToggleGame.textContent = txt;
        if (this.el.btnMusicToggle) this.el.btnMusicToggle.classList.toggle('muted', !enabled);
        if (this.el.btnMusicToggleGame) this.el.btnMusicToggleGame.classList.toggle('muted', !enabled);
    },
    flashScreen: function(isCorrect) {
        if (!this.el.flashOverlay) return;
        this.el.flashOverlay.className = isCorrect ? 'flash-overlay flash-green' : 'flash-overlay flash-red';
        setTimeout(() => this.el.flashOverlay.className = 'flash-overlay', 300);
    },
    updateTimer: function(timeLeft, maxTime) {
        if (this.el.timeLeftDisplay) this.el.timeLeftDisplay.textContent = Math.ceil(timeLeft);
        const percent = (timeLeft / maxTime) * 100;
        if (this.el.timerBar) {
            this.el.timerBar.style.width = percent + '%';
            if (percent > 50) {
                this.el.timerBar.style.background = '#22c55e'; // Green
            } else if (percent > 20) {
                this.el.timerBar.style.background = '#f59e0b'; // Yellow
            } else {
                this.el.timerBar.style.background = '#ef4444'; // Red
            }
        }
    },
    renderQuestion: function(count, display, options) {
        if (this.el.questionNum) this.el.questionNum.textContent = `Question ${count}`;
        if (this.el.questionText) this.el.questionText.textContent = display;
        
        this.el.answerBtns.forEach((btn, i) => {
            btn.textContent = options[i];
            btn.dataset.value = options[i];
            btn.className = 'answer-btn';
            btn.disabled = false;
        });
    },
    disableAnswers: function(correctValue, pickedValue) {
        this.el.answerBtns.forEach(btn => {
            btn.disabled = true;
            const val = Number(btn.dataset.value);
            if (val === correctValue) btn.classList.add('correct');
            else if (val === pickedValue && pickedValue !== correctValue) btn.classList.add('wrong');
        });
    },
    updateHUD: function(score, streak, modeLabel) {
        if (this.el.currentScore) this.el.currentScore.textContent = score;
        if (this.el.currentStreak) this.el.currentStreak.textContent = streak > 1 ? `🔥 Streak x${streak}` : streak;
        if (this.el.modeBadge) this.el.modeBadge.textContent = modeLabel;
    },
    showAnalytics: function(stats, leaderboard, currentScoreObj) {
        if (this.el.finalScore) this.el.finalScore.textContent = stats.score;
        if (this.el.finalHighScore) this.el.finalHighScore.textContent = stats.highScore;
        if (this.el.accuracyStat) this.el.accuracyStat.textContent = `${stats.accuracy}%`;
        if (this.el.questionsStat) this.el.questionsStat.textContent = stats.totalQuestions;
        if (this.el.bestStreakStat) this.el.bestStreakStat.textContent = stats.bestStreak;
        if (this.el.avgTimeStat) this.el.avgTimeStat.textContent = `${stats.avgTime.toFixed(1)}s`;

        if (this.el.leaderboardList) {
            this.el.leaderboardList.innerHTML = '';
            if (leaderboard.length === 0) {
                this.el.leaderboardList.innerHTML = '<li style="padding:5px 0; color:rgba(255,255,255,0.5);">No scores yet!</li>';
                return;
            }
            leaderboard.forEach((scoreObj, index) => {
                const li = document.createElement('li');
                li.style.padding = '8px 0';
                li.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
                li.style.display = 'flex';
                li.style.justifyContent = 'space-between';
                li.style.alignItems = 'center';
                if (scoreObj === currentScoreObj) {
                    li.style.background = 'rgba(124,107,255,0.2)';
                    li.style.borderRadius = '8px';
                    li.style.padding = '8px';
                    li.style.borderBottom = 'none';
                }
                let icon = `${index + 1}. `;
                if (index === 0) icon = '🥇 ';
                else if (index === 1) icon = '🥈 ';
                else if (index === 2) icon = '🥉 ';
                li.innerHTML = `
                  <span style="text-align:left;">${icon}<strong>${scoreObj.score} pts</strong></span>
                  <span style="opacity:0.8;font-size:0.8rem;text-align:right;">${scoreObj.mode || ''} - ${scoreObj.difficulty || ''}</span>
                `;
                this.el.leaderboardList.appendChild(li);
            });
        }
    }
};

window.UI = UI;