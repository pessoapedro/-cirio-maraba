/**
 * trackingService.js
 * - Serviço de alto nível para gerenciar posições do rastreador externo
 * - Mantém buffer de posições (últimos 200 pontos)
 * - Detecta offline quando sem atualização por 30s
 */
(function(){
    const MAX_POINTS = 200;
    const OFFLINE_TIMEOUT = 30000; // ms

    const subscribers = [];
    const state = {
        deviceId: null,
        status: 'offline',
        lastUpdate: null,
        battery: null,
        signal: null,
        position: null,
        positions: []
    };

    let offlineTimer = null;

    function notify(){
        subscribers.forEach(cb => {
            try { cb(getState()); } catch(e){ console.error(e); }
        });
    }

    function getState(){
        return Object.assign({}, state, { positions: state.positions.slice() });
    }

    function subscribe(cb){
        if (typeof cb === 'function') {
            subscribers.push(cb);
            try { cb(getState()); } catch(e) {}
        }
    }

    function resetOfflineTimer(){
        if (offlineTimer) clearTimeout(offlineTimer);
        offlineTimer = setTimeout(() => {
            state.status = 'offline';
            notify();
            console.warn('trackingService: sem atualizações por 30s — marca como offline');
        }, OFFLINE_TIMEOUT);
    }

    function handlePayload(payload){
        if (!payload || typeof payload !== 'object') return;
        // tentar normalizar campos conforme especificado
        const lat = parseFloat(payload.latitude ?? payload.lat ?? payload.latitud ?? payload.coords?.lat);
        const lng = parseFloat(payload.longitude ?? payload.lng ?? payload.long ?? payload.coords?.lng);
        const battery = payload.bateria ?? payload.battery ?? payload.charge ?? payload.batteryLevel ?? null;
        const signal = payload.sinal ?? payload.signal ?? payload.rssi ?? null;
        const status = (payload.status || payload.connection || payload.online) ?? 'online';
        const speed = payload.velocidade ?? payload.speed ?? null;
        const direction = payload.direcao ?? payload.direction ?? null;
        const ts = payload.ultimaAtualizacao ?? payload.timestamp ?? payload.time ?? payload.updatedAt ?? Date.now();

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            console.warn('trackingService: payload sem lat/lng válido', payload);
            return;
        }

        const pos = { lat: Number(lat), lng: Number(lng), timestamp: Number(ts), speed: speed, direction: direction };

        state.deviceId = payload.deviceId || payload.id || state.deviceId || 'berlinda';
        state.position = pos;
        state.lastUpdate = pos.timestamp;
        state.battery = battery;
        state.signal = signal;
        state.status = (String(status).toLowerCase().indexOf('off') === 0 || status === false) ? 'offline' : 'online';

        state.positions.push(pos);
        if (state.positions.length > MAX_POINTS) state.positions = state.positions.slice(-MAX_POINTS);

        // repassa para qualquer trackerManager já presente (compat)
        if (window.trackerManager && typeof window.trackerManager.handlePayload === 'function') {
            try { window.trackerManager.handlePayload(payload); } catch(e) { /* ignore */ }
        }

        resetOfflineTimer();
        state.status = 'online';
        notify();
    }

    function init(){
        // nada por agora — firebaseService chamará handlePayload diretamente
        // mas expor interface para que outros módulos possam inicializar
        if (window.firebaseService && typeof window.firebaseService.init === 'function') {
            // firebaseService será inicializado pela app
        }
    }

    try { window.trackingService = { init, subscribe, handlePayload, getState: () => getState() }; } catch(e) {}
})();
