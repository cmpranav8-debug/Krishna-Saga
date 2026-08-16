const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('==============================================');
console.log('   BHAGAVAD GITA CHAPTER 10 VERIFICATION      ');
console.log('   विभूतियोग • VIBHUTI YOGA                    ');
console.log('==============================================\n');

let failed = false;

// 1. Verify data/verses/chapter-10.json
const ch10Path = path.join(__dirname, '..', 'data', 'verses', 'chapter-10.json');
if (!fs.existsSync(ch10Path)) {
  console.error('❌ Missing file:', ch10Path);
  process.exit(1);
}

let ch10Data;
try {
  const content = fs.readFileSync(ch10Path, 'utf8');
  ch10Data = JSON.parse(content);
  console.log('✔ data/verses/chapter-10.json: JSON syntax valid.');
} catch (e) {
  console.error('❌ JSON parse error in chapter-10.json:', e.message);
  process.exit(1);
}

// Check chapter meta
if (ch10Data.chapter_number !== 10 && ch10Data.chapter !== 10) {
  console.error(`❌ Expected chapter_number 10, got: ${ch10Data.chapter_number}`);
  failed = true;
} else {
  console.log('✔ chapter_number: 10');
}

if (ch10Data.verses_count !== 42) {
  console.error(`❌ Expected verses_count 42, got: ${ch10Data.verses_count}`);
  failed = true;
} else {
  console.log('✔ verses_count: 42');
}

if (!Array.isArray(ch10Data.verses)) {
  console.error('❌ ch10Data.verses is not an array');
  process.exit(1);
}

if (ch10Data.verses.length !== 42) {
  console.error(`❌ Expected 42 verses in array, found: ${ch10Data.verses.length}`);
  failed = true;
} else {
  console.log(`✔ verses array length: ${ch10Data.verses.length}`);
}

// Check each individual verse schema and high-fidelity fields
const requiredFields = ['verse_number', 'text_sanskrit', 'transliteration', 'translation', 'meaning', 'speaker', 'word_meanings'];
ch10Data.verses.forEach((v, index) => {
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

  // Verify speaker validity (1-11 Sri Krishna, 12-18 Arjuna, 19-42 Sri Krishna)
  let expectedSpeaker;
  if (expectedNum >= 12 && expectedNum <= 18) {
    expectedSpeaker = 'अर्जुन उवाच';
  } else {
    expectedSpeaker = 'श्रीभगवानुवाच';
  }

  if (v.speaker !== expectedSpeaker) {
    console.error(`❌ Verse ${expectedNum} speaker is "${v.speaker}", expected "${expectedSpeaker}"`);
    failed = true;
  }
});

if (!failed) {
  console.log('✔ All 42 verses strictly adhere to schema with complete Devanagari, transliteration, speaker, word meanings, translation, and purport.');
}

// Check key highlighted shlokas (including Chatushloki Gita 10.8-10.11)
const keyVerses = [1, 2, 3, 8, 9, 10, 11, 12, 19, 20, 21, 22, 25, 37, 39, 41, 42];
console.log('\nVerifying key philosophical shlokas & Chatushloki Gita:');
keyVerses.forEach(num => {
  const verse = ch10Data.verses.find(v => v.verse_number === num);
  if (verse) {
    const firstLine = verse.text_sanskrit.split('\n')[0];
    console.log(`  ✔ BG 10.${num} [${verse.speaker}]: "${firstLine}"`);
  } else {
    console.error(`  ❌ Missing key shloka: BG 10.${num}`);
    failed = true;
  }
});

// 2. Verify data/gita-chapters.json
const chaptersPath = path.join(__dirname, '..', 'data', 'gita-chapters.json');
const chaptersContent = fs.readFileSync(chaptersPath, 'utf8');
const chapters = JSON.parse(chaptersContent);
const ch10Meta = chapters.find(c => c.chapter_number === 10);

console.log('\nVerifying data/gita-chapters.json:');
if (!ch10Meta) {
  console.error('❌ Chapter 10 not found in data/gita-chapters.json');
  failed = true;
} else if (ch10Meta.status !== 'available') {
  console.error(`❌ Chapter 10 status is "${ch10Meta.status}", expected "available"`);
  failed = true;
} else if (ch10Meta.verses_count !== 42) {
  console.error(`❌ Chapter 10 verses_count is ${ch10Meta.verses_count}, expected 42`);
  failed = true;
} else {
  console.log('  ✔ Chapter 10 is marked "available" with 42 verses in gita-chapters.json.');
}

// 3. Verify assets/images/10th-adhyaya-end.jpg
const imgPath = path.join(__dirname, '..', 'assets', 'images', '10th-adhyaya-end.jpg');
console.log('\nVerifying completion image asset:');
if (fs.existsSync(imgPath)) {
  const stat = fs.statSync(imgPath);
  console.log(`  ✔ assets/images/10th-adhyaya-end.jpg exists (${(stat.size / 1024).toFixed(1)} KB).`);
} else {
  console.error('❌ Missing assets/images/10th-adhyaya-end.jpg');
  failed = true;
}

// 4. Verify js/app.js syntax and Chapter 10 handlers
const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

try {
  new vm.Script(appJsContent);
  console.log('\n✔ js/app.js: V8 syntax check passed.');
} catch (e) {
  console.error('❌ js/app.js syntax error:', e.message);
  failed = true;
}

if (appJsContent.includes('10th-adhyaya-end.jpg')) {
  console.log('✔ js/app.js references 10th-adhyaya-end.jpg for Chapter 10 completion.');
} else {
  console.error('❌ js/app.js missing 10th-adhyaya-end.jpg reference');
  failed = true;
}

if (appJsContent.includes('विभूतियोगो नाम दशमोऽध्यायः')) {
  console.log('✔ js/app.js includes authentic Chapter 10 colophon.');
} else {
  console.error('❌ js/app.js missing Chapter 10 colophon text');
  failed = true;
}

if (failed) {
  console.error('\n❌ Chapter 10 Verification encountered failures.');
  process.exit(1);
} else {
  console.log('\n==============================================');
  console.log('   ALL CHAPTER 10 VERIFICATIONS PASSED (100%) ');
  console.log('==============================================');
}
