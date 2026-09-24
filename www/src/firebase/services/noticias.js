import { fetchCollection, listenCollection } from '../firebase/firestore.js';

const getNoticias = async () => {
  return await fetchCollection('noticias', [orderBy('data', 'desc')]);
};

const onNoticiasChange = (callback) => {
  return listenCollection('noticias', (snapshot) => {
    const noticias = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => new Date(b.data) - new Date(a.data));
    callback(noticias);
  }, [orderBy('data', 'desc')]);
};

export { getNoticias, onNoticiasChange };
