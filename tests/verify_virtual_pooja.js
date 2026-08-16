const fs = require('fs');
const path = require('path');
const vm = require('vm');
const http = require('http');

console.log('================================================================');
console.log('   MILESTONE 4: VIRTUAL POOJA SANCTUM VERIFICATION             ');
console.log('================================================================\n');

let failed = false;

function pass(msg) { console.log(`  ✔ [PASS] ${msg}`); }
function fail(msg) { console.error(`  ❌ [FAIL] ${msg}`); failed = true; }

// 1. Assets Check
console.log('1. Image Assets Check:');
const vpA = path.join(__dirname, '..', 'assets', 'images', 'vp_a.jpeg');
const vpB = path.join(__dirname, '..', 'assets', 'images', 'vp_b.jpeg');
const vpCover = path.join(__dirname, '..', 'assets', 'images', 'pooja.jpg');

if (fs.existsSync(vpA)) {
  pass(`vp_a.jpeg exists (${(fs.statSync(vpA).size / 1024).toFixed(1)} KB)`);
} else {
  fail('Missing assets/images/vp_a.jpeg');
}

if (fs.existsSync(vpB)) {
  pass(`vp_b.jpeg exists (${(fs.statSync(vpB).size / 1024).toFixed(1)} KB)`);
} else {
  fail('Missing assets/images/vp_b.jpeg');
}

if (fs.existsSync(vpCover)) {
  pass(`pooja.jpg exists (${(fs.statSync(vpCover).size / 1024).toFixed(1)} KB)`);
} else {
  fail('Missing assets/images/pooja.jpg');
}

// 2. index.html Structure Check
console.log('\n2. index.html Structure Check:');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

const requiredElements = [
  'id="pooja-view"',
  'id="pooja-welcome-modal"',
  'id="seva-card-abhisheka"',
  'id="seva-card-mahapooja"',
  'id="btn-enter-abhisheka"',
  'id="btn-enter-mahapooja"',
  'id="pooja-back-to-home-btn"',
  'id="pooja-tab-abhisheka"',
  'id="pooja-tab-mahapooja"',
  'id="pooja-tanpura-toggle"',
  'id="pooja-sfx-toggle"',
  'id="pooja-change-seva-btn"',
  'id="pooja-deity-img"',
  'id="pooja-effects-canvas"',
  'id="pooja-aarti-overlay"',
  'id="pooja-dhoop-overlay"',
  'id="pooja-tilak-overlay"',
  'id="pooja-tulsi-overlay"',
  'id="pooja-naivedya-overlay"',
  'id="pooja-abhisheka-tray"',
  'id="pooja-mahapooja-tray"',
  'id="pooja-complete-btn"',
  'id="btn-offer-milk"',
  'id="btn-offer-water"',
  'id="btn-offer-honey"',
  'id="btn-offer-flowers-abh"',
  'id="btn-offer-dhoop-abh"',
  'id="btn-offer-aarti-abh"',
  'id="btn-offer-gandha"',
  'id="btn-offer-tulsi"',
  'id="btn-offer-dhoop-maha"',
  'id="btn-offer-naivedya"',
  'id="btn-offer-flowers-maha"',
  'id="btn-offer-bell"',
  'id="btn-offer-maha-aarti"',
  'id="pooja-ticker-text"'
];

requiredElements.forEach(el => {
  if (html.includes(el)) {
    pass(`Element present: ${el}`);
  } else {
    fail(`Missing element in index.html: ${el}`);
  }
});

// 3. css/main.css Check
console.log('\n3. css/main.css Check:');
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'main.css'), 'utf8');
const requiredCss = [
  '.pooja-view',
  '.pooja-top-nav',
  '.pooja-two-column-layout',
  '.pooja-sidebar-dock',
  '.offering-dock-card',
  '.pooja-seva-switcher',
  '.pooja-tab-btn',
  '.pooja-shrine-frame',
  '.pooja-deity-container',
  '.pooja-effects-canvas',
  '.pooja-aarti-overlay',
  '.pooja-dhoop-overlay',
  '.golden-naivedya-thal-svg',
  '.sacred-golden-thal-container',
  '.pooja-dialog',
  '.pooja-seva-cards-grid'
];

requiredCss.forEach(c => {
  if (css.includes(c)) {
    pass(`CSS class present: ${c}`);
  } else {
    fail(`Missing CSS class in main.css: ${c}`);
  }
});

// 4. js/app.js V8 Syntax & Features Check
console.log('\n4. js/app.js Syntax & Logic Check:');
const appJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
try {
  new vm.Script(appJs);
  pass('js/app.js: V8 syntax check passed.');
} catch (e) {
  fail(`js/app.js syntax error: ${e.message}`);
}

const requiredJsTerms = [
  'initVirtualPooja',
  'startTanpura',
  'playBellSound',
  'playPouringSound',
  'playDhoopSound',
  'handleDhoopOffering',
  'scatterSettledFlowers',
  'startAarti',
  'stopAarti',
  'वसुदेवसुतं देवं कंसचाणूरमर्दनम्',
  'BotanicalParticle',
  'settledPetals',
  'flowerOfferingCount',
  'showPoojaView',
  'vp_a.jpeg',
  'vp_b.jpeg'
];

requiredJsTerms.forEach(term => {
  if (appJs.includes(term)) {
    pass(`JS logic element present: ${term}`);
  } else {
    fail(`Missing JS logic element: ${term}`);
  }
});

// 5. HTTP Endpoints Check
console.log('\n5. HTTP Endpoints Check (http://localhost:8080):');
const urls = [
  'http://localhost:8080/',
  'http://localhost:8080/css/main.css',
  'http://localhost:8080/js/app.js',
  'http://localhost:8080/assets/images/vp_a.jpeg',
  'http://localhost:8080/assets/images/vp_b.jpeg',
  'http://localhost:8080/assets/images/pooja.jpg'
];

let pending = urls.length;
let httpFails = 0;

urls.forEach(u => {
  http.get(u, res => {
    let size = 0;
    res.on('data', chunk => size += chunk.length);
    res.on('end', () => {
      pending--;
      if (res.statusCode === 200) {
        pass(`[200 OK] (${(size / 1024).toFixed(1)} KB) -> ${u}`);
      } else {
        fail(`[${res.statusCode}] -> ${u}`);
        httpFails++;
      }
      if (pending === 0) finish();
    });
  }).on('error', err => {
    pending--;
    fail(`Network error on ${u}: ${err.message}`);
    httpFails++;
    if (pending === 0) finish();
  });
});

function finish() {
  console.log('\n================================================================');
  console.log('   VERIFICATION SUMMARY                                        ');
  console.log('================================================================');
  if (failed || httpFails > 0) {
    console.error('❌ Virtual Pooja verification failed.');
    process.exit(1);
  } else {
    console.log('🌟 ALL VIRTUAL POOJA TESTS PASSED WITH 100% SUCCESS! 🌟');
    process.exit(0);
  }
}
