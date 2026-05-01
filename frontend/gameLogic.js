const Game = {
    state: {
        mode: null,
        baseDifficulty: null, // 'easy', 'medium', 'hard'
        currentDifficultyLevel: 1, // scales up/down
        score: 0,
        streak: 0,
        bestStreak: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        totalResponseTime: 0,
        currentQuestion: null,
        questionStartTime: 0,
        timeLeft: 0,
        timerInterval: null,
        isGameOver: false,
        musicPromptShown: false
    },
    
    createStars: function() {
        const container = document.getElementById('stars');
        if (!container) return;
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
    },
    
    init: function() {
        this.createStars();
        UI.showScreen('landing');
        UI.updateSoundBtn(Sound.enabled);
        this.bindEvents();
    },
    
    bindEvents: function() {
        if (UI.el.btnMusicYes) {
            UI.el.btnMusicYes.addEventListener('click', () => {
                Sound.enabled = false;
                Sound.toggle(); // turns it to true and plays
                UI.updateSoundBtn(Sound.enabled);
                this.revealStartButton();
            });
        }
        if (UI.el.btnMusicNo) {
            UI.el.btnMusicNo.addEventListener('click', () => {
                Sound.enabled = true;
                Sound.toggle(); // turns it to false and stops
                Sound.playFile('skip'); // explicit play logic bypasses enabled usually, wait playFile checks enabled.
                // If it's skipped, we might just not play a sound. Or we set enabled true briefly:
                Sound.enabled = true;
                Sound.playFile('skip');
                Sound.enabled = false;
                
                UI.updateSoundBtn(Sound.enabled);
                this.revealStartButton();
            });
        }
        
        document.getElementById('btn-start').addEventListener('click', () => UI.showScreen('mode'));
        document.getElementById('btn-music-toggle').addEventListener('click', () => {
            const enabled = Sound.toggle();
            UI.updateSoundBtn(enabled);
        });
        document.getElementById('btn-music-toggle-game').addEventListener('click', () => {
            const enabled = Sound.toggle();
            UI.updateSoundBtn(enabled);
        });
        
        document.querySelectorAll('.mode-card').forEach(card => {
            card.addEventListener('click', () => {
                this.state.mode = card.dataset.mode;
                UI.showScreen('difficulty');
            });
        });
        
        document.querySelectorAll('.diff-card').forEach(card => {
            card.addEventListener('click', () => {
                this.state.baseDifficulty = card.dataset.diff;
                Sound.playDifficultySound(this.state.baseDifficulty);
                setTimeout(() => {
                    this.startGame();
                }, 1200);
            });
        });
        
        document.getElementById('btn-back-to-landing').addEventListener('click', () => UI.showScreen('landing'));
        document.getElementById('btn-back-to-mode').addEventListener('click', () => UI.showScreen('mode'));
        
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const val = Number(e.target.dataset.value);
                this.checkAnswer(val);
            });
        });
        
        document.getElementById('btn-play-again').addEventListener('click', () => this.startGame());
        document.getElementById('btn-main-menu').addEventListener('click', () => {
            UI.showScreen('landing');
            if (this.state.musicPromptShown) {
                if (UI.el.musicPromptCard) UI.el.musicPromptCard.style.display = 'none';
                if (UI.el.btnStart) UI.el.btnStart.style.display = 'flex';
                if (UI.el.btnMusicToggle) UI.el.btnMusicToggle.style.display = 'flex';
            }
        });
    },
    
    revealStartButton: function() {
        this.state.musicPromptShown = true;
        if (UI.el.musicPromptCard) UI.el.musicPromptCard.style.display = 'none';
        if (UI.el.btnStart) UI.el.btnStart.style.display = 'flex';
        if (UI.el.btnMusicToggle) UI.el.btnMusicToggle.style.display = 'flex';
    },
    
    startGame: function() {
        this.state.score = 0;
        this.state.streak = 0;
        this.state.bestStreak = 0;
        this.state.correctAnswers = 0;
        this.state.totalQuestions = 0;
        this.state.totalResponseTime = 0;
        this.state.isGameOver = false;
        
        if (this.state.baseDifficulty === 'easy') this.state.currentDifficultyLevel = 1;
        if (this.state.baseDifficulty === 'medium') this.state.currentDifficultyLevel = 3;
        if (this.state.baseDifficulty === 'hard') this.state.currentDifficultyLevel = 5;

        UI.updateHUD(0, 0, this.state.mode.toUpperCase());
        UI.showScreen('game');
        this.nextQuestion();
    },
    
    rand: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    generateQuestion: function() {
        let maxNumber = 10 + (this.state.currentDifficultyLevel * 5);
        let answer, display;
        const mode = this.state.mode;

        if (mode === 'addition') {
            const n1 = this.rand(1, maxNumber);
            const n2 = this.rand(1, maxNumber);
            answer = n1 + n2;
            display = `${n1} + ${n2} = ?`;
        } else if (mode === 'subtraction') {
            const n1 = this.rand(Math.floor(maxNumber/2) + 1, maxNumber * 2);
            const n2 = this.rand(1, n1);
            answer = n1 - n2;
            display = `${n1} - ${n2} = ?`;
        } else if (mode === 'multiplication') {
            const maxMult = Math.min(15, 3 + this.state.currentDifficultyLevel);
            const n1 = this.rand(2, maxMult);
            const n2 = this.rand(2, maxMult);
            answer = n1 * n2;
            display = `${n1} × ${n2} = ?`;
        } else if (mode === 'division') {
            const maxDiv = Math.min(15, 3 + this.state.currentDifficultyLevel);
            const n2 = this.rand(2, maxDiv);
            const q = this.rand(2, maxDiv);
            const n1 = n2 * q;
            answer = q;
            display = `${n1} ÷ ${n2} = ?`;
        }

        this.state.currentQuestion = { answer, display };
    },
    
    generateOptions: function(correctAnswer) {
        const options = new Set([correctAnswer]);
        const variance = Math.max(5, Math.floor(correctAnswer * 0.3));

        while (options.size < 4) {
            let wrong = correctAnswer + this.rand(-variance, variance);
            if (wrong !== correctAnswer && wrong >= 0) {
                options.add(wrong);
            }
        }
        return [...options].sort(() => Math.random() - 0.5);
    },
    
    nextQuestion: function() {
        if (this.state.isGameOver) return;
        
        this.state.totalQuestions++;
        this.generateQuestion();
        
        const options = this.generateOptions(this.state.currentQuestion.answer);
        UI.renderQuestion(this.state.totalQuestions, this.state.currentQuestion.display, options);
        
        this.state.questionStartTime = Date.now();
        this.startTimer();
    },
    
    startTimer: function() {
        clearInterval(this.state.timerInterval);
        const maxTime = Math.max(5, Math.min(10, 11 - this.state.currentDifficultyLevel)); // 5-10s
        this.state.timeLeft = maxTime;
        UI.updateTimer(this.state.timeLeft, maxTime);

        this.state.timerInterval = setInterval(() => {
            this.state.timeLeft -= 0.1;
            UI.updateTimer(this.state.timeLeft, maxTime);
            
            if (this.state.timeLeft <= 0) {
                clearInterval(this.state.timerInterval);
                if (!this.state.isGameOver) {
                    this.handleWrongAnswer(null);
                }
            }
        }, 100);
    },
    
    checkAnswer: function(selected) {
        if (this.state.isGameOver) return;
        clearInterval(this.state.timerInterval);
        
        const responseTime = (Date.now() - this.state.questionStartTime) / 1000;
        this.state.totalResponseTime += responseTime;
        
        const correct = this.state.currentQuestion.answer;
        const isCorrect = selected === correct;
        
        UI.disableAnswers(correct, selected);
        
        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer(selected);
        }
    },
    
    handleCorrectAnswer: function() {
        this.state.streak++;
        if (this.state.streak > this.state.bestStreak) this.state.bestStreak = this.state.streak;
        this.state.correctAnswers++;
        
        let points = 10 + (this.state.currentDifficultyLevel * 2);
        if (this.state.streak >= 3) {
            points += 5 * (this.state.streak - 2);
        }
        Sound.correct();
        
        this.state.score += points;
        
        if (this.state.streak > 0 && this.state.streak % 3 === 0) {
            this.state.currentDifficultyLevel++;
        }
        
        UI.updateHUD(this.state.score, this.state.streak, this.state.mode.toUpperCase());
        UI.flashScreen(true);
        
        setTimeout(() => this.nextQuestion(), 800);
    },
    
    handleWrongAnswer: function(selected) {
        Sound.wrong();
        UI.flashScreen(false);
        this.state.streak = 0;
        
        if (this.state.currentDifficultyLevel > 1) {
            this.state.currentDifficultyLevel--;
        }
        
        UI.updateHUD(this.state.score, this.state.streak, this.state.mode.toUpperCase());
        setTimeout(() => this.endGame(), 1000);
    },
    
    endGame: function() {
        this.state.isGameOver = true;
        clearInterval(this.state.timerInterval);
        
        const accuracy = this.state.totalQuestions > 0 
            ? Math.round((this.state.correctAnswers / this.state.totalQuestions) * 100) 
            : 0;
        const avgTime = this.state.totalQuestions > 0 
            ? this.state.totalResponseTime / this.state.totalQuestions 
            : 0;
            
        const scoreObj = {
            score: this.state.score,
            mode: this.state.mode,
            difficulty: this.state.baseDifficulty,
            date: new Date().toLocaleDateString()
        };
        
        const leaderboard = Storage.saveScore(scoreObj);
        const highScore = Storage.getHighScore();
        
        const stats = {
            score: this.state.score,
            highScore: highScore,
            accuracy: accuracy,
            totalQuestions: this.state.totalQuestions,
            bestStreak: this.state.bestStreak,
            avgTime: avgTime
        };
        
        if (this.state.score > 0 && this.state.score >= highScore) {
            Sound.highScore();
        } else {
            Sound.gameOver();
        }
        
        UI.showAnalytics(stats, leaderboard, scoreObj);
        UI.showScreen('gameover');
    }
};

window.addEventListener('DOMContentLoaded', () => Game.init());
