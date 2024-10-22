import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';
import { getAnalytics, logEvent, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBsOes01Lnp2leFMN_qJbk-_X6nZIlHvBU",
  authDomain: "alpha-orbit.firebaseapp.com",
  projectId: "alpha-orbit",
  storageBucket: "alpha-orbit.appspot.com",
  messagingSenderId: "152969284019",
  appId: "1:152969284019:web:8c2a1d6a7d6a48c52623c6",
  measurementId: "G-4TB90WRQ97"
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