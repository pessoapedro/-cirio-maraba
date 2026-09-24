import { fetchCollection, listenCollection } from '../firebase/firestore.js';

const getLinksAtivos = async () => {
  return await fetchCollection('links', [where('ativo', '==', true), orderBy('ordem', 'asc')]);
};

const onLinksChange = (callback) => {
  return listenCollection('links', (snapshot) => {
    const links = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(link => link.ativo)
      .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    callback(links);
  }, [where('ativo', '==', true), orderBy('ordem', 'asc')]);
};

export { getLinksAtivos, onLinksChange };
