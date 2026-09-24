/**
 * gpsService.js - abstrai o GPS do celular para uso pela UI (não para compartilhar posição da berlinda)
 */
(function(){
    function subscribe(cb){
        if (window.gps && typeof window.gps.subscribe === 'function') {
            window.gps.subscribe(cb);
        }
    }

    function start(){
        if (window.gps && typeof window.gps.startWatch === 'function') window.gps.startWatch();
    }

    function stop(){
        if (window.gps && typeof window.gps.stopWatch === 'function') window.gps.stopWatch();
    }

    try { window.gpsService = { subscribe, start, stop }; } catch(e) {}
})();
