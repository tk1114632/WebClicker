(() => {
    const history = {
        getSteam64StorageKey() {
            return 'webclicker_steam64';
        },
        loadSteam64() {
            try {
                return localStorage.getItem(this.getSteam64StorageKey()) || '';
            } catch (error) {
                console.warn('Failed to load Steam64:', error);
                return '';
            }
        },
        saveSteam64(game) {
            const input = document.getElementById('steam64-input');
            if (!input) return '';

            const value = input.value.trim();
            if (!value) {
                localStorage.removeItem(this.getSteam64StorageKey());
                this.setSteam64Status(game, game.t('history.steam64Cleared'), false);
                return '';
            }

            if (!/^\d{17}$/.test(value)) {
                this.setSteam64Status(game, game.t('history.steam64Invalid'), true);
                return '';
            }

            try {
                localStorage.setItem(this.getSteam64StorageKey(), value);
                this.setSteam64Status(game, game.t('history.steam64Bound'), false);
                this.refreshHistoryFromServer(game);
                return value;
            } catch (error) {
                console.warn('Failed to save Steam64:', error);
                this.setSteam64Status(game, game.t('history.steam64SaveFailed'), true);
                return '';
            }
        },
        setSteam64Status(game, message, isError) {
            const statusEl = document.getElementById('steam64-status');
            if (!statusEl) return;
            statusEl.textContent = message;
            statusEl.style.color = isError ? '#ff6b6b' : '#7fd6ff';
        },
        async syncSessionToServer(game, sessionData) {
            const steam64 = this.loadSteam64();
            if (!steam64) return;
            try {
                await fetch('/api/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        steam64,
                        ...sessionData
                    })
                });
            } catch (error) {
                console.warn('Failed to sync session to server:', error);
            }
        },
        async refreshHistoryFromServer(game) {
            const steam64 = this.loadSteam64();
            if (!steam64) return;
            try {
                const response = await fetch(`/api/history/${steam64}`);
                if (!response.ok) return;
                const data = await response.json();
                if (Array.isArray(data.sessions)) {
                    localStorage.setItem('webclicker_game_history', JSON.stringify(data.sessions));
                    this.updateHistoryDisplay(game);
                }
            } catch (error) {
                console.warn('Failed to refresh history from server:', error);
            }
        },
        saveSessionData(game) {
            try {
                const sessionData = {
                    timestamp: Date.now(),
                    steam64: this.loadSteam64(),
                    score: game.score,
                    accuracy: game.getAccuracy(),
                    hits: game.hits,
                    misses: game.misses,
                    totalClicks: game.performanceData.totalClicks,
                    averageReactionTime: game.performanceData.averageReactionTime,
                    consistency: game.performanceData.consistency,
                    grade: game.performanceData.grade,
                    difficulty: game.difficulty,
                    gameMode: game.gameMode,
                    fov: game.fov,
                    reactionTimeScore: game.performanceData.reactionTimeScore,
                    accuracyScore: game.performanceData.accuracyScore,
                    overallScore: game.performanceData.overallScore,
                    performanceTier: game.performanceData.performanceTier,
                    percentile: game.performanceData.percentile,
                    maxStreak: game.performanceData.maxStreak,
                    streakBonus: game.performanceData.streakBonus,
                    warmUpAverage: game.performanceData.warmUpAverage
                };

                console.log('Saving session data:', sessionData);
                console.log('performanceData:', game.performanceData);
                console.log('hitTimes length:', game.hitTimes.length);
                console.log('hitTimes:', game.hitTimes);

                const existingHistory = this.loadHistory();
                console.log('Existing history length:', existingHistory.length);

                existingHistory.unshift(sessionData);
                const trimmedHistory = existingHistory.slice(0, 50);
                localStorage.setItem('webclicker_game_history', JSON.stringify(trimmedHistory));
                console.log('History saved, new total sessions:', trimmedHistory.length);

                this.syncSessionToServer(game, sessionData);
            } catch (error) {
                console.warn('Failed to save session data:', error);
            }
        },
        loadHistory() {
            try {
                const historyData = localStorage.getItem('webclicker_game_history');
                console.log('Raw history data from localStorage:', historyData);
                const historyList = historyData ? JSON.parse(historyData) : [];
                console.log('Parsed history:', historyList);
                console.log('loadHistory returning', historyList.length, 'sessions');
                return historyList;
            } catch (error) {
                console.warn('Failed to load history data:', error);
                console.warn('Raw data that failed to parse:', localStorage.getItem('webclicker_game_history'));
                return [];
            }
        },
        getBestSession(game) {
            const historyList = this.loadHistory();
            console.log('getBestSession - history length:', historyList.length);
            if (historyList.length === 0) {
                console.log('getBestSession - no history, returning null');
                return null;
            }

            const best = historyList.reduce((bestSession, session) => {
                const result = (!bestSession || session.score > bestSession.score) ? session : bestSession;
                console.log('Comparing session score', session.score, 'with best', bestSession ? bestSession.score : 'none', '-> new best:', result.score);
                return result;
            });
            console.log('getBestSession - returning best session with score:', best.score);
            return best;
        },
        getRecentSessions() {
            const historyList = this.loadHistory();
            return historyList.slice(0, 10);
        },
        clearHistory(game) {
            localStorage.removeItem('webclicker_game_history');
            this.updateHistoryDisplay(game);
        },
        updateHistoryDisplay(game) {
            console.log('updateHistoryDisplay called');
            const historyList = this.loadHistory();
            console.log('Loaded history:', historyList);

            const historyCard = document.getElementById('history-card');
            const noHistoryMsg = document.getElementById('no-history-message');
            const historyStats = document.getElementById('history-stats');

            if (historyList.length === 0) {
                console.log('No history found, showing no history message');
                if (noHistoryMsg) noHistoryMsg.style.display = 'block';
                if (historyStats) historyStats.style.display = 'none';
                return;
            }

            console.log('History found, showing stats for', historyList.length, 'sessions');
            if (noHistoryMsg) noHistoryMsg.style.display = 'none';
            if (historyStats) historyStats.style.display = 'block';

            const bestSession = this.getBestSession(game);
            const totalGames = historyList.length;
            const avgAccuracy = historyList.reduce((sum, session) => sum + session.accuracy, 0) / historyList.length;
            const avgReactionTime = historyList.reduce((sum, session) => sum + session.averageReactionTime, 0) / historyList.length;

            console.log('Calculated stats:', { bestSession, totalGames, avgAccuracy, avgReactionTime });

            const bestScoreEl = document.getElementById('best-score');
            const totalGamesEl = document.getElementById('total-games');
            const avgAccuracyEl = document.getElementById('avg-accuracy');
            const avgReactionEl = document.getElementById('avg-reaction');

            if (bestScoreEl) bestScoreEl.textContent = bestSession ? bestSession.score : '0';
            if (totalGamesEl) totalGamesEl.textContent = totalGames;
            if (avgAccuracyEl) avgAccuracyEl.textContent = avgAccuracy.toFixed(1) + '%';
            if (avgReactionEl) avgReactionEl.textContent = Math.round(avgReactionTime) + 'ms';

            game.updatePerformanceChart(historyList.slice(0, 10));
        }
    };

    window.WebClickerHistory = history;
})();
