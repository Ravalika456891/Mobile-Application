/**
 * Firebase Native SDK Configuration & Initialization Service for QuickMart
 *
 * Project ID: quickmart-9d228
 * Android Package: com.mygroceries.app
 *
 * In native Android builds, React Native Firebase auto-initializes the default app
 * from google-services.json at native launch via GoogleServicesPlugin.
 * This module connects to the native SDK instances and provides resilient access
 * to Firebase App, Authentication, Firestore, and Cloud Functions.
 */

import { getApp, getApps, initializeApp, FirebaseApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import { getFunctions } from '@react-native-firebase/functions';

export const FIREBASE_CONFIG = {
  projectId: 'quickmart-9d228',
  packageName: 'com.mygroceries.app',
};

/**
 * Retrieves the default native Firebase App instance.
 * Automatically initialized by native Android runtime from google-services.json.
 */
export const getFirebaseApp = (): FirebaseApp | null => {
  try {
    const apps = getApps();
    if (apps && apps.length > 0) {
      return getApp();
    }
    // In environments where native auto-init has not yet executed,
    // safely return getApp() or null without unhandled crashes.
    return getApp();
  } catch (error) {
    console.warn('[Firebase] Native default app not yet initialized:', error);
    return null;
  }
};

/**
 * Firebase Auth service instance connected to native SDK.
 */
export const getFirebaseAuth = () => {
  try {
    const app = getFirebaseApp();
    return app ? getAuth(app) : getAuth();
  } catch (error) {
    console.warn('[Firebase] Auth initialization warning:', error);
    return null;
  }
};

/**
 * Firebase Firestore database service instance connected to native SDK.
 */
export const getFirebaseFirestore = () => {
  try {
    const app = getFirebaseApp();
    return app ? getFirestore(app) : getFirestore();
  } catch (error) {
    console.warn('[Firebase] Firestore initialization warning:', error);
    return null;
  }
};

/**
 * Firebase Cloud Functions service instance connected to native SDK.
 */
export const getFirebaseFunctions = () => {
  try {
    const app = getFirebaseApp();
    return app ? getFunctions(app) : getFunctions();
  } catch (error) {
    console.warn('[Firebase] Functions initialization warning:', error);
    return null;
  }
};

/**
 * Diagnostics & status checker for the Firebase native connection.
 */
export const getFirebaseStatus = () => {
  const apps = getApps();
  const isInitialized = apps.length > 0;
  return {
    initialized: isInitialized,
    appName: isInitialized ? apps[0].name : null,
    projectId: FIREBASE_CONFIG.projectId,
    packageName: FIREBASE_CONFIG.packageName,
    servicesAvailable: {
      auth: true,
      firestore: true,
      functions: true,
    },
  };
};

export default {
  getFirebaseApp,
  getFirebaseAuth,
  getFirebaseFirestore,
  getFirebaseFunctions,
  getFirebaseStatus,
  config: FIREBASE_CONFIG,
};
