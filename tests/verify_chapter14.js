const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('====================================================');
console.log('   BHAGAVAD GITA CHAPTER 14 VERIFICATION            ');
console.log('   गुणत्रयविभागयोग • GUNATRAYA VIBHAGA YOGA          ');
console.log('====================================================\n');

let failed = false;

// 1. Verify data/verses/chapter-14.json
const ch14Path = path.join(__dirname, '..', 'data', 'verses', 'chapter-14.json');
if (!fs.existsSync(ch14Path)) {
  console.error('❌ Missing file:', ch14Path);
  process.exit(1);
}

let ch14Data;
try {
  const content = fs.readFileSync(ch14Path, 'utf8');
  ch14Data = JSON.parse(content);
  console.log('✔ data/verses/chapter-14.json: JSON syntax valid.');
} catch (e) {
  console.error('❌ JSON parse error in chapter-14.json:', e.message);
  process.exit(1);
}

// Check chapter meta
if (ch14Data.chapter_number !== 14 && ch14Data.chapter !== 14) {
  console.error(`❌ Expected chapter_number 14, got: ${ch14Data.chapter_number}`);
  failed = true;
} else {
  console.log('✔ chapter_number: 14');
}

if (ch14Data.verses_count !== 27) {
  console.error(`❌ Expected verses_count 27, got: ${ch14Data.verses_count}`);
  failed = true;
} else {
  console.log('✔ verses_count: 27');
}

if (!Array.isArray(ch14Data.verses)) {
  console.error('❌ ch14Data.verses is not an array');
  process.exit(1);
}

if (ch14Data.verses.length !== 27) {
  console.error(`❌ Expected 27 verses in array, found: ${ch14Data.verses.length}`);
  failed = true;
} else {
  console.log(`✔ verses array length: ${ch14Data.verses.length}`);
}

// Check each individual verse schema, speaker tags, and high-fidelity fields
const requiredFields = ['verse_number', 'text_sanskrit', 'transliteration', 'translation', 'meaning', 'speaker', 'word_meanings', 'purport'];
ch14Data.verses.forEach((v, index) => {
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

  // Verify speaker attribution: Verse 21 = Arjuna, Verses 1-20, 22-27 = Bhagavan Sri Krishna
  let expectedSpeaker = (expectedNum === 21) ? 'अर्जुन उवाच' : 'श्रीभगवानुवाच';
  if (v.speaker !== expectedSpeaker) {
    console.error(`❌ Verse ${expectedNum} speaker is "${v.speaker}", expected "${expectedSpeaker}"`);
    failed = true;
  }
});

if (!failed) {
  console.log('✔ All 27 verses strictly adhere to schema with complete Devanagari, transliteration, speaker parsing, word meanings, translation, and purport.');
}

// Check key highlighted shlokas
const keyVerses = [1, 2, 3, 4, 6, 7, 8, 18, 19, 21, 22, 23, 24, 25, 26, 27];
console.log('\nVerifying key theological shlokas:');
keyVerses.forEach(num => {
  const verse = ch14Data.verses.find(v => v.verse_number === num);
  if (verse) {
    const firstLine = verse.text_sanskrit.split('\n')[1] || verse.text_sanskrit.split('\n')[0];
    console.log(`  ✔ BG 14.${num} [${verse.speaker}]: "${firstLine}"`);
  } else {
    console.error(`  ❌ Missing key shloka: BG 14.${num}`);
    failed = true;
  }
});

// 2. Verify data/gita-chapters.json
const chaptersPath = path.join(__dirname, '..', 'data', 'gita-chapters.json');
const chaptersContent = fs.readFileSync(chaptersPath, 'utf8');
const chapters = JSON.parse(chaptersContent);
const ch14Meta = chapters.find(c => c.chapter_number === 14);

console.log('\nVerifying data/gita-chapters.json:');
if (!ch14Meta) {
  console.error('❌ Chapter 14 not found in data/gita-chapters.json');
  failed = true;
} else if (ch14Meta.status !== 'available') {
  console.error(`❌ Chapter 14 status is "${ch14Meta.status}", expected "available"`);
  failed = true;
} else if (ch14Meta.verses_count !== 27) {
  console.error(`❌ Chapter 14 verses_count is ${ch14Meta.verses_count}, expected 27`);
  failed = true;
} else {
  console.log('  ✔ Chapter 14 is marked "available" with 27 verses in gita-chapters.json.');
}

// 3. Verify assets/images/14th-adhyaya-end.jpg
const imgPath = path.join(__dirname, '..', 'assets', 'images', '14th-adhyaya-end.jpg');
console.log('\nVerifying completion image asset:');
if (fs.existsSync(imgPath)) {
  const stat = fs.statSync(imgPath);
  console.log(`  ✔ assets/images/14th-adhyaya-end.jpg exists (${(stat.size / 1024).toFixed(1)} KB).`);
} else {
  console.error('❌ Missing assets/images/14th-adhyaya-end.jpg');
  failed = true;
}

// 4. Verify js/app.js syntax and Chapter 14 handlers
const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

try {
  new vm.Script(appJsContent);
  console.log('\n✔ js/app.js: V8 syntax check passed.');
} catch (e) {
  console.error('❌ js/app.js syntax error:', e.message);
  failed = true;
}

if (appJsContent.includes('14th-adhyaya-end.jpg')) {
  console.log('✔ js/app.js references 14th-adhyaya-end.jpg for Chapter 14 completion.');
} else {
  console.error('❌ js/app.js missing 14th-adhyaya-end.jpg reference');
  failed = true;
}

if (appJsContent.includes('गुणत्रयविभागयोगो नाम चतुर्दशोऽध्यायः')) {
  console.log('✔ js/app.js includes authentic Chapter 14 colophon.');
} else {
  console.error('❌ js/app.js missing Chapter 14 colophon text');
  failed = true;
}

if (failed) {
  console.error('\n❌ Chapter 14 Verification encountered failures.');
  process.exit(1);
} else {
  console.log('\n====================================================');
  console.log('   ALL CHAPTER 14 VERIFICATIONS PASSED (100%)       ');
  console.log('====================================================');
}
