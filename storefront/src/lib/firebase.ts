import { FirebaseError, getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

let analyticsInitialized = false;

export function initializeFirebase(firebaseConfig: FirebaseOptions) {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  if (typeof window !== "undefined" && !analyticsInitialized) {
    getAnalytics(app);
    analyticsInitialized = true;
  }

  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: "select_account" });

  return {
    auth: getAuth(app),
    googleProvider,
  };
}

export { FirebaseError };
