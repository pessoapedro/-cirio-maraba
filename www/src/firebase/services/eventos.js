import { fetchCollection, listenCollection } from '../firebase/firestore.js';

const getEventos = async () => {
  return await fetchCollection('eventos', [orderBy('data', 'asc')]);
};

const onEventosChange = (callback) => {
  return listenCollection('eventos', (snapshot) => {
    const eventos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(eventos);
  }, [orderBy('data', 'asc')]);
};

export { getEventos, onEventosChange };
