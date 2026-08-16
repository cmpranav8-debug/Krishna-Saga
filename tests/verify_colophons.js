const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('==============================================');
console.log('   COLOPHON & DEDICATION DEDUPLICATION TEST    ');
console.log('==============================================\n');

let failed = false;

// 1. Verify index.html structure
const htmlPath = path.join(__dirname, '..', 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

if (!htmlContent.includes('completion-dedication-banner')) {
  console.error('❌ Missing .completion-dedication-banner in index.html');
  failed = true;
} else {
  console.log('✔ index.html: Golden dedication box (.completion-dedication-banner) intact.');
}

if (!htmlContent.includes('॥ श्रीकृष्णार्पणमस्तु ॥')) {
  console.error('❌ Missing "॥ श्रीकृष्णार्पणमस्तु ॥" in dedication banner');
  failed = true;
} else {
  console.log('✔ index.html: "॥ श्रीकृष्णार्पणमस्तु ॥" present in golden dedication box.');
}

// 2. Verify js/app.js
const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

try {
  new vm.Script(appJsContent);
  console.log('✔ js/app.js: V8 syntax check passed.');
} catch (e) {
  console.error('❌ js/app.js syntax error:', e.message);
  failed = true;
}

// Check that showCompletionView does NOT put "श्रीकृष्णार्पणमस्तु" inside compColophon.innerHTML
const compColophonMatches = appJsContent.match(/compColophon\.innerHTML\s*=\s*['"][^'"]+['"]/g) || [];
console.log(`\nFound ${compColophonMatches.length} compColophon assignments in js/app.js:`);

compColophonMatches.forEach((match, idx) => {
  if (match.includes('श्रीकृष्णार्पणमस्तु')) {
    console.error(`❌ Duplicate dedication found in assignment: ${match}`);
    failed = true;
  } else {
    console.log(`  ✔ Assignment ${idx + 1} contains only the clean 2-line colophon.`);
  }
});

// Check that all 18 available chapters have proper colophons
const expectedColophons = [
  'अर्जुनविषादयोगो नाम प्रथमोऽध्यायः',
  'साङ्ख्ययोगो नाम द्वितीयोऽध्यायः',
  'कर्मयोगो नाम तृतीयोऽध्यायः',
  'ज्ञानकर्मसंन्यासयोगो नाम चतुर्थोऽध्यायः',
  'कर्मसंन्यासयोगो नाम पञ्चमोऽध्यायः',
  'आत्मसंयमयोगो नाम षष्ठोऽध्यायः',
  'ज्ञानविज्ञानयोगो नाम सप्तमोऽध्यायः',
  'अक्षरब्रह्मयोगो नाम अष्टमोऽध्यायः',
  'राजविद्याराजगुह्ययोगो नाम नवमोऽध्यायः',
  'विभूतियोगो नाम दशमोऽध्यायः',
  'विश्वरूपदर्शनयोगो नाम एकादशोऽध्यायः',
  'भक्तियोगो नाम द्वादशोऽध्यायः',
  'क्षेत्रक्षेत्रज्ञविभागयोगो नाम त्रयोदशोऽध्यायः',
  'गुणत्रयविभागयोगो नाम चतुर्दशोऽध्यायः',
  'पुरुषोत्तमयोगो नाम पञ्चदशोऽध्यायः',
  'दैवासुरसम्पद्विभागयोगो नाम षोडशोऽध्यायः',
  'श्रद्धात्रयविभागयोगो नाम सप्तदशोऽध्यायः',
  'मोक्षसंन्यासयोगो नाम अष्टादशोऽध्यायः'
];

expectedColophons.forEach((name, i) => {
  if (appJsContent.includes(name)) {
    console.log(`✔ Chapter ${i + 1} colophon present: "${name}"`);
  } else {
    console.error(`❌ Missing colophon for Chapter ${i + 1}: "${name}"`);
    failed = true;
  }
});

// Verify grand conclusion statement
if (appJsContent.includes('इति श्रीमद्भगवद्गीता समाप्ता')) {
  console.log('✔ Concluding dedication statement present: "॥ इति श्रीमद्भगवद्गीता समाप्ता ॥"');
} else {
  console.error('❌ Missing concluding dedication statement: "॥ इति श्रीमद्भगवद्गीता समाप्ता ॥"');
  failed = true;
}

if (failed) {
  console.error('\n❌ Deduplication test failed.');
  process.exit(1);
} else {
  console.log('\n==============================================');
  console.log('   ALL DEDUPLICATION TESTS PASSED (100%)      ');
  console.log('==============================================');
}
