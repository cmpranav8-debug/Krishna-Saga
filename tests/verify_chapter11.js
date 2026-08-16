const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('==============================================');
console.log('   BHAGAVAD GITA CHAPTER 11 VERIFICATION      ');
console.log('   विश्वरूपदर्शनयोग • VISHVARUPA DARSHANA YOGA ');
console.log('==============================================\n');

let failed = false;

// 1. Verify data/verses/chapter-11.json
const ch11Path = path.join(__dirname, '..', 'data', 'verses', 'chapter-11.json');
if (!fs.existsSync(ch11Path)) {
  console.error('❌ Missing file:', ch11Path);
  process.exit(1);
}

let ch11Data;
try {
  const content = fs.readFileSync(ch11Path, 'utf8');
  ch11Data = JSON.parse(content);
  console.log('✔ data/verses/chapter-11.json: JSON syntax valid.');
} catch (e) {
  console.error('❌ JSON parse error in chapter-11.json:', e.message);
  process.exit(1);
}

// Check chapter meta
if (ch11Data.chapter_number !== 11 && ch11Data.chapter !== 11) {
  console.error(`❌ Expected chapter_number 11, got: ${ch11Data.chapter_number}`);
  failed = true;
} else {
  console.log('✔ chapter_number: 11');
}

if (ch11Data.verses_count !== 55) {
  console.error(`❌ Expected verses_count 55, got: ${ch11Data.verses_count}`);
  failed = true;
} else {
  console.log('✔ verses_count: 55');
}

if (!Array.isArray(ch11Data.verses)) {
  console.error('❌ ch11Data.verses is not an array');
  process.exit(1);
}

if (ch11Data.verses.length !== 55) {
  console.error(`❌ Expected 55 verses in array, found: ${ch11Data.verses.length}`);
  failed = true;
} else {
  console.log(`✔ verses array length: ${ch11Data.verses.length}`);
}

// Check each individual verse schema, speaker tags, and high-fidelity fields
const requiredFields = ['verse_number', 'text_sanskrit', 'transliteration', 'translation', 'meaning', 'speaker', 'word_meanings'];
ch11Data.verses.forEach((v, index) => {
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

  // Verify exact speaker attribution for all 11 dialogue shifts in Chapter 11
  let expectedSpeaker;
  if (expectedNum >= 1 && expectedNum <= 4) {
    expectedSpeaker = 'अर्जुन उवाच';
  } else if (expectedNum >= 5 && expectedNum <= 8) {
    expectedSpeaker = 'श्रीभगवानुवाच';
  } else if (expectedNum >= 9 && expectedNum <= 14) {
    expectedSpeaker = 'सञ्जय उवाच';
  } else if (expectedNum >= 15 && expectedNum <= 31) {
    expectedSpeaker = 'अर्जुन उवाच';
  } else if (expectedNum >= 32 && expectedNum <= 34) {
    expectedSpeaker = 'श्रीभगवानुवाच';
  } else if (expectedNum === 35) {
    expectedSpeaker = 'सञ्जय उवाच';
  } else if (expectedNum >= 36 && expectedNum <= 46) {
    expectedSpeaker = 'अर्जुन उवाच';
  } else if (expectedNum >= 47 && expectedNum <= 49) {
    expectedSpeaker = 'श्रीभगवानुवाच';
  } else if (expectedNum === 50) {
    expectedSpeaker = 'सञ्जय उवाच';
  } else if (expectedNum === 51) {
    expectedSpeaker = 'अर्जुन उवाच';
  } else if (expectedNum >= 52 && expectedNum <= 55) {
    expectedSpeaker = 'श्रीभगवानुवाच';
  }

  if (v.speaker !== expectedSpeaker) {
    console.error(`❌ Verse ${expectedNum} speaker is "${v.speaker}", expected "${expectedSpeaker}"`);
    failed = true;
  }
});

if (!failed) {
  console.log('✔ All 55 verses strictly adhere to schema with complete Devanagari, transliteration, speaker parsing, word meanings, translation, and purport.');
}

// Check key highlighted shlokas
const keyVerses = [1, 4, 8, 9, 12, 15, 18, 32, 33, 36, 40, 43, 45, 50, 54, 55];
console.log('\nVerifying key philosophical shlokas:');
keyVerses.forEach(num => {
  const verse = ch11Data.verses.find(v => v.verse_number === num);
  if (verse) {
    const firstLine = verse.text_sanskrit.split('\n')[0];
    console.log(`  ✔ BG 11.${num} [${verse.speaker}]: "${firstLine}"`);
  } else {
    console.error(`  ❌ Missing key shloka: BG 11.${num}`);
    failed = true;
  }
});

// 2. Verify data/gita-chapters.json
const chaptersPath = path.join(__dirname, '..', 'data', 'gita-chapters.json');
const chaptersContent = fs.readFileSync(chaptersPath, 'utf8');
const chapters = JSON.parse(chaptersContent);
const ch11Meta = chapters.find(c => c.chapter_number === 11);

console.log('\nVerifying data/gita-chapters.json:');
if (!ch11Meta) {
  console.error('❌ Chapter 11 not found in data/gita-chapters.json');
  failed = true;
} else if (ch11Meta.status !== 'available') {
  console.error(`❌ Chapter 11 status is "${ch11Meta.status}", expected "available"`);
  failed = true;
} else if (ch11Meta.verses_count !== 55) {
  console.error(`❌ Chapter 11 verses_count is ${ch11Meta.verses_count}, expected 55`);
  failed = true;
} else {
  console.log('  ✔ Chapter 11 is marked "available" with 55 verses in gita-chapters.json.');
}

// 3. Verify assets/images/11th-adhyaya-end.jpg
const imgPath = path.join(__dirname, '..', 'assets', 'images', '11th-adhyaya-end.jpg');
console.log('\nVerifying completion image asset:');
if (fs.existsSync(imgPath)) {
  const stat = fs.statSync(imgPath);
  console.log(`  ✔ assets/images/11th-adhyaya-end.jpg exists (${(stat.size / 1024).toFixed(1)} KB).`);
} else {
  console.error('❌ Missing assets/images/11th-adhyaya-end.jpg');
  failed = true;
}

// 4. Verify js/app.js syntax and Chapter 11 handlers
const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

try {
  new vm.Script(appJsContent);
  console.log('\n✔ js/app.js: V8 syntax check passed.');
} catch (e) {
  console.error('❌ js/app.js syntax error:', e.message);
  failed = true;
}

if (appJsContent.includes('11th-adhyaya-end.jpg')) {
  console.log('✔ js/app.js references 11th-adhyaya-end.jpg for Chapter 11 completion.');
} else {
  console.error('❌ js/app.js missing 11th-adhyaya-end.jpg reference');
  failed = true;
}

if (appJsContent.includes('विश्वरूपदर्शनयोगो नाम एकादशोऽध्यायः')) {
  console.log('✔ js/app.js includes authentic Chapter 11 colophon.');
} else {
  console.error('❌ js/app.js missing Chapter 11 colophon text');
  failed = true;
}

if (failed) {
  console.error('\n❌ Chapter 11 Verification encountered failures.');
  process.exit(1);
} else {
  console.log('\n==============================================');
  console.log('   ALL CHAPTER 11 VERIFICATIONS PASSED (100%) ');
  console.log('==============================================');
}
