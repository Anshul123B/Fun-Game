const Storage = {
    getLeaderboard: function() {
        const data = localStorage.getItem('mathblitz_leaderboard');
        return data ? JSON.parse(data) : [];
    },
    saveScore: function(scoreData) {
        const leaderboard = this.getLeaderboard();
        leaderboard.push(scoreData);
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard.splice(3); // keep top 3
        localStorage.setItem('mathblitz_leaderboard', JSON.stringify(leaderboard));
        return leaderboard;
    },
    getHighScore: function() {
        const leaderboard = this.getLeaderboard();
        return leaderboard.length > 0 ? leaderboard[0].score : 0;
    }
};

window.Storage = Storage;