import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let serviceAccount;

try {
  // Use individual environment variables (more reliable)
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL?.replace('@', '%40')}`,
      universe_domain: "googleapis.com"
    };
    console.log('✅ Firebase credentials loaded from individual env vars');
  }
  // Fallback to JSON parsing
  else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    let rawJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    // Remove outer quotes if they exist
    if (rawJson.startsWith("'") && rawJson.endsWith("'")) {
      rawJson = rawJson.slice(1, -1);
    }
    if (rawJson.startsWith('"') && rawJson.endsWith('"')) {
      rawJson = rawJson.slice(1, -1);
    }
    
    // Replace escaped newlines with actual newlines
    rawJson = rawJson.replace(/\\n/g, '\n');
    
    serviceAccount = JSON.parse(rawJson);
    console.log('✅ Firebase credentials loaded from JSON');
  }
  else {
    throw new Error('Firebase credentials not found. Please set either FIREBASE_SERVICE_ACCOUNT or individual Firebase env variables.');
  }
} catch (error) {
  console.error('❌ Failed to load Firebase credentials');
  console.error('Error details:', error.message);
  console.error('Available env vars:', {
    hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT,
    hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
    hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL
  });
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('✅ Firebase Admin Initialized');
}

export default admin;