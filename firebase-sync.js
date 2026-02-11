// --- Firebase Cloud Sync Module ---
// This module handles syncing bird sightings to Firebase Firestore
// so data is available across all devices (computer, phone, tablet).

// ============================================================
// 🔧 FIREBASE CONFIG — Replace with your own Firebase project config
// Go to: https://console.firebase.google.com → Project Settings → Your Apps → Web
// ============================================================
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// --- State ---
let db = null;
let firebaseReady = false;
let unsubscribeListener = null;
const COLLECTION_NAME = 'birdfinder_sightings';
const DOC_ID = 'all_sightings';

// --- Initialize Firebase ---
function initFirebase() {
    try {
        // Check if Firebase SDK is loaded
        if (typeof firebase === 'undefined') {
            console.warn('Firebase SDK not loaded. Running in offline mode.');
            updateSyncStatus('offline');
            return false;
        }

        // Check if config is still placeholder
        if (firebaseConfig.apiKey === 'YOUR_API_KEY') {
            console.warn('Firebase not configured. Edit firebase-sync.js with your project config.');
            console.warn('Get config from: https://console.firebase.google.com → Project Settings');
            updateSyncStatus('not-configured');
            return false;
        }

        // Initialize Firebase app (only once)
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        db = firebase.firestore();

        // Enable offline persistence for Firestore
        db.enablePersistence({ synchronizeTabs: true }).catch(err => {
            if (err.code === 'failed-precondition') {
                console.warn('Firestore persistence: Multiple tabs open, only one can use offline.');
            } else if (err.code === 'unimplemented') {
                console.warn('Firestore persistence: Browser does not support offline.');
            }
        });

        firebaseReady = true;
        updateSyncStatus('synced');
        console.log('✅ Firebase initialized successfully');
        return true;

    } catch (e) {
        console.error('Firebase initialization error:', e);
        updateSyncStatus('offline');
        return false;
    }
}

// --- Save sightings to Firestore ---
async function syncSightingsToCloud(sightings) {
    if (!firebaseReady || !db) return;

    try {
        updateSyncStatus('syncing');

        await db.collection(COLLECTION_NAME).doc(DOC_ID).set({
            sightings: sightings,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: navigator.userAgent.substring(0, 50) // track which device
        });

        updateSyncStatus('synced');
        console.log('☁️ Sightings synced to cloud');

    } catch (e) {
        console.error('Cloud sync error:', e);
        updateSyncStatus('offline');
    }
}

// --- Load sightings from Firestore ---
async function loadSightingsFromCloud() {
    if (!firebaseReady || !db) return null;

    try {
        updateSyncStatus('syncing');

        const doc = await db.collection(COLLECTION_NAME).doc(DOC_ID).get();

        if (doc.exists && doc.data().sightings) {
            updateSyncStatus('synced');
            console.log('☁️ Loaded sightings from cloud');
            return doc.data().sightings;
        }

        updateSyncStatus('synced');
        return null;

    } catch (e) {
        console.error('Cloud load error:', e);
        updateSyncStatus('offline');
        return null;
    }
}

// --- Real-time listener for cross-device sync ---
function listenForCloudChanges(onDataChanged) {
    if (!firebaseReady || !db) return;

    // Unsubscribe from previous listener if any
    if (unsubscribeListener) {
        unsubscribeListener();
    }

    unsubscribeListener = db.collection(COLLECTION_NAME).doc(DOC_ID)
        .onSnapshot(
            { includeMetadataChanges: true },
            (doc) => {
                // Skip if it's a local write (to avoid loops)
                if (doc.metadata.hasPendingWrites) {
                    return;
                }

                if (doc.exists && doc.data().sightings) {
                    console.log('☁️ Real-time update received from another device');
                    updateSyncStatus('synced');
                    onDataChanged(doc.data().sightings);
                }
            },
            (error) => {
                console.error('Real-time listener error:', error);
                updateSyncStatus('offline');
            }
        );
}

// --- Merge Strategy ---
// Combines local and cloud data, keeping the larger dataset
// (assumes more data = more up to date)
function mergeSightings(localSightings, cloudSightings) {
    if (!cloudSightings || cloudSightings.length === 0) return localSightings;
    if (!localSightings || localSightings.length === 0) return cloudSightings;

    // Build a map of all sightings by ID
    const merged = {};

    // Add cloud sightings first (baseline)
    cloudSightings.forEach(s => {
        merged[s.id] = s;
    });

    // Add local sightings (overrides cloud if same ID)
    localSightings.forEach(s => {
        merged[s.id] = s;
    });

    return Object.values(merged);
}

// --- UI Sync Status Indicator ---
function updateSyncStatus(status) {
    const indicator = document.getElementById('sync-status');
    if (!indicator) return;

    const icon = indicator.querySelector('.sync-icon');
    const text = indicator.querySelector('.sync-text');
    if (!icon || !text) return;

    // Remove all status classes
    indicator.classList.remove('synced', 'syncing', 'offline', 'not-configured');
    indicator.classList.add(status);

    switch (status) {
        case 'synced':
            icon.innerHTML = '<i class="fa-solid fa-cloud"></i>';
            text.textContent = 'Synkad';
            break;
        case 'syncing':
            icon.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i>';
            text.textContent = 'Synkar...';
            break;
        case 'offline':
            icon.innerHTML = '<i class="fa-solid fa-cloud-bolt"></i>';
            text.textContent = 'Offline';
            break;
        case 'not-configured':
            icon.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i>';
            text.textContent = 'Ej konfigurerad';
            break;
    }
}

// --- Expose to global scope ---
window.firebaseSync = {
    init: initFirebase,
    save: syncSightingsToCloud,
    load: loadSightingsFromCloud,
    listen: listenForCloudChanges,
    merge: mergeSightings,
    get isReady() { return firebaseReady; }
};
