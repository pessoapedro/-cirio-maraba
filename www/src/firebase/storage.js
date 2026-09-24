import { app } from './firebaseApp.js';
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js';

const storage = getStorage(app);

const getStorageRef = (path) => ref(storage, path);

const fetchImageUrl = async (path) => {
  try {
    const imageRef = getStorageRef(path);
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error('Erro ao buscar imagem no Storage:', error);
    return null;
  }
};

const uploadImage = async (path, file) => {
  const imageRef = getStorageRef(path);
  const snapshot = await uploadBytesResumable(imageRef, file);
  return await getDownloadURL(snapshot.ref);
};

export { storage, getStorageRef, fetchImageUrl, uploadImage };
