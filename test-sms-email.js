#!/usr/bin/env node

/**
 * Elite Clinic - SMS & Email Integration Tester
 * 
 * This script tests real SMS and Email delivery
 * After adding Twilio & Gmail credentials to .env, run:
 * 
 *   node test-sms-email.js
 * 
 * Then follow the prompts to test SMS and Email
 */

const readline = require('readline');
const http = require('http');

const BASE_URL = 'http://localhost:5001';

// Helper to make HTTP requests
const makeRequest = (method, path, data) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

const testSMS = async () => {
  console.log('\n📱 SMS DELIVERY TEST\n');
  
  const phone = await question('Enter phone number (e.g., +1234567890): ');
  
  try {
    console.log('Sending OTP...');
    const response = await makeRequest('POST', '/api/mobile/send-otp', {
      phone: phone.trim()
    });
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200) {
      console.log('\n✅ SMS API call successful!');
      console.log('Check your phone for SMS within 30 seconds...');
    } else {
      console.log('\n❌ Failed to send SMS');
      console.log('Check backend console for errors');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
};

const testEmail = async () => {
  console.log('\n📧 EMAIL DELIVERY TEST\n');
  
  const email = await question('Enter email address: ');
  
  try {
    console.log('Sending verification email...');
    const response = await makeRequest('POST', '/api/auth/send-email-verification', {
      email: email.trim(),
      userName: 'Test User'
    });
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200) {
      console.log('\n✅ Email API call successful!');
      console.log('Check your email inbox for verification code within 30 seconds...');
    } else {
      console.log('\n❌ Failed to send email');
      console.log('Check backend console for errors');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
};

const main = async () => {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 ELITE CLINIC - SMS & EMAIL INTEGRATION TESTER');
  console.log('='.repeat(60));
  
  console.log('\nMake sure your server is running: npm run dev\n');
  
  while (true) {
    console.log('\nWhat would you like to test?');
    console.log('1. SMS Delivery (send OTP)');
    console.log('2. Email Delivery (send verification code)');
    console.log('3. Exit\n');
    
    const choice = await question('Enter choice (1-3): ');
    
    switch (choice.trim()) {
      case '1':
        await testSMS();
        break;
      case '2':
        await testEmail();
        break;
      case '3':
        console.log('\nGoodbye! 👋\n');
        rl.close();
        process.exit(0);
      default:
        console.log('Invalid choice');
    }
  }
};

// Start tests
main().catch(console.error);
