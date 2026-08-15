const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('==============================================');
console.log('   COLOPHON & DEDICATION DEDUPLICATION TEST    ');
console.log('==============================================\n');

let failed = false;

// 1. Verify index.html structure
const htmlPath = path.join(__dirname, 'index.html');
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
const appJsPath = path.join(__dirname, 'js', 'app.js');
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

// Check that all 5 chapters have proper colophons
const expectedColophons = [
  'अर्जुनविषादयोगो नाम प्रथमोऽध्यायः',
  'साङ्ख्ययोगो नाम द्वितीयोऽध्यायः',
  'कर्मयोगो नाम तृतीयोऽध्यायः',
  'ज्ञानकर्मसंन्यासयोगो नाम चतुर्थोऽध्यायः',
  'कर्मसंन्यासयोगो नाम पञ्चमोऽध्यायः'
];

expectedColophons.forEach((name, i) => {
  if (appJsContent.includes(name)) {
    console.log(`✔ Chapter ${i + 1} colophon present: "${name}"`);
  } else {
    console.error(`❌ Missing colophon for Chapter ${i + 1}: "${name}"`);
    failed = true;
  }
});

if (failed) {
  console.error('\n❌ Deduplication test failed.');
  process.exit(1);
} else {
  console.log('\n==============================================');
  console.log('   ALL DEDUPLICATION TESTS PASSED (100%)      ');
  console.log('==============================================');
}
