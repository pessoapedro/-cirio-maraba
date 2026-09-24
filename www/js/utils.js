/**
 * utils.js - utilitários comuns (distância, formatação, cálculo de ETA)
 */
const utils = (function(){
    // Haversine em metros
    function haversine(lat1, lon1, lat2, lon2){
        const R = 6371000; // metros
        const toRad = (d) => d * Math.PI / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    function metersToKm(m){ return m/1000; }

    function formatMeters(m){
        if (m >= 1000) return (m/1000).toFixed(2) + ' km';
        return Math.round(m) + ' m';
    }

    function formatTimeAgo(ts){
        if (!ts) return '--';
        const d = Date.now() - ts;
        if (d < 60000) return 'agora';
        if (d < 3600000) return Math.floor(d/60000) + ' min atrás';
        if (d < 86400000) return Math.floor(d/3600000) + ' h atrás';
        const date = new Date(ts);
        return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
    }

    function estimateETA(distanceMeters, speedMps){
        if (!speedMps || speedMps <= 0) return '--';
        const seconds = distanceMeters / speedMps;
        const eta = new Date(Date.now() + Math.round(seconds*1000));
        return eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return { haversine, metersToKm, formatMeters, formatTimeAgo, estimateETA };
})();

try { window.utils = utils; } catch(e) {}
