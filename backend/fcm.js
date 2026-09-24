const { initFirebase } = require('./firebase');
const admin = require('firebase-admin');
const crypto = require('crypto');

function ensure() {
    initFirebase();
}

async function registerToken(token, meta = {}){
    if (!token) throw new Error('token required');
    ensure();
    const db = admin.database();
    const key = crypto.createHash('sha256').update(token).digest('hex');
    const ref = db.ref(`fcmTokens/${key}`);
    const data = Object.assign({ token, createdAt: Date.now() }, meta);
    await ref.set(data);
    return data;
}

async function getAllTokens(){
    ensure();
    const db = admin.database();
    const snap = await db.ref('fcmTokens').once('value');
    const val = snap.val() || {};
    return Object.values(val).map(x => x.token).filter(Boolean);
}

async function sendNotificationToTokens(tokens, payload){
    ensure();
    if (!Array.isArray(tokens) || tokens.length === 0) return { success: 0, failure: 0 };
    // chunk tokens to 500 per sendMulticast limitation
    const chunks = [];
    for (let i=0;i<tokens.length;i+=500) chunks.push(tokens.slice(i,i+500));
    const results = { success: 0, failure: 0 };
    for (const chunk of chunks) {
        try {
            const res = await admin.messaging().sendMulticast({
                tokens: chunk,
                notification: {
                    title: payload.title || 'Notificação',
                    body: payload.body || ''
                },
                data: payload.data || {}
            });
            results.success += res.successCount || 0;
            results.failure += res.failureCount || 0;
        } catch (e) {
            console.error('Erro enviando multicast', e);
        }
    }
    return results;
}

module.exports = { registerToken, getAllTokens, sendNotificationToTokens };
