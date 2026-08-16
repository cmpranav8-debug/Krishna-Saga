const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
let anomalies = [];
let passCount = 0;

function logPass(msg) {
  passCount++;
  console.log(`  ✔ [PASS] ${msg}`);
}

function logAnomaly(type, msg) {
  anomalies.push({ type, msg });
  console.error(`  ❌ [ANOMALY - ${type}] ${msg}`);
}

console.log('================================================================');
console.log('   DEEP EXHAUSTIVE SCAN: KRISHNA SAGA CODEBASE');
console.log('================================================================\n');

// 1. READ ALL RELEVANT FILES
const indexHtmlPath = path.join(rootDir, 'index.html');
const appJsPath = path.join(rootDir, 'js', 'app.js');
const serverJsPath = path.join(rootDir, 'server.js');
const cssPath = path.join(rootDir, 'css', 'main.css');

const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
const appJs = fs.readFileSync(appJsPath, 'utf8');
const serverJs = fs.readFileSync(serverJsPath, 'utf8');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// 2. EXTRACT ALL DOM IDs IN index.html
console.log('--- 1. DOM ID MAPPING & INTEGRITY CHECK ---');
const htmlIdRegex = /id=["']([^"']+)["']/g;
const htmlIds = new Set();
let match;
while ((match = htmlIdRegex.exec(indexHtml)) !== null) {
  htmlIds.add(match[1]);
}
logPass(`Indexed ${htmlIds.size} unique DOM IDs from index.html`);

// Extract all getElementById in app.js
const getElementByIdRegex = /getElementById\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
const appJsGetElementByIds = new Set();
while ((match = getElementByIdRegex.exec(appJs)) !== null) {
  appJsGetElementByIds.add(match[1]);
}
logPass(`Found ${appJsGetElementByIds.size} distinct getElementById references in js/app.js`);

// Check if each getElementById in app.js exists in index.html
appJsGetElementByIds.forEach(id => {
  if (htmlIds.has(id)) {
    logPass(`DOM ID exists: "${id}"`);
  } else {
    // Note: Some elements might be dynamically generated in app.js. Check if generated dynamically.
    const dynamicallyCreated = appJs.includes(`id = '${id}'`) || appJs.includes(`id = "${id}"`) || appJs.includes(`id="${id}"`) || appJs.includes(`id='${id}'`);
    if (dynamicallyCreated) {
      logPass(`DOM ID is dynamically created in app.js: "${id}"`);
    } else {
      logAnomaly('MISSING_DOM_ID', `js/app.js references getElementById("${id}") but it is NOT found in index.html and not dynamically created`);
    }
  }
});

// Extract querySelector with #id in app.js
const querySelectorIdRegex = /querySelector\(\s*['"`]#([^'"` >.:\[]+)['"`]\s*\)/g;
while ((match = querySelectorIdRegex.exec(appJs)) !== null) {
  const id = match[1];
  if (htmlIds.has(id)) {
    logPass(`querySelector ID exists: "#${id}"`);
  } else {
    logAnomaly('MISSING_QS_ID', `js/app.js references querySelector("#${id}") but it is NOT found in index.html`);
  }
}

// 3. EVENT LISTENERS AND NULL SAFETY CHECK
console.log('\n--- 2. EVENT LISTENER & BINDING INTEGRITY CHECK ---');
// Scan for pattern: const elem = document.getElementById('xyz'); elem.addEventListener...
// or document.getElementById('xyz')?.addEventListener / .addEventListener
const addListenerPattern = /(?:document\.getElementById\(['"]([^'"]+)['"]\)|([a-zA-Z0-9_$]+))\s*\.\s*addEventListener/g;
let listenerMatch;
while ((listenerMatch = addListenerPattern.exec(appJs)) !== null) {
  if (listenerMatch[1]) {
    const id = listenerMatch[1];
    if (!htmlIds.has(id)) {
      logAnomaly('UNSAFE_EVENT_LISTENER', `Direct addEventListener on document.getElementById("${id}") without checking null, and ID is missing in HTML!`);
    } else {
      logPass(`Direct addEventListener safely bound to existing ID "${id}"`);
    }
  }
}

// 4. SCAN ALL ASSET PATHS IN HTML, JS, CSS, JSON
console.log('\n--- 3. ASSET PATH & RESOURCE EXISTENCE AUDIT ---');

function checkAssetFile(relPath, sourceFile) {
  // Normalize path
  if (relPath.startsWith('/')) relPath = relPath.slice(1);
  // remove query or hash
  relPath = relPath.split('?')[0].split('#')[0];
  if (!relPath || relPath.startsWith('http://') || relPath.startsWith('https://') || relPath.startsWith('data:')) {
    return;
  }
  const diskPath = path.join(rootDir, decodeURIComponent(relPath));
  if (fs.existsSync(diskPath)) {
    logPass(`Asset resolved: "${relPath}" (from ${sourceFile})`);
  } else {
    logAnomaly('BROKEN_ASSET_PATH', `Asset file not found on disk: "${relPath}" referenced in ${sourceFile}`);
  }
}

// Scan index.html for src, href
const htmlSrcRegex = /(?:src|href)=["']([^"']+)["']/g;
while ((match = htmlSrcRegex.exec(indexHtml)) !== null) {
  const asset = match[1];
  if (!asset.startsWith('http') && !asset.startsWith('#') && !asset.startsWith('mailto:')) {
    checkAssetFile(asset, 'index.html');
  }
}

// Scan CSS url(...)
const cssUrlRegex = /url\(\s*['"]?([^'")]+)['"]?\s*\)/g;
while ((match = cssUrlRegex.exec(cssContent)) !== null) {
  const asset = match[1];
  if (!asset.startsWith('http') && !asset.startsWith('data:')) {
    // Relative to css folder
    let target = asset;
    if (asset.startsWith('../')) {
      target = asset.replace('../', '');
    } else if (asset.startsWith('./')) {
      target = 'css/' + asset.replace('./', '');
    }
    checkAssetFile(target, 'css/main.css');
  }
}

// Scan JS for image/audio/data paths
const jsAssetRegex = /['"`](assets\/[^'"`]+|data\/[^'"`]+)['"`]/g;
while ((match = jsAssetRegex.exec(appJs)) !== null) {
  if (!match[1].includes('${')) {
    checkAssetFile(match[1], 'js/app.js');
  }
}

// Scan data/gita-chapters.json
const gitaChapters = JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'gita-chapters.json'), 'utf8'));
if (Array.isArray(gitaChapters)) {
  gitaChapters.forEach(ch => {
    if (ch.image_url) checkAssetFile(ch.image_url, 'data/gita-chapters.json');
  });
}

// Scan data/verses/chapter-*.json
for (let i = 1; i <= 7; i++) {
  const vPath = path.join(rootDir, 'data', 'verses', `chapter-${i}.json`);
  if (fs.existsSync(vPath)) {
    const vData = JSON.parse(fs.readFileSync(vPath, 'utf8'));
    logPass(`Chapter ${i} JSON valid: ${vData.verses ? vData.verses.length : 0} verses`);
  } else {
    logAnomaly('MISSING_CHAPTER_FILE', `Missing chapter file: ${vPath}`);
  }
}

// 5. EXAMINE JS APP LOGIC AND SYNTAX
console.log('\n--- 4. JS RUNTIME & SYNTAX CHECK ---');
const vm = require('vm');
try {
  new vm.Script(appJs);
  logPass('js/app.js passed V8 compilation test with 0 errors');
} catch (e) {
  logAnomaly('V8_COMPILATION_ERROR', `js/app.js failed compilation: ${e.message}`);
}

try {
  new vm.Script(serverJs);
  logPass('server.js passed V8 compilation test with 0 errors');
} catch (e) {
  logAnomaly('V8_COMPILATION_ERROR', `server.js failed compilation: ${e.message}`);
}

// Summary
console.log('\n================================================================');
console.log('   SCAN RESULTS SUMMARY');
console.log('================================================================');
console.log(`Total Checks Passed: ${passCount}`);
console.log(`Total Anomalies Detected: ${anomalies.length}`);

if (anomalies.length > 0) {
  console.log('\nList of Anomalies:');
  anomalies.forEach((a, idx) => console.log(` ${idx + 1}. [${a.type}] ${a.msg}`));
}
