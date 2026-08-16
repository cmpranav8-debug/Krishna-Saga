const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('====================================================');
console.log('   BHAGAVAD GITA CHAPTER 13 VERIFICATION            ');
console.log('   क्षेत्रक्षेत्रज्ञविभागयोग • KSHETRA KSHETRAJNA YOGA');
console.log('====================================================\n');

let failed = false;

// 1. Verify data/verses/chapter-13.json
const ch13Path = path.join(__dirname, '..', 'data', 'verses', 'chapter-13.json');
if (!fs.existsSync(ch13Path)) {
  console.error('❌ Missing file:', ch13Path);
  process.exit(1);
}

let ch13Data;
try {
  const content = fs.readFileSync(ch13Path, 'utf8');
  ch13Data = JSON.parse(content);
  console.log('✔ data/verses/chapter-13.json: JSON syntax valid.');
} catch (e) {
  console.error('❌ JSON parse error in chapter-13.json:', e.message);
  process.exit(1);
}

// Check chapter meta
if (ch13Data.chapter_number !== 13 && ch13Data.chapter !== 13) {
  console.error(`❌ Expected chapter_number 13, got: ${ch13Data.chapter_number}`);
  failed = true;
} else {
  console.log('✔ chapter_number: 13');
}

if (ch13Data.verses_count !== 35) {
  console.error(`❌ Expected verses_count 35, got: ${ch13Data.verses_count}`);
  failed = true;
} else {
  console.log('✔ verses_count: 35');
}

if (!Array.isArray(ch13Data.verses)) {
  console.error('❌ ch13Data.verses is not an array');
  process.exit(1);
}

if (ch13Data.verses.length !== 35) {
  console.error(`❌ Expected 35 verses in array, found: ${ch13Data.verses.length}`);
  failed = true;
} else {
  console.log(`✔ verses array length: ${ch13Data.verses.length}`);
}

// Check each individual verse schema, speaker tags, and high-fidelity fields
const requiredFields = ['verse_number', 'text_sanskrit', 'transliteration', 'translation', 'meaning', 'speaker', 'word_meanings', 'purport'];
ch13Data.verses.forEach((v, index) => {
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

  // Verify speaker attribution: Verse 1 = Arjuna, Verses 2-35 = Bhagavan Sri Krishna
  let expectedSpeaker = (expectedNum === 1) ? 'अर्जुन उवाच' : 'श्रीभगवानुवाच';
  if (v.speaker !== expectedSpeaker) {
    console.error(`❌ Verse ${expectedNum} speaker is "${v.speaker}", expected "${expectedSpeaker}"`);
    failed = true;
  }
});

if (!failed) {
  console.log('✔ All 35 verses strictly adhere to schema with complete Devanagari, transliteration, speaker parsing, word meanings, translation, and purport.');
}

// Check key highlighted shlokas
const keyVerses = [1, 2, 3, 8, 9, 10, 11, 12, 13, 14, 18, 23, 28, 34, 35];
console.log('\nVerifying key theological shlokas:');
keyVerses.forEach(num => {
  const verse = ch13Data.verses.find(v => v.verse_number === num);
  if (verse) {
    const firstLine = verse.text_sanskrit.split('\n')[1] || verse.text_sanskrit.split('\n')[0];
    console.log(`  ✔ BG 13.${num} [${verse.speaker}]: "${firstLine}"`);
  } else {
    console.error(`  ❌ Missing key shloka: BG 13.${num}`);
    failed = true;
  }
});

// 2. Verify data/gita-chapters.json
const chaptersPath = path.join(__dirname, '..', 'data', 'gita-chapters.json');
const chaptersContent = fs.readFileSync(chaptersPath, 'utf8');
const chapters = JSON.parse(chaptersContent);
const ch13Meta = chapters.find(c => c.chapter_number === 13);

console.log('\nVerifying data/gita-chapters.json:');
if (!ch13Meta) {
  console.error('❌ Chapter 13 not found in data/gita-chapters.json');
  failed = true;
} else if (ch13Meta.status !== 'available') {
  console.error(`❌ Chapter 13 status is "${ch13Meta.status}", expected "available"`);
  failed = true;
} else if (ch13Meta.verses_count !== 35) {
  console.error(`❌ Chapter 13 verses_count is ${ch13Meta.verses_count}, expected 35`);
  failed = true;
} else {
  console.log('  ✔ Chapter 13 is marked "available" with 35 verses in gita-chapters.json.');
}

// 3. Verify assets/images/13th-adhyaya-end.jpg
const imgPath = path.join(__dirname, '..', 'assets', 'images', '13th-adhyaya-end.jpg');
console.log('\nVerifying completion image asset:');
if (fs.existsSync(imgPath)) {
  const stat = fs.statSync(imgPath);
  console.log(`  ✔ assets/images/13th-adhyaya-end.jpg exists (${(stat.size / 1024).toFixed(1)} KB).`);
} else {
  console.error('❌ Missing assets/images/13th-adhyaya-end.jpg');
  failed = true;
}

// 4. Verify js/app.js syntax and Chapter 13 handlers
const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

try {
  new vm.Script(appJsContent);
  console.log('\n✔ js/app.js: V8 syntax check passed.');
} catch (e) {
  console.error('❌ js/app.js syntax error:', e.message);
  failed = true;
}

if (appJsContent.includes('13th-adhyaya-end.jpg')) {
  console.log('✔ js/app.js references 13th-adhyaya-end.jpg for Chapter 13 completion.');
} else {
  console.error('❌ js/app.js missing 13th-adhyaya-end.jpg reference');
  failed = true;
}

if (appJsContent.includes('क्षेत्रक्षेत्रज्ञविभागयोगो नाम त्रयोदशोऽध्यायः')) {
  console.log('✔ js/app.js includes authentic Chapter 13 colophon.');
} else {
  console.error('❌ js/app.js missing Chapter 13 colophon text');
  failed = true;
}

if (failed) {
  console.error('\n❌ Chapter 13 Verification encountered failures.');
  process.exit(1);
} else {
  console.log('\n====================================================');
  console.log('   ALL CHAPTER 13 VERIFICATIONS PASSED (100%)       ');
  console.log('====================================================');
}
