/**
 * QuickMart — Secure Admin Script to Create First Product in Firebase Firestore
 *
 * Project ID: quickmart-9d228
 * Collection: products
 * Document ID: 101
 *
 * Security Requirements:
 * - Uses Firebase Admin SDK with authorized administrator credentials.
 * - Credentials must NOT be stored in mobile app bundle or committed to Git.
 * - This script checks for serviceAccountKey.json in the project root (gitignored)
 *   or the GOOGLE_APPLICATION_CREDENTIALS environment variable.
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'quickmart-9d228';
const COLLECTION_NAME = 'products';
const DOCUMENT_ID = '101';

const PRODUCT_PAYLOAD = {
  id: 101,
  name: 'Apple',
  category: 'Fruits',
  subcategory: 'Everyday Fruits',
  price: 180,
  currency: 'INR',
  unit: '1 kg',
  stock: 25,
  image: 'assets/images/fruits/apple.png',
  featured: true,
  isSamplePrice: true,
  isSampleStock: true,
};

function findServiceAccount() {
  // 1. Check environment variable
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    return process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }

  // 2. Check local gitignored filenames in project root
  const candidateNames = [
    'serviceAccountKey.json',
    'quickmart-9d228-firebase-adminsdk.json',
    'firebase-admin.json',
  ];

  for (const name of candidateNames) {
    const p = path.resolve(__dirname, '..', name);
    if (fs.existsSync(p)) {
      return p;
    }
  }

  // 3. Check for any *-adminsdk-*.json in project root
  const rootDir = path.resolve(__dirname, '..');
  const files = fs.readdirSync(rootDir);
  const matched = files.find(f => f.includes('adminsdk') && f.endsWith('.json'));
  if (matched) {
    return path.join(rootDir, matched);
  }

  return null;
}

async function main() {
  console.log('========================================================');
  console.log('   QuickMart — Firestore First Product Admin Seeder     ');
  console.log('========================================================\n');
  console.log(`Target Project: ${PROJECT_ID}`);
  console.log(`Collection:     ${COLLECTION_NAME}`);
  console.log(`Document ID:    ${DOCUMENT_ID}\n`);
  console.log('Product Data to Write:');
  console.log(JSON.stringify(PRODUCT_PAYLOAD, null, 2));
  console.log('\n--------------------------------------------------------');

  const keyPath = findServiceAccount();

  if (!keyPath) {
    console.log('[AUTHENTICATION REQUIRED]');
    console.log('No Firebase service account key found.');
    console.log('\nTo authenticate with authorized administrator credentials:');
    console.log('1. Go to Firebase Console: https://console.firebase.google.com/project/quickmart-9d228/settings/serviceaccounts/adminsdk');
    console.log('2. Click "Generate new private key" to download the JSON service account key.');
    console.log('3. Save the downloaded file as "serviceAccountKey.json" inside the QuickMart folder:');
    console.log('   c:\\Users\\illur\\OneDrive\\Desktop\\my projects\\mobile app both IOS AND ANDROID\\QuickMart\\serviceAccountKey.json');
    console.log('   (Note: serviceAccountKey.json is already added to .gitignore and will not be committed).');
    console.log('4. Run this script again: node scripts/seed_first_product.js --confirm\n');
    console.log('Alternatively, you can provide the path via:');
    console.log('set GOOGLE_APPLICATION_CREDENTIALS="C:\\path\\to\\serviceAccountKey.json"');
    process.exit(1);
  }

  console.log(`[OK] Found Service Account credentials at: ${keyPath}`);

  // Require confirmation flag to prevent accidental writes
  const confirmed = process.argv.includes('--confirm');
  if (!confirmed) {
    console.log('\n[CONFIRMATION REQUIRED]');
    console.log('Please confirm that you want to write document 101 to Firestore:');
    console.log('Run the command with --confirm:');
    console.log('  node scripts/seed_first_product.js --confirm\n');
    process.exit(0);
  }

  let admin;
  try {
    admin = require('firebase-admin');
  } catch (err) {
    console.error('[ERROR] firebase-admin package is not installed. Please run: npm install --save-dev firebase-admin');
    process.exit(1);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: PROJECT_ID,
    });
  }

  const db = admin.firestore();
  console.log('\n[1/3] Connecting to Cloud Firestore...');

  const docRef = db.collection(COLLECTION_NAME).doc(DOCUMENT_ID);

  console.log(`[2/3] Checking if document ${DOCUMENT_ID} already exists...`);
  const existing = await docRef.get();
  if (existing.exists) {
    console.log(`[NOTE] Document ${DOCUMENT_ID} already exists with data:`);
    console.log(JSON.stringify(existing.data(), null, 2));
    console.log('\nUpdating document with verified fields...');
  } else {
    console.log(`[NOTE] Document ${DOCUMENT_ID} does not exist yet. Creating new document...`);
  }

  await docRef.set(PRODUCT_PAYLOAD, { merge: true });
  console.log(`[3/3] Successfully wrote document ${DOCUMENT_ID} to collection "${COLLECTION_NAME}"!`);

  // Verification read-back
  const verifyDoc = await docRef.get();
  console.log('\n========================================================');
  console.log('SUCCESS: Verified Document Data in Firestore:');
  console.log('========================================================');
  console.log(JSON.stringify(verifyDoc.data(), null, 2));
}

main().catch(err => {
  console.error('\n[FATAL ERROR writing to Firestore]:', err);
  process.exit(1);
});
