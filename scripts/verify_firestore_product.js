const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

const keyPath = path.resolve(__dirname, '..', 'serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: 'quickmart-9d228',
});

const db = getFirestore(app);

async function verify() {
  console.log('--- Verifying Firestore Document 101 ---');
  const docRef = db.collection('products').doc('101');
  const snap = await docRef.get();

  if (!snap.exists) {
    console.error('[FAIL] Document 101 does not exist in collection products!');
    process.exit(1);
  }

  const data = snap.data();
  console.log('[PASS] Document 101 exists in collection "products".');
  console.log('[PASS] Document Data:', JSON.stringify(data, null, 2));

  // Field validation
  const validations = [
    { field: 'id', expected: 101, type: 'number' },
    { field: 'name', expected: 'Apple', type: 'string' },
    { field: 'category', expected: 'Fruits', type: 'string' },
    { field: 'subcategory', expected: 'Everyday Fruits', type: 'string' },
    { field: 'price', expected: 180, type: 'number' },
    { field: 'currency', expected: 'INR', type: 'string' },
    { field: 'unit', expected: '1 kg', type: 'string' },
    { field: 'stock', expected: 25, type: 'number' },
    { field: 'image', expected: 'assets/images/fruits/apple.png', type: 'string' },
    { field: 'featured', expected: true, type: 'boolean' },
    { field: 'isSamplePrice', expected: true, type: 'boolean' },
    { field: 'isSampleStock', expected: true, type: 'boolean' },
  ];

  let allPass = true;
  for (const v of validations) {
    const val = data[v.field];
    const actualType = typeof val;
    if (val === v.expected && actualType === v.type) {
      console.log(`[PASS] Field "${v.field}": ${JSON.stringify(val)} (${actualType})`);
    } else {
      console.error(`[FAIL] Field "${v.field}": got ${JSON.stringify(val)} (${actualType}), expected ${JSON.stringify(v.expected)} (${v.type})`);
      allPass = false;
    }
  }

  if (allPass) {
    console.log('\n>>> ALL 12 FIELDS AND DATA TYPES VERIFIED SUCCESSFULLY IN CLOUD FIRESTORE! <<<');
  } else {
    process.exit(1);
  }
}

verify().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
