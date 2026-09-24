import { app } from './firebaseApp.js';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const getCollection = (collectionName) => collection(db, collectionName);
const getDocument = (collectionName, documentId) => doc(db, collectionName, documentId);

const fetchDocument = async (collectionName, documentId) => {
  const documentRef = getDocument(collectionName, documentId);
  const snapshot = await getDoc(documentRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

const fetchCollection = async (collectionName, constraints = []) => {
  const collectionRef = getCollection(collectionName);
  const q = query(collectionRef, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const listenDocument = (collectionName, documentId, callback) => {
  const documentRef = getDocument(collectionName, documentId);
  return onSnapshot(documentRef, callback, (error) => console.error('Firestore listener error:', error));
};

const listenCollection = (collectionName, callback, constraints = []) => {
  const collectionRef = getCollection(collectionName);
  const q = query(collectionRef, ...constraints);
  return onSnapshot(q, callback, (error) => console.error('Firestore listener error:', error));
};

const saveDocument = async (collectionName, documentId, data) => {
  const documentRef = getDocument(collectionName, documentId);
  await setDoc(documentRef, {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

const updateDocument = async (collectionName, documentId, data) => {
  const documentRef = getDocument(collectionName, documentId);
  await updateDoc(documentRef, data);
};

export { db, getCollection, getDocument, fetchDocument, fetchCollection, listenDocument, listenCollection, saveDocument, updateDocument };
