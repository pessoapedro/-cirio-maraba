/**
 * UI.JS - Atualiza os cards de informação e controla interação visual
 */
const ui = (function(){
    function setCurrentAddress(text){
        const el = document.getElementById('currentAddress');
        if (el) el.textContent = text;
    }

    function setFirebaseRole(text){
        const el = document.getElementById('firebaseRoleText');
        if (el) el.textContent = text ? `Role: ${text}` : 'Role: --';
    }

    function setFirebaseShareState(text){
        const el = document.getElementById('firebaseShareStateText');
        if (el) el.textContent = text || '--';
    }

    function setFirebaseDeviceId(text){
        const el = document.getElementById('firebaseDeviceIdText');
        if (el) el.textContent = text || '--';
    }

    function setTotalDistance(meters){
        const formatted = formatMetersLabel(meters);
        const el = document.getElementById('totalDistanceValue');
        if (el) el.textContent = formatted;
        const legacy = document.getElementById('totalDistance');
        if (legacy) legacy.textContent = formatMeters(meters);
    }

    function setCoveredDistance(meters){
        const formatted = formatMetersLabel(meters);
        const el = document.getElementById('coveredDistanceValue');
        if (el) el.textContent = formatted;
        const legacy = document.getElementById('coveredDistance');
        if (legacy) legacy.textContent = formatMeters(meters);
    }

    function setRemainingDistance(meters){
        const formatted = formatMetersLabel(meters);
        const el = document.getElementById('remainingDistanceValue');
        if (el) el.textContent = formatted;
        const legacy = document.getElementById('remainingDistance');
        if (legacy) legacy.textContent = formatMeters(meters);
    }

    function setProgress(percent){
        const pct = Math.max(0, Math.min(100, Math.round(percent)));
        const bar = document.getElementById('progressBar');
        if (bar) {
            bar.style.setProperty('--progress', pct + '%');
            const marker = document.getElementById('progressVehicleMarker');
            if (marker) {
                marker.style.left = `calc(${pct}% - 3px)`;
            }
            const fill = bar;
            fill.style.background = `linear-gradient(90deg, #2563eb 0%, #2563eb ${pct}%, #ef4444 ${pct}%, #ef4444 100%)`;
        }
        const p = document.getElementById('progressPercent');
        if (p) p.textContent = pct + '%';
    }

    function setElapsedTime(s){
        const formatted = formatDurationLabel(s);
        const el = document.getElementById('procissaoTime');
        if (el) el.textContent = formatted;
        const legacy = document.getElementById('elapsedTime');
        if (legacy) legacy.textContent = formatTime(s);
    }

    function setAvgSpeed(mps){
        const kmh = (mps * 3.6);
        const value = `${kmh.toFixed(1)} km/h`;
        const el = document.getElementById('avgSpeedValue');
        if (el) el.textContent = value;
        const legacy = document.getElementById('avgSpeed');
        if (legacy) legacy.textContent = `${(mps).toFixed(2)} m/s`;
    }

    function setETA(text){
        const el = document.getElementById('etaValue');
        if (el) el.textContent = text;
        const legacy = document.getElementById('eta');
        if (legacy) legacy.textContent = text;
    }

    function setExternalTrackerStatus(text){
        const el = document.getElementById('externalTrackerStatusValue');
        if (el) el.textContent = text;
    }

    function setExternalTrackerLastUpdate(timestamp){
        const el = document.getElementById('externalTrackerLastUpdateValue');
        if (!el) return;
        if (!timestamp) {
            el.textContent = '--';
            return;
        }
        el.textContent = formatTimeAgo(timestamp);
    }

    function setExternalTrackerBattery(text){
        const el = document.getElementById('externalTrackerBatteryValue');
        if (el) el.textContent = text;
    }

    function setExternalTrackerDevice(text){
        const el = document.getElementById('externalTrackerDeviceValue');
        if (el) el.textContent = text;
    }

    function formatMeters(m){
        if (m >= 1000) return `${(m/1000).toFixed(2)} km`;
        return `${Math.round(m)} m`;
    }

    function formatTimeAgo(timestamp){
        if (!timestamp) return '--';
        const diff = Date.now() - timestamp;
        if (diff < 60000) return 'agora';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} min atrás`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} h atrás`;
        const date = new Date(timestamp);
        return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
    }

    function formatMetersLabel(m){
        const rounded = Math.round(m);
        return `${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')} m`;
    }

    function formatDurationLabel(seconds){
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${String(hours).padStart(2,'0')}h ${String(minutes).padStart(2,'0')}min`;
    }

    function formatTime(seconds){
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    }

    return {
        setCurrentAddress,
        setFirebaseRole,
        setFirebaseShareState,
        setFirebaseDeviceId,
        setTotalDistance,
        setCoveredDistance,
        setRemainingDistance,
        setProgress,
        setElapsedTime,
        setAvgSpeed,
        setETA,
        setExternalTrackerStatus,
        setExternalTrackerLastUpdate,
        setExternalTrackerBattery,
        setExternalTrackerDevice
    };
})();

try { window.ui = ui; } catch(e) {}
