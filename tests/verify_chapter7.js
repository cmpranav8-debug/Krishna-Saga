const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('==============================================');
console.log('   BHAGAVAD GITA CHAPTER 7 VERIFICATION       ');
console.log('==============================================\n');

let failed = false;

// 1. Verify data/verses/chapter-7.json
const ch7Path = path.join(__dirname, '..', 'data', 'verses', 'chapter-7.json');
if (!fs.existsSync(ch7Path)) {
  console.error('❌ Missing file:', ch7Path);
  process.exit(1);
}

let ch7Data;
try {
  const content = fs.readFileSync(ch7Path, 'utf8');
  ch7Data = JSON.parse(content);
  console.log('✔ data/verses/chapter-7.json: JSON syntax valid.');
} catch (e) {
  console.error('❌ JSON parse error in chapter-7.json:', e.message);
  process.exit(1);
}

// Check chapter meta
if (ch7Data.chapter_number !== 7) {
  console.error(`❌ Expected chapter_number 7, got: ${ch7Data.chapter_number}`);
  failed = true;
} else {
  console.log('✔ chapter_number: 7');
}

if (ch7Data.verses_count !== 30) {
  console.error(`❌ Expected verses_count 30, got: ${ch7Data.verses_count}`);
  failed = true;
} else {
  console.log('✔ verses_count: 30');
}

if (!Array.isArray(ch7Data.verses)) {
  console.error('❌ ch7Data.verses is not an array');
  process.exit(1);
}

if (ch7Data.verses.length !== 30) {
  console.error(`❌ Expected 30 verses in array, found: ${ch7Data.verses.length}`);
  failed = true;
} else {
  console.log(`✔ verses array length: ${ch7Data.verses.length}`);
}

// Check each individual verse
const requiredFields = ['verse_number', 'text_sanskrit', 'transliteration', 'translation', 'meaning'];
ch7Data.verses.forEach((v, index) => {
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
  console.log('✔ All 30 verses strictly adhere to schema and contain non-empty data.');
}

// Check key highlighted shlokas
const keyVerses = [1, 2, 4, 5, 7, 8, 14, 16, 17, 18, 19, 21, 28, 30];
console.log('\nVerifying key philosophical shlokas:');
keyVerses.forEach(num => {
  const verse = ch7Data.verses.find(v => v.verse_number === num);
  if (verse) {
    const firstLine = verse.text_sanskrit.split('\n')[0];
    console.log(`  ✔ BG 7.${num}: "${firstLine}"`);
  } else {
    console.error(`  ❌ Missing key shloka: BG 7.${num}`);
    failed = true;
  }
});

// 2. Verify data/gita-chapters.json
const chaptersPath = path.join(__dirname, '..', 'data', 'gita-chapters.json');
const chaptersContent = fs.readFileSync(chaptersPath, 'utf8');
const chapters = JSON.parse(chaptersContent);
const ch7Meta = chapters.find(c => c.chapter_number === 7);

console.log('\nVerifying data/gita-chapters.json:');
if (!ch7Meta) {
  console.error('❌ Chapter 7 not found in data/gita-chapters.json');
  failed = true;
} else if (ch7Meta.status !== 'available') {
  console.error(`❌ Chapter 7 status is "${ch7Meta.status}", expected "available"`);
  failed = true;
} else if (ch7Meta.verses_count !== 30) {
  console.error(`❌ Chapter 7 verses_count is ${ch7Meta.verses_count}, expected 30`);
  failed = true;
} else {
  console.log('  ✔ Chapter 7 is marked "available" with 30 verses in gita-chapters.json.');
}

// 3. Verify assets/images/7th-adhyaya-end.jpg
const imgPath = path.join(__dirname, '..', 'assets', 'images', '7th-adhyaya-end.jpg');
console.log('\nVerifying completion image asset:');
if (fs.existsSync(imgPath)) {
  const stat = fs.statSync(imgPath);
  console.log(`  ✔ assets/images/7th-adhyaya-end.jpg exists (${(stat.size / 1024).toFixed(1)} KB).`);
} else {
  console.error('❌ Missing assets/images/7th-adhyaya-end.jpg');
  failed = true;
}

// 4. Verify js/app.js syntax and Chapter 7 handlers
const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

try {
  new vm.Script(appJsContent);
  console.log('\n✔ js/app.js: V8 syntax check passed.');
} catch (e) {
  console.error('❌ js/app.js syntax error:', e.message);
  failed = true;
}

if (appJsContent.includes('7th-adhyaya-end.jpg')) {
  console.log('✔ js/app.js references 7th-adhyaya-end.jpg for Chapter 7 completion.');
} else {
  console.error('❌ js/app.js missing 7th-adhyaya-end.jpg reference');
  failed = true;
}

if (failed) {
  console.error('\n❌ Verification encountered failures.');
  process.exit(1);
} else {
  console.log('\n==============================================');
  console.log('   ALL CHAPTER 7 VERIFICATIONS PASSED (100%)  ');
  console.log('==============================================');
}
