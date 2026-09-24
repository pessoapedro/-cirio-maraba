import { app } from './firebaseApp.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging.js';

const messaging = getMessaging(app);

const requestPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Erro ao solicitar permissão de notificações:', error);
    return false;
  }
};

const getFcmToken = async (vapidKey) => {
  try {
    const currentToken = await getToken(messaging, { vapidKey });
    return currentToken;
  } catch (error) {
    console.error('Erro ao obter token FCM:', error);
    throw error;
  }
};

const listenForegroundMessages = (callback) => {
  onMessage(messaging, (payload) => {
    callback(payload);
  });
};

const enviarNotificacao = (title, body, data = {}) => {
  console.log('Enviar notificação via servidor ou Cloud Function deve ser implementado no backend.', { title, body, data });
};

const receberNotificacao = (payload) => {
  if (!payload) return;
  if (Notification.permission === 'granted') {
    new Notification(payload.notification.title, {
      body: payload.notification.body,
      data: payload.data
    });
  }
};

const abrirNotificacao = (payload, appInstance) => {
  if (!payload || !payload.data) return;
  const target = payload.data.target;
  if (!appInstance || !appInstance.openSection) return;

  switch (target) {
    case 'Evento':
      appInstance.openSection('eventos');
      break;
    case 'Transmissão':
      appInstance.openSection('transmissoes');
      break;
    case 'Cartaz':
      appInstance.openSection('cartazes');
      break;
    case 'Notícia':
      appInstance.openSection('noticias');
      break;
    default:
      break;
  }
};

export { messaging, requestPermission, getFcmToken, listenForegroundMessages, enviarNotificacao, receberNotificacao, abrirNotificacao };
