/**
 * GPS.JS - Gerenciamento de atualizações de posição
 * Exporta funções para iniciar/parar watch e assinar callbacks
 */
const gps = (function(){
    const subscribers = [];
    let watchId = null;

    function subscribe(cb){
        if (typeof cb === 'function') subscribers.push(cb);
    }

    function unsubscribe(cb){
        const idx = subscribers.indexOf(cb);
        if (idx !== -1) subscribers.splice(idx,1);
    }

    function notify(position){
        subscribers.forEach(cb => {
            try { cb(position); } catch(e) { console.error(e); }
        });
    }

    function startWatch(options = { enableHighAccuracy: false, timeout: 15000, maximumAge: 5000 }){
        if (!navigator.geolocation) {
            console.warn('Geolocation não disponível');
            return null;
        }

        if (watchId !== null) return watchId;

        watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const p = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                    timestamp: pos.timestamp || Date.now()
                };
                notify(p);
            },
            (err) => {
                console.error('gps.watchPosition error', err);
            },
            options
        );

        return watchId;
    }

    function stopWatch(){
        if (watchId !== null && navigator.geolocation) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }
    }

    // Permite enviar atualizações manuais (ex: integração com Firebase)
    function pushPosition(lat,lng,accuracy=0,timestamp=Date.now(), source='gps'){
        let p;
        if (typeof lat === 'object' && lat !== null) {
            const data = lat;
            p = {
                lat: parseFloat(data.lat),
                lng: parseFloat(data.lng),
                accuracy: typeof data.accuracy === 'number' ? data.accuracy : parseFloat(data.accuracy || data.accuracyMeter || data.hdop) || 0,
                timestamp: data.timestamp || data.time || Date.now(),
                source: data.source || 'gps'
            };
        } else {
            p = { lat, lng, accuracy, timestamp, source };
        }
        notify(p);
    }

    return {
        subscribe,
        unsubscribe,
        startWatch,
        stopWatch,
        pushPosition
    };
})();

// Expor globalmente para integração simples
try { window.gps = gps; } catch(e) {}
