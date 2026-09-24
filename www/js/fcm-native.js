/* Adaptador para registrar token FCM nativo em Cordova
   - Tenta detectar APIs comuns de plugins FCM para Cordova
   - Envia token ao backend em POST /api/register-token com { token, platform }
   - Registra handlers básicos para receber notificações em foreground
*/
(function(){
  'use strict';

  function backendUrl(){
    return (window.BACKEND_URL && window.BACKEND_URL.replace(/\/$/, '')) || 'http://localhost:3000';
  }

  async function postToken(token, platform){
    try{
      var idToken = null;
      for (var attempt = 0; attempt < 10 && !idToken; attempt++) {
        idToken = window.firebaseManager && window.firebaseManager.getIdToken
          ? await window.firebaseManager.getIdToken() : null;
        if (!idToken) await new Promise(function(resolve){ setTimeout(resolve, 500); });
      }
      if (!idToken) {
        console.warn('FCM: Firebase Auth ainda não está pronto para registrar o token');
        return;
      }
      var response = await fetch(backendUrl() + '/api/register-token', {
        method: 'POST',
        headers: {'Content-Type':'application/json', 'Authorization':'Bearer ' + idToken},
        body: JSON.stringify({ token: token, platform: platform || 'cordova' })
      });
      if (!response.ok) console.warn('FCM: backend rejeitou o token', response.status);
    }catch(e){console.warn('postToken error', e)}
  }

  function showLocalNotification(title, body){
    try{
      if(window.cordova && window.cordova.plugins && window.cordova.plugins.notification && window.cordova.plugins.notification.local && window.cordova.plugins.notification.local.schedule){
        window.cordova.plugins.notification.local.schedule({
          title: title || 'Notificação',
          text: body || '',
          foreground: true
        });
        return;
      }
      // fallback: alert
      if(navigator && navigator.notification && navigator.notification.alert){
        navigator.notification.alert(body || title || 'Notificação');
        return;
      }
      console.info('Notification:', title, body);
    }catch(e){console.warn('showLocalNotification', e)}
  }

  function handleMessage(payload){
    var title = (payload && payload.title) || (payload && payload.notification && payload.notification.title) || 'Notificação';
    var body = (payload && payload.body) || (payload && payload.notification && payload.notification.body) || JSON.stringify(payload || {});
    showLocalNotification(title, body);
  }

  function tryFirebasePlugin(){
    // cordova-plugin-firebase (older) / FirebasePlugin
    try{
      if(window.FirebasePlugin && typeof FirebasePlugin.getToken === 'function'){
        FirebasePlugin.getToken(function(token){
          postToken(token, 'FirebasePlugin');
        }, function(err){console.warn('FirebasePlugin.getToken', err)});

        if(typeof FirebasePlugin.onMessage === 'function'){
          FirebasePlugin.onMessage(function(payload){ handleMessage(payload); });
        }
        if(typeof FirebasePlugin.onTokenRefresh === 'function'){
          FirebasePlugin.onTokenRefresh(function(token){ postToken(token, 'FirebasePlugin'); });
        }
        return true;
      }
    }catch(e){/*ignore*/}
    return false;
  }

  function tryFCMPlugin(){
    // cordova-plugin-fcm-with-dependecies or cordova-plugin-fcm
    try{
      if(window.FCM && typeof window.FCM.getToken === 'function'){
        window.FCM.getToken(function(token){ postToken(token, 'FCM'); });
        if(typeof window.FCM.onNotification === 'function'){
          window.FCM.onNotification(function(data){ handleMessage(data); }, function(err){console.warn('FCM.onNotification err', err)});
        }
        return true;
      }
    }catch(e){/*ignore*/}
    return false;
  }

  function tryCordovaFirebaseMessaging(){
    // cordova-plugin-firebase-messaging (community)
    try{
      var mob = window.cordova && window.cordova.plugins && window.cordova.plugins.firebase && window.cordova.plugins.firebase.messaging;
      if(mob && typeof mob.getToken === 'function'){
        var permission = typeof mob.requestPermission === 'function'
          ? mob.requestPermission({forceShow: false})
          : Promise.resolve();
        permission.then(function(){
          return mob.getToken();
        }).then(function(token){
          return postToken(token, 'cordova-plugin-firebase-messaging');
        }).catch(function(err){console.warn('messaging permission/getToken', err)});
        if(typeof mob.onMessage === 'function') mob.onMessage(function(payload){ handleMessage(payload); });
        return true;
      }
    }catch(e){/*ignore*/}
    return false;
  }

  function registerNativeToken(){
    var ok = tryFirebasePlugin() || tryFCMPlugin() || tryCordovaFirebaseMessaging();
    if(!ok) console.info('Nenhum plugin FCM nativo detectado no momento.');
  }

  document.addEventListener('deviceready', function(){
    try{
      registerNativeToken();
      // also listen for generic push events
      document.addEventListener('push-notification', function(e){ handleMessage(e.detail || {}); }, false);
    }catch(e){console.warn('fcm-native init error', e)}
  }, false);

})();
