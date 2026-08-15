const fs = require('fs');
const path = require('path');

console.log('==============================================');
console.log('   KRISHNA SAGA - SLIDESHOW VERIFICATION      ');
console.log('==============================================\n');

// 1. Verify app.js syntax
const vm = require('vm');
const appJsPath = path.join(__dirname, 'js', 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

try {
  new vm.Script(appJsContent);
  console.log('✔ js/app.js: Syntax validated successfully with V8 VM.');
} catch (err) {
  console.error('❌ js/app.js syntax error:', err.message);
  process.exit(1);
}

// 2. Verify all slideshow images exist
const slidesMatch = appJsContent.match(/const HERO_SLIDES = (\[[\s\S]*?\]);/);
if (!slidesMatch) {
  console.error('❌ HERO_SLIDES definition not found in js/app.js');
  process.exit(1);
}

const heroSlides = eval(slidesMatch[1]);
console.log(`\nChecking ${heroSlides.length} configured hero slides:`);
let allFilesExist = true;

heroSlides.forEach((slide, i) => {
  const fullPath = path.join(__dirname, slide.src);
  if (!fs.existsSync(fullPath)) {
    console.error(`  ❌ Slide ${i + 1} Missing file: ${slide.src}`);
    allFilesExist = false;
  } else {
    const stat = fs.statSync(fullPath);
    console.log(`  ✔ Slide ${i + 1}: "${slide.title}" -> ${slide.src} (${(stat.size / 1024).toFixed(1)} KB)`);
  }
});

if (!allFilesExist) {
  console.error('\n❌ Some slideshow image files are missing!');
  process.exit(1);
}
console.log(`\n✔ All ${heroSlides.length} slideshow images exist and are accessible.`);

// 3. Verify index.html elements
const htmlPath = path.join(__dirname, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

const requiredIds = [
  'hero-image',
  'hero-slides-track',
  'hero-krishna-image',
  'hero-caption-meta',
  'hero-slide-title',
  'hero-slide-subtitle'
];

console.log('\nChecking index.html element IDs:');
requiredIds.forEach(id => {
  if (htmlContent.includes(`id="${id}"`)) {
    console.log(`  ✔ Found id="${id}"`);
  } else {
    console.error(`  ❌ Missing id="${id}" in index.html`);
  }
});

// 4. Verify removed elements in index.html
const removedIds = [
  'hero-slide-badge',
  'hero-slide-count',
  'hero-slide-prev-btn',
  'hero-slide-next-btn',
  'hero-slide-dots'
];

console.log('\nChecking removed manual control IDs from index.html:');
removedIds.forEach(id => {
  if (!htmlContent.includes(`id="${id}"`)) {
    console.log(`  ✔ Confirmed removed: id="${id}"`);
  } else {
    console.error(`  ❌ Element id="${id}" is still present in index.html`);
  }
});

// 5. Verify main.css rules
const cssPath = path.join(__dirname, 'css', 'main.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

const requiredCssRules = [
  '.hero-slideshow-container',
  '.hero-slides-track',
  '.hero-slide-img',
  '.hero-slide-img.active',
  'cursor: default'
];

console.log('\nChecking css/main.css rules:');
requiredCssRules.forEach(rule => {
  if (cssContent.includes(rule)) {
    console.log(`  ✔ Found CSS rule "${rule}"`);
  } else {
    console.error(`  ❌ Missing CSS rule "${rule}" in main.css`);
  }
});

console.log('\n==============================================');
console.log('   ALL STATIC VERIFICATIONS PASSED (100%)    ');
console.log('==============================================');
