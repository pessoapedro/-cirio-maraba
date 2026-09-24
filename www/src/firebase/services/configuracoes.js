import { fetchDocument, listenDocument } from '../firebase/firestore.js';

const CONFIG_DOC = 'app';

const getConfiguracoes = async () => {
  return await fetchDocument('configuracoes', CONFIG_DOC);
};

const onConfiguracoesChange = (callback) => {
  return listenDocument('configuracoes', CONFIG_DOC, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback({ id: snapshot.id, ...snapshot.data() });
  });
};

export { getConfiguracoes, onConfiguracoesChange };
