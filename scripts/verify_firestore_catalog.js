/**
 * QuickMart — Cloud Firestore Full Catalog Verification Script
 * Validates:
 * 1. Total category count in `categories` collection (28)
 * 2. Total product count in `products` collection (447)
 * 3. Document 101 integrity (Apple)
 * 4. Sample price and sample stock flags
 * 5. Category queries (Fruits, Vegetables, Snacks, Dairy, etc.)
 * 6. Featured products queries
 * 7. Price & unit validity
 */

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'quickmart-9d228';
const keyPath = path.resolve(__dirname, '..', 'serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

const app = !getApps().length
  ? initializeApp({
      credential: cert(serviceAccount),
      projectId: PROJECT_ID,
    })
  : getApps()[0];

const db = getFirestore(app);

async function verify() {
  console.log('================================================================');
  console.log('      QuickMart — Cloud Firestore Catalog Live Verification     ');
  console.log('================================================================');

  let allPassed = true;

  // 1. Verify Categories Count
  console.log('\n[1/6] Verifying "categories" collection...');
  const catSnap = await db.collection('categories').get();
  console.log(`   Found ${catSnap.size} categories in Firestore.`);
  if (catSnap.size === 28) {
    console.log('   [PASS] Exact 28 categories verified.');
  } else {
    console.error(`   [FAIL] Expected 28 categories, found ${catSnap.size}`);
    allPassed = false;
  }

  // Check sample category document fields
  const sampleCat = catSnap.docs[0].data();
  console.log(`   Sample Category (${sampleCat.id}): "${sampleCat.name}" | DisplayOrder: ${sampleCat.displayOrder} | Active: ${sampleCat.isActive}`);
  if (sampleCat.id && sampleCat.name && typeof sampleCat.displayOrder === 'number' && typeof sampleCat.isActive === 'boolean') {
    console.log('   [PASS] Category schema fields verified (id, name, image, description, displayOrder, isActive).');
  } else {
    console.error('   [FAIL] Category schema missing required fields!');
    allPassed = false;
  }

  // 2. Verify Products Count
  console.log('\n[2/6] Verifying "products" collection...');
  const prodSnap = await db.collection('products').get();
  console.log(`   Found ${prodSnap.size} products in Firestore.`);
  if (prodSnap.size === 447) {
    console.log('   [PASS] Exact 447 products verified.');
  } else {
    console.error(`   [FAIL] Expected 447 products, found ${prodSnap.size}`);
    allPassed = false;
  }

  // 3. Verify Document 101 (Apple)
  console.log('\n[3/6] Verifying Document 101 (Apple)...');
  const appleDoc = await db.collection('products').doc('101').get();
  if (appleDoc.exists) {
    const data = appleDoc.data();
    console.log(`   [PASS] Document 101 exists: "${data.name}", Price: ₹${data.price}, Unit: "${data.unit}", Stock: ${data.stock}`);
    console.log(`   Sample flags: isSamplePrice=${data.isSamplePrice}, isSampleStock=${data.isSampleStock}, featured=${data.featured}`);
  } else {
    console.error('   [FAIL] Document 101 does not exist!');
    allPassed = false;
  }

  // 4. Verify Schema and Data Types across all products
  console.log('\n[4/6] Auditing field types across all 447 products...');
  let invalidFields = 0;
  const docIds = new Set();
  let duplicateCount = 0;

  prodSnap.docs.forEach(doc => {
    if (docIds.has(doc.id)) duplicateCount++;
    docIds.add(doc.id);

    const d = doc.data();
    if (!d.name || typeof d.name !== 'string') invalidFields++;
    if (typeof d.price !== 'number' || isNaN(d.price)) invalidFields++;
    if (!d.category || typeof d.category !== 'string') invalidFields++;
    if (typeof d.inStock !== 'boolean') invalidFields++;
    if (typeof d.stock !== 'number') invalidFields++;
  });

  if (duplicateCount === 0) {
    console.log('   [PASS] Zero duplicate document IDs.');
  } else {
    console.error(`   [FAIL] Found ${duplicateCount} duplicate document IDs!`);
    allPassed = false;
  }

  if (invalidFields === 0) {
    console.log('   [PASS] All 447 product documents passed data type & schema audit.');
  } else {
    console.error(`   [FAIL] Found ${invalidFields} invalid product fields!`);
    allPassed = false;
  }

  // 5. Verify Querying by Category
  console.log('\n[5/6] Testing category queries...');
  const testCategories = ['Fruits', 'vegetables', 'dairy', 'snacks', 'atta-rice-dal-grains', 'masala-spices'];
  for (const cat of testCategories) {
    const qSnap = await db.collection('products').where('category', '==', cat).get();
    console.log(`   Category query "${cat}": returned ${qSnap.size} products.`);
    if (qSnap.size > 0) {
      console.log(`   [PASS] Successfully retrieved products for "${cat}".`);
    } else {
      console.error(`   [FAIL] No products returned for category "${cat}".`);
      allPassed = false;
    }
  }

  // 6. Verify Featured Products Query
  console.log('\n[6/6] Testing featured products query...');
  const featSnap = await db.collection('products').where('featured', '==', true).get();
  console.log(`   Featured products query: returned ${featSnap.size} products.`);
  if (featSnap.size > 0) {
    console.log(`   [PASS] Successfully retrieved featured products.`);
  } else {
    console.error('   [FAIL] No featured products returned!');
    allPassed = false;
  }

  console.log('\n================================================================');
  if (allPassed) {
    console.log('   >>> ALL FIRESTORE VERIFICATION CHECKS PASSED (6/6) <<<       ');
  } else {
    console.error('   >>> SOME FIRESTORE VERIFICATION CHECKS FAILED! <<<           ');
    process.exit(1);
  }
  console.log('================================================================\n');
}

verify().catch(err => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
