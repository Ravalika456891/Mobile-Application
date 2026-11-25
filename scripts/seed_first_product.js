/**
 * QuickMart — Secure Admin Script to Create First Product in Firebase Firestore
 *
 * Project ID: quickmart-9d228
 * Collection: products
 * Document ID: 101
 *
 * Supports two authorized admin paths:
 * 1. Firebase Admin SDK via serviceAccountKey.json (Recommended)
 * 2. Firestore REST API via Google Services configuration
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

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
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    return process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }

  const rootDir = path.resolve(__dirname, '..');
  const candidateNames = [
    'serviceAccountKey.json',
    'quickmart-9d228-firebase-adminsdk.json',
    'firebase-admin.json',
  ];

  for (const name of candidateNames) {
    const p = path.join(rootDir, name);
    if (fs.existsSync(p)) return p;
  }

  try {
    const files = fs.readdirSync(rootDir);
    const matched = files.find(f => f.includes('adminsdk') && f.endsWith('.json'));
    if (matched) return path.join(rootDir, matched);
  } catch {}

  // Also check Downloads directory if accessible
  const userHome = process.env.USERPROFILE || process.env.HOME;
  if (userHome) {
    const downloads = path.join(userHome, 'Downloads');
    if (fs.existsSync(downloads)) {
      try {
        const dFiles = fs.readdirSync(downloads);
        const dMatched = dFiles.find(f => f.includes('adminsdk') && f.endsWith('.json'));
        if (dMatched) return path.join(downloads, dMatched);
      } catch {}
    }
  }

  return null;
}

function writeViaRestApi(apiKey) {
  return new Promise((resolve, reject) => {
    const restPayload = {
      fields: {
        id: { integerValue: String(PRODUCT_PAYLOAD.id) },
        name: { stringValue: PRODUCT_PAYLOAD.name },
        category: { stringValue: PRODUCT_PAYLOAD.category },
        subcategory: { stringValue: PRODUCT_PAYLOAD.subcategory },
        price: { integerValue: String(PRODUCT_PAYLOAD.price) },
        currency: { stringValue: PRODUCT_PAYLOAD.currency },
        unit: { stringValue: PRODUCT_PAYLOAD.unit },
        stock: { integerValue: String(PRODUCT_PAYLOAD.stock) },
        image: { stringValue: PRODUCT_PAYLOAD.image },
        featured: { booleanValue: PRODUCT_PAYLOAD.featured },
        isSamplePrice: { booleanValue: PRODUCT_PAYLOAD.isSamplePrice },
        isSampleStock: { booleanValue: PRODUCT_PAYLOAD.isSampleStock },
      }
    };

    const postData = JSON.stringify(restPayload);
    const options = {
      hostname: 'firestore.googleapis.com',
      port: 443,
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${COLLECTION_NAME}/${DOCUMENT_ID}?key=${apiKey}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject({ statusCode: res.statusCode, data: JSON.parse(data || '{}') });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
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

  if (keyPath) {
    console.log(`[AUTH] Using authorized Service Account: ${keyPath}`);
    const admin = require('firebase-admin');
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: PROJECT_ID,
      });
    }

    const db = admin.firestore();
    console.log('[1/3] Connecting to Cloud Firestore via Admin SDK...');
    const docRef = db.collection(COLLECTION_NAME).doc(DOCUMENT_ID);

    console.log(`[2/3] Writing document ${DOCUMENT_ID}...`);
    await docRef.set(PRODUCT_PAYLOAD, { merge: true });

    console.log('[3/3] Verifying written document...');
    const verifyDoc = await docRef.get();
    console.log('\n========================================================');
    console.log('SUCCESS: Document 101 successfully written and verified:');
    console.log('========================================================');
    console.log(JSON.stringify(verifyDoc.data(), null, 2));
    return;
  }

  // Fallback: Check if google-services.json API key can write via REST API
  console.log('[NOTE] No serviceAccountKey.json found yet.');
  console.log('[NOTE] Attempting write via Cloud Firestore REST API with google-services.json...');

  const gsPath = path.resolve(__dirname, '..', 'google-services.json');
  if (fs.existsSync(gsPath)) {
    const gs = JSON.parse(fs.readFileSync(gsPath, 'utf8'));
    const apiKey = gs.client?.[0]?.api_key?.[0]?.current_key;

    if (apiKey) {
      try {
        const result = await writeViaRestApi(apiKey);
        console.log('\n========================================================');
        console.log('SUCCESS: Document 101 written to Firestore via API:');
        console.log('========================================================');
        console.log(JSON.stringify(result, null, 2));
        return;
      } catch (err) {
        console.log(`\n[REST API Result]: HTTP ${err.statusCode}`);
        if (err.data?.error) {
          console.log(`Reason: ${err.data.error.message} (${err.data.error.status})`);
        }
      }
    }
  }

  console.log('\n--------------------------------------------------------');
  console.log('[ACTION REQUIRED TO WRITE TO FIRESTORE]');
  console.log('Your Cloud Firestore rules currently block unauthenticated client writes (HTTP 403 PERMISSION_DENIED).');
  console.log('\nTo complete the write, please choose ONE of the following options:');
  console.log('\nOPTION A (Recommended - Firebase Admin SDK):');
  console.log('1. Go to: https://console.firebase.google.com/project/quickmart-9d228/settings/serviceaccounts/adminsdk');
  console.log('2. Click "Generate new private key" to download the JSON key.');
  console.log('3. Save it as "serviceAccountKey.json" inside the QuickMart folder:');
  console.log('   c:\\Users\\illur\\OneDrive\\Desktop\\my projects\\mobile app both IOS AND ANDROID\\QuickMart\\serviceAccountKey.json');
  console.log('   (It is already in .gitignore and protected from git commits).');
  console.log('4. Run: node scripts/seed_first_product.js\n');
  console.log('OPTION B (Update Security Rules for initial setup):');
  console.log('1. Go to: https://console.firebase.google.com/project/quickmart-9d228/firestore/rules');
  console.log('2. Allow products read & write:');
  console.log('   rules_version = \'2\';');
  console.log('   service cloud.firestore {');
  console.log('     match /databases/{database}/documents {');
  console.log('       match /products/{id} { allow read, write: if true; }');
  console.log('     }');
  console.log('   }');
  console.log('3. Click "Publish". Then run: node scripts/seed_first_product.js');
  console.log('========================================================');
}

main().catch(err => {
  console.error('\n[FATAL ERROR]:', err);
  process.exit(1);
});
