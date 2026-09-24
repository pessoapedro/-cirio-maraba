/**
 * firebase-config.example.js
 * Copie este arquivo para `js/firebase-config.js` e preencha com suas credenciais reais.
 * Mantenha este arquivo fora do controle de versão (adicione em .gitignore se necessário).
 */

window.FIREBASE_CONFIG = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  databaseURL: "https://SEU_PROJETO.firebaseio.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Caminho no Realtime Database onde as posições serão publicadas (opcional)
window.FIREBASE_LOCATIONS_PATH = 'locations/current';
// Caminho para os dados do rastreador externo no Realtime Database (opcional)
window.FIREBASE_TRACKER_PATH = 'tracker';

// Defina quem tem permissão para enviar localização: 'sharer' ou 'viewer'.
// Apenas um dispositivo deve ser configurado como 'sharer'.
// Dispositivos 'viewer' não poderão gravar dados no Firebase.
window.FIREBASE_DEVICE_ROLE = 'viewer';
window.FIREBASE_AUTO_SHARE = false;
window.FIREBASE_SHARE_DEVICE_ID = ''; // Se vazio, o app usa device.uuid quando disponível
window.FIREBASE_ALLOWED_SHARER_IDS = []; // IDs autorizados, mantidos apenas como configuração de implantação
window.FIREBASE_SHARERS_PATH = 'sharers';
window.FIREBASE_SHARE_DEVICE_LABEL = ''; // nome opcional do aparelho
window.FIREBASE_REGISTER_SHARER = false;
window.FIREBASE_SHARE_PATH = 'locations/{deviceId}';
window.FIREBASE_SHARE_INTERVAL_MS = 5000;
window.FIREBASE_SHARE_USE_PUSH = false;
