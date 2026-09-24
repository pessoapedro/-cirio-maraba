(async function(){
    if (!window.FIREBASE_CONFIG) return;
    const VERS = '9.22.2';
    function load(src){
        return new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = () => res();
            s.onerror = (e) => rej(e);
            document.head.appendChild(s);
        });
    }

    try {
        if (!window.firebase || !firebase.initializeApp) {
            await load(`https://www.gstatic.com/firebasejs/${VERS}/firebase-app-compat.js`);
        }
        if (!firebase.apps || firebase.apps.length === 0) {
            firebase.initializeApp(window.FIREBASE_CONFIG);
        }
        await load(`https://www.gstatic.com/firebasejs/${VERS}/firebase-messaging-compat.js`);
        if (!window.firebase || !firebase.messaging) return;
        const messaging = firebase.messaging();
        const serviceWorkerRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

        if (Notification && Notification.permission === 'default') {
            try { await Notification.requestPermission(); } catch(e){}
        }

        const vapidKey = window.FIREBASE_VAPID_KEY || '';
        let token = null;
        try {
            token = await messaging.getToken({
                vapidKey: vapidKey || undefined,
                serviceWorkerRegistration
            });
        } catch (e) {
            console.warn('FCM: getToken failed', e);
        }

        if (token) {
            const configuredBackend = (window.BACKEND_URL || '').replace(/\/$/, '');
            const backend = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? 'http://localhost:3000'
                : configuredBackend;
            try {
                await fetch(backend + '/api/register-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, label: window.location.hostname, platform: 'web' })
                });
                console.info('FCM token registrado no backend');
            } catch (e) {
                console.warn('FCM: falha ao registrar token no backend', e);
            }
        }

        // escuta mensagens em foreground (quando site aberto)
        try{
            messaging.onMessage((payload) => {
                console.info('FCM foreground message', payload);
                if (window.firebaseManager && typeof window.firebaseManager.receberNotificacao === 'function') {
                    try { window.firebaseManager.receberNotificacao(payload); } catch(e){}
                } else if (Notification && Notification.permission === 'granted') {
                    const title = payload.notification && payload.notification.title ? payload.notification.title : 'Notificação';
                    const body = payload.notification && payload.notification.body ? payload.notification.body : '';
                    new Notification(title, { body });
                }
            });
        } catch(e){/* ignore */}
    } catch (e) {
        console.warn('FCM register script failed', e);
    }
})();
