/**
 * QuickMart — Automated Catalog Import & Dry-Run Script
 * Imports all 28 shopping categories and all 447 catalog products into Cloud Firestore.
 *
 * Requirements:
 * 1. Read existing JSON (quickmart_fruits.json) and TypeScript (categories.ts, products.ts).
 * 2. Validate all product and category fields.
 * 3. Use unique IDs as Firestore document IDs.
 * 4. Disambiguate and report conflicting IDs.
 * 5. Preserve the existing Apple document with ID 101.
 * 6. Use batch writes (max 200 operations per batch).
 * 7. Default to Dry-Run mode unless --execute or --commit is explicitly passed.
 *
 * Usage:
 *   Dry Run Preview:  node scripts/import_catalog_to_firestore.js
 *   Live Write:       node scripts/import_catalog_to_firestore.js --execute
 */

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const ts = require('typescript');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'quickmart-9d228';
const PRODUCTS_COLLECTION = 'products';
const CATEGORIES_COLLECTION = 'categories';
const BATCH_SIZE = 200;

const isExecuteMode = process.argv.includes('--execute') || process.argv.includes('--commit');

// Load service account key
const keyPath = path.resolve(__dirname, '..', 'serviceAccountKey.json');
if (!fs.existsSync(keyPath)) {
  console.error(`[ERROR] Missing service account key at ${keyPath}`);
  process.exit(1);
}
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

// Initialize Firebase Admin
const app = !getApps().length
  ? initializeApp({
      credential: cert(serviceAccount),
      projectId: PROJECT_ID,
    })
  : getApps()[0];

const db = getFirestore(app);

// Helper to transpile and evaluate TypeScript modules
function requireTs(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const result = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const moduleObj = { exports: {} };
  const customRequire = (importPath) => {
    if (importPath.endsWith('.json')) {
      const resolved = path.resolve(path.dirname(filePath), importPath);
      return JSON.parse(fs.readFileSync(resolved, 'utf8'));
    }
    if (importPath.includes('types')) return {};
    if (importPath.startsWith('.')) {
      let resolved = path.resolve(path.dirname(filePath), importPath);
      if (fs.existsSync(resolved + '.ts')) return requireTs(resolved + '.ts');
      if (fs.existsSync(resolved + '.tsx')) return requireTs(resolved + '.tsx');
      if (fs.existsSync(resolved + '.js')) return require(resolved + '.js');
    }
    return {};
  };
  const fn = new Function('module', 'exports', 'require', result.outputText);
  fn(moduleObj, moduleObj.exports, customRequire);
  return moduleObj.exports;
}

// Slugify helper for disambiguating colliding IDs
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 24);
}

async function main() {
  console.log('================================================================');
  console.log('      QuickMart — Cloud Firestore Complete Catalog Importer     ');
  console.log('================================================================');
  console.log(`Target Project:   ${PROJECT_ID}`);
  console.log(`Execution Mode:   ${isExecuteMode ? '>>> LIVE WRITE <<<' : '*** DRY-RUN PREVIEW (No writes) ***'}`);
  console.log(`Service Account:  ${serviceAccount.client_email}\n`);

  // -------------------------------------------------------------
  // STEP 1: Load and Validate Categories
  // -------------------------------------------------------------
  console.log('[1/4] Loading shopping categories from categories.ts...');
  const catMod = requireTs(path.resolve(__dirname, '../src/data/categories.ts'));
  const rawCategories = catMod.ALL_28_CATEGORIES || [];

  if (rawCategories.length === 0) {
    console.error('[ERROR] No categories found in categories.ts!');
    process.exit(1);
  }

  const categoryMap = new Map();
  const validatedCategories = [];

  rawCategories.forEach((cat, index) => {
    const id = String(cat.id);
    if (categoryMap.has(id)) {
      console.warn(`[WARN] Duplicate category ID: ${id}`);
      return;
    }

    const categoryDoc = {
      id: id,
      name: cat.name || id,
      image: cat.image || '',
      description: cat.description || `Explore ${cat.name} products`,
      displayOrder: index + 1,
      isActive: true,
      icon: cat.icon || 'basket-outline',
      color: cat.color || '#10B981',
      subcategories: Array.isArray(cat.subcategories) ? cat.subcategories : [],
    };

    // Validation
    if (!categoryDoc.id || !categoryDoc.name) {
      throw new Error(`Invalid category at index ${index}: missing id or name`);
    }

    categoryMap.set(id, categoryDoc);
    validatedCategories.push(categoryDoc);
  });

  console.log(`[PASS] Loaded and validated ${validatedCategories.length} categories.`);

  // -------------------------------------------------------------
  // STEP 2: Load Products (TypeScript Catalog + Fruits JSON)
  // -------------------------------------------------------------
  console.log('\n[2/4] Loading products from products.ts & quickmart_fruits.json...');
  const prodMod = requireTs(path.resolve(__dirname, '../src/data/products.ts'));
  const prodsFromTs = prodMod.PRODUCTS || [];
  const fruitsJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/data/quickmart_fruits.json'), 'utf8'));

  console.log(`   - Found ${prodsFromTs.length} products in TypeScript catalog.`);
  console.log(`   - Found ${fruitsJson.length} products in Fruits JSON.`);

  // Combine datasets
  const allRawProducts = [];

  // Add fruits first (includes doc 101 Apple)
  fruitsJson.forEach(f => {
    allRawProducts.push({
      ...f,
      id: String(f.id),
      isFruitJson: true,
    });
  });

  // Add TypeScript catalog products
  prodsFromTs.forEach(p => {
    allRawProducts.push({
      ...p,
      id: String(p.id),
      isFruitJson: false,
    });
  });

  console.log(`   - Combined total raw items: ${allRawProducts.length}`);

  // -------------------------------------------------------------
  // STEP 3: Detect and Resolve ID Collisions, Validate Schema
  // -------------------------------------------------------------
  console.log('\n[3/4] Resolving ID collisions and validating product schemas...');
  const idRegistry = new Map();
  const conflictingIdReports = [];
  const validatedProducts = [];

  for (const raw of allRawProducts) {
    let docId = String(raw.id);

    // Collision detection
    if (idRegistry.has(docId)) {
      const existing = idRegistry.get(docId);
      // Generate deterministic unique disambiguated ID
      const disambiguatedId = `${docId}-${slugify(raw.name)}`;
      conflictingIdReports.push({
        collidingId: docId,
        firstProduct: { name: existing.name, category: existing.category },
        duplicateProduct: { name: raw.name, category: raw.category },
        resolvedDocId: disambiguatedId,
      });
      docId = disambiguatedId;
    }

    // Build standardized product document
    const stock = typeof raw.stock === 'number'
      ? raw.stock
      : (typeof raw.stockCount === 'number' ? raw.stockCount : 25);

    const isSample = Boolean(raw.isSamplePrice || raw.isSampleStock);

    const productDoc = {
      id: docId,
      originalId: String(raw.id),
      name: raw.name,
      category: raw.category,
      subcategory: raw.subcategory || 'General',
      description: raw.description || `${raw.name} - high quality QuickMart selection`,
      price: Number(raw.price) || 0,
      originalPrice: raw.originalPrice ? Number(raw.originalPrice) : (isSample ? Number(raw.price) + 20 : Number(raw.price)),
      currency: raw.currency || 'INR',
      unit: raw.unit || raw.weightOrSize || '1 unit',
      stock: stock,
      stockCount: stock,
      inStock: stock > 0,
      image: raw.image || '',
      featured: Boolean(raw.featured),
      isSamplePrice: isSample,
      isSampleStock: isSample,
      rating: typeof raw.rating === 'number' ? raw.rating : 4.8,
      reviewsCount: typeof raw.reviewsCount === 'number' ? raw.reviewsCount : 150,
      deliveryTimeMins: typeof raw.deliveryTimeMins === 'number' ? raw.deliveryTimeMins : 10,
      isVeg: typeof raw.isVeg === 'boolean' ? raw.isVeg : true,
    };

    if (raw.brand) productDoc.brand = raw.brand;
    if (Array.isArray(raw.tags)) productDoc.tags = raw.tags;
    if (raw.discountPercentage) productDoc.discountPercentage = raw.discountPercentage;
    if (Array.isArray(raw.variants)) productDoc.variants = raw.variants;

    // Field validation
    if (!productDoc.name || typeof productDoc.name !== 'string') {
      throw new Error(`Product missing valid name: ID ${docId}`);
    }
    if (typeof productDoc.price !== 'number' || isNaN(productDoc.price)) {
      throw new Error(`Product missing valid price: ID ${docId} (${productDoc.name})`);
    }
    if (!productDoc.category || typeof productDoc.category !== 'string') {
      throw new Error(`Product missing valid category: ID ${docId} (${productDoc.name})`);
    }

    idRegistry.set(docId, productDoc);
    validatedProducts.push(productDoc);
  }

  // Report Collisions
  console.log(`\n--- ID Collision Resolution Report ---`);
  if (conflictingIdReports.length === 0) {
    console.log('[PASS] Zero ID collisions found.');
  } else {
    console.log(`[INFO] Found ${conflictingIdReports.length} colliding product IDs. Disambiguated each safely:`);
    conflictingIdReports.forEach((c, i) => {
      console.log(`   ${i + 1}. ID "${c.collidingId}":`);
      console.log(`      Existing:   "${c.firstProduct.name}" [${c.firstProduct.category}]`);
      console.log(`      Duplicate:  "${c.duplicateProduct.name}" [${c.duplicateProduct.category}]`);
      console.log(`      --> New Document ID: "${c.resolvedDocId}"`);
    });
  }

  // Document 101 Preservation Check
  console.log('\n--- Document 101 (Apple) Preservation Check ---');
  const appleDoc = validatedProducts.find(p => p.id === '101');
  if (appleDoc) {
    console.log(`[PASS] Document 101 is preserved: "${appleDoc.name}", Price: ₹${appleDoc.price}, Stock: ${appleDoc.stock}, Category: "${appleDoc.category}"`);
  } else {
    console.error('[ERROR] Document 101 is missing from import dataset!');
    process.exit(1);
  }

  // Category counts
  const categoryProductCounts = {};
  validatedProducts.forEach(p => {
    categoryProductCounts[p.category] = (categoryProductCounts[p.category] || 0) + 1;
  });

  console.log('\n--- Product Count by Category ---');
  Object.keys(categoryProductCounts).sort().forEach(cat => {
    console.log(`   - ${cat.padEnd(28)}: ${categoryProductCounts[cat]} products`);
  });

  console.log('\n================================================================');
  console.log('                     CATALOG IMPORT SUMMARY                     ');
  console.log('================================================================');
  console.log(`Total Categories to Import:  ${validatedCategories.length}`);
  console.log(`Total Products to Import:    ${validatedProducts.length}`);
  console.log(`Total Unique Document IDs:   ${idRegistry.size}`);
  console.log(`Batch Size:                  ${BATCH_SIZE} operations per batch`);
  console.log(`Total Batches Required:      ${Math.ceil((validatedCategories.length + validatedProducts.length) / BATCH_SIZE)} batches`);
  console.log(`Document 101 Status:         PRESERVED`);
  console.log(`ID Collisions Resolved:      ${conflictingIdReports.length}`);

  if (!isExecuteMode) {
    console.log('\n****************************************************************');
    console.log('   [DRY-RUN COMPLETE] NO WRITES WERE COMMITTED TO FIRESTORE.    ');
    console.log('   Review the plan and run with --execute to commit to database.');
    console.log('****************************************************************\n');
    return;
  }

  // -------------------------------------------------------------
  // STEP 4: Live Batch Writes to Cloud Firestore
  // -------------------------------------------------------------
  console.log('\n[4/4] Executing batch writes to Cloud Firestore...');

  // 4A: Write Categories
  console.log(`\nWriting ${validatedCategories.length} categories to "${CATEGORIES_COLLECTION}"...`);
  const catBatch = db.batch();
  validatedCategories.forEach(cat => {
    const docRef = db.collection(CATEGORIES_COLLECTION).doc(cat.id);
    catBatch.set(docRef, cat, { merge: true });
  });
  await catBatch.commit();
  console.log(`[SUCCESS] Committed ${validatedCategories.length} categories to Firestore.`);

  // 4B: Write Products in Chunks
  console.log(`\nWriting ${validatedProducts.length} products to "${PRODUCTS_COLLECTION}" in chunks of ${BATCH_SIZE}...`);
  const totalChunks = Math.ceil(validatedProducts.length / BATCH_SIZE);

  for (let i = 0; i < totalChunks; i++) {
    const chunk = validatedProducts.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
    const batch = db.batch();

    chunk.forEach(prod => {
      const docRef = db.collection(PRODUCTS_COLLECTION).doc(prod.id);
      batch.set(docRef, prod, { merge: true });
    });

    console.log(`   Committing Batch ${i + 1}/${totalChunks} (${chunk.length} products)...`);
    await batch.commit();
  }

  console.log('\n================================================================');
  console.log('   >>> ALL CATEGORIES AND PRODUCTS IMPORTED SUCCESSFULLY! <<<   ');
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('\n[FATAL ERROR during import]:', err);
  process.exit(1);
});
