importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

if (typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp({
            apiKey: 'AIzaSyDPgg4wSLqYcxTQLv_x29sxpTaAVcqp-7k',
            authDomain: 'cirio-app-01.firebaseapp.com',
            databaseURL: 'https://cirio-app-01-default-rtdb.firebaseio.com',
            projectId: 'cirio-app-01',
            storageBucket: 'cirio-app-01.firebasestorage.app',
            messagingSenderId: '476488114532',
            appId: '1:476488114532:web:196f85d00cb0a8f0c99a71'
        });
        const messaging = firebase.messaging();
        messaging.onBackgroundMessage(function(payload) {
            const notificationTitle = (payload.notification && payload.notification.title) || 'Notificação';
            const notificationOptions = {
                body: (payload.notification && payload.notification.body) || '',
                data: payload.data || {}
            };
            self.registration.showNotification(notificationTitle, notificationOptions);
        });
    } catch (e) {
        // ignore
    }
}
