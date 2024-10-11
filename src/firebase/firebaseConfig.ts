import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';
import { getAnalytics, logEvent, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBWQ40NnSo1Ou4cM5u31Qgiari8Km19ZNA",
  authDomain: "alphaorbit-2cf88.firebaseapp.com",
  projectId: "alphaorbit-2cf88",
  storageBucket: "alphaorbit-2cf88.appspot.com",
  messagingSenderId: "464364454067",
  appId: "1:464364454067:web:a728187dfade63d7aff0c6",
  measurementId: "G-JB1FVPQYV5"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Initialize App Check in a way that works on both client and server
let appCheck: AppCheck | undefined;

if (typeof window !== 'undefined') {
  // We're on the client side
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LdOr0gqAAAAAGvpXEXk8XJywsa2ivqrvjwrozNi'),
    isTokenAutoRefreshEnabled: true
  });
}

const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export { app, auth, db, appCheck, analytics, logEvent };