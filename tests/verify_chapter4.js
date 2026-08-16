const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('==============================================');
console.log('   BHAGAVAD GITA CHAPTER 4 VERIFICATION       ');
console.log('==============================================\n');

let failed = false;

// 1. Verify data/verses/chapter-4.json
const ch4Path = path.join(__dirname, '..', 'data', 'verses', 'chapter-4.json');
if (!fs.existsSync(ch4Path)) {
  console.error('❌ Missing file:', ch4Path);
  process.exit(1);
}

let ch4Data;
try {
  const content = fs.readFileSync(ch4Path, 'utf8');
  ch4Data = JSON.parse(content);
  console.log('✔ data/verses/chapter-4.json: JSON syntax valid.');
} catch (e) {
  console.error('❌ JSON parse error in chapter-4.json:', e.message);
  process.exit(1);
}

// Check chapter meta
if (ch4Data.chapter_number !== 4) {
  console.error(`❌ Expected chapter_number 4, got: ${ch4Data.chapter_number}`);
  failed = true;
} else {
  console.log('✔ chapter_number: 4');
}

if (ch4Data.verses_count !== 42) {
  console.error(`❌ Expected verses_count 42, got: ${ch4Data.verses_count}`);
  failed = true;
} else {
  console.log('✔ verses_count: 42');
}

if (!Array.isArray(ch4Data.verses)) {
  console.error('❌ ch4Data.verses is not an array');
  process.exit(1);
}

if (ch4Data.verses.length !== 42) {
  console.error(`❌ Expected 42 verses in array, found: ${ch4Data.verses.length}`);
  failed = true;
} else {
  console.log(`✔ verses array length: ${ch4Data.verses.length}`);
}

// Check each individual verse
const requiredFields = ['verse_number', 'text_sanskrit', 'transliteration', 'translation', 'meaning'];
ch4Data.verses.forEach((v, index) => {
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
  console.log('✔ All 42 verses strictly adhere to schema and contain non-empty data.');
}

// Check key highlighted shlokas
const keyVerses = [1, 2, 3, 7, 8, 9, 13, 18, 24, 34, 37, 38, 39];
console.log('\nVerifying key philosophical shlokas:');
keyVerses.forEach(num => {
  const verse = ch4Data.verses.find(v => v.verse_number === num);
  if (verse) {
    const firstLine = verse.text_sanskrit.split('\n')[0];
    console.log(`  ✔ BG 4.${num}: "${firstLine}"`);
  } else {
    console.error(`  ❌ Missing key shloka: BG 4.${num}`);
    failed = true;
  }
});

// 2. Verify data/gita-chapters.json
const chaptersPath = path.join(__dirname, '..', 'data', 'gita-chapters.json');
const chaptersContent = fs.readFileSync(chaptersPath, 'utf8');
const chapters = JSON.parse(chaptersContent);
const ch4Meta = chapters.find(c => c.chapter_number === 4);

console.log('\nVerifying data/gita-chapters.json:');
if (!ch4Meta) {
  console.error('❌ Chapter 4 not found in data/gita-chapters.json');
  failed = true;
} else if (ch4Meta.status !== 'available') {
  console.error(`❌ Chapter 4 status is "${ch4Meta.status}", expected "available"`);
  failed = true;
} else if (ch4Meta.verses_count !== 42) {
  console.error(`❌ Chapter 4 verses_count is ${ch4Meta.verses_count}, expected 42`);
  failed = true;
} else {
  console.log('  ✔ Chapter 4 is marked "available" with 42 verses in gita-chapters.json.');
}

// 3. Verify assets/images/4th-adhyaya-end.jpg
const imgPath = path.join(__dirname, '..', 'assets', 'images', '4th-adhyaya-end.jpg');
console.log('\nVerifying completion image asset:');
if (fs.existsSync(imgPath)) {
  const stat = fs.statSync(imgPath);
  console.log(`  ✔ assets/images/4th-adhyaya-end.jpg exists (${(stat.size / 1024).toFixed(1)} KB).`);
} else {
  console.error('❌ Missing assets/images/4th-adhyaya-end.jpg');
  failed = true;
}

// 4. Verify js/app.js syntax and Chapter 4 handlers
const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

try {
  new vm.Script(appJsContent);
  console.log('\n✔ js/app.js: V8 syntax check passed.');
} catch (e) {
  console.error('❌ js/app.js syntax error:', e.message);
  failed = true;
}

if (appJsContent.includes('4th-adhyaya-end.jpg')) {
  console.log('✔ js/app.js references 4th-adhyaya-end.jpg for Chapter 4 completion.');
} else {
  console.error('❌ js/app.js missing 4th-adhyaya-end.jpg reference');
  failed = true;
}

if (failed) {
  console.error('\n❌ Verification encountered failures.');
  process.exit(1);
} else {
  console.log('\n==============================================');
  console.log('   ALL CHAPTER 4 VERIFICATIONS PASSED (100%)  ');
  console.log('==============================================');
}
