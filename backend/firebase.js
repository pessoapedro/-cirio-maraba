/**
 * firebase.js
 * - Inicializa Firebase Admin SDK e expõe função para atualizar Realtime Database.
 */

const admin = require('firebase-admin');
const path = require('path');

let initialized = false;

function initFirebase(){
    if (initialized) return;
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT;
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountPath && !serviceAccountJson) throw new Error('Configure FIREBASE_SERVICE_ACCOUNT_JSON ou FIREBASE_SERVICE_ACCOUNT');
    const serviceAccount = serviceAccountJson ? JSON.parse(serviceAccountJson) : require(path.resolve(serviceAccountPath));
    const credential = admin.credential ? admin.credential.cert(serviceAccount) : admin.cert(serviceAccount);
    admin.initializeApp({
        credential,
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    initialized = true;
}

function getDatabase(){
    if (!initialized) initFirebase();
    return admin.database();
}

function getGpsRoot(){
    return process.env.FIREBASE_GPS_ROOT ? process.env.FIREBASE_GPS_ROOT.replace(/^\/+|\/+$/g, '') : 'gps';
}

async function saveGpsData(deviceId, payload){
    if (!deviceId) throw new Error('deviceId obrigatório para salvar GPS');
    if (!/^(?:\d{6,20}|device\d{1,20})$/.test(String(deviceId))) throw new Error('deviceId inválido');
    if (!Number.isFinite(payload.latitude) || payload.latitude < -90 || payload.latitude > 90) throw new Error('latitude inválida');
    if (!Number.isFinite(payload.longitude) || payload.longitude < -180 || payload.longitude > 180) throw new Error('longitude inválida');
    const db = getDatabase();
    const root = getGpsRoot();
    const ref = db.ref(`${root}/${deviceId}`);
    const data = {
        imei: payload.imei || deviceId,
        latitude: payload.latitude,
        longitude: payload.longitude,
        speed: payload.speed != null ? payload.speed : 0,
        course: payload.course != null ? payload.course : 0,
        online: payload.online === false ? false : true,
        timestamp: payload.timestamp || Date.now()
    };
    await ref.update(data);
    return data;
}

module.exports = { initFirebase, saveGpsData };
