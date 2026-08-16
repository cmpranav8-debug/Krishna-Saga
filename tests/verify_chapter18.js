const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('====================================================');
console.log('   BHAGAVAD GITA CHAPTER 18 VERIFICATION            ');
console.log('   मोक्षसंन्यासयोग • MOKSHA SANNYASA YOGA (GRAND FINALE)');
console.log('====================================================\n');

let failed = false;

// 1. Verify data/verses/chapter-18.json
const ch18Path = path.join(__dirname, '..', 'data', 'verses', 'chapter-18.json');
if (!fs.existsSync(ch18Path)) {
  console.error('❌ Missing file:', ch18Path);
  process.exit(1);
}

let ch18Data;
try {
  const content = fs.readFileSync(ch18Path, 'utf8');
  ch18Data = JSON.parse(content);
  console.log('✔ data/verses/chapter-18.json: JSON syntax valid.');
} catch (e) {
  console.error('❌ JSON parse error in chapter-18.json:', e.message);
  process.exit(1);
}

// Check chapter meta
if (ch18Data.chapter_number !== 18 && ch18Data.chapter !== 18) {
  console.error(`❌ Expected chapter_number 18, got: ${ch18Data.chapter_number}`);
  failed = true;
} else {
  console.log('✔ chapter_number: 18');
}

if (ch18Data.verses_count !== 78) {
  console.error(`❌ Expected verses_count 78, got: ${ch18Data.verses_count}`);
  failed = true;
} else {
  console.log('✔ verses_count: 78');
}

if (!Array.isArray(ch18Data.verses)) {
  console.error('❌ ch18Data.verses is not an array');
  process.exit(1);
}

if (ch18Data.verses.length !== 78) {
  console.error(`❌ Expected 78 verses in array, found: ${ch18Data.verses.length}`);
  failed = true;
} else {
  console.log(`✔ verses array length: ${ch18Data.verses.length}`);
}

// Check each individual verse schema, speaker tags, and high-fidelity fields
const requiredFields = ['verse_number', 'text_sanskrit', 'transliteration', 'translation', 'meaning', 'speaker', 'word_meanings', 'purport'];
ch18Data.verses.forEach((v, index) => {
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

  // Verify speaker attribution: Verse 1 = Arjuna, Verses 2-72 = Sri Krishna, Verse 73 = Arjuna, Verses 74-78 = Sanjaya
  let expectedSpeaker;
  if (expectedNum === 1 || expectedNum === 73) {
    expectedSpeaker = 'अर्जुन उवाच';
  } else if (expectedNum >= 2 && expectedNum <= 72) {
    expectedSpeaker = 'श्रीभगवानुवाच';
  } else {
    expectedSpeaker = 'सञ्जय उवाच';
  }

  if (v.speaker !== expectedSpeaker) {
    console.error(`❌ Verse ${expectedNum} speaker is "${v.speaker}", expected "${expectedSpeaker}"`);
    failed = true;
  }
});

if (!failed) {
  console.log('✔ All 78 verses strictly adhere to schema with complete Devanagari, transliteration, accurate speaker transitions, word meanings, translation, and purport.');
}

// Check key highlighted shlokas
const keyVerses = [1, 2, 6, 14, 20, 30, 37, 42, 46, 47, 54, 55, 61, 62, 63, 65, 66, 70, 73, 78];
console.log('\nVerifying key theological shlokas:');
keyVerses.forEach(num => {
  const verse = ch18Data.verses.find(v => v.verse_number === num);
  if (verse) {
    const firstLine = verse.text_sanskrit.split('\n')[1] || verse.text_sanskrit.split('\n')[0];
    console.log(`  ✔ BG 18.${num} [${verse.speaker}]: "${firstLine}"`);
  } else {
    console.error(`  ❌ Missing key shloka: BG 18.${num}`);
    failed = true;
  }
});

// 2. Verify data/gita-chapters.json
const chaptersPath = path.join(__dirname, '..', 'data', 'gita-chapters.json');
const chaptersContent = fs.readFileSync(chaptersPath, 'utf8');
const chapters = JSON.parse(chaptersContent);
const ch18Meta = chapters.find(c => c.chapter_number === 18);

console.log('\nVerifying data/gita-chapters.json:');
if (!ch18Meta) {
  console.error('❌ Chapter 18 not found in data/gita-chapters.json');
  failed = true;
} else if (ch18Meta.status !== 'available') {
  console.error(`❌ Chapter 18 status is "${ch18Meta.status}", expected "available"`);
  failed = true;
} else if (ch18Meta.verses_count !== 78) {
  console.error(`❌ Chapter 18 verses_count is ${ch18Meta.verses_count}, expected 78`);
  failed = true;
} else {
  console.log('  ✔ Chapter 18 is marked "available" with 78 verses in gita-chapters.json.');
}

// 3. Verify assets/images/18th-adhyaya-end.jpg
const imgPath = path.join(__dirname, '..', 'assets', 'images', '18th-adhyaya-end.jpg');
console.log('\nVerifying completion image asset:');
if (fs.existsSync(imgPath)) {
  const stat = fs.statSync(imgPath);
  console.log(`  ✔ assets/images/18th-adhyaya-end.jpg exists (${(stat.size / 1024).toFixed(1)} KB).`);
} else {
  console.error('❌ Missing assets/images/18th-adhyaya-end.jpg');
  failed = true;
}

// 4. Verify js/app.js syntax and Chapter 18 handlers
const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

try {
  new vm.Script(appJsContent);
  console.log('\n✔ js/app.js: V8 syntax check passed.');
} catch (e) {
  console.error('❌ js/app.js syntax error:', e.message);
  failed = true;
}

if (appJsContent.includes('18th-adhyaya-end.jpg')) {
  console.log('✔ js/app.js references 18th-adhyaya-end.jpg for Chapter 18 completion.');
} else {
  console.error('❌ js/app.js missing 18th-adhyaya-end.jpg reference');
  failed = true;
}

if (appJsContent.includes('मोक्षसंन्यासयोगो नाम अष्टादशोऽध्यायः')) {
  console.log('✔ js/app.js includes authentic Chapter 18 colophon.');
} else {
  console.error('❌ js/app.js missing Chapter 18 colophon text');
  failed = true;
}

if (appJsContent.includes('इति श्रीमद्भगवद्गीता समाप्ता')) {
  console.log('✔ js/app.js includes the sacred grand concluding line "॥ इति श्रीमद्भगवद्गीता समाप्ता ॥".');
} else {
  console.error('❌ js/app.js missing "॥ इति श्रीमद्भगवद्गीता समाप्ता ॥"');
  failed = true;
}

if (failed) {
  console.error('\n❌ Chapter 18 Verification encountered failures.');
  process.exit(1);
} else {
  console.log('\n====================================================');
  console.log('   ALL CHAPTER 18 VERIFICATIONS PASSED (100%)       ');
  console.log('====================================================');
}
