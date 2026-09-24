/**
 * INDEX.JS - Inicialização do Cordova
 * 
 * Este arquivo é carregado automaticamente pelo Cordova
 * Aguarda o evento 'deviceready' antes de usar APIs do Cordova
 */

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova está inicializado e pronto para usar APIs do dispositivo
    console.log('✅ Cordova Inicializado!');
    console.log('Plataforma: ' + cordova.platformId);
    console.log('Versão: ' + cordova.version);
    
    // Log para desenvolvimento
    console.log('📱 App Localiza a Berlinda v1.0.0');
}
