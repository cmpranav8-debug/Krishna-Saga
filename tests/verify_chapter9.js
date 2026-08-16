const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('==============================================');
console.log('   BHAGAVAD GITA CHAPTER 9 VERIFICATION       ');
console.log('   राजविद्याराजगुह्ययोग • RAJA VIDYA RAJA GUHYA   ');
console.log('==============================================\n');

let failed = false;

// 1. Verify data/verses/chapter-9.json
const ch9Path = path.join(__dirname, '..', 'data', 'verses', 'chapter-9.json');
if (!fs.existsSync(ch9Path)) {
  console.error('❌ Missing file:', ch9Path);
  process.exit(1);
}

let ch9Data;
try {
  const content = fs.readFileSync(ch9Path, 'utf8');
  ch9Data = JSON.parse(content);
  console.log('✔ data/verses/chapter-9.json: JSON syntax valid.');
} catch (e) {
  console.error('❌ JSON parse error in chapter-9.json:', e.message);
  process.exit(1);
}

// Check chapter meta
if (ch9Data.chapter_number !== 9 && ch9Data.chapter !== 9) {
  console.error(`❌ Expected chapter_number 9, got: ${ch9Data.chapter_number}`);
  failed = true;
} else {
  console.log('✔ chapter_number: 9');
}

if (ch9Data.verses_count !== 34) {
  console.error(`❌ Expected verses_count 34, got: ${ch9Data.verses_count}`);
  failed = true;
} else {
  console.log('✔ verses_count: 34');
}

if (!Array.isArray(ch9Data.verses)) {
  console.error('❌ ch9Data.verses is not an array');
  process.exit(1);
}

if (ch9Data.verses.length !== 34) {
  console.error(`❌ Expected 34 verses in array, found: ${ch9Data.verses.length}`);
  failed = true;
} else {
  console.log(`✔ verses array length: ${ch9Data.verses.length}`);
}

// Check each individual verse schema and high-fidelity fields
const requiredFields = ['verse_number', 'text_sanskrit', 'transliteration', 'translation', 'meaning', 'speaker', 'word_meanings'];
ch9Data.verses.forEach((v, index) => {
  const expectedNum = index + 1;
  if (v.verse_number !== expectedNum) {
    console.error(`❌ Verse index ${index} has verse_number ${v.verse_number}, expected ${expectedNum}`);
    failed = true;
  }
  requiredFields.forEach(f => {
    if (!v[f] || typeof v[f] !== (f === 'verse_number' ? 'number' : 'string') || (typeof v[f] === 'string' && v[f].trim() === '')) {
      console.error(`❌ Verse ${expectedNum} missing or empty field: "${f}"`);
      failed = true;
    }
  });

  // Verify speaker validity (all 34 verses in Ch 9 are spoken by Sri Krishna)
  if (v.speaker !== 'श्रीभगवानुवाच') {
    console.error(`❌ Verse ${expectedNum} has unexpected speaker: "${v.speaker}"`);
    failed = true;
  }
});

if (!failed) {
  console.log('✔ All 34 verses strictly adhere to schema with complete Devanagari, transliteration, speaker, word meanings, translation, and purport.');
}

// Check key highlighted shlokas
const keyVerses = [1, 2, 4, 5, 10, 11, 13, 14, 17, 18, 22, 26, 27, 29, 30, 31, 32, 34];
console.log('\nVerifying key philosophical shlokas:');
keyVerses.forEach(num => {
  const verse = ch9Data.verses.find(v => v.verse_number === num);
  if (verse) {
    const firstLine = verse.text_sanskrit.split('\n')[0];
    console.log(`  ✔ BG 9.${num} [${verse.speaker}]: "${firstLine}"`);
  } else {
    console.error(`  ❌ Missing key shloka: BG 9.${num}`);
    failed = true;
  }
});

// 2. Verify data/gita-chapters.json
const chaptersPath = path.join(__dirname, '..', 'data', 'gita-chapters.json');
const chaptersContent = fs.readFileSync(chaptersPath, 'utf8');
const chapters = JSON.parse(chaptersContent);
const ch9Meta = chapters.find(c => c.chapter_number === 9);

console.log('\nVerifying data/gita-chapters.json:');
if (!ch9Meta) {
  console.error('❌ Chapter 9 not found in data/gita-chapters.json');
  failed = true;
} else if (ch9Meta.status !== 'available') {
  console.error(`❌ Chapter 9 status is "${ch9Meta.status}", expected "available"`);
  failed = true;
} else if (ch9Meta.verses_count !== 34) {
  console.error(`❌ Chapter 9 verses_count is ${ch9Meta.verses_count}, expected 34`);
  failed = true;
} else {
  console.log('  ✔ Chapter 9 is marked "available" with 34 verses in gita-chapters.json.');
}

// 3. Verify assets/images/9th-adhyaya-end.jpg
const imgPath = path.join(__dirname, '..', 'assets', 'images', '9th-adhyaya-end.jpg');
console.log('\nVerifying completion image asset:');
if (fs.existsSync(imgPath)) {
  const stat = fs.statSync(imgPath);
  console.log(`  ✔ assets/images/9th-adhyaya-end.jpg exists (${(stat.size / 1024).toFixed(1)} KB).`);
} else {
  console.error('❌ Missing assets/images/9th-adhyaya-end.jpg');
  failed = true;
}

// 4. Verify js/app.js syntax and Chapter 9 handlers
const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

try {
  new vm.Script(appJsContent);
  console.log('\n✔ js/app.js: V8 syntax check passed.');
} catch (e) {
  console.error('❌ js/app.js syntax error:', e.message);
  failed = true;
}

if (appJsContent.includes('9th-adhyaya-end.jpg')) {
  console.log('✔ js/app.js references 9th-adhyaya-end.jpg for Chapter 9 completion.');
} else {
  console.error('❌ js/app.js missing 9th-adhyaya-end.jpg reference');
  failed = true;
}

if (appJsContent.includes('राजविद्याराजगुह्ययोगो नाम नवमोऽध्यायः')) {
  console.log('✔ js/app.js includes authentic Chapter 9 colophon.');
} else {
  console.error('❌ js/app.js missing Chapter 9 colophon text');
  failed = true;
}

if (failed) {
  console.error('\n❌ Chapter 9 Verification encountered failures.');
  process.exit(1);
} else {
  console.log('\n==============================================');
  console.log('   ALL CHAPTER 9 VERIFICATIONS PASSED (100%)  ');
  console.log('==============================================');
}
