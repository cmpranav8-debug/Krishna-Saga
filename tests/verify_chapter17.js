const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('====================================================');
console.log('   BHAGAVAD GITA CHAPTER 17 VERIFICATION            ');
console.log('   श्रद्धात्रयविभागयोग • SHRADDHATRAYA VIBHAGA YOGA   ');
console.log('====================================================\n');

let failed = false;

// 1. Verify data/verses/chapter-17.json
const ch17Path = path.join(__dirname, '..', 'data', 'verses', 'chapter-17.json');
if (!fs.existsSync(ch17Path)) {
  console.error('❌ Missing file:', ch17Path);
  process.exit(1);
}

let ch17Data;
try {
  const content = fs.readFileSync(ch17Path, 'utf8');
  ch17Data = JSON.parse(content);
  console.log('✔ data/verses/chapter-17.json: JSON syntax valid.');
} catch (e) {
  console.error('❌ JSON parse error in chapter-17.json:', e.message);
  process.exit(1);
}

// Check chapter meta
if (ch17Data.chapter_number !== 17 && ch17Data.chapter !== 17) {
  console.error(`❌ Expected chapter_number 17, got: ${ch17Data.chapter_number}`);
  failed = true;
} else {
  console.log('✔ chapter_number: 17');
}

if (ch17Data.verses_count !== 28) {
  console.error(`❌ Expected verses_count 28, got: ${ch17Data.verses_count}`);
  failed = true;
} else {
  console.log('✔ verses_count: 28');
}

if (!Array.isArray(ch17Data.verses)) {
  console.error('❌ ch17Data.verses is not an array');
  process.exit(1);
}

if (ch17Data.verses.length !== 28) {
  console.error(`❌ Expected 28 verses in array, found: ${ch17Data.verses.length}`);
  failed = true;
} else {
  console.log(`✔ verses array length: ${ch17Data.verses.length}`);
}

// Check each individual verse schema, speaker tags, and high-fidelity fields
const requiredFields = ['verse_number', 'text_sanskrit', 'transliteration', 'translation', 'meaning', 'speaker', 'word_meanings', 'purport'];
ch17Data.verses.forEach((v, index) => {
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

  // Verify speaker attribution: Verse 1 = Arjuna, Verses 2-28 = Sri Krishna
  let expectedSpeaker = (expectedNum === 1) ? 'अर्जुन उवाच' : 'श्रीभगवानुवाच';
  if (v.speaker !== expectedSpeaker) {
    console.error(`❌ Verse ${expectedNum} speaker is "${v.speaker}", expected "${expectedSpeaker}"`);
    failed = true;
  }
});

if (!failed) {
  console.log('✔ All 28 verses strictly adhere to schema with complete Devanagari, transliteration, speaker parsing, word meanings, translation, and purport.');
}

// Check key highlighted shlokas
const keyVerses = [1, 2, 3, 4, 7, 8, 9, 10, 11, 14, 15, 16, 20, 23, 24, 25, 26, 27, 28];
console.log('\nVerifying key theological shlokas:');
keyVerses.forEach(num => {
  const verse = ch17Data.verses.find(v => v.verse_number === num);
  if (verse) {
    const firstLine = verse.text_sanskrit.split('\n')[1] || verse.text_sanskrit.split('\n')[0];
    console.log(`  ✔ BG 17.${num} [${verse.speaker}]: "${firstLine}"`);
  } else {
    console.error(`  ❌ Missing key shloka: BG 17.${num}`);
    failed = true;
  }
});

// 2. Verify data/gita-chapters.json
const chaptersPath = path.join(__dirname, '..', 'data', 'gita-chapters.json');
const chaptersContent = fs.readFileSync(chaptersPath, 'utf8');
const chapters = JSON.parse(chaptersContent);
const ch17Meta = chapters.find(c => c.chapter_number === 17);

console.log('\nVerifying data/gita-chapters.json:');
if (!ch17Meta) {
  console.error('❌ Chapter 17 not found in data/gita-chapters.json');
  failed = true;
} else if (ch17Meta.status !== 'available') {
  console.error(`❌ Chapter 17 status is "${ch17Meta.status}", expected "available"`);
  failed = true;
} else if (ch17Meta.verses_count !== 28) {
  console.error(`❌ Chapter 17 verses_count is ${ch17Meta.verses_count}, expected 28`);
  failed = true;
} else {
  console.log('  ✔ Chapter 17 is marked "available" with 28 verses in gita-chapters.json.');
}

// 3. Verify assets/images/Madhav ✨.jpg
const imgPath = path.join(__dirname, '..', 'assets', 'images', 'Madhav ✨.jpg');
console.log('\nVerifying completion image asset:');
if (fs.existsSync(imgPath)) {
  const stat = fs.statSync(imgPath);
  console.log(`  ✔ assets/images/Madhav ✨.jpg exists (${(stat.size / 1024).toFixed(1)} KB).`);
} else {
  console.error('❌ Missing assets/images/Madhav ✨.jpg');
  failed = true;
}

// 4. Verify js/app.js syntax and Chapter 17 handlers
const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

try {
  new vm.Script(appJsContent);
  console.log('\n✔ js/app.js: V8 syntax check passed.');
} catch (e) {
  console.error('❌ js/app.js syntax error:', e.message);
  failed = true;
}

if (appJsContent.includes('Madhav ✨.jpg')) {
  console.log('✔ js/app.js references Madhav ✨.jpg for Chapter 17 completion.');
} else {
  console.error('❌ js/app.js missing Madhav ✨.jpg reference');
  failed = true;
}

if (appJsContent.includes('श्रद्धात्रयविभागयोगो नाम सप्तदशोऽध्यायः')) {
  console.log('✔ js/app.js includes authentic Chapter 17 colophon.');
} else {
  console.error('❌ js/app.js missing Chapter 17 colophon text');
  failed = true;
}

if (failed) {
  console.error('\n❌ Chapter 17 Verification encountered failures.');
  process.exit(1);
} else {
  console.log('\n====================================================');
  console.log('   ALL CHAPTER 17 VERIFICATIONS PASSED (100%)       ');
  console.log('====================================================');
}
