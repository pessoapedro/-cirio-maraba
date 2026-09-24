// Minimal cordova stub for browser testing
window.cordova = window.cordova || {};
window.device = window.device || { platform: 'browser' };
console.log('cordova stub loaded');
(function(){
  if(!document.addEventListener) return;
  // Provide navigator.notification fallback
  navigator.notification = navigator.notification || {
    alert: function(msg){ console.log('alert:', msg); }
  };
})();
