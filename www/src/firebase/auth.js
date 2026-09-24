import { app } from './firebaseApp.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

const auth = getAuth(app);

const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Erro no login Firebase:', error);
    throw error;
  }
};

const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Erro no logout Firebase:', error);
    throw error;
  }
};

const onAuthChange = (callback) => {
  onAuthStateChanged(auth, callback);
};

export { auth, login, logout, onAuthChange };
