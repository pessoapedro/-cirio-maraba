import { fetchCollection, listenCollection } from '../firebase/firestore.js';

const getCartazes = async () => {
  return await fetchCollection('cartazes', [where('ativo', '==', true), orderBy('data', 'desc')]);
};

const onCartazesChange = (callback) => {
  return listenCollection('cartazes', (snapshot) => {
    const cartazes = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(cartaz => cartaz.ativo)
      .sort((a, b) => new Date(b.data) - new Date(a.data));
    callback(cartazes);
  }, [where('ativo', '==', true), orderBy('data', 'desc')]);
};

export { getCartazes, onCartazesChange };
