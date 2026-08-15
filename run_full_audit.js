const fs = require('fs');
const path = require('path');
const vm = require('vm');
const http = require('http');

console.log('================================================================');
console.log('   KRISHNA SAGA: FULL-SPECTRUM MASTER DIAGNOSTIC & AUDIT       ');
console.log('================================================================\n');

let totalErrors = 0;
let totalWarnings = 0;

function reportPass(msg) {
  console.log(`  ✔ [PASS] ${msg}`);
}
function reportFail(msg) {
  console.error(`  ❌ [FAIL] ${msg}`);
  totalErrors++;
}
function reportWarn(msg) {
  console.warn(`  ⚠️ [WARN] ${msg}`);
  totalWarnings++;
}

// ================================================================
// 1. MILESTONE 1 AUDIT: HTML, CSS, CORE ASSETS, HERO SLIDESHOW
// ================================================================
console.log('----------------------------------------------------------------');
console.log('1. MILESTONE 1: HOMEPAGE, PORTAL, & VISUAL PIPELINE AUDIT');
console.log('----------------------------------------------------------------');

// A. index.html
const indexHtmlPath = path.join(__dirname, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  reportFail('index.html not found on disk');
} else {
  const html = fs.readFileSync(indexHtmlPath, 'utf8');
  reportPass('index.html exists and is readable.');

  // Check essential structural elements
  const essentialElements = [
    'id="landing-view"',
    'id="gita-view"',
    'id="gita-chapters-view"',
    'id="gita-reader-view"',
    'id="gita-completion-view"',
    'id="hero-image"',
    'id="hero-slides-track"',
    'class="hero-sacred-frame"',
    'class="completion-hero-art-frame"',
    'class="completion-dedication-banner"',
    'class="completion-dedication-text"',
    'id="verse-number-tabs"',
    'id="verse-quick-select"',
    'id="prev-verse-btn"',
    'id="next-verse-btn"',
    'id="translit-toggle-btn"'
  ];

  essentialElements.forEach(el => {
    if (html.includes(el)) {
      reportPass(`Found structural element: ${el}`);
    } else {
      reportFail(`Missing structural element in index.html: ${el}`);
    }
  });

  // Verify removed obsolete slideshow controls are indeed absent
  const obsoleteElements = [
    'id="hero-slide-badge"',
    'id="hero-slide-prev-btn"',
    'id="hero-slide-next-btn"',
    'id="hero-slide-dots"'
  ];
  obsoleteElements.forEach(obs => {
    if (!html.includes(obs)) {
      reportPass(`Obsolete element correctly absent: ${obs}`);
    } else {
      reportFail(`Obsolete element still present in index.html: ${obs}`);
    }
  });
}

// B. css/main.css
const cssPath = path.join(__dirname, 'css', 'main.css');
if (!fs.existsSync(cssPath)) {
  reportFail('css/main.css not found on disk');
} else {
  const css = fs.readFileSync(cssPath, 'utf8');
  reportPass(`css/main.css exists (${(css.length / 1024).toFixed(1)} KB).`);

  // Verify key animations and classes
  const keyRules = [
    '.hero-slide-img',
    '.hero-slide-img.active',
    '.gita-chapter-card',
    '.verse-tab-btn',
    '.completion-card',
    '.completion-hero-art-frame',
    '.completion-dedication-banner'
  ];
  keyRules.forEach(rule => {
    if (css.includes(rule)) {
      reportPass(`CSS rule present: ${rule}`);
    } else {
      reportFail(`Missing CSS rule: ${rule}`);
    }
  });
}

// C. Slideshow Images in assets/images/Slideshow images/
const slideshowDir = path.join(__dirname, 'assets', 'images', 'Slideshow images');
if (!fs.existsSync(slideshowDir)) {
  reportFail('Slideshow directory missing: assets/images/Slideshow images');
} else {
  const slideFiles = fs.readdirSync(slideshowDir);
  reportPass(`Found ${slideFiles.length} files in Slideshow images directory.`);
  
  const expectedSlides = [
    'udupi-krishna-hero.jpg',
    'WhatsApp Image 2026-08-15 at 11.33.34.jpeg',
    'WhatsApp Image 2026-08-15 at 11.33.35.jpeg',
    'WhatsApp Image 2026-08-15 at 11.33.35 (1).jpeg',
    'WhatsApp Image 2026-08-15 at 11.33.35 (2).jpeg',
    'WhatsApp Image 2026-08-15 at 11.33.36.jpeg',
    'WhatsApp Image 2026-08-15 at 11.34.17.jpeg'
  ];

  expectedSlides.forEach((slide, idx) => {
    const p = path.join(slideshowDir, slide);
    if (fs.existsSync(p)) {
      const sz = fs.statSync(p).size;
      reportPass(`Slide ${idx + 1}: "${slide}" exists (${(sz / 1024).toFixed(1)} KB)`);
    } else {
      reportFail(`Missing slide image: "${slide}"`);
    }
  });
}

// ================================================================
// 2. MILESTONE 2 AUDIT: BHAGAVAD GITA SCRIPTURE ENGINE & CHAPTERS
// ================================================================
console.log('\n----------------------------------------------------------------');
console.log('2. MILESTONE 2: BHAGAVAD GITA ENGINE & CHAPTERS 1-6 AUDIT');
console.log('----------------------------------------------------------------');

// A. data/gita-chapters.json
const chaptersJsonPath = path.join(__dirname, 'data', 'gita-chapters.json');
let chaptersMeta = [];
if (!fs.existsSync(chaptersJsonPath)) {
  reportFail('data/gita-chapters.json missing');
} else {
  try {
    chaptersMeta = JSON.parse(fs.readFileSync(chaptersJsonPath, 'utf8'));
    reportPass(`data/gita-chapters.json parsed successfully (${chaptersMeta.length} chapters defined).`);

    if (chaptersMeta.length !== 18) {
      reportFail(`Expected 18 chapters in gita-chapters.json, found ${chaptersMeta.length}`);
    } else {
      reportPass('All 18 chapters configured in metadata.');
    }

    // Verify Chapters 1-6 are available
    for (let i = 1; i <= 6; i++) {
      const ch = chaptersMeta.find(c => c.chapter_number === i);
      if (!ch) {
        reportFail(`Chapter ${i} missing from gita-chapters.json`);
      } else {
        if (ch.status === 'available') {
          reportPass(`Chapter ${i} (${ch.name_transliteration}) status: "available" [${ch.verses_count} verses]`);
        } else {
          reportFail(`Chapter ${i} status is "${ch.status}", expected "available"`);
        }
      }
    }

    // Verify Chapters 7-18 are upcoming
    for (let i = 7; i <= 18; i++) {
      const ch = chaptersMeta.find(c => c.chapter_number === i);
      if (ch && ch.status !== 'upcoming') {
        reportWarn(`Chapter ${i} status is "${ch.status}", expected "upcoming"`);
      }
    }
  } catch (e) {
    reportFail(`JSON syntax error in gita-chapters.json: ${e.message}`);
  }
}

// B. Verse Datasets for Chapters 1 through 6
const expectedVerseCounts = {
  1: 47,
  2: 72,
  3: 43,
  4: 42,
  5: 29,
  6: 47
};

let grandTotalVerses = 0;
const verseRequiredKeys = ['verse_number', 'text_sanskrit', 'transliteration', 'translation', 'meaning'];

for (let chNum = 1; chNum <= 6; chNum++) {
  const expectedCount = expectedVerseCounts[chNum];
  const filePath = path.join(__dirname, 'data', 'verses', `chapter-${chNum}.json`);
  
  if (!fs.existsSync(filePath)) {
    reportFail(`data/verses/chapter-${chNum}.json is missing`);
    continue;
  }

  try {
    const chData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (chData.chapter_number !== chNum) {
      reportFail(`Chapter ${chNum} JSON has chapter_number: ${chData.chapter_number}`);
    }
    if (chData.verses_count !== expectedCount) {
      reportFail(`Chapter ${chNum} JSON has verses_count: ${chData.verses_count}, expected ${expectedCount}`);
    }

    if (!Array.isArray(chData.verses)) {
      reportFail(`Chapter ${chNum} verses is not an array`);
      continue;
    }

    if (chData.verses.length !== expectedCount) {
      reportFail(`Chapter ${chNum} verses array length is ${chData.verses.length}, expected ${expectedCount}`);
    } else {
      reportPass(`Chapter ${chNum} (${chData.name_transliteration}): exactly ${chData.verses.length}/${expectedCount} verses verified.`);
    }

    grandTotalVerses += chData.verses.length;

    // Check each verse in chapter
    let chVerseErrors = 0;
    chData.verses.forEach((v, idx) => {
      const expVerseNum = idx + 1;
      if (v.verse_number !== expVerseNum) {
        chVerseErrors++;
        reportFail(`Ch ${chNum} verse index ${idx} has verse_number ${v.verse_number}, expected ${expVerseNum}`);
      }

      verseRequiredKeys.forEach(k => {
        if (!v[k] || (typeof v[k] === 'string' && v[k].trim() === '')) {
          chVerseErrors++;
          reportFail(`Ch ${chNum} verse ${expVerseNum} missing/empty field: "${k}"`);
        }
      });
    });

    if (chVerseErrors === 0) {
      reportPass(`Chapter ${chNum}: All ${expectedCount} verses strictly adhere to schema with complete text.`);
    }

  } catch (err) {
    reportFail(`Error reading/parsing chapter-${chNum}.json: ${err.message}`);
  }
}

console.log(`\n  ✦ Total Verified Verses across Chapters 1-6: ${grandTotalVerses} / 280 verses`);
if (grandTotalVerses === 280) {
  reportPass('Complete 280/280 verses (47 + 72 + 43 + 42 + 29 + 47) accounted for across all 6 active chapters.');
} else {
  reportFail(`Total verse count mismatch: found ${grandTotalVerses}, expected 280`);
}

// C. Completion Shrine Images
console.log('\nVerifying Adhyaya Completion Shrine Artwork:');
const completionImages = {
  1: 'slideshow-2.jpg',
  2: 'adhyaya-2-end.jpg',
  3: '3rd-adhyaya-end.jpg',
  4: '4th-adhyaya-end.jpg',
  5: '5th-adhyaya-end_.jpg',
  6: '6th-adhyaya-end.jpg'
};

for (let chNum = 1; chNum <= 6; chNum++) {
  const imgName = completionImages[chNum];
  const p = path.join(__dirname, 'assets', 'images', imgName);
  if (fs.existsSync(p)) {
    const sz = fs.statSync(p).size;
    reportPass(`Chapter ${chNum} Shrine Image: "${imgName}" (${(sz / 1024).toFixed(1)} KB)`);
  } else {
    reportFail(`Chapter ${chNum} Shrine Image MISSING: "${imgName}"`);
  }
}

// ================================================================
// 3. JAVASCRIPT LOGIC & DEDUPLICATION AUDIT
// ================================================================
console.log('\n----------------------------------------------------------------');
console.log('3. JAVASCRIPT RUNTIME & DEDUPLICATION AUDIT');
console.log('----------------------------------------------------------------');

const appJsPath = path.join(__dirname, 'js', 'app.js');
let appJsContent = '';
if (!fs.existsSync(appJsPath)) {
  reportFail('js/app.js missing');
} else {
  appJsContent = fs.readFileSync(appJsPath, 'utf8');
  try {
    new vm.Script(appJsContent);
    reportPass('js/app.js: V8 syntax check passed without errors.');
  } catch (e) {
    reportFail(`js/app.js syntax error: ${e.message}`);
  }

  // Check showCompletionView handles chapters 1-6
  for (let ch = 1; ch <= 6; ch++) {
    const imgName = completionImages[ch];
    if (appJsContent.includes(imgName)) {
      reportPass(`js/app.js maps Chapter ${ch} completion to "${imgName}"`);
    } else {
      reportFail(`js/app.js missing image reference for Chapter ${ch}: "${imgName}"`);
    }
  }

  // Check for duplicate dedication text in compColophon
  const compColophonMatches = appJsContent.match(/compColophon\.innerHTML\s*=\s*['"][^'"]+['"]/g) || [];
  let colophonDups = 0;
  compColophonMatches.forEach(m => {
    if (m.includes('श्रीकृष्णार्पणमस्तु')) {
      colophonDups++;
      reportFail(`Duplicate dedication found in compColophon: ${m}`);
    }
  });

  if (colophonDups === 0) {
    reportPass(`All ${compColophonMatches.length} compColophon templates are clean (zero duplicate dedication text).`);
  }
}

// ================================================================
// 4. HTTP ENDPOINT RUNTIME HEALTH CHECK (PORT 8080)
// ================================================================
console.log('\n----------------------------------------------------------------');
console.log('4. HTTP ENDPOINT RUNTIME TEST (http://localhost:8080)');
console.log('----------------------------------------------------------------');

const testUrls = [
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
  'http://localhost:8080/assets/images/krishna-and-arjuna.jpg',
  'http://localhost:8080/assets/images/slideshow-2.jpg',
  'http://localhost:8080/assets/images/adhyaya-2-end.jpg',
  'http://localhost:8080/assets/images/3rd-adhyaya-end.jpg',
  'http://localhost:8080/assets/images/4th-adhyaya-end.jpg',
  'http://localhost:8080/assets/images/5th-adhyaya-end_.jpg',
  'http://localhost:8080/assets/images/6th-adhyaya-end.jpg'
];

let pending = testUrls.length;
let httpErrors = 0;

testUrls.forEach(url => {
  http.get(url, res => {
    let size = 0;
    res.on('data', chunk => size += chunk.length);
    res.on('end', () => {
      pending--;
      if (res.statusCode === 200) {
        reportPass(`HTTP 200 OK (${(size / 1024).toFixed(1)} KB) -> ${url}`);
      } else {
        reportFail(`HTTP ${res.statusCode} -> ${url}`);
        httpErrors++;
      }
      if (pending === 0) {
        finishAudit(httpErrors);
      }
    });
  }).on('error', err => {
    pending--;
    reportFail(`HTTP Network Error on ${url}: ${err.message}`);
    httpErrors++;
    if (pending === 0) {
      finishAudit(httpErrors);
    }
  });
});

function finishAudit(httpErrs) {
  console.log('\n================================================================');
  console.log('   AUDIT RESULTS SUMMARY                                       ');
  console.log('================================================================');
  console.log(`Total Errors: ${totalErrors}`);
  console.log(`Total Warnings: ${totalWarnings}`);
  
  if (totalErrors === 0 && httpErrs === 0) {
    console.log('\n🌟 CONGRATULATIONS: 100% OF AUDIT CHECKS PASSED PERFECTLY! 🌟\n');
    process.exit(0);
  } else {
    console.error(`\n❌ AUDIT FAILED WITH ${totalErrors + httpErrs} ERRORS.\n`);
    process.exit(1);
  }
}
