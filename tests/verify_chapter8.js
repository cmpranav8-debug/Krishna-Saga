const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('==============================================');
console.log('   BHAGAVAD GITA CHAPTER 8 VERIFICATION       ');
console.log('   अक्षरब्रह्मयोग • AKSARA BRAHMA YOGA         ');
console.log('==============================================\n');

let failed = false;

// 1. Verify data/verses/chapter-8.json
const ch8Path = path.join(__dirname, '..', 'data', 'verses', 'chapter-8.json');
if (!fs.existsSync(ch8Path)) {
  console.error('❌ Missing file:', ch8Path);
  process.exit(1);
}

let ch8Data;
try {
  const content = fs.readFileSync(ch8Path, 'utf8');
  ch8Data = JSON.parse(content);
  console.log('✔ data/verses/chapter-8.json: JSON syntax valid.');
} catch (e) {
  console.error('❌ JSON parse error in chapter-8.json:', e.message);
  process.exit(1);
}

// Check chapter meta
if (ch8Data.chapter_number !== 8 && ch8Data.chapter !== 8) {
  console.error(`❌ Expected chapter_number 8, got: ${ch8Data.chapter_number}`);
  failed = true;
} else {
  console.log('✔ chapter_number: 8');
}

if (ch8Data.verses_count !== 28) {
  console.error(`❌ Expected verses_count 28, got: ${ch8Data.verses_count}`);
  failed = true;
} else {
  console.log('✔ verses_count: 28');
}

if (!Array.isArray(ch8Data.verses)) {
  console.error('❌ ch8Data.verses is not an array');
  process.exit(1);
}

if (ch8Data.verses.length !== 28) {
  console.error(`❌ Expected 28 verses in array, found: ${ch8Data.verses.length}`);
  failed = true;
} else {
  console.log(`✔ verses array length: ${ch8Data.verses.length}`);
}

// Check each individual verse schema and high-fidelity fields
const requiredFields = ['verse_number', 'text_sanskrit', 'transliteration', 'translation', 'meaning', 'speaker', 'word_meanings'];
ch8Data.verses.forEach((v, index) => {
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

  // Verify speaker validity
  if (v.speaker !== 'अर्जुन उवाच' && v.speaker !== 'श्रीभगवानुवाच') {
    console.error(`❌ Verse ${expectedNum} has unrecognized speaker: "${v.speaker}"`);
    failed = true;
  }
});

if (!failed) {
  console.log('✔ All 28 verses strictly adhere to schema with complete Devanagari, transliteration, speaker, word meanings, translation, and purport.');
}

// Check key highlighted shlokas
const keyVerses = [1, 2, 3, 4, 5, 6, 7, 9, 10, 12, 13, 14, 15, 17, 20, 22, 24, 25, 26, 28];
console.log('\nVerifying key philosophical shlokas:');
keyVerses.forEach(num => {
  const verse = ch8Data.verses.find(v => v.verse_number === num);
  if (verse) {
    const firstLine = verse.text_sanskrit.split('\n')[0];
    console.log(`  ✔ BG 8.${num} [${verse.speaker}]: "${firstLine}"`);
  } else {
    console.error(`  ❌ Missing key shloka: BG 8.${num}`);
    failed = true;
  }
});

// 2. Verify data/gita-chapters.json
const chaptersPath = path.join(__dirname, '..', 'data', 'gita-chapters.json');
const chaptersContent = fs.readFileSync(chaptersPath, 'utf8');
const chapters = JSON.parse(chaptersContent);
const ch8Meta = chapters.find(c => c.chapter_number === 8);

console.log('\nVerifying data/gita-chapters.json:');
if (!ch8Meta) {
  console.error('❌ Chapter 8 not found in data/gita-chapters.json');
  failed = true;
} else if (ch8Meta.status !== 'available') {
  console.error(`❌ Chapter 8 status is "${ch8Meta.status}", expected "available"`);
  failed = true;
} else if (ch8Meta.verses_count !== 28) {
  console.error(`❌ Chapter 8 verses_count is ${ch8Meta.verses_count}, expected 28`);
  failed = true;
} else {
  console.log('  ✔ Chapter 8 is marked "available" with 28 verses in gita-chapters.json.');
}

// 3. Verify assets/images/8th-adhyaya-end.jpg
const imgPath = path.join(__dirname, '..', 'assets', 'images', '8th-adhyaya-end.jpg');
console.log('\nVerifying completion image asset:');
if (fs.existsSync(imgPath)) {
  const stat = fs.statSync(imgPath);
  console.log(`  ✔ assets/images/8th-adhyaya-end.jpg exists (${(stat.size / 1024).toFixed(1)} KB).`);
} else {
  console.error('❌ Missing assets/images/8th-adhyaya-end.jpg');
  failed = true;
}

// 4. Verify js/app.js syntax and Chapter 8 handlers
const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

try {
  new vm.Script(appJsContent);
  console.log('\n✔ js/app.js: V8 syntax check passed.');
} catch (e) {
  console.error('❌ js/app.js syntax error:', e.message);
  failed = true;
}

if (appJsContent.includes('8th-adhyaya-end.jpg')) {
  console.log('✔ js/app.js references 8th-adhyaya-end.jpg for Chapter 8 completion.');
} else {
  console.error('❌ js/app.js missing 8th-adhyaya-end.jpg reference');
  failed = true;
}

if (appJsContent.includes('अक्षरब्रह्मयोगो नाम अष्टमोऽध्यायः')) {
  console.log('✔ js/app.js includes authentic Chapter 8 colophon.');
} else {
  console.error('❌ js/app.js missing Chapter 8 colophon text');
  failed = true;
}

if (failed) {
  console.error('\n❌ Chapter 8 Verification encountered failures.');
  process.exit(1);
} else {
  console.log('\n==============================================');
  console.log('   ALL CHAPTER 8 VERIFICATIONS PASSED (100%)  ');
  console.log('==============================================');
}
