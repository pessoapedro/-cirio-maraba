import { fetchDocument, listenDocument } from '../firebase/firestore.js';

const TRANSMISSAO_DOC = 'atual';

const getTransmissaoAtual = async () => {
  return await fetchDocument('transmissao', TRANSMISSAO_DOC);
};

const onTransmissaoAtualChange = (callback) => {
  return listenDocument('transmissao', TRANSMISSAO_DOC, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    const data = { id: snapshot.id, ...snapshot.data() };
    callback(data);
  });
};

export { getTransmissaoAtual, onTransmissaoAtualChange };
