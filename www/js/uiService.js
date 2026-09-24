/**
 * uiService.js - Atualiza painel de status e métricas com base no estado do rastreador
 */
(function(){
    function updateTrackerPanel(state, userPos){
        if (!state) return;
        const online = state.status === 'online';
        ui.setExternalTrackerStatus(online ? 'Online' : 'Offline');
        ui.setExternalTrackerDevice(state.deviceId || 'N/A');
        ui.setExternalTrackerBattery(state.battery != null ? (state.battery + '%') : '--');
        ui.setExternalTrackerLastUpdate(state.lastUpdate || state.position?.timestamp || null);

        // distância até o usuário
        if (userPos && state.position) {
            const d = utils.haversine(userPos.lat, userPos.lng, state.position.lat, state.position.lng);
            ui.setRemainingDistance(d);
            ui.setCoveredDistance(state.positions ? state.positions.length : 0);
            const eta = utils.estimateETA(d, (state.position.speed || 0));
            ui.setETA(eta);
        }
    }

    try { window.uiService = { updateTrackerPanel }; } catch(e) {}
})();
