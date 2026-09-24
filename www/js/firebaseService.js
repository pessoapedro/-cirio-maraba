/**
 * firebaseService.js
 * - Escuta /berlinda/localizacao no Realtime Database e repassa para trackingService
 * - Tenta usar SDK quando disponível, faz retry caso necessário
 */
(function(){
    const PATH = '/berlinda/localizacao';
    let inited = false;

    function safeHandle(payload){
        // repassa para trackingService ou trackerManager existente
        try {
            if (window.trackingService && typeof window.trackingService.handlePayload === 'function') {
                window.trackingService.handlePayload(payload);
                return;
            }
            if (window.trackerManager && typeof window.trackerManager.handlePayload === 'function') {
                window.trackerManager.handlePayload(payload);
                return;
            }
            console.warn('firebaseService: nenhum handler de tracker disponível');
        } catch(e){ console.error('firebaseService: falha ao encaminhar payload', e); }
    }

    function attachDb(){
        if (!window.firebase || !firebase.database) return false;
        try {
            const db = firebase.database();
            const ref = db.ref(PATH);
            ref.on('value', snap => {
                const payload = snap.val();
                if (payload) {
                    safeHandle(payload);
                }
            });
            console.info('firebaseService: ligado em', PATH);
            return true;
        } catch(e){
            console.error('firebaseService: attachDb error', e);
            return false;
        }
    }

    function init(){
        if (inited) return;
        inited = true;
        // se SDK já disponível, anexar imediatamente
        if (attachDb()) return;

        // caso contrário, aguardar SDK carregado (retry por some segundos)
        let attempts = 0;
        const id = setInterval(() => {
            attempts++;
            if (attachDb()) {
                clearInterval(id);
                return;
            }
            if (attempts > 30) {
                clearInterval(id);
                console.warn('firebaseService: não conseguiu conectar ao SDK do Firebase');
            }
        }, 500);
    }

    // expor API mínima
    try { window.firebaseService = { init, path: PATH }; } catch(e) {}
})();
