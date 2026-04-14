const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || "elite-clinic-demo"
    });
    console.log('✅ [FIREBASE] Admin SDK initialized successfully');
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
