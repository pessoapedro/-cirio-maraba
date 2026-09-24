/**
 * FIREBASE.JS - Integração mínima com Firebase Realtime Database
 * - Carrega SDK dinamicamente (compat build)
 * - Inicializa com window.FIREBASE_CONFIG
 * - Escuta atualizações na path configurada e chama gps.pushPosition
 *
 * USO:
 * Defina `window.FIREBASE_CONFIG = { apiKey: '...', authDomain: '...', databaseURL: '...', projectId: '...' }` antes de carregar este script
 * Opcional: defina `window.FIREBASE_LOCATIONS_PATH = 'locations/current'`
 */

(function(){
    const SDK_VERSION = '9.22.2';
    const compatUrls = [
        `https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-app-compat.js`,
        `https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-database-compat.js`,
        `https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-auth-compat.js`
    ];

    const appDataCallbacks = [];
    let appDataCache = {};
    let firebaseDb = null;

    function notifyAppData(data){
        if (!data || typeof data !== 'object') return;
        appDataCache = Object.assign({}, appDataCache, data);
        if (window.app && typeof window.app.applyFirebaseAppData === 'function') {
            try { window.app.applyFirebaseAppData(appDataCache); } catch (e) { console.warn('Firebase: apply app data failed', e); }
        }
        appDataCallbacks.forEach(cb => {
            try { cb(appDataCache); } catch (e) { console.warn('Firebase: app data callback failed', e); }
        });
    }

    function loadScript(url){
        return new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = url;
            s.onload = () => res();
            s.onerror = (e) => rej(e);
            document.head.appendChild(s);
        });
    }

    async function init(){
        if (!window.FIREBASE_CONFIG) {
            console.info('Firebase: nenhuma configuração detectada em window.FIREBASE_CONFIG. Inicialização adiada.');
            return;
        }

        try {
            // carregar SDKs compat
            for (const url of compatUrls) await loadScript(url);
            if (!window.firebase || !window.firebase.initializeApp) {
                console.error('Firebase SDK não carregado corretamente');
                return;
            }

            // inicializar
            const config = window.FIREBASE_CONFIG;
            try { window._firebaseApp = firebase.initializeApp(config); } catch(e) { console.warn('Firebase já inicializado'); }

            if (!firebase.auth) throw new Error('Firebase Auth não carregado');
            if (!firebase.auth().currentUser) await firebase.auth().signInAnonymously();

            firebaseDb = firebase.database();
            const path = window.FIREBASE_LOCATIONS_PATH || 'locations/current';
            const trackerPath = window.FIREBASE_TRACKER_PATH || 'tracker';

            console.info('Firebase: ouvindo', path);
            registerSharerDevice();

            // Suporta três formatos comuns:
            // 1) valor único com { lat, lng, accuracy, timestamp }
            // 2) um mapa com chaves e valores (por exemplo histórico) -> pega último child
            // 3) child_added em 'updates'

            const ref = firebaseDb.ref(path);
            const trackerRef = firebaseDb.ref(trackerPath);

            // value listener: sempre que path trocar (valor único)
            ref.on('value', snapshot => {
                const v = snapshot.val();
                handleIncoming(v);
            });

            const appDataRef = firebaseDb.ref('appData');
            appDataRef.on('value', snapshot => {
                const value = snapshot.val();
                if (value) {
                    console.info('Firebase: appData recebido', value);
                    notifyAppData(value);
                }
            });

            trackerRef.on('value', snapshot => {
                const payload = snapshot.val();
                if (payload) {
                    console.info('Firebase: tracker recebido', payload);
                    if (window.trackerManager && typeof window.trackerManager.handlePayload === 'function') {
                        try {
                            window.trackerManager.handlePayload(payload);
                        } catch (e) {
                            console.error('Firebase: trackerManager.handlePayload failed', e);
                            handleIncoming(payload);
                        }
                    } else {
                        handleIncoming(payload);
                    }
                }
            });

            // também escutar updates se houver sub-path 'updates'
            try {
                const updRef = firebaseDb.ref(path + '/updates');
                updRef.limitToLast(1).on('child_added', snap => {
                    handleIncoming(snap.val());
                });
            } catch(e) { /* ignore */ }

        } catch (e) {
            console.error('Erro inicializando Firebase:', e);
        }
    }

    function handleIncoming(v){
        if (!v) return;
        // se for array, pegar último
        if (Array.isArray(v)) v = v[v.length-1];

        // se for objeto com lat/lng
        if (v && typeof v.lat === 'number' && typeof v.lng === 'number'){
            const accuracy = typeof v.accuracy === 'number' ? v.accuracy : 0;
            const ts = v.timestamp || Date.now();
            try { gps.pushPosition(v.lat, v.lng, accuracy, ts); } catch(e){ console.error(e); }
            return;
        }

        // se for objeto com coordinates [lat, lng]
        if (v && Array.isArray(v.coordinates) && v.coordinates.length>=2){
            const lat = parseFloat(v.coordinates[0]);
            const lng = parseFloat(v.coordinates[1]);
            if (!isNaN(lat) && !isNaN(lng)){
                const accuracy = v.accuracy || 0;
                const ts = v.timestamp || Date.now();
                try { gps.pushPosition(lat, lng, accuracy, ts); } catch(e){ console.error(e); }
                return;
            }
        }

        // se for mapa (historico), pegar o último child se contiver lat/lng
        if (v && typeof v === 'object'){
            const keys = Object.keys(v).sort();
            for (let i = keys.length - 1; i >= 0; i--) {
                const val = v[keys[i]];
                if (val && typeof val.lat === 'number' && typeof val.lng === 'number'){
                    try { gps.pushPosition(val.lat, val.lng, val.accuracy || 0, val.timestamp || Date.now()); } catch(e){ console.error(e); }
                    return;
                }
            }
        }

        console.warn('Firebase: formato de posição não reconhecido', v);
    }

    function handleAppData(data){
        if (!data || typeof data !== 'object') return;
        notifyAppData(data);
    }

    function getSharePath(deviceId){
        const rawPath = window.FIREBASE_SHARE_PATH || 'locations/current';
        if (typeof rawPath !== 'string' || rawPath.trim().length === 0) return null;
        const path = rawPath.replace(/\{deviceId\}/g, deviceId || 'device');
        return path;
    }

    function getDeviceUuid(){
        return (window.device && typeof window.device.uuid === 'string' && window.device.uuid.length > 0)
            ? window.device.uuid
            : null;
    }

    function getShareDeviceId(){
        return window.FIREBASE_SHARE_DEVICE_ID || getDeviceUuid() || 'device-1';
    }

    function getEffectiveDeviceRole(){
        const rawRole = String(window.FIREBASE_DEVICE_ROLE || 'viewer').toLowerCase();
        if (rawRole === 'auto') {
            return getDeviceUuid() ? 'sharer' : 'viewer';
        }
        return rawRole === 'sharer' ? 'sharer' : 'viewer';
    }

    function getSharersPath(){
        return window.FIREBASE_SHARERS_PATH || 'sharers';
    }

    function getDeviceLabel(){
        if (window.FIREBASE_SHARE_DEVICE_LABEL && window.FIREBASE_SHARE_DEVICE_LABEL.trim()) {
            return window.FIREBASE_SHARE_DEVICE_LABEL.trim();
        }
        if (window.device && typeof window.device.model === 'string' && window.device.model.trim()) {
            return window.device.model.trim();
        }
        return navigator.userAgent || 'dispositivo';
    }

    function getSharerRecord(){
        return {
            deviceId: getShareDeviceId(),
            role: getEffectiveDeviceRole(),
            label: getDeviceLabel(),
            platform: (window.device && window.device.platform) || 'web',
            timestamp: Date.now()
        };
    }

    function getAllowedSharerIds(){
        const allowed = window.FIREBASE_ALLOWED_SHARER_IDS;
        if (!Array.isArray(allowed)) return [];
        return allowed
            .map(id => typeof id === 'string' ? id.trim() : '')
            .filter(id => id.length > 0);
    }

    function isAllowedSharer(){
        if (getEffectiveDeviceRole() !== 'sharer') return false;
        const allowedIds = getAllowedSharerIds();
        return allowedIds.includes(getShareDeviceId());
    }

    async function registerSharerDevice(){
        if (!firebaseDb) return;
        if (window.FIREBASE_REGISTER_SHARER !== true && window.FIREBASE_REGISTER_SHARER !== 'true') return;
        if (getEffectiveDeviceRole() !== 'sharer') return;

        const path = `${getSharersPath()}/${getShareDeviceId()}`;
        const data = getSharerRecord();
        try {
            await firebaseDb.ref(path).set(data);
            console.info('Firebase: aparelho sharer registrado em', path, data);
        } catch (e) {
            console.warn('Firebase: falha ao registrar aparelho sharer', e);
        }
    }

    function createSharePayload(position){
        if (!position || typeof position !== 'object') return null;
        const payload = {
            lat: Number(position.lat || position.latitude || position.coords?.latitude),
            lng: Number(position.lng || position.longitude || position.coords?.longitude),
            accuracy: Number(position.accuracy || position.coords?.accuracy || 0),
            timestamp: position.timestamp || Date.now(),
            source: position.source || 'gps'
        };
        payload.deviceId = position.deviceId || getShareDeviceId();
        return payload;
    }

    async function sharePosition(position){
        if (!isAllowedSharer()) {
            const deviceId = getShareDeviceId();
            console.warn('Firebase: este dispositivo não está autorizado a compartilhar', deviceId);
            return;
        }
        if (!firebaseDb) {
            console.warn('Firebase: banco de dados não inicializado, não é possível compartilhar posição');
            return;
        }

        const payload = createSharePayload(position);
        if (!payload || Number.isNaN(payload.lat) || Number.isNaN(payload.lng)) {
            console.warn('Firebase: posição inválida para compartilhamento', position);
            return;
        }

        const sharePath = getSharePath(getShareDeviceId());
        if (!sharePath) return;

        try {
            const ref = firebaseDb.ref(sharePath);
            const usePush = window.FIREBASE_SHARE_USE_PUSH === true || window.FIREBASE_SHARE_USE_PUSH === 'true';
            if (usePush) {
                await ref.push(payload);
            } else {
                await ref.set(payload);
            }
            console.info('Firebase: posição compartilhada em', sharePath, payload);
        } catch (e) {
            console.error('Firebase: falha ao compartilhar posição', e);
        }
    }

    // Tenta carregar um arquivo local `js/firebase-config.js` com as credenciais
    function loadLocalConfig(){
        return new Promise((res) => {
            if (window.FIREBASE_CONFIG) return res(true);
            const script = document.createElement('script');
            script.src = 'js/firebase-config.js';
            script.onload = () => res(true);
            script.onerror = () => res(false);
            document.head.appendChild(script);
            // se o arquivo não existir, onerror será chamado
        });
    }

    // expor manager
    try {
        window.firebaseManager = {
            init,
            getAppData: () => appDataCache,
            onAppDataUpdate: (cb) => {
                if (typeof cb !== 'function') return;
                appDataCallbacks.push(cb);
                if (Object.keys(appDataCache).length) {
                    try { cb(appDataCache); } catch (e) { console.warn('Firebase: appData callback failed', e); }
                }
            },
            applyAppDataToApp: () => {
                if (window.app && typeof window.app.applyFirebaseAppData === 'function') {
                    try { window.app.applyFirebaseAppData(appDataCache); } catch (e) { console.warn('Firebase: apply app data failed', e); }
                }
            },
            sharePosition,
            canSharePosition: isAllowedSharer,
            getShareDeviceId,
            getEffectiveDeviceRole,
            getIdToken: async () => {
                const user = firebase.auth && firebase.auth().currentUser;
                return user ? user.getIdToken() : null;
            },
            registerSharerDevice
        };
    } catch(e){}

    // tentativa automática após tentar carregar config local
    (async function auto(){
        await loadLocalConfig();
        setTimeout(() => init(), 150);
    })();

})();
