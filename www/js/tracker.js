/* TRACKER.JS - Gerencia dados do rastreador externo via Firebase Realtime Database
 * - Atualiza status do rastreador
 * - Notifica app sobre posições do tracker
 * - Mantém dados de bateria e último timestamp
 */

const trackerManager = (function(){
    const subscribers = [];
    const state = {
        deviceId: null,
        status: 'offline',
        lastUpdate: null,
        battery: null,
        position: null,
        lastFirebasePayload: null
    };

    function subscribe(cb){
        if (typeof cb === 'function') {
            subscribers.push(cb);
            try { cb(getState()); } catch(e) { console.error('trackerManager subscriber failed', e); }
        }
    }

    function unsubscribe(cb){
        const idx = subscribers.indexOf(cb);
        if (idx !== -1) subscribers.splice(idx, 1);
    }

    function notify(){
        subscribers.forEach(cb => {
            try { cb(getState()); } catch(e) { console.error('trackerManager subscriber failed', e); }
        });
    }

    function updateState(partial){
        Object.assign(state, partial);
        notify();
    }

    function getState(){
        return {
            deviceId: state.deviceId,
            status: state.status,
            lastUpdate: state.lastUpdate,
            battery: state.battery,
            position: state.position,
            lastFirebasePayload: state.lastFirebasePayload
        };
    }

    function getStatusValue(payload){
        if (!payload || typeof payload !== 'object') return 'offline';
        if (typeof payload.status === 'string' && payload.status.trim().length > 0) return payload.status.trim();
        if (payload.connection === false || payload.online === false) return 'offline';
        if (payload.connection === true || payload.online === true) return 'online';
        return 'offline';
    }

    function parseTrackerPayload(payload){
        if (!payload || typeof payload !== 'object') return null;

        const result = {
            deviceId: payload.deviceId || payload.id || payload.device || null,
            lat: parseFloat(payload.lat || payload.latitude || payload.coords?.lat || payload.coords?.latitude),
            lng: parseFloat(payload.lng || payload.longitude || payload.coords?.lng || payload.coords?.longitude),
            accuracy: typeof payload.accuracy === 'number' ? payload.accuracy : parseFloat(payload.accuracy || payload.accuracyMeter || payload.hdop) || 0,
            timestamp: payload.timestamp || payload.time || payload.updatedAt || payload.lastSeen || Date.now(),
            battery: payload.battery || payload.charge || payload.batteryLevel || payload.battery_pct || null,
            status: getStatusValue(payload)
        };

        if (Number.isNaN(result.lat) || Number.isNaN(result.lng)) return null;
        return result;
    }

    function handlePayload(payload){
        const info = parseTrackerPayload(payload);
        if (!info) {
            console.warn('trackerManager: payload de rastreador inválido', payload);
            return;
        }

        const deviceIdChanged = info.deviceId && info.deviceId !== state.deviceId;
        if (deviceIdChanged) {
            state.positions = [];
        }

        state.deviceId = info.deviceId || state.deviceId || 'Tracker-1';
        const trackerPosition = { lat: info.lat, lng: info.lng, accuracy: info.accuracy, timestamp: info.timestamp };
        state.position = trackerPosition;
        state.lastUpdate = info.timestamp;
        state.battery = info.battery || state.battery;
        state.status = info.status || 'offline';
        state.lastFirebasePayload = payload;

        if (trackerPosition && trackerPosition.lat != null && trackerPosition.lng != null) {
            state.positions.push(trackerPosition);
            if (state.positions.length > 200) {
                state.positions = state.positions.slice(-200);
            }
        }

        notify();
    }

    function init(){
        if (window.firebaseManager && typeof window.firebaseManager.onAppDataUpdate === 'function') {
            window.firebaseManager.onAppDataUpdate((appData) => {
                if (appData && appData.tracker) {
                    handlePayload(appData.tracker);
                }
            });
        }
    }

    return {
        init,
        subscribe,
        unsubscribe,
        getState,
        handlePayload
    };
})();

try { window.trackerManager = trackerManager; } catch(e) {}
