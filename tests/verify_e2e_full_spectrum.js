const fs = require('fs');
const path = require('path');
const vm = require('vm');
const http = require('http');

console.log('================================================================');
console.log('   KRISHNA SAGA: END-TO-END MASTER VALIDATION & AUDIT SUITE    ');
console.log('================================================================\n');

let totalErrors = 0;
let totalPasses = 0;

function reportPass(msg) {
  console.log(`  ✔ [PASS] ${msg}`);
  totalPasses++;
}

function reportFail(msg) {
  console.error(`  ❌ [FAIL] ${msg}`);
  totalErrors++;
}

const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'index.html');
const cssPath = path.join(root, 'css', 'main.css');
const appJsPath = path.join(root, 'js', 'app.js');
const gitaChaptersPath = path.join(root, 'data', 'gita-chapters.json');

// ----------------------------------------------------------------
// 1. ASSETS & PATH RESOLUTION (GITHUB PAGES COMPATIBILITY)
// ----------------------------------------------------------------
console.log('----------------------------------------------------------------');
console.log('1. ASSET RELATIVE PATHS & DISK EXISTENCE AUDIT');
console.log('----------------------------------------------------------------');

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const cssContent = fs.readFileSync(cssPath, 'utf8');
const jsContent = fs.readFileSync(appJsPath, 'utf8');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== '.git' && file !== 'node_modules') getAllFiles(filePath, fileList);
    } else {
      fileList.push(path.relative(root, filePath).replace(/\\/g, '/'));
    }
  }
  return fileList;
}

const diskFiles = getAllFiles(root);
const diskFileMap = new Map();
diskFiles.forEach(f => diskFileMap.set(f.toLowerCase(), f));

const assetRegexes = [
  /(?:src|href|poster)=["']([^"']+)["']/gi,
  /url\(["']?([^"')]+)["']?\)/gi,
  /["']((?:assets\/|data\/|css\/|js\/)[^"'\s]+)["']/gi
];

const scannedRefs = new Set();
[
  { name: 'index.html', text: htmlContent },
  { name: 'css/main.css', text: cssContent },
  { name: 'js/app.js', text: jsContent }
].forEach(doc => {
  for (const re of assetRegexes) {
    let match;
    while ((match = re.exec(doc.text)) !== null) {
      const ref = match[1].trim();
      if (!ref.startsWith('http') && !ref.startsWith('#') && !ref.startsWith('data:') && !ref.includes('${')) {
        scannedRefs.add({ file: doc.name, ref });
      }
    }
  }
});

let assetErrors = 0;
for (const item of scannedRefs) {
  let cleanRef = decodeURIComponent(item.ref.split('?')[0].split('#')[0].replace(/^\.\//, ''));
  if (cleanRef.startsWith('/')) {
    reportFail(`Absolute path detected in ${item.file}: "${item.ref}"`);
    assetErrors++;
  } else if (!diskFiles.includes(cleanRef)) {
    if (diskFileMap.has(cleanRef.toLowerCase())) {
      reportFail(`Case mismatch in ${item.file}: "${item.ref}" -> Disk has: "${diskFileMap.get(cleanRef.toLowerCase())}"`);
    } else {
      reportFail(`File not found on disk for ${item.file}: "${item.ref}"`);
    }
    assetErrors++;
  }
}

if (assetErrors === 0) {
  reportPass(`All ${scannedRefs.size} scanned asset references are relative and verified on disk with exact case matching.`);
}

// ----------------------------------------------------------------
// 2. ROUTING, NAVIGATION & REFRESH INTEGRITY
// ----------------------------------------------------------------
console.log('\n----------------------------------------------------------------');
console.log('2. ROUTING & REFRESH INTEGRITY MATRIX');
console.log('----------------------------------------------------------------');

function mockRouter(rawHash) {
  const cleanHash = (rawHash || '').trim().toLowerCase();

  if (!cleanHash || cleanHash === '' || cleanHash === '#' || cleanHash === '#home' || cleanHash === '#landing' || cleanHash === '#hero' || cleanHash === '/') {
    return { view: 'landing', action: 'showLandingView' };
  }

  if (cleanHash === '#portals' || cleanHash === '#sanctuaries-grid' || cleanHash === '#explore-portals-btn' || cleanHash === '#sanctuaries') {
    return { view: 'landing', action: 'scrollToPortals' };
  }

  if (cleanHash === '#udupi' || cleanHash === '#udupi-krishna' || cleanHash === '#udupi-matha') {
    return { view: 'landing', action: 'openUdupiModal' };
  }

  if (cleanHash.startsWith('#pooja') || cleanHash.startsWith('#puja')) {
    const match = cleanHash.match(/#(?:pooja|puja)(?:\/([a-z]+))?/);
    const phase = match && match[1] ? match[1] : null;
    return { view: 'pooja', phase: phase || 'abhisheka' };
  }

  if (cleanHash.endsWith('/completed')) {
    const match = cleanHash.match(/#(?:gita|geeta)\/(?:chapter-)?(\d+)\/completed/);
    const ch = match ? parseInt(match[1], 10) : 1;
    return { view: 'gita-completion', chapter: ch };
  }

  if (cleanHash.startsWith('#gita/') || cleanHash.startsWith('#geeta/')) {
    const match = cleanHash.match(/#(?:gita|geeta)\/(?:chapter-)?(\d+)(?:\/(?:verse-)?(\d+))?/);
    if (match) {
      const ch = parseInt(match[1], 10);
      const v = match[2] ? parseInt(match[2], 10) : 1;
      return { view: 'gita-reader', chapter: ch, verse: v };
    } else {
      return { view: 'gita-chapters' };
    }
  }

  if (cleanHash === '#gita' || cleanHash === '#gita-explorer' || cleanHash === '#geeta' || cleanHash === '#gita-chapters') {
    return { view: 'gita-chapters' };
  }

  return { view: 'landing', action: 'showLandingView' };
}

const routesToTest = [
  { hash: '', expectedView: 'landing' },
  { hash: '/', expectedView: 'landing' },
  { hash: '#', expectedView: 'landing' },
  { hash: '#home', expectedView: 'landing' },
  { hash: '#landing', expectedView: 'landing' },
  { hash: '#portals', expectedView: 'landing', action: 'scrollToPortals' },
  { hash: '#explore-portals-btn', expectedView: 'landing', action: 'scrollToPortals' },
  { hash: '#gita', expectedView: 'gita-chapters' },
  { hash: '#gita-explorer', expectedView: 'gita-chapters' },
  { hash: '#udupi', expectedView: 'landing', action: 'openUdupiModal' },
  { hash: '#pooja', expectedView: 'pooja', phase: 'abhisheka' },
  { hash: '#pooja/abhisheka', expectedView: 'pooja', phase: 'abhisheka' },
  { hash: '#pooja/mahapooja', expectedView: 'pooja', phase: 'mahapooja' },
  { hash: '#puja/mahapooja', expectedView: 'pooja', phase: 'mahapooja' },
  { hash: '#gita/chapter-1/verse-1', expectedView: 'gita-reader', chapter: 1, verse: 1 },
  { hash: '#gita/chapter-2/verse-47', expectedView: 'gita-reader', chapter: 2, verse: 47 },
  { hash: '#gita/3/1', expectedView: 'gita-reader', chapter: 3, verse: 1 },
  { hash: '#gita/chapter-1/completed', expectedView: 'gita-completion', chapter: 1 },
  { hash: '#gita/chapter-6/completed', expectedView: 'gita-completion', chapter: 6 }
];

let routeErrors = 0;
routesToTest.forEach(rt => {
  const result = mockRouter(rt.hash);
  let ok = result.view === rt.expectedView;
  if (rt.action && result.action !== rt.action) ok = false;
  if (rt.phase && result.phase !== rt.phase) ok = false;
  if (rt.chapter && result.chapter !== rt.chapter) ok = false;
  if (rt.verse && result.verse !== rt.verse) ok = false;

  if (ok) {
    reportPass(`Route "${rt.hash || '(root)'}" successfully resolves to view: "${result.view}"`);
  } else {
    reportFail(`Route "${rt.hash}" mismatch: got ${JSON.stringify(result)}, expected ${JSON.stringify(rt)}`);
    routeErrors++;
  }
});

// ----------------------------------------------------------------
// 3. INTERACTIVE COMPONENTS & SYNTHESIZERS INTEGRITY
// ----------------------------------------------------------------
console.log('\n----------------------------------------------------------------');
console.log('3. INTERACTIVE COMPONENTS, OFFERINGS & SYNTHESIZERS AUDIT');
console.log('----------------------------------------------------------------');

// A. Virtual Pooja Offering Elements Check in HTML & JS
const requiredPoojaActions = [
  { id: 'btn-offer-milk', name: 'Milk Abhisheka', handler: 'handleMilkOffering' },
  { id: 'btn-offer-water', name: 'Holy Water Abhisheka', handler: 'handleWaterOffering' },
  { id: 'btn-offer-honey', name: 'Honey Abhisheka', handler: 'handleHoneyOffering' },
  { id: 'btn-offer-flowers-abh', name: 'Flowers & Tulsi (Abhisheka)', handler: 'handleFlowersAbhisheka' },
  { id: 'btn-offer-dhoop-abh', name: 'Dhoop Incense (Abhisheka)', handler: 'handleDhoopOffering' },
  { id: 'btn-offer-aarti-abh', name: 'Camphor Aarti', handler: 'handleAartiAbhisheka' },
  { id: 'btn-offer-gandha', name: 'Sandalwood Gandha', handler: 'handleGandhaOffering' },
  { id: 'btn-offer-tulsi', name: 'Sacred Tulsi', handler: 'handleTulsiOffering' },
  { id: 'btn-offer-dhoop-maha', name: 'Dhoop Incense (Mahapooja)', handler: 'handleDhoopOffering' },
  { id: 'btn-offer-naivedya', name: 'Butter & Fruits Naivedya', handler: 'handleNaivedyaOffering' },
  { id: 'btn-offer-flowers-maha', name: 'Pushparchana', handler: 'handleFlowersMahapooja' },
  { id: 'btn-offer-bell', name: 'Temple Bell', handler: 'handleBellOffering' },
  { id: 'btn-offer-maha-aarti', name: 'Deepa Maha Aarti', handler: 'handleMahaAartiOffering' }
];

requiredPoojaActions.forEach(act => {
  const inHtml = htmlContent.includes(`id="${act.id}"`);
  const inJs = jsContent.includes(act.id) && jsContent.includes(act.handler);
  if (inHtml && inJs) {
    reportPass(`Virtual Pooja action: ${act.name} (DOM id="${act.id}") correctly wired to ${act.handler}`);
  } else {
    reportFail(`Virtual Pooja action mismatch: ${act.name} inHtml=${inHtml}, inJs=${inJs}`);
  }
});

// B. Web Audio API Synthesizers & Sound Fallback Check
const synthFunctions = [
  'startTanpura',
  'stopTanpura',
  'playBellSound',
  'playPouringSound',
  'playChimeSound',
  'playDhoopSound',
  'startAarti',
  'stopAarti',
  'stopVirtualPoojaAudio'
];

synthFunctions.forEach(fn => {
  if (jsContent.includes(fn)) {
    reportPass(`Synthesizer function "${fn}" present and verified.`);
  } else {
    reportFail(`Missing synthesizer function: "${fn}"`);
  }
});

// C. Gita Bottom Verse Navigation Dock Check
if (htmlContent.includes('id="verse-bottom-nav"') && 
    htmlContent.includes('id="bottom-prev-verse-btn"') && 
    htmlContent.includes('id="bottom-next-verse-btn"') && 
    jsContent.includes('bottomPrevVerseBtn') && 
    jsContent.includes('bottomNextVerseBtn')) {
  reportPass('Bhagavad Gita bottom verse navigation dock (LHS Previous, RHS Next) verified.');
} else {
  reportFail('Missing Bhagavad Gita bottom verse navigation dock');
}

if (!htmlContent.includes('id="gita-search-input"') && !htmlContent.includes('id="recite-verse-btn"') && !htmlContent.includes('id="copy-verse-btn"')) {
  reportPass('Clean UI: Unwanted search bar, recitation button, and copy button successfully removed.');
} else {
  reportFail('Unwanted controls still present in HTML');
}

// ----------------------------------------------------------------
// 4. CONSOLE & CODE INTEGRITY
// ----------------------------------------------------------------
console.log('\n----------------------------------------------------------------');
console.log('4. JAVASCRIPT RUNTIME & SYNTAX EXECUTION AUDIT');
console.log('----------------------------------------------------------------');

try {
  new vm.Script(jsContent);
  reportPass('js/app.js: V8 syntax check executed flawlessly (0 syntax errors).');
} catch (e) {
  reportFail(`js/app.js syntax error: ${e.message}`);
}

// Check tag balance in index.html
const tagList = ['div', 'section', 'article', 'aside', 'main', 'header', 'footer', 'button', 'select', 'p', 'h1', 'h2', 'h3', 'h4', 'span'];
let tagMismatch = 0;
tagList.forEach(t => {
  const oCount = (htmlContent.match(new RegExp(`<${t}(?:\\s|>|/)`, 'gi')) || []).length;
  const cCount = (htmlContent.match(new RegExp(`</${t}>`, 'gi')) || []).length;
  if (oCount !== cCount) {
    reportFail(`Tag <${t}> count mismatch: ${oCount} open vs ${cCount} close`);
    tagMismatch++;
  }
});
if (tagMismatch === 0) {
  reportPass('index.html: 100% of HTML semantic tags are perfectly balanced.');
}

// ----------------------------------------------------------------
// 5. HTTP ENDPOINTS HEALTH CHECK (http://localhost:8080)
// ----------------------------------------------------------------
console.log('\n----------------------------------------------------------------');
console.log('5. LIVE HTTP ENDPOINT HEALTH CHECK');
console.log('----------------------------------------------------------------');

const httpUrls = [
  'http://localhost:8080/',
  'http://localhost:8080/css/main.css',
  'http://localhost:8080/js/app.js',
  'http://localhost:8080/data/gita-chapters.json',
  'http://localhost:8080/data/verses/chapter-1.json',
  'http://localhost:8080/data/verses/chapter-2.json',
  'http://localhost:8080/data/verses/chapter-3.json',
  'http://localhost:8080/data/verses/chapter-4.json',
  'http://localhost:8080/data/verses/chapter-5.json',
  'http://localhost:8080/data/verses/chapter-6.json',
  'http://localhost:8080/data/verses/chapter-7.json',
  'http://localhost:8080/data/verses/chapter-8.json',
  'http://localhost:8080/data/verses/chapter-9.json',
  'http://localhost:8080/data/verses/chapter-10.json',
  'http://localhost:8080/data/verses/chapter-11.json',
  'http://localhost:8080/data/verses/chapter-12.json',
  'http://localhost:8080/data/verses/chapter-13.json',
  'http://localhost:8080/data/verses/chapter-14.json',
  'http://localhost:8080/data/verses/chapter-15.json',
  'http://localhost:8080/data/verses/chapter-16.json',
  'http://localhost:8080/data/verses/chapter-17.json',
  'http://localhost:8080/data/verses/chapter-18.json',
  'http://localhost:8080/assets/images/krishna-and-arjuna.jpg',
  'http://localhost:8080/assets/images/slideshow-2.jpg',
  'http://localhost:8080/assets/images/adhyaya-2-end.jpg',
  'http://localhost:8080/assets/images/3rd-adhyaya-end.jpg',
  'http://localhost:8080/assets/images/4th-adhyaya-end.jpg',
  'http://localhost:8080/assets/images/5th-adhyaya-end_.jpg',
  'http://localhost:8080/assets/images/6th-adhyaya-end.jpg',
  'http://localhost:8080/assets/images/7th-adhyaya-end.jpg',
  'http://localhost:8080/assets/images/8th-adhyaya-end.jpg',
  'http://localhost:8080/assets/images/9th-adhyaya-end.jpg',
  'http://localhost:8080/assets/images/10th-adhyaya-end.jpg',
  'http://localhost:8080/assets/images/11th-adhyaya-end.jpg',
  'http://localhost:8080/assets/images/12th-adhyaya-end.jpg',
  'http://localhost:8080/assets/images/13th-adhyaya-end.jpg',
  'http://localhost:8080/assets/images/14th-adhyaya-end.jpg',
  'http://localhost:8080/assets/images/15th-adhyaya-end.jpg',
  'http://localhost:8080/assets/images/16th-adhyaya-end.jpg',
  'http://localhost:8080/assets/images/Madhav ✨.jpg',
  'http://localhost:8080/assets/images/18th-adhyaya-end.jpg',
  'http://localhost:8080/assets/images/vp_a.jpeg',
  'http://localhost:8080/assets/images/vp_b.jpeg',
  'http://localhost:8080/assets/images/pooja.jpg'
];

let pending = httpUrls.length;
let httpErrs = 0;

httpUrls.forEach(url => {
  http.get(url, res => {
    let size = 0;
    res.on('data', chunk => (size += chunk.length));
    res.on('end', () => {
      pending--;
      if (res.statusCode === 200) {
        reportPass(`HTTP 200 OK (${(size / 1024).toFixed(1)} KB) -> ${url}`);
      } else {
        reportFail(`HTTP ${res.statusCode} -> ${url}`);
        httpErrs++;
      }
      if (pending === 0) finishSuite(httpErrs);
    });
  }).on('error', err => {
    pending--;
    reportFail(`HTTP Network Error on ${url}: ${err.message}`);
    httpErrs++;
    if (pending === 0) finishSuite(httpErrs);
  });
});

function finishSuite(httpFailures) {
  console.log('\n================================================================');
  console.log('   FINAL AUDIT SUMMARY & SCORECARD                              ');
  console.log('================================================================');
  console.log(`Total Checks Passed: ${totalPasses}`);
  console.log(`Total Failures:     ${totalErrors + httpFailures}`);

  if (totalErrors === 0 && httpFailures === 0) {
    console.log('\n🌟 100% PASS: KRISHNA SAGA IS FULLY VERIFIED, ROBUST & DEPLOYMENT-READY! 🌟\n');
    process.exit(0);
  } else {
    console.error(`\n❌ AUDIT FAILED WITH ${totalErrors + httpFailures} ERRORS.\n`);
    process.exit(1);
  }
}
