const ts = require('../node_modules/typescript');
const fs = require('fs');
const path = require('path');

function requireTs(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const result = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
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

const catMod = requireTs(path.resolve(__dirname, '../src/data/categories.ts'));
const categories = catMod.ALL_28_CATEGORIES || [];

console.log('=== 28 CATEGORIES SUMMARY ===');
categories.forEach((cat, index) => {
  console.log(`${index + 1}. [${cat.id}] "${cat.name}"`);
  console.log(`   Image: ${cat.image || '(None)'}`);
  console.log(`   Description: ${cat.description || '(None)'}`);
  console.log(`   Subcategories (${cat.subcategories?.length || 0}): ${cat.subcategories?.slice(0, 4).join(', ')}...`);
});

const prodMod = requireTs(path.resolve(__dirname, '../src/data/products.ts'));
const prods = prodMod.PRODUCTS || [];
const fruits = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/data/quickmart_fruits.json'), 'utf8'));

console.log('\n=== PRODUCT COUNTS ===');
console.log('Products in products.ts:', prods.length);
console.log('Fruits in quickmart_fruits.json:', fruits.length);
