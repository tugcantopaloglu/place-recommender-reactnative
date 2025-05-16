import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Firebase yapılandırma bilgilerinizi buraya ekleyin
  apiKey: "DUMMY_FIREBASE_API_KEY",
  authDomain: "DUMMY_FIREBASE_AUTH_DOMAIN",
  projectId: "DUMMY_FIREBASE_PROJECT_ID",
  storageBucket: "DUMMY_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "DUMMY_FIREBASE_MESSAGING_SENDER_ID",
  appId: "DUMMY_FIREBASE_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 