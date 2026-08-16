const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('====================================================');
console.log('   BHAGAVAD GITA CHAPTER 16 VERIFICATION            ');
console.log('   दैवासुरसम्पद्विभागयोग • DAIVASURA SAMPAD YOGA      ');
console.log('====================================================\n');

let failed = false;

// 1. Verify data/verses/chapter-16.json
const ch16Path = path.join(__dirname, '..', 'data', 'verses', 'chapter-16.json');
if (!fs.existsSync(ch16Path)) {
  console.error('❌ Missing file:', ch16Path);
  process.exit(1);
}

let ch16Data;
try {
  const content = fs.readFileSync(ch16Path, 'utf8');
  ch16Data = JSON.parse(content);
  console.log('✔ data/verses/chapter-16.json: JSON syntax valid.');
} catch (e) {
  console.error('❌ JSON parse error in chapter-16.json:', e.message);
  process.exit(1);
}

// Check chapter meta
if (ch16Data.chapter_number !== 16 && ch16Data.chapter !== 16) {
  console.error(`❌ Expected chapter_number 16, got: ${ch16Data.chapter_number}`);
  failed = true;
} else {
  console.log('✔ chapter_number: 16');
}

if (ch16Data.verses_count !== 24) {
  console.error(`❌ Expected verses_count 24, got: ${ch16Data.verses_count}`);
  failed = true;
} else {
  console.log('✔ verses_count: 24');
}

if (!Array.isArray(ch16Data.verses)) {
  console.error('❌ ch16Data.verses is not an array');
  process.exit(1);
}

if (ch16Data.verses.length !== 24) {
  console.error(`❌ Expected 24 verses in array, found: ${ch16Data.verses.length}`);
  failed = true;
} else {
  console.log(`✔ verses array length: ${ch16Data.verses.length}`);
}

// Check each individual verse schema, speaker tags, and high-fidelity fields
const requiredFields = ['verse_number', 'text_sanskrit', 'transliteration', 'translation', 'meaning', 'speaker', 'word_meanings', 'purport'];
ch16Data.verses.forEach((v, index) => {
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

  // Verify speaker attribution: Verses 1-24 = Bhagavan Sri Krishna
  let expectedSpeaker = 'श्रीभगवानुवाच';
  if (v.speaker !== expectedSpeaker) {
    console.error(`❌ Verse ${expectedNum} speaker is "${v.speaker}", expected "${expectedSpeaker}"`);
    failed = true;
  }
});

if (!failed) {
  console.log('✔ All 24 verses strictly adhere to schema with complete Devanagari, transliteration, speaker parsing, word meanings, translation, and purport.');
}

// Check key highlighted shlokas
const keyVerses = [1, 2, 3, 4, 5, 7, 8, 9, 10, 13, 14, 15, 21, 22, 23, 24];
console.log('\nVerifying key theological shlokas:');
keyVerses.forEach(num => {
  const verse = ch16Data.verses.find(v => v.verse_number === num);
  if (verse) {
    const firstLine = verse.text_sanskrit.split('\n')[1] || verse.text_sanskrit.split('\n')[0];
    console.log(`  ✔ BG 16.${num} [${verse.speaker}]: "${firstLine}"`);
  } else {
    console.error(`  ❌ Missing key shloka: BG 16.${num}`);
    failed = true;
  }
});

// 2. Verify data/gita-chapters.json
const chaptersPath = path.join(__dirname, '..', 'data', 'gita-chapters.json');
const chaptersContent = fs.readFileSync(chaptersPath, 'utf8');
const chapters = JSON.parse(chaptersContent);
const ch16Meta = chapters.find(c => c.chapter_number === 16);

console.log('\nVerifying data/gita-chapters.json:');
if (!ch16Meta) {
  console.error('❌ Chapter 16 not found in data/gita-chapters.json');
  failed = true;
} else if (ch16Meta.status !== 'available') {
  console.error(`❌ Chapter 16 status is "${ch16Meta.status}", expected "available"`);
  failed = true;
} else if (ch16Meta.verses_count !== 24) {
  console.error(`❌ Chapter 16 verses_count is ${ch16Meta.verses_count}, expected 24`);
  failed = true;
} else {
  console.log('  ✔ Chapter 16 is marked "available" with 24 verses in gita-chapters.json.');
}

// 3. Verify assets/images/16th-adhyaya-end.jpg
const imgPath = path.join(__dirname, '..', 'assets', 'images', '16th-adhyaya-end.jpg');
console.log('\nVerifying completion image asset:');
if (fs.existsSync(imgPath)) {
  const stat = fs.statSync(imgPath);
  console.log(`  ✔ assets/images/16th-adhyaya-end.jpg exists (${(stat.size / 1024).toFixed(1)} KB).`);
} else {
  console.error('❌ Missing assets/images/16th-adhyaya-end.jpg');
  failed = true;
}

// 4. Verify js/app.js syntax and Chapter 16 handlers
const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

try {
  new vm.Script(appJsContent);
  console.log('\n✔ js/app.js: V8 syntax check passed.');
} catch (e) {
  console.error('❌ js/app.js syntax error:', e.message);
  failed = true;
}

if (appJsContent.includes('16th-adhyaya-end.jpg')) {
  console.log('✔ js/app.js references 16th-adhyaya-end.jpg for Chapter 16 completion.');
} else {
  console.error('❌ js/app.js missing 16th-adhyaya-end.jpg reference');
  failed = true;
}

if (appJsContent.includes('दैवासुरसम्पद्विभागयोगो नाम षोडशोऽध्यायः')) {
  console.log('✔ js/app.js includes authentic Chapter 16 colophon.');
} else {
  console.error('❌ js/app.js missing Chapter 16 colophon text');
  failed = true;
}

if (failed) {
  console.error('\n❌ Chapter 16 Verification encountered failures.');
  process.exit(1);
} else {
  console.log('\n====================================================');
  console.log('   ALL CHAPTER 16 VERIFICATIONS PASSED (100%)       ');
  console.log('====================================================');
}
