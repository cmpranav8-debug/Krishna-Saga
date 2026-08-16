const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('==============================================');
console.log('   BHAGAVAD GITA CHAPTER 5 VERIFICATION       ');
console.log('==============================================\n');

let failed = false;

// 1. Verify data/verses/chapter-5.json
const ch5Path = path.join(__dirname, '..', 'data', 'verses', 'chapter-5.json');
if (!fs.existsSync(ch5Path)) {
  console.error('❌ Missing file:', ch5Path);
  process.exit(1);
}

let ch5Data;
try {
  const content = fs.readFileSync(ch5Path, 'utf8');
  ch5Data = JSON.parse(content);
  console.log('✔ data/verses/chapter-5.json: JSON syntax valid.');
} catch (e) {
  console.error('❌ JSON parse error in chapter-5.json:', e.message);
  process.exit(1);
}

// Check chapter meta
if (ch5Data.chapter_number !== 5) {
  console.error(`❌ Expected chapter_number 5, got: ${ch5Data.chapter_number}`);
  failed = true;
} else {
  console.log('✔ chapter_number: 5');
}

if (ch5Data.verses_count !== 29) {
  console.error(`❌ Expected verses_count 29, got: ${ch5Data.verses_count}`);
  failed = true;
} else {
  console.log('✔ verses_count: 29');
}

if (!Array.isArray(ch5Data.verses)) {
  console.error('❌ ch5Data.verses is not an array');
  process.exit(1);
}

if (ch5Data.verses.length !== 29) {
  console.error(`❌ Expected 29 verses in array, found: ${ch5Data.verses.length}`);
  failed = true;
} else {
  console.log(`✔ verses array length: ${ch5Data.verses.length}`);
}

// Check each individual verse
const requiredFields = ['verse_number', 'text_sanskrit', 'transliteration', 'translation', 'meaning'];
ch5Data.verses.forEach((v, index) => {
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
});

if (!failed) {
  console.log('✔ All 29 verses strictly adhere to schema and contain non-empty data.');
}

// Check key highlighted shlokas
const keyVerses = [2, 10, 18, 22, 24, 29];
console.log('\nVerifying key philosophical shlokas:');
keyVerses.forEach(num => {
  const verse = ch5Data.verses.find(v => v.verse_number === num);
  if (verse) {
    const firstLine = verse.text_sanskrit.split('\n')[0];
    console.log(`  ✔ BG 5.${num}: "${firstLine}"`);
  } else {
    console.error(`  ❌ Missing key shloka: BG 5.${num}`);
    failed = true;
  }
});

// 2. Verify data/gita-chapters.json
const chaptersPath = path.join(__dirname, '..', 'data', 'gita-chapters.json');
const chaptersContent = fs.readFileSync(chaptersPath, 'utf8');
const chapters = JSON.parse(chaptersContent);
const ch5Meta = chapters.find(c => c.chapter_number === 5);

console.log('\nVerifying data/gita-chapters.json:');
if (!ch5Meta) {
  console.error('❌ Chapter 5 not found in data/gita-chapters.json');
  failed = true;
} else if (ch5Meta.status !== 'available') {
  console.error(`❌ Chapter 5 status is "${ch5Meta.status}", expected "available"`);
  failed = true;
} else if (ch5Meta.verses_count !== 29) {
  console.error(`❌ Chapter 5 verses_count is ${ch5Meta.verses_count}, expected 29`);
  failed = true;
} else {
  console.log('  ✔ Chapter 5 is marked "available" with 29 verses in gita-chapters.json.');
}

// 3. Verify assets/images/5th-adhyaya-end_.jpg
const imgPath = path.join(__dirname, '..', 'assets', 'images', '5th-adhyaya-end_.jpg');
console.log('\nVerifying completion image asset:');
if (fs.existsSync(imgPath)) {
  const stat = fs.statSync(imgPath);
  console.log(`  ✔ assets/images/5th-adhyaya-end_.jpg exists (${(stat.size / 1024).toFixed(1)} KB).`);
} else {
  console.error('❌ Missing assets/images/5th-adhyaya-end_.jpg');
  failed = true;
}

// 4. Verify js/app.js syntax and Chapter 5 handlers
const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

try {
  new vm.Script(appJsContent);
  console.log('\n✔ js/app.js: V8 syntax check passed.');
} catch (e) {
  console.error('❌ js/app.js syntax error:', e.message);
  failed = true;
}

if (appJsContent.includes('5th-adhyaya-end_.jpg')) {
  console.log('✔ js/app.js references 5th-adhyaya-end_.jpg for Chapter 5 completion.');
} else {
  console.error('❌ js/app.js missing 5th-adhyaya-end_.jpg reference');
  failed = true;
}

if (failed) {
  console.error('\n❌ Verification encountered failures.');
  process.exit(1);
} else {
  console.log('\n==============================================');
  console.log('   ALL CHAPTER 5 VERIFICATIONS PASSED (100%)  ');
  console.log('==============================================');
}
