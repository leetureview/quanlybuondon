import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: 'AIzaSyApEq1aZ60eCJOXzrz0p3mqMip96ibyy18',
    authDomain: 'quanlybuondon.firebaseapp.com',
    projectId: 'quanlybuondon',
    storageBucket: 'quanlybuondon.firebasestorage.app',
    messagingSenderId: '684982209167',
    appId: '1:684982209167:web:3a5a9599f9fe84a930befa',
    measurementId: 'G-VWZ9F7YSC3',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Secondary app: admin creates users without signing out the current session
const secondaryApp = initializeApp(firebaseConfig, 'secondary');
export const secondaryAuth = getAuth(secondaryApp);

export const analytics = isAnalyticsSupported().then((ok) =>
    ok ? getAnalytics(app) : null
);
