const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('====================================================');
console.log('   BHAGAVAD GITA CHAPTER 15 VERIFICATION            ');
console.log('   पुरुषोत्तमयोग • PURUSHOTTAMA YOGA                 ');
console.log('====================================================\n');

let failed = false;

// 1. Verify data/verses/chapter-15.json
const ch15Path = path.join(__dirname, '..', 'data', 'verses', 'chapter-15.json');
if (!fs.existsSync(ch15Path)) {
  console.error('❌ Missing file:', ch15Path);
  process.exit(1);
}

let ch15Data;
try {
  const content = fs.readFileSync(ch15Path, 'utf8');
  ch15Data = JSON.parse(content);
  console.log('✔ data/verses/chapter-15.json: JSON syntax valid.');
} catch (e) {
  console.error('❌ JSON parse error in chapter-15.json:', e.message);
  process.exit(1);
}

// Check chapter meta
if (ch15Data.chapter_number !== 15 && ch15Data.chapter !== 15) {
  console.error(`❌ Expected chapter_number 15, got: ${ch15Data.chapter_number}`);
  failed = true;
} else {
  console.log('✔ chapter_number: 15');
}

if (ch15Data.verses_count !== 20) {
  console.error(`❌ Expected verses_count 20, got: ${ch15Data.verses_count}`);
  failed = true;
} else {
  console.log('✔ verses_count: 20');
}

if (!Array.isArray(ch15Data.verses)) {
  console.error('❌ ch15Data.verses is not an array');
  process.exit(1);
}

if (ch15Data.verses.length !== 20) {
  console.error(`❌ Expected 20 verses in array, found: ${ch15Data.verses.length}`);
  failed = true;
} else {
  console.log(`✔ verses array length: ${ch15Data.verses.length}`);
}

// Check each individual verse schema, speaker tags, and high-fidelity fields
const requiredFields = ['verse_number', 'text_sanskrit', 'transliteration', 'translation', 'meaning', 'speaker', 'word_meanings', 'purport'];
ch15Data.verses.forEach((v, index) => {
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

  // Verify speaker attribution: Verses 1-20 = Bhagavan Sri Krishna
  let expectedSpeaker = 'श्रीभगवानुवाच';
  if (v.speaker !== expectedSpeaker) {
    console.error(`❌ Verse ${expectedNum} speaker is "${v.speaker}", expected "${expectedSpeaker}"`);
    failed = true;
  }
});

if (!failed) {
  console.log('✔ All 20 verses strictly adhere to schema with complete Devanagari, transliteration, speaker parsing, word meanings, translation, and purport.');
}

// Check key highlighted shlokas
const keyVerses = [1, 3, 4, 5, 6, 7, 10, 12, 14, 15, 16, 17, 18, 19, 20];
console.log('\nVerifying key theological shlokas:');
keyVerses.forEach(num => {
  const verse = ch15Data.verses.find(v => v.verse_number === num);
  if (verse) {
    const firstLine = verse.text_sanskrit.split('\n')[1] || verse.text_sanskrit.split('\n')[0];
    console.log(`  ✔ BG 15.${num} [${verse.speaker}]: "${firstLine}"`);
  } else {
    console.error(`  ❌ Missing key shloka: BG 15.${num}`);
    failed = true;
  }
});

// 2. Verify data/gita-chapters.json
const chaptersPath = path.join(__dirname, '..', 'data', 'gita-chapters.json');
const chaptersContent = fs.readFileSync(chaptersPath, 'utf8');
const chapters = JSON.parse(chaptersContent);
const ch15Meta = chapters.find(c => c.chapter_number === 15);

console.log('\nVerifying data/gita-chapters.json:');
if (!ch15Meta) {
  console.error('❌ Chapter 15 not found in data/gita-chapters.json');
  failed = true;
} else if (ch15Meta.status !== 'available') {
  console.error(`❌ Chapter 15 status is "${ch15Meta.status}", expected "available"`);
  failed = true;
} else if (ch15Meta.verses_count !== 20) {
  console.error(`❌ Chapter 15 verses_count is ${ch15Meta.verses_count}, expected 20`);
  failed = true;
} else {
  console.log('  ✔ Chapter 15 is marked "available" with 20 verses in gita-chapters.json.');
}

// 3. Verify assets/images/15th-adhyaya-end.jpg
const imgPath = path.join(__dirname, '..', 'assets', 'images', '15th-adhyaya-end.jpg');
console.log('\nVerifying completion image asset:');
if (fs.existsSync(imgPath)) {
  const stat = fs.statSync(imgPath);
  console.log(`  ✔ assets/images/15th-adhyaya-end.jpg exists (${(stat.size / 1024).toFixed(1)} KB).`);
} else {
  console.error('❌ Missing assets/images/15th-adhyaya-end.jpg');
  failed = true;
}

// 4. Verify js/app.js syntax and Chapter 15 handlers
const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

try {
  new vm.Script(appJsContent);
  console.log('\n✔ js/app.js: V8 syntax check passed.');
} catch (e) {
  console.error('❌ js/app.js syntax error:', e.message);
  failed = true;
}

if (appJsContent.includes('15th-adhyaya-end.jpg')) {
  console.log('✔ js/app.js references 15th-adhyaya-end.jpg for Chapter 15 completion.');
} else {
  console.error('❌ js/app.js missing 15th-adhyaya-end.jpg reference');
  failed = true;
}

if (appJsContent.includes('पुरुषोत्तमयोगो नाम पञ्चदशोऽध्यायः')) {
  console.log('✔ js/app.js includes authentic Chapter 15 colophon.');
} else {
  console.error('❌ js/app.js missing Chapter 15 colophon text');
  failed = true;
}

if (failed) {
  console.error('\n❌ Chapter 15 Verification encountered failures.');
  process.exit(1);
} else {
  console.log('\n====================================================');
  console.log('   ALL CHAPTER 15 VERIFICATIONS PASSED (100%)       ');
  console.log('====================================================');
}
