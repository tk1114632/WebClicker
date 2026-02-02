(() => {
    const i18n = {
        getTranslations() {
            return {
                en: {
                    'app.title': 'CS2 Aim Trainer',
                    'app.subtitle': 'Focus for CS2/CSGO players',
                    'app.language': 'Language',
                    'menu.play': '>> PLAY',
                    'history.title': 'Game History',
                    'history.subtitle': 'Your recent performance stats',
                    'history.steam64Label': 'Steam64 ID',
                    'history.steam64Placeholder': '7656119xxxxxxxxxx',
                    'history.bindBtn': 'Bind',
                    'history.empty': 'No games played yet. Start your first session!',
                    'history.bestScore': 'Best Score',
                    'history.totalGames': 'Total Games',
                    'history.avgAccuracy': 'Avg Accuracy',
                    'history.avgReaction': 'Avg Reaction',
                    'history.clear': 'Clear History',
                    'history.steam64Cleared': 'Steam64 cleared',
                    'history.steam64Bound': 'Steam64 bound',
                    'history.steam64Invalid': 'Steam64 format should be 17 digits',
                    'history.steam64SaveFailed': 'Steam64 save failed',
                    'settings.cs2Title': 'CS2/CSGO Settings',
                    'settings.cs2Subtitle': 'Match your in-game feel',
                    'settings.aspectRatio': 'Canvas Aspect Ratio',
                    'settings.aspect169': '16:9 (106.26° FOV)',
                    'settings.aspect43': '4:3 (90° FOV)',
                    'settings.sensitivity': 'Sensitivity',
                    'settings.fovInput': 'FOV',
                    'settings.apply': 'Apply',
                    'settings.quickPreset': 'Quick Preset:',
                    'settings.presetCs': 'CS2/CSGO',
                    'settings.gameTitle': 'Game Settings',
                    'settings.gameSubtitle': 'Customize your training experience',
                    'settings.difficulty': 'Difficulty',
                    'settings.difficultyEasy': 'Easy',
                    'settings.difficultyMedium': 'Medium',
                    'settings.difficultyHard': 'Hard',
                    'settings.difficultyExpert': 'Expert',
                    'settings.gameMode': 'Game Mode',
                    'settings.modeJumbo': 'Jumbo Tile Frenzy',
                    'settings.modeSpeed': 'Speed Test',
                    'settings.modePrecision': 'Precision',
                    'settings.targetLifetime': 'Target Lifetime',
                    'settings.spawnDelay': 'Spawn Delay',
                    'settings.fov': 'FOV',
                    'settings.targetSize': 'Target Size',
                    'settings.targetDistance': 'Target Distance',
                    'crosshair.title': 'Crosshair Settings',
                    'crosshair.subtitle': 'Customize your aiming reticle',
                    'crosshair.style': 'Crosshair Style',
                    'crosshair.default': 'Default (White)',
                    'crosshair.red': 'Red',
                    'crosshair.green': 'Green',
                    'crosshair.blue': 'Blue',
                    'crosshair.cyan': 'Cyan',
                    'crosshair.magenta': 'Magenta',
                    'crosshair.yellow': 'Yellow',
                    'crosshair.size': 'Crosshair Size',
                    'crosshair.thickness': 'Crosshair Thickness',
                    'crosshair.centerDot': 'Center Dot',
                    'crosshair.reset': 'Reset',
                    'crosshair.preview': 'Preview',
                    'game.score': 'Score',
                    'game.time': 'Time',
                    'game.accuracy': 'Accuracy',
                    'game.warmup': 'Warm-up',
                    'gameOver.title': 'Training Complete!',
                    'gameOver.performanceGrade': 'Performance Grade',
                    'gameOver.newHighscore': '🏆 NEW HIGHSCORE! 🏆',
                    'gameOver.yourScore': 'Your Score',
                    'gameOver.bestScore': 'Best Score',
                    'gameOver.vs': 'vs',
                    'gameOver.finalScore': 'Final Score',
                    'gameOver.time': 'Time',
                    'gameOver.accuracy': 'Accuracy',
                    'gameOver.avgReaction': 'Avg Reaction Time',
                    'gameOver.hits': 'Hits',
                    'gameOver.misses': 'Misses',
                    'gameOver.totalClicks': 'Total Clicks',
                    'gameOver.consistency': 'Consistency',
                    'gameOver.advancedTitle': 'Advanced Performance Analysis',
                    'gameOver.performanceTier': 'Performance Tier',
                    'gameOver.percentile': 'Percentile Ranking',
                    'gameOver.reactionScore': 'Reaction Time Score',
                    'gameOver.accuracyScore': 'Accuracy Score',
                    'gameOver.overallScore': 'Overall Score',
                    'gameOver.mode': 'Game Mode',
                    'gameOver.bestStreak': 'Best Streak',
                    'gameOver.streakBonus': 'Streak Bonus',
                    'gameOver.warmupAvg': 'Warm-up Avg',
                    'gameOver.metricsTitle': 'Performance Metrics',
                    'gameOver.reactionRating': 'Reaction Time Rating',
                    'gameOver.consistencyRating': 'Consistency Rating',
                    'gameOver.overallPerformance': 'Overall Performance',
                    'gameOver.playAgain': 'Play Again',
                    'gameOver.backToMenu': 'Back to Menu',
                    'pause.title': 'Paused',
                    'pause.subtitle': 'Press ESC to resume',
                    'pause.restart': 'Restart',
                    'pause.menu': 'Main Menu',
                    'alerts.invalidSensitivity': 'Please enter a valid sensitivity value',
                    'alerts.clearHistoryConfirm': 'Are you sure you want to clear all game history? This cannot be undone.',
                    'alerts.sensitivitySavedTitle': 'Sensitivity saved!',
                    'alerts.labelGame': 'Game',
                    'alerts.labelSensitivity': 'Sensitivity',
                    'alerts.labelFov': 'FOV'
                },
                zh: {
                    'app.title': 'CS2 练枪',
                    'app.subtitle': '专注于 CS2/CSGO 玩家',
                    'app.language': '语言',
                    'menu.play': '>> 开始训练',
                    'history.title': '历史记录',
                    'history.subtitle': '最近的训练数据',
                    'history.steam64Label': 'Steam64 ID',
                    'history.steam64Placeholder': '7656119xxxxxxxxxx',
                    'history.bindBtn': '绑定',
                    'history.empty': '还没有记录，开始你的第一局吧！',
                    'history.bestScore': '最高分',
                    'history.totalGames': '总局数',
                    'history.avgAccuracy': '平均命中率',
                    'history.avgReaction': '平均反应',
                    'history.clear': '清空记录',
                    'history.steam64Cleared': '已清除 Steam64',
                    'history.steam64Bound': '已绑定 Steam64',
                    'history.steam64Invalid': 'Steam64 格式应为 17 位数字',
                    'history.steam64SaveFailed': 'Steam64 保存失败',
                    'settings.cs2Title': 'CS2/CSGO 设置',
                    'settings.cs2Subtitle': '匹配你的游戏手感',
                    'settings.aspectRatio': '画布比例',
                    'settings.aspect169': '16:9 (106.26° 视野)',
                    'settings.aspect43': '4:3 (90° 视野)',
                    'settings.sensitivity': '灵敏度',
                    'settings.fovInput': '视野 (FOV)',
                    'settings.apply': '应用',
                    'settings.quickPreset': '快速预设：',
                    'settings.presetCs': 'CS2/CSGO',
                    'settings.gameTitle': '游戏设置',
                    'settings.gameSubtitle': '自定义训练体验',
                    'settings.difficulty': '难度',
                    'settings.difficultyEasy': '简单',
                    'settings.difficultyMedium': '普通',
                    'settings.difficultyHard': '困难',
                    'settings.difficultyExpert': '专家',
                    'settings.gameMode': '模式',
                    'settings.modeJumbo': '巨型反应',
                    'settings.modeSpeed': '速度测试',
                    'settings.modePrecision': '精准训练',
                    'settings.targetLifetime': '目标存活时间',
                    'settings.spawnDelay': '生成间隔',
                    'settings.fov': '视野 (FOV)',
                    'settings.targetSize': '目标大小',
                    'settings.targetDistance': '目标距离',
                    'crosshair.title': '准星设置',
                    'crosshair.subtitle': '自定义准星样式',
                    'crosshair.style': '准星风格',
                    'crosshair.default': '默认（白色）',
                    'crosshair.red': '红色',
                    'crosshair.green': '绿色',
                    'crosshair.blue': '蓝色',
                    'crosshair.cyan': '青色',
                    'crosshair.magenta': '品红',
                    'crosshair.yellow': '黄色',
                    'crosshair.size': '准星大小',
                    'crosshair.thickness': '准星粗细',
                    'crosshair.centerDot': '中心点',
                    'crosshair.reset': '重置',
                    'crosshair.preview': '预览',
                    'game.score': '得分',
                    'game.time': '时间',
                    'game.accuracy': '命中率',
                    'game.warmup': '热身',
                    'gameOver.title': '训练完成！',
                    'gameOver.performanceGrade': '综合评级',
                    'gameOver.newHighscore': '🏆 新纪录！🏆',
                    'gameOver.yourScore': '本局分数',
                    'gameOver.bestScore': '最高分',
                    'gameOver.vs': '对比',
                    'gameOver.finalScore': '最终得分',
                    'gameOver.time': '时间',
                    'gameOver.accuracy': '命中率',
                    'gameOver.avgReaction': '平均反应时间',
                    'gameOver.hits': '命中',
                    'gameOver.misses': '未命中',
                    'gameOver.totalClicks': '总点击',
                    'gameOver.consistency': '稳定性',
                    'gameOver.advancedTitle': '高级表现分析',
                    'gameOver.performanceTier': '表现段位',
                    'gameOver.percentile': '百分位排名',
                    'gameOver.reactionScore': '反应评分',
                    'gameOver.accuracyScore': '命中评分',
                    'gameOver.overallScore': '综合评分',
                    'gameOver.mode': '模式',
                    'gameOver.bestStreak': '最佳连击',
                    'gameOver.streakBonus': '连击加成',
                    'gameOver.warmupAvg': '热身平均',
                    'gameOver.metricsTitle': '表现指标',
                    'gameOver.reactionRating': '反应评级',
                    'gameOver.consistencyRating': '稳定性评级',
                    'gameOver.overallPerformance': '综合表现',
                    'gameOver.playAgain': '再来一局',
                    'gameOver.backToMenu': '返回菜单',
                    'pause.title': '已暂停',
                    'pause.subtitle': '按 ESC 继续',
                    'pause.restart': '重新开始',
                    'pause.menu': '主菜单',
                    'alerts.invalidSensitivity': '请输入有效的灵敏度数值',
                    'alerts.clearHistoryConfirm': '确定清空所有历史记录吗？此操作不可撤销。',
                    'alerts.sensitivitySavedTitle': '灵敏度已保存！',
                    'alerts.labelGame': '游戏',
                    'alerts.labelSensitivity': '灵敏度',
                    'alerts.labelFov': 'FOV'
                }
            };
        },
        getSavedLocale(game) {
            try {
                const saved = localStorage.getItem('webclicker_locale');
                if (saved && game.translations[saved]) {
                    return saved;
                }
            } catch (error) {
                console.warn('Failed to load locale:', error);
            }
            const browserLang = (navigator.language || 'en').toLowerCase();
            return browserLang.startsWith('zh') ? 'zh' : 'en';
        },
        setLocale(game, locale) {
            if (!game.translations[locale]) return;
            game.locale = locale;
            try {
                localStorage.setItem('webclicker_locale', locale);
            } catch (error) {
                console.warn('Failed to save locale:', error);
            }
            this.applyLocale(game);
        },
        t(game, key) {
            return (game.translations[game.locale] && game.translations[game.locale][key]) ||
                (game.translations.en && game.translations.en[key]) ||
                key;
        },
        applyLocale(game) {
            document.querySelectorAll('[data-i18n]').forEach((el) => {
                const key = el.getAttribute('data-i18n');
                if (key) {
                    el.textContent = this.t(game, key);
                }
            });
            document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
                const key = el.getAttribute('data-i18n-placeholder');
                if (key) {
                    el.setAttribute('placeholder', this.t(game, key));
                }
            });

            document.documentElement.lang = game.locale === 'zh' ? 'zh-CN' : 'en';
            const languageSelect = document.getElementById('language-select');
            if (languageSelect) {
                languageSelect.value = game.locale;
            }

            game.updateUI();
        }
    };

    window.WebClickerI18n = i18n;
})();
