/**
 * server.js
 * - Backend TCP para receber mensagens do rastreador SinoTrack ST-901.
 * - Envia os dados parseados para o Firebase Realtime Database.
 */

require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const { TcpServer } = require('./tcpServer');
const { saveGpsData, initFirebase } = require('./firebase');
const { registerToken, getAllTokens, sendNotificationToTokens } = require('./fcm');

const TCP_PORT = parseInt(process.env.TCP_PORT, 10) || 8090;
const HTTP_PORT = parseInt(process.env.HTTP_PORT, 10) || 3000;
const HTTP_API_KEY = process.env.HTTP_API_KEY || '';
const ALLOWED_ORIGINS = new Set((process.env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean));
const ALLOWED_IMEIS = new Set((process.env.TCP_ALLOWED_IMEIS || '').split(',').map(value => value.trim()).filter(Boolean));
const rateBuckets = new Map();

function rateLimit(key, limit, windowMs){
    const now = Date.now();
    const current = rateBuckets.get(key);
    if (!current || current.resetAt <= now) {
        rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }
    current.count += 1;
    return current.count <= limit;
}

function safeEqual(left, right){
    if (typeof left !== 'string' || typeof right !== 'string' || !left || left.length !== right.length) return false;
    return crypto.timingSafeEqual(Buffer.from(left), Buffer.from(right));
}

async function requireFirebaseUser(req, res, next){
    const header = req.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!token) return res.status(401).json({ error: 'authentication required' });
    try {
        req.user = await require('firebase-admin').auth().verifyIdToken(token);
        return next();
    } catch (error) {
        return res.status(401).json({ error: 'invalid authentication' });
    }
}

function requireAdminKey(req, res, next){
    if (!HTTP_API_KEY) return res.status(503).json({ error: 'administrative API disabled' });
    const supplied = req.get('x-api-key') || '';
    if (!safeEqual(supplied, HTTP_API_KEY)) return res.status(401).json({ error: 'invalid API key' });
    return next();
}

(async function bootstrap(){
    try {
        initFirebase();
        const tcpServer = new TcpServer(TCP_PORT);

        tcpServer.on('gps', async (payload) => {
            const deviceId = payload.imei || payload.deviceId || 'device01';
            if (ALLOWED_IMEIS.size > 0 && !ALLOWED_IMEIS.has(String(deviceId))) {
                console.warn('GPS rejeitado para IMEI não autorizado');
                return;
            }
            try {
                const saved = await saveGpsData(deviceId, payload);
                console.log('GPS salvo no Firebase:', deviceId, saved);
            } catch (err) {
                console.error('Falha ao salvar GPS no Firebase:', err.message);
            }
        });

        tcpServer.start();

        // Start HTTP API for FCM token registration and sending notifications
        const app = express();
        app.disable('x-powered-by');
        app.use(express.json({ limit: '32kb' }));
        app.use((req, res, next) => {
            const origin = req.get('origin');
            if (origin && ALLOWED_ORIGINS.has(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Vary', 'Origin');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('Referrer-Policy', 'no-referrer');
            if (req.method === 'OPTIONS') {
                res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-API-Key');
                res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
                return res.sendStatus(204);
            }
            return next();
        });

        app.get('/healthz', (req, res) => res.json({ ok: true }));

        app.post('/api/register-token', requireFirebaseUser, async (req, res, next) => {
            if (!rateLimit(`token:${req.ip}:${req.user.uid}`, 10, 60 * 60 * 1000)) return res.status(429).json({ error: 'rate limit exceeded' });
            const { token, label, platform } = req.body || {};
            if (typeof token !== 'string' || token.length < 20 || token.length > 4096) return res.status(400).json({ error: 'invalid token' });
            if (label != null && (typeof label !== 'string' || label.length > 80)) return res.status(400).json({ error: 'invalid label' });
            if (platform != null && (typeof platform !== 'string' || platform.length > 40)) return res.status(400).json({ error: 'invalid platform' });
            try {
                const meta = { label: label || null, platform: platform || null, uid: req.user.uid };
                const data = await registerToken(token, meta);
                return res.json({ ok: true, data });
            } catch (e) {
                return next(e);
            }
        });

        app.post('/api/send-notification', requireAdminKey, async (req, res, next) => {
            if (!rateLimit(`notify:${req.ip}`, 5, 60 * 60 * 1000)) return res.status(429).json({ error: 'rate limit exceeded' });
            const { title, body, tokens } = req.body || {};
            if (typeof title !== 'string' || title.length > 120 || typeof body !== 'string' || body.length > 1000) return res.status(400).json({ error: 'invalid notification' });
            if (tokens !== undefined && (!Array.isArray(tokens) || tokens.length > 5000 || tokens.some(token => typeof token !== 'string' || token.length < 20 || token.length > 4096))) return res.status(400).json({ error: 'invalid tokens' });
            try {
                let targetTokens = tokens;
                if (!Array.isArray(targetTokens) || targetTokens.length === 0) {
                    targetTokens = await getAllTokens();
                }
                const result = await sendNotificationToTokens(targetTokens, { title, body, data: {} });
                return res.json({ ok: true, result });
            } catch (e) {
                return next(e);
            }
        });

        app.use((error, req, res, next) => {
            console.error('HTTP request failed', error.message);
            return res.status(500).json({ error: 'internal server error' });
        });

        app.listen(HTTP_PORT, () => console.log('HTTP API listening on', HTTP_PORT));

    } catch (err) {
        console.error('Bootstrap falhou:', err.message);
        process.exit(1);
    }
})();
