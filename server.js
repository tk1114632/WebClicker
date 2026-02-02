const http = require('http');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const publicDir = __dirname;
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'webclicker.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            steam64 TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            score INTEGER,
            accuracy REAL,
            hits INTEGER,
            misses INTEGER,
            totalClicks INTEGER,
            averageReactionTime REAL,
            consistency REAL,
            grade TEXT,
            difficulty TEXT,
            gameMode TEXT,
            fov INTEGER,
            reactionTimeScore REAL,
            accuracyScore REAL,
            overallScore REAL,
            performanceTier TEXT,
            percentile REAL,
            maxStreak INTEGER,
            streakBonus REAL,
            warmUpAverage REAL
        )
    `);
});

const contentTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

const sendJson = (res, status, payload) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
};

const parseJsonBody = (req) => new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk;
        if (body.length > 1e6) {
            req.destroy();
            reject(new Error('Body too large'));
        }
    });
    req.on('end', () => {
        if (!body) {
            resolve({});
            return;
        }
        try {
            resolve(JSON.parse(body));
        } catch (error) {
            reject(error);
        }
    });
});

const isValidSteam64 = (value) => typeof value === 'string' && /^\d{17}$/.test(value);

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');

    if (url.pathname.startsWith('/api/')) {
        if (req.method === 'POST' && url.pathname === '/api/session') {
            try {
                const body = await parseJsonBody(req);
                if (!isValidSteam64(body.steam64)) {
                    sendJson(res, 400, { error: 'Invalid steam64' });
                    return;
                }

                const session = {
                    steam64: body.steam64,
                    timestamp: body.timestamp || Date.now(),
                    score: body.score || 0,
                    accuracy: body.accuracy || 0,
                    hits: body.hits || 0,
                    misses: body.misses || 0,
                    totalClicks: body.totalClicks || 0,
                    averageReactionTime: body.averageReactionTime || 0,
                    consistency: body.consistency || 0,
                    grade: body.grade || 'N/A',
                    difficulty: body.difficulty || '',
                    gameMode: body.gameMode || '',
                    fov: body.fov || 0,
                    reactionTimeScore: body.reactionTimeScore || 0,
                    accuracyScore: body.accuracyScore || 0,
                    overallScore: body.overallScore || 0,
                    performanceTier: body.performanceTier || '',
                    percentile: body.percentile || 0,
                    maxStreak: body.maxStreak || 0,
                    streakBonus: body.streakBonus || 0,
                    warmUpAverage: body.warmUpAverage || 0
                };

                const sql = `
                    INSERT INTO sessions (
                        steam64, timestamp, score, accuracy, hits, misses, totalClicks,
                        averageReactionTime, consistency, grade, difficulty, gameMode, fov,
                        reactionTimeScore, accuracyScore, overallScore, performanceTier,
                        percentile, maxStreak, streakBonus, warmUpAverage
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const values = [
                    session.steam64,
                    session.timestamp,
                    session.score,
                    session.accuracy,
                    session.hits,
                    session.misses,
                    session.totalClicks,
                    session.averageReactionTime,
                    session.consistency,
                    session.grade,
                    session.difficulty,
                    session.gameMode,
                    session.fov,
                    session.reactionTimeScore,
                    session.accuracyScore,
                    session.overallScore,
                    session.performanceTier,
                    session.percentile,
                    session.maxStreak,
                    session.streakBonus,
                    session.warmUpAverage
                ];

                db.run(sql, values, (err) => {
                    if (err) {
                        console.error('Failed to insert session:', err);
                        sendJson(res, 500, { error: 'Failed to save session' });
                        return;
                    }
                    sendJson(res, 200, { ok: true });
                });
            } catch (error) {
                sendJson(res, 400, { error: 'Invalid JSON' });
            }
            return;
        }

        if (req.method === 'GET' && url.pathname.startsWith('/api/history/')) {
            const steam64 = url.pathname.split('/').pop();
            if (!isValidSteam64(steam64)) {
                sendJson(res, 400, { error: 'Invalid steam64' });
                return;
            }

            const sql = `
                SELECT
                    timestamp, score, accuracy, hits, misses, totalClicks, averageReactionTime,
                    consistency, grade, difficulty, gameMode, fov, reactionTimeScore, accuracyScore,
                    overallScore, performanceTier, percentile, maxStreak, streakBonus, warmUpAverage
                FROM sessions
                WHERE steam64 = ?
                ORDER BY timestamp DESC
                LIMIT 50
            `;

            db.all(sql, [steam64], (err, rows) => {
                if (err) {
                    console.error('Failed to load history:', err);
                    sendJson(res, 500, { error: 'Failed to load history' });
                    return;
                }
                sendJson(res, 200, { sessions: rows });
            });
            return;
        }

        sendJson(res, 404, { error: 'Not found' });
        return;
    }

    const filePath = path.join(publicDir, url.pathname === '/' ? 'index.html' : url.pathname);
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        const ext = path.extname(filePath);
        const contentType = contentTypes[ext] || 'text/plain';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(8000, () => console.log('Server running on http://localhost:8000'));
