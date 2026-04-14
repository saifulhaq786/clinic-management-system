// ============ CONFIG STATUS CHECK ============
// Run this to verify SMS/Email integration is ready

const checkCredentials = () => {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 ELITE CLINIC - CREDENTIALS STATUS CHECK');
  console.log('='.repeat(60) + '\n');

  const emailConfigured = process.env.EMAIL_USER && 
                         process.env.EMAIL_PASSWORD &&
                         !process.env.EMAIL_USER.includes('your-email');

  const firebaseConfigured = process.env.VITE_FIREBASE_API_KEY && 
                             process.env.FIREBASE_PROJECT_ID &&
                             !process.env.VITE_FIREBASE_API_KEY.includes('your_firebase');

  const googleConfigured = process.env.GOOGLE_CLIENT_ID && 
                           !process.env.GOOGLE_CLIENT_ID.includes('google_client');

  // Email Status
  console.log('📧 EMAIL CONFIGURATION:');
  if (emailConfigured) {
    console.log(`  ✅ Gmail: CONFIGURED (${process.env.EMAIL_USER})`);
  } else {
    console.log(`  ❌ Gmail: NOT CONFIGURED`);
  }

  // Auth Status (Social & SMS)
  console.log('\n🚀 AUTHENTICATION SUITE:');
  if (firebaseConfigured) {
    console.log(`  ✅ Firebase (SMS/Email Link): CONFIGURED (${process.env.FIREBASE_PROJECT_ID})`);
  } else {
    console.log(`  ❌ Firebase: NOT CONFIGURED`);
  }

  if (googleConfigured) {
    console.log(`  ✅ Google Login: CONFIGURED (${process.env.GOOGLE_CLIENT_ID.slice(0, 15)}...)`);
  } else {
    console.log(`  ❌ Google Login: NOT CONFIGURED`);
  }

  // Overall Status
  console.log('\n' + '-'.repeat(60));
  if (emailConfigured && firebaseConfigured && googleConfigured) {
    console.log('✅ ELITE CLINIC READY - Premium Auth Suite Active!');
  } else {
    console.log('⚠️  PARTIAL CONFIG - Check your .env file credentials');
  }
  console.log('-'.repeat(60) + '\n');
};

module.exports = { checkCredentials };
