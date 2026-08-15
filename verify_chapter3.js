const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('==============================================');
console.log('   BHAGAVAD GITA CHAPTER 3 VERIFICATION       ');
console.log('==============================================\n');

let failed = false;

// 1. Verify data/verses/chapter-3.json
const ch3Path = path.join(__dirname, 'data', 'verses', 'chapter-3.json');
if (!fs.existsSync(ch3Path)) {
  console.error('❌ Missing file:', ch3Path);
  process.exit(1);
}

let ch3Data;
try {
  const content = fs.readFileSync(ch3Path, 'utf8');
  ch3Data = JSON.parse(content);
  console.log('✔ data/verses/chapter-3.json: JSON syntax valid.');
} catch (e) {
  console.error('❌ JSON parse error in chapter-3.json:', e.message);
  process.exit(1);
}

// Check chapter meta
if (ch3Data.chapter_number !== 3) {
  console.error(`❌ Expected chapter_number 3, got: ${ch3Data.chapter_number}`);
  failed = true;
} else {
  console.log('✔ chapter_number: 3');
}

if (ch3Data.verses_count !== 43) {
  console.error(`❌ Expected verses_count 43, got: ${ch3Data.verses_count}`);
  failed = true;
} else {
  console.log('✔ verses_count: 43');
}

if (!Array.isArray(ch3Data.verses)) {
  console.error('❌ ch3Data.verses is not an array');
  process.exit(1);
}

if (ch3Data.verses.length !== 43) {
  console.error(`❌ Expected 43 verses in array, found: ${ch3Data.verses.length}`);
  failed = true;
} else {
  console.log(`✔ verses array length: ${ch3Data.verses.length}`);
}

// Check each individual verse
const requiredFields = ['verse_number', 'text_sanskrit', 'transliteration', 'translation', 'meaning'];
ch3Data.verses.forEach((v, index) => {
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
  console.log('✔ All 43 verses strictly adhere to schema and contain non-empty data.');
}

// Check key highlighted shlokas
const keyVerses = [8, 9, 21, 27, 30, 35, 42, 43];
console.log('\nVerifying key philosophical shlokas:');
keyVerses.forEach(num => {
  const verse = ch3Data.verses.find(v => v.verse_number === num);
  if (verse) {
    const firstLine = verse.text_sanskrit.split('\n')[0];
    console.log(`  ✔ BG 3.${num}: "${firstLine}"`);
  } else {
    console.error(`  ❌ Missing key shloka: BG 3.${num}`);
    failed = true;
  }
});

// 2. Verify data/gita-chapters.json
const chaptersPath = path.join(__dirname, 'data', 'gita-chapters.json');
const chaptersContent = fs.readFileSync(chaptersPath, 'utf8');
const chapters = JSON.parse(chaptersContent);
const ch3Meta = chapters.find(c => c.chapter_number === 3);

console.log('\nVerifying data/gita-chapters.json:');
if (!ch3Meta) {
  console.error('❌ Chapter 3 not found in data/gita-chapters.json');
  failed = true;
} else if (ch3Meta.status !== 'available') {
  console.error(`❌ Chapter 3 status is "${ch3Meta.status}", expected "available"`);
  failed = true;
} else if (ch3Meta.verses_count !== 43) {
  console.error(`❌ Chapter 3 verses_count is ${ch3Meta.verses_count}, expected 43`);
  failed = true;
} else {
  console.log('  ✔ Chapter 3 is marked "available" with 43 verses in gita-chapters.json.');
}

// 3. Verify assets/images/3rd-adhyaya-end.jpg
const imgPath = path.join(__dirname, 'assets', 'images', '3rd-adhyaya-end.jpg');
console.log('\nVerifying completion image asset:');
if (fs.existsSync(imgPath)) {
  const stat = fs.statSync(imgPath);
  console.log(`  ✔ assets/images/3rd-adhyaya-end.jpg exists (${(stat.size / 1024).toFixed(1)} KB).`);
} else {
  console.error('❌ Missing assets/images/3rd-adhyaya-end.jpg');
  failed = true;
}

// 4. Verify js/app.js syntax and Chapter 3 handlers
const appJsPath = path.join(__dirname, 'js', 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

try {
  new vm.Script(appJsContent);
  console.log('\n✔ js/app.js: V8 syntax check passed.');
} catch (e) {
  console.error('❌ js/app.js syntax error:', e.message);
  failed = true;
}

if (appJsContent.includes('3rd-adhyaya-end.jpg')) {
  console.log('✔ js/app.js references 3rd-adhyaya-end.jpg for Chapter 3 completion.');
} else {
  console.error('❌ js/app.js missing 3rd-adhyaya-end.jpg reference');
  failed = true;
}

if (failed) {
  console.error('\n❌ Verification encountered failures.');
  process.exit(1);
} else {
  console.log('\n==============================================');
  console.log('   ALL CHAPTER 3 VERIFICATIONS PASSED (100%)  ');
  console.log('==============================================');
}
