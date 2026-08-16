const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('==============================================');
console.log('   BHAGAVAD GITA CHAPTER 6 VERIFICATION       ');
console.log('==============================================\n');

let failed = false;

// 1. Verify data/verses/chapter-6.json
const ch6Path = path.join(__dirname, '..', 'data', 'verses', 'chapter-6.json');
if (!fs.existsSync(ch6Path)) {
  console.error('❌ Missing file:', ch6Path);
  process.exit(1);
}

let ch6Data;
try {
  const content = fs.readFileSync(ch6Path, 'utf8');
  ch6Data = JSON.parse(content);
  console.log('✔ data/verses/chapter-6.json: JSON syntax valid.');
} catch (e) {
  console.error('❌ JSON parse error in chapter-6.json:', e.message);
  process.exit(1);
}

// Check chapter meta
if (ch6Data.chapter_number !== 6) {
  console.error(`❌ Expected chapter_number 6, got: ${ch6Data.chapter_number}`);
  failed = true;
} else {
  console.log('✔ chapter_number: 6');
}

if (ch6Data.verses_count !== 47) {
  console.error(`❌ Expected verses_count 47, got: ${ch6Data.verses_count}`);
  failed = true;
} else {
  console.log('✔ verses_count: 47');
}

if (!Array.isArray(ch6Data.verses)) {
  console.error('❌ ch6Data.verses is not an array');
  process.exit(1);
}

if (ch6Data.verses.length !== 47) {
  console.error(`❌ Expected 47 verses in array, found: ${ch6Data.verses.length}`);
  failed = true;
} else {
  console.log(`✔ verses array length: ${ch6Data.verses.length}`);
}

// Check each individual verse
const requiredFields = ['verse_number', 'text_sanskrit', 'transliteration', 'translation', 'meaning'];
ch6Data.verses.forEach((v, index) => {
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
  console.log('✔ All 47 verses strictly adhere to schema and contain non-empty data.');
}

// Check key highlighted shlokas
const keyVerses = [5, 6, 16, 17, 19, 26, 30, 34, 35, 40, 47];
console.log('\nVerifying key philosophical shlokas:');
keyVerses.forEach(num => {
  const verse = ch6Data.verses.find(v => v.verse_number === num);
  if (verse) {
    const firstLine = verse.text_sanskrit.split('\n')[0];
    console.log(`  ✔ BG 6.${num}: "${firstLine}"`);
  } else {
    console.error(`  ❌ Missing key shloka: BG 6.${num}`);
    failed = true;
  }
});

// 2. Verify data/gita-chapters.json
const chaptersPath = path.join(__dirname, '..', 'data', 'gita-chapters.json');
const chaptersContent = fs.readFileSync(chaptersPath, 'utf8');
const chapters = JSON.parse(chaptersContent);
const ch6Meta = chapters.find(c => c.chapter_number === 6);

console.log('\nVerifying data/gita-chapters.json:');
if (!ch6Meta) {
  console.error('❌ Chapter 6 not found in data/gita-chapters.json');
  failed = true;
} else if (ch6Meta.status !== 'available') {
  console.error(`❌ Chapter 6 status is "${ch6Meta.status}", expected "available"`);
  failed = true;
} else if (ch6Meta.verses_count !== 47) {
  console.error(`❌ Chapter 6 verses_count is ${ch6Meta.verses_count}, expected 47`);
  failed = true;
} else {
  console.log('  ✔ Chapter 6 is marked "available" with 47 verses in gita-chapters.json.');
}

// 3. Verify assets/images/6th-adhyaya-end.jpg
const imgPath = path.join(__dirname, '..', 'assets', 'images', '6th-adhyaya-end.jpg');
console.log('\nVerifying completion image asset:');
if (fs.existsSync(imgPath)) {
  const stat = fs.statSync(imgPath);
  console.log(`  ✔ assets/images/6th-adhyaya-end.jpg exists (${(stat.size / 1024).toFixed(1)} KB).`);
} else {
  console.error('❌ Missing assets/images/6th-adhyaya-end.jpg');
  failed = true;
}

// 4. Verify js/app.js syntax and Chapter 6 handlers
const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

try {
  new vm.Script(appJsContent);
  console.log('\n✔ js/app.js: V8 syntax check passed.');
} catch (e) {
  console.error('❌ js/app.js syntax error:', e.message);
  failed = true;
}

if (appJsContent.includes('6th-adhyaya-end.jpg')) {
  console.log('✔ js/app.js references 6th-adhyaya-end.jpg for Chapter 6 completion.');
} else {
  console.error('❌ js/app.js missing 6th-adhyaya-end.jpg reference');
  failed = true;
}

if (failed) {
  console.error('\n❌ Verification encountered failures.');
  process.exit(1);
} else {
  console.log('\n==============================================');
  console.log('   ALL CHAPTER 6 VERIFICATIONS PASSED (100%)  ');
  console.log('==============================================');
}
