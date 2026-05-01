const Sound = {
    enabled: false, // Defaulting to false, will be toggled or explicitly enabled
    audioEls: {},
    init: function() {
        this.audioEls = {
            correct: document.getElementById('audio-correct'),
            wrong:   document.getElementById('audio-wrong'),
            music:   document.getElementById('audio-music'),
            easy:    document.getElementById('audio-easy'),
            medium:  document.getElementById('audio-medium'),
            hard:    document.getElementById('audio-hard'),
            highscore: document.getElementById('audio-highscore'),
            skip:    document.getElementById('audio-skip')
        };
        if (this.audioEls.music) {
            this.audioEls.music.volume = 0.4;
        }
    },
    toggle: function() {
        this.enabled = !this.enabled;
        if (this.enabled) {
            if (this.audioEls.music) this.audioEls.music.play().catch(() => {});
        } else {
            if (this.audioEls.music) this.audioEls.music.pause();
        }
        return this.enabled;
    },
    playFile: function(type) {
        try {
            const clip = this.audioEls[type];
            if (clip) {
                clip.currentTime = 0;
                clip.play().catch(() => {});
            }
        } catch (e) {}
    },
    correct: function() {
        this.playFile('correct');
    },
    wrong: function() {
        this.playFile('wrong');
    },
    streakBonus: function() {
        this.playFile('highscore');
    },
    gameOver: function() {
        this.playFile('skip');
    },
    playDifficultySound: function(diff) {
        this.playFile(diff);
    },
    highScore: function() {
        this.playFile('highscore');
    }
};

window.addEventListener('DOMContentLoaded', () => Sound.init());
window.Sound = Sound;