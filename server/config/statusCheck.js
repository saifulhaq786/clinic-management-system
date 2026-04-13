// ============ CONFIG STATUS CHECK ============
// Run this to verify SMS/Email integration is ready

const checkCredentials = () => {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 ELITE CLINIC - CREDENTIALS STATUS CHECK');
  console.log('='.repeat(60) + '\n');

  const emailConfigured = process.env.EMAIL_USER && 
                         process.env.EMAIL_PASSWORD &&
                         !process.env.EMAIL_USER.includes('your-email');

  const smsConfigured = process.env.TWILIO_ACCOUNT_SID && 
                       process.env.TWILIO_AUTH_TOKEN &&
                       !process.env.TWILIO_ACCOUNT_SID.includes('your_twilio');

  // Email Status
  console.log('📧 EMAIL CONFIGURATION:');
  if (emailConfigured) {
    console.log(`  ✅ Gmail: CONFIGURED (${process.env.EMAIL_USER})`);
  } else {
    console.log(`  ❌ Gmail: NOT CONFIGURED - Placeholder values detected`);
    console.log('     Update .env with real Gmail credentials');
  }

  // SMS Status
  console.log('\n📱 SMS CONFIGURATION:');
  if (smsConfigured) {
    console.log(`  ✅ Twilio: CONFIGURED (SID: ${process.env.TWILIO_ACCOUNT_SID.slice(0, 6)}...)`);
  } else {
    console.log(`  ❌ Twilio: NOT CONFIGURED - Placeholder values detected`);
    console.log('     Update .env with real Twilio credentials');
  }

  // Overall Status
  console.log('\n' + '-'.repeat(60));
  if (emailConfigured && smsConfigured) {
    console.log('✅ ALL SYSTEMS READY - Real SMS & Email should work!');
  } else if (emailConfigured || smsConfigured) {
    console.log('⚠️  PARTIAL CONFIG - Add missing credentials to .env');
  } else {
    console.log('❌ NOT CONFIGURED - See CREDENTIALS_SETUP.md for instructions');
  }
  console.log('-'.repeat(60) + '\n');
};

module.exports = { checkCredentials };
