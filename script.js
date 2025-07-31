// Five Crowns Progress Tracker
class FiveCrownsTracker {
    constructor() {
        this.currentGame = null;
        this.players = [];
        this.currentRound = 1;
        this.gameHistory = [];
        this.playerStats = {};
        
        this.wildCards = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        this.init();
        this.loadData();
    }

    init() {
        console.log('FiveCrownsTracker initializing...');
        this.bindEvents();
        this.updateWildCard();
        this.renderHistory();
        this.renderStats();
        
        // Debug: Check if game tab is visible
        const gameTab = document.getElementById('game-tab');
        console.log('Game tab element:', gameTab);
        console.log('Game tab classes:', gameTab?.className);
        console.log('Game tab display style:', window.getComputedStyle(gameTab).display);
        
        // Force show the game tab if it's hidden
        if (gameTab && window.getComputedStyle(gameTab).display === 'none') {
            console.log('Game tab is hidden, forcing it to show...');
            gameTab.style.display = 'block';
        }
        
        console.log('FiveCrownsTracker initialized successfully');
    }

    bindEvents() {
        // Tab navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Player management
        document.getElementById('add-player').addEventListener('click', () => this.addPlayer());
        document.getElementById('player-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPlayer();
        });
        document.getElementById('start-game').addEventListener('click', () => this.startGame());

        // Game controls
        document.getElementById('submit-scores').addEventListener('click', () => this.submitRoundScores());
        document.getElementById('next-round').addEventListener('click', () => this.nextRound());
        document.getElementById('end-game').addEventListener('click', () => this.endGame());

        // Modal controls
        document.getElementById('modal-cancel').addEventListener('click', () => this.closeModal());
        document.getElementById('modal-save').addEventListener('click', () => this.saveModalScore());
        document.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('score-modal').addEventListener('click', (e) => {
            if (e.target.id === 'score-modal') this.closeModal();
        });

        // Number pad
        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleNumberPad(e.target));
        });

        // Score input
        document.getElementById('modal-score-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveModalScore();
        });
    }

    switchTab(tabName) {
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Refresh content if needed
        if (tabName === 'history') this.renderHistory();
        if (tabName === 'stats') this.renderStats();
    }

    addPlayer() {
        const nameInput = document.getElementById('player-name');
        const name = nameInput.value.trim();
        
        if (!name) {
            alert('Please enter a player name');
            return;
        }

        if (this.players.includes(name)) {
            alert('Player already exists');
            return;
        }

        if (this.players.length >= 6) {
            alert('Maximum 6 players allowed');
            return;
        }

        this.players.push(name);
        nameInput.value = '';
        this.renderPlayersList();
        this.updateStartButton();
    }

    removePlayer(playerName) {
        this.players = this.players.filter(p => p !== playerName);
        this.renderPlayersList();
        this.updateStartButton();
    }

    renderPlayersList() {
        const container = document.getElementById('players-list');
        container.innerHTML = '';

        this.players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-item';
            playerDiv.innerHTML = `
                <span class="player-name">${player}</span>
                <button class="btn btn-small btn-danger" onclick="tracker.removePlayer('${player}')">Remove</button>
            `;
            container.appendChild(playerDiv);
        });
    }

    updateStartButton() {
        const startBtn = document.getElementById('start-game');
        startBtn.disabled = this.players.length < 2;
    }

    startGame() {
        if (this.players.length < 2) {
            alert('Need at least 2 players to start a game');
            return;
        }

        this.currentGame = {
            players: [...this.players],
            scores: {},
            startTime: new Date().toISOString(),
            completed: false
        };

        // Initialize scores
        this.players.forEach(player => {
            this.currentGame.scores[player] = new Array(11).fill(null);
        });

        this.currentRound = 1;
        this.updateWildCard();
        this.showGameView();
        this.renderScorecard();
        this.renderScoreInputs();
        this.updateSubmitButton();
    }

    showGameView() {
        document.getElementById('game-setup').style.display = 'none';
        document.getElementById('active-game').classList.remove('hidden');
    }

    hideGameView() {
        document.getElementById('game-setup').style.display = 'block';
        document.getElementById('active-game').classList.add('hidden');
    }

    renderScorecard() {
        const container = document.getElementById('scorecard-body');
        container.innerHTML = '';

        this.currentGame.players.forEach(player => {
            const row = document.createElement('div');
            row.className = 'player-row';
            
            const scoresHtml = this.currentGame.scores[player].map((score, index) => {
                const isCurrentRound = index === this.currentRound - 1;
                const displayScore = score !== null ? score : '';
                return `<div class="score-cell ${isCurrentRound ? 'current-round' : ''}" 
                              onclick="tracker.openScoreModal('${player}', ${index + 1})">${displayScore}</div>`;
            }).join('');

            row.innerHTML = `
                <div class="player-name-cell">${player}</div>
                <div class="scores-row">${scoresHtml}</div>
                <div class="total-cell">${this.calculatePlayerTotal(player)}</div>
            `;
            
            container.appendChild(row);
        });
    }

    calculatePlayerTotal(player) {
        return this.currentGame.scores[player]
            .filter(score => score !== null)
            .reduce((sum, score) => sum + score, 0);
    }

    renderScoreInputs() {
        const container = document.getElementById('score-inputs');
        const roundSpan = document.getElementById('input-round');
        
        roundSpan.textContent = this.currentRound;
        container.innerHTML = '';

        this.currentGame.players.forEach(player => {
            const inputRow = document.createElement('div');
            inputRow.className = 'score-input-row';
            
            const currentScore = this.currentGame.scores[player][this.currentRound - 1];
            const scoreValue = currentScore !== null ? currentScore : '';
            
            inputRow.innerHTML = `
                <label>${player}:</label>
                <input type="number" min="0" data-player="${player}" value="${scoreValue}" 
                       placeholder="Enter score">
            `;
            
            container.appendChild(inputRow);
        });

        // Add event listeners for real-time validation
        container.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => this.updateSubmitButton());
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.submitRoundScores();
            });
        });

        this.updateSubmitButton();
    }

    updateSubmitButton() {
        const inputs = document.querySelectorAll('.score-input-row input');
        const allFilled = Array.from(inputs).every(input => input.value.trim() !== '');
        const allValid = Array.from(inputs).every(input => {
            const value = parseInt(input.value);
            return !isNaN(value) && value >= 0;
        });
        
        const submitBtn = document.getElementById('submit-scores');
        const nextBtn = document.getElementById('next-round');
        
        // Check if current round scores are already saved
        const currentRoundSaved = this.currentGame.players.every(player => {
            return this.currentGame.scores[player][this.currentRound - 1] !== null;
        });
        
        if (currentRoundSaved) {
            // Round already submitted, show next round button
            submitBtn.style.display = 'none';
            nextBtn.classList.remove('hidden');
            nextBtn.style.display = 'block';
            nextBtn.disabled = false;
        } else {
            // Round not submitted yet
            submitBtn.style.display = 'block';
            submitBtn.disabled = !allFilled || !allValid;
            nextBtn.classList.add('hidden');
            nextBtn.style.display = 'none';
        }
    }

    submitRoundScores() {
        const inputs = document.querySelectorAll('.score-input-row input');
        let allValid = true;

        inputs.forEach(input => {
            const player = input.dataset.player;
            const score = parseInt(input.value);

            if (isNaN(score) || score < 0) {
                allValid = false;
                input.style.borderColor = '#dc3545';
            } else {
                this.currentGame.scores[player][this.currentRound - 1] = score;
                input.style.borderColor = '';
            }
        });

        if (!allValid) {
            alert('Please enter valid scores for all players');
            return;
        }

        // Show feedback
        const submitBtn = document.getElementById('submit-scores');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Saved!';
        submitBtn.style.background = '#28a745';
        
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.background = '';
        }, 1000);

        this.renderScorecard();
        this.updateSubmitButton();

        // Check if game is complete
        if (this.currentRound === 11) {
            setTimeout(() => {
                this.completeGame();
            }, 1000);
        }
    }

    nextRound() {
        if (this.currentRound < 11) {
            this.currentRound++;
            this.updateWildCard();
            this.renderScoreInputs();
            this.renderScorecard();
            
            // Show feedback
            const nextBtn = document.getElementById('next-round');
            const originalText = nextBtn.textContent;
            nextBtn.textContent = 'Moving to next round...';
            nextBtn.disabled = true;
            
            setTimeout(() => {
                nextBtn.textContent = originalText;
                nextBtn.disabled = false;
            }, 500);
        }
    }

    updateWildCard() {
        const wildCard = this.wildCards[this.currentRound - 1];
        document.getElementById('wild-card').textContent = wildCard;
    }

    openScoreModal(player, round) {
        document.getElementById('modal-player-name').textContent = player;
        document.getElementById('modal-round').textContent = round;
        
        const currentScore = this.currentGame.scores[player][round - 1];
        document.getElementById('modal-score-input').value = currentScore !== null ? currentScore : '';
        
        this.modalContext = { player, round };
        document.getElementById('score-modal').style.display = 'flex';
        document.getElementById('modal-score-input').focus();
    }

    closeModal() {
        document.getElementById('score-modal').style.display = 'none';
        this.modalContext = null;
    }

    saveModalScore() {
        const scoreInput = document.getElementById('modal-score-input');
        const score = parseInt(scoreInput.value);

        if (isNaN(score) || score < 0) {
            alert('Please enter a valid score (0 or higher)');
            return;
        }

        const { player, round } = this.modalContext;
        this.currentGame.scores[player][round - 1] = score;
        
        this.renderScorecard();
        this.renderScoreInputs();
        this.closeModal();
    }

    handleNumberPad(button) {
        const input = document.getElementById('modal-score-input');
        const currentValue = input.value;

        if (button.classList.contains('clear')) {
            input.value = '';
        } else if (button.classList.contains('backspace')) {
            input.value = currentValue.slice(0, -1);
        } else {
            const number = button.textContent;
            if (currentValue.length < 3) { // Limit to 3 digits
                input.value = currentValue + number;
            }
        }
    }

    completeGame() {
        // Calculate final scores and winner
        const finalScores = {};
        let lowestScore = Infinity;
        let winner = null;

        this.currentGame.players.forEach(player => {
            const total = this.calculatePlayerTotal(player);
            finalScores[player] = total;
            
            if (total < lowestScore) {
                lowestScore = total;
                winner = player;
            }
        });

        this.currentGame.finalScores = finalScores;
        this.currentGame.winner = winner;
        this.currentGame.completed = true;
        this.currentGame.endTime = new Date().toISOString();

        // Add to history and update stats
        this.gameHistory.unshift(this.currentGame);
        this.updatePlayerStats();
        this.saveData();

        alert(`Game Complete! Winner: ${winner} with ${lowestScore} points`);
        this.hideGameView();
        this.currentGame = null;
    }

    endGame() {
        if (confirm('Are you sure you want to end the current game?')) {
            this.hideGameView();
            this.currentGame = null;
        }
    }

    updatePlayerStats() {
        if (!this.currentGame.completed) return;

        this.currentGame.players.forEach(player => {
            if (!this.playerStats[player]) {
                this.playerStats[player] = {
                    gamesPlayed: 0,
                    wins: 0,
                    totalScore: 0,
                    averageScore: 0,
                    bestScore: Infinity
                };
            }

            const stats = this.playerStats[player];
            const score = this.currentGame.finalScores[player];

            stats.gamesPlayed++;
            stats.totalScore += score;
            stats.averageScore = Math.round(stats.totalScore / stats.gamesPlayed);
            
            if (score < stats.bestScore) {
                stats.bestScore = score;
            }

            if (this.currentGame.winner === player) {
                stats.wins++;
            }
        });
    }

    renderHistory() {
        const container = document.getElementById('games-history');
        
        if (this.gameHistory.length === 0) {
            container.innerHTML = '<p class="text-center">No games played yet.</p>';
            return;
        }

        container.innerHTML = '';
        
        this.gameHistory.forEach(game => {
            const gameDiv = document.createElement('div');
            gameDiv.className = 'game-item';
            
            const date = new Date(game.startTime).toLocaleDateString();
            const time = new Date(game.startTime).toLocaleTimeString();
            
            gameDiv.innerHTML = `
                <div class="game-date">${date} at ${time}</div>
                <div class="game-players">
                    ${game.players.map(player => {
                        const score = game.finalScores ? game.finalScores[player] : 'N/A';
                        const isWinner = game.winner === player;
                        return `<div class="player-result ${isWinner ? 'winner' : ''}">${player}: ${score}</div>`;
                    }).join('')}
                </div>
            `;
            
            container.appendChild(gameDiv);
        });
    }

    renderStats() {
        const container = document.getElementById('player-stats');
        
        if (Object.keys(this.playerStats).length === 0) {
            container.innerHTML = '<p class="text-center">No player statistics available yet.</p>';
            return;
        }

        container.innerHTML = '';
        
        Object.entries(this.playerStats).forEach(([player, stats]) => {
            const winRate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;
            
            const statDiv = document.createElement('div');
            statDiv.className = 'stat-item';
            
            statDiv.innerHTML = `
                <div class="stat-name">${player}</div>
                <div>Games Played: <span class="stat-value">${stats.gamesPlayed}</span></div>
                <div>Wins: <span class="stat-value">${stats.wins}</span></div>
                <div>Win Rate: <span class="stat-value">${winRate}%</span></div>
                <div>Average Score: <span class="stat-value">${stats.averageScore}</span></div>
                <div>Best Score: <span class="stat-value">${stats.bestScore === Infinity ? 'N/A' : stats.bestScore}</span></div>
            `;
            
            container.appendChild(statDiv);
        });
    }

    saveData() {
        const data = {
            gameHistory: this.gameHistory,
            playerStats: this.playerStats
        };
        localStorage.setItem('fiveCrownsData', JSON.stringify(data));
    }

    loadData() {
        const saved = localStorage.getItem('fiveCrownsData');
        if (saved) {
            const data = JSON.parse(saved);
            this.gameHistory = data.gameHistory || [];
            this.playerStats = data.playerStats || {};
        }
    }
}

// Initialize the tracker when the page loads
let tracker;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating FiveCrownsTracker...');
    tracker = new FiveCrownsTracker();
    console.log('Tracker created:', tracker);
});

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
