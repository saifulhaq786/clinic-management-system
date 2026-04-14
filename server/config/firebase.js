const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "elite-clinic-demo";
    admin.initializeApp({
      projectId: projectId
    });
    console.log(`✅ [FIREBASE] Admin SDK initialized successfully. Project: ${projectId}`);
  } catch (err) {
    console.error('❌ [FIREBASE] Admin SDK initialization failed:', err.message);
  }
}

/**
 * Verify a Firebase ID Token sent from the client
 */
const verifyFirebaseToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return { success: true, uid: decodedToken.uid, phoneNumber: decodedToken.phone_number };
  } catch (error) {
    console.error('Error verifying Firebase token:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  admin,
  verifyFirebaseToken
};
