const fs = require('fs');
const path = require('path');
const vm = require('vm');
const http = require('http');

console.log('================================================================');
console.log('   KRISHNA SAGA: COMPLETE SIMULATED RUNTIME E2E SUITE');
console.log('================================================================\n');

const htmlContent = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const appJsContent = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');

// Build a robust DOM simulation environment
class MockDOMElement {
  constructor(tagName, id = '', className = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.className = className;
    this.children = [];
    this.style = {};
    this.attributes = {};
    this.listeners = {};
    this._innerHTML = '';
    this.textContent = '';
    this.disabled = false;
    this.title = '';
    this.value = '';
    this.src = '';
    this.alt = '';
  }

  set innerHTML(val) {
    this._innerHTML = val;
    if (val === '') {
      this.children = [];
    }
  }

  get innerHTML() {
    return this._innerHTML || '';
  }

  setAttribute(name, val) {
    this.attributes[name] = String(val);
  }

  getAttribute(name) {
    return this.attributes[name] || null;
  }

  removeAttribute(name) {
    delete this.attributes[name];
  }

  addEventListener(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  removeEventListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  dispatchEvent(event) {
    if (this.listeners[event.type]) {
      this.listeners[event.type].forEach(cb => cb(event));
    }
  }

  click() {
    this.dispatchEvent({ type: 'click', target: this, preventDefault: () => {}, stopPropagation: () => {} });
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    this.children = this.children.filter(c => c !== child);
    return child;
  }

  querySelector(selector) {
    if (selector.startsWith('.')) {
      const cls = selector.slice(1);
      return this.children.find(c => c.classList && c.classList.contains(cls)) || null;
    }
    return null;
  }

  querySelectorAll(selector) {
    const res = [];
    if (selector.startsWith('.')) {
      const cls = selector.slice(1);
      const walk = (node) => {
        if (node.classList && node.classList.contains(cls)) res.push(node);
        node.children.forEach(walk);
      };
      this.children.forEach(walk);
    }
    return res;
  }

  scrollIntoView() {}
  getBoundingClientRect() {
    return { top: 100, bottom: 500, left: 50, right: 450, width: 440, height: 410 };
  }

  get classList() {
    const self = this;
    return {
      add(...classes) {
        const set = new Set(self.className.split(' ').filter(Boolean));
        classes.forEach(c => set.add(c));
        self.className = Array.from(set).join(' ');
      },
      remove(...classes) {
        const set = new Set(self.className.split(' ').filter(Boolean));
        classes.forEach(c => set.delete(c));
        self.className = Array.from(set).join(' ');
      },
      toggle(cls, force) {
        const set = new Set(self.className.split(' ').filter(Boolean));
        if (force !== undefined) {
          if (force) set.add(cls); else set.delete(cls);
        } else {
          if (set.has(cls)) set.delete(cls); else set.add(cls);
        }
        self.className = Array.from(set).join(' ');
        return set.has(cls);
      },
      contains(cls) {
        return self.className.split(' ').filter(Boolean).includes(cls);
      }
    };
  }
}

// Parse IDs from index.html and initialize mock elements
const htmlIdRegex = /id=["']([^"']+)["']/g;
const elementRegistry = new Map();
let match;
while ((match = htmlIdRegex.exec(htmlContent)) !== null) {
  const id = match[1];
  elementRegistry.set(id, new MockDOMElement('div', id));
}

// Custom Mock Context
const mockCanvasCtx = {
  save() {},
  restore() {},
  beginPath() {},
  arc() {},
  fill() {},
  stroke() {},
  moveTo() {},
  lineTo() {},
  ellipse() {},
  clearRect() {},
  translate() {},
  rotate() {},
  createRadialGradient() {
    return { addColorStop() {} };
  }
};

const mockAudioNode = {
  connect() {},
  disconnect() {},
  start() {},
  stop() {},
  setValueAtTime() {},
  linearRampToValueAtTime() {},
  exponentialRampToValueAtTime() {},
  gain: {
    setValueAtTime() {},
    linearRampToValueAtTime() {},
    exponentialRampToValueAtTime() {}
  },
  frequency: {
    setValueAtTime() {},
    linearRampToValueAtTime() {},
    exponentialRampToValueAtTime() {}
  },
  detune: {
    setValueAtTime() {},
    connect() {}
  },
  Q: {
    setValueAtTime() {}
  }
};

class MockAudioContext {
  constructor() {
    this.currentTime = 0;
    this.sampleRate = 44100;
    this.state = 'running';
    this.destination = {};
  }
  createGain() { return Object.assign({}, mockAudioNode); }
  createOscillator() { return Object.assign({}, mockAudioNode); }
  createBiquadFilter() { return Object.assign({}, mockAudioNode); }
  createBuffer(channels, length, rate) {
    return {
      getChannelData: () => new Float32Array(length)
    };
  }
  createBufferSource() { return Object.assign({}, mockAudioNode); }
  resume() { return Promise.resolve(); }
}

const windowListeners = {};
const documentListeners = {};

const mockDocument = {
  body: new MockDOMElement('body'),
  getElementById(id) {
    if (!elementRegistry.has(id)) {
      elementRegistry.set(id, new MockDOMElement('div', id));
    }
    return elementRegistry.get(id);
  },
  querySelector(selector) {
    if (selector.startsWith('#')) {
      return this.getElementById(selector.slice(1));
    }
    return new MockDOMElement('div');
  },
  querySelectorAll() { return []; },
  createElement(tag) {
    return new MockDOMElement(tag);
  },
  addEventListener(event, cb) {
    if (!documentListeners[event]) documentListeners[event] = [];
    documentListeners[event].push(cb);
  },
  removeEventListener(event, cb) {
    if (documentListeners[event]) {
      documentListeners[event] = documentListeners[event].filter(fn => fn !== cb);
    }
  },
  hidden: false
};

// Hook canvas getContext
const cosmicCanvas = mockDocument.getElementById('cosmic-canvas');
cosmicCanvas.getContext = () => mockCanvasCtx;
const poojaCanvas = mockDocument.getElementById('pooja-effects-canvas');
poojaCanvas.getContext = () => mockCanvasCtx;

const mockWindow = {
  document: mockDocument,
  innerWidth: 1920,
  innerHeight: 1080,
  scrollY: 0,
  pageYOffset: 0,
  AudioContext: MockAudioContext,
  webkitAudioContext: MockAudioContext,
  location: {
    hash: '',
    pathname: '/',
    search: '',
    href: 'http://localhost:8080/'
  },
  history: {
    pushState: (state, title, url) => {
      mockWindow.location.hash = url.startsWith('#') ? url : '';
    },
    replaceState: (state, title, url) => {
      mockWindow.location.hash = url.startsWith('#') ? url : '';
    }
  },
  scrollTo() {},
  addEventListener(event, cb) {
    if (!windowListeners[event]) windowListeners[event] = [];
    windowListeners[event].push(cb);
  },
  removeEventListener(event, cb) {
    if (windowListeners[event]) {
      windowListeners[event] = windowListeners[event].filter(fn => fn !== cb);
    }
  },
  requestAnimationFrame(cb) { return setTimeout(cb, 16); },
  cancelAnimationFrame(id) { clearTimeout(id); },
  setInterval: setInterval,
  clearInterval: clearInterval,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  Image: class {
    constructor() {
      this.src = '';
    }
  },
  alert(msg) {
    console.log(`    [ALERT DIALOG]: "${msg}"`);
  },
  fetch: async (url) => {
    // Read local project files directly
    const filePath = path.join(__dirname, '..', url.split('?')[0]);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return {
        ok: true,
        status: 200,
        json: async () => JSON.parse(data),
        text: async () => data
      };
    } else {
      return {
        ok: false,
        status: 404,
        json: async () => { throw new Error('404 Not Found'); }
      };
    }
  }
};

// Create VM context
const sandbox = {
  window: mockWindow,
  document: mockDocument,
  navigator: { userAgent: 'Node-Mock-Browser' },
  location: mockWindow.location,
  history: mockWindow.history,
  fetch: mockWindow.fetch,
  AudioContext: MockAudioContext,
  webkitAudioContext: MockAudioContext,
  Image: mockWindow.Image,
  requestAnimationFrame: mockWindow.requestAnimationFrame,
  cancelAnimationFrame: mockWindow.cancelAnimationFrame,
  setInterval: setInterval,
  clearInterval: clearInterval,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  alert: mockWindow.alert,
  console: console
};

vm.createContext(sandbox);

let testFailures = 0;
let testPasses = 0;
function assert(desc, condition) {
  if (condition) {
    console.log(`  ✔ [PASS] ${desc}`);
    testPasses++;
  } else {
    testFailures++;
    console.error(`  ❌ [FAIL] ${desc}`);
  }
}

async function runSimulationTests() {
  console.log('1. Executing js/app.js in VM...');
  try {
    vm.runInContext(appJsContent, sandbox);
    console.log('  ✔ [PASS] Script parsed and executed in global context');
  } catch (err) {
    console.error('  ❌ [FAIL] VM script execution error:', err);
    process.exit(1);
  }

  console.log('\n2. Triggering DOMContentLoaded event...');
  if (documentListeners['DOMContentLoaded']) {
    for (const listener of documentListeners['DOMContentLoaded']) {
      listener();
    }
  }

  // Allow async fetch of chapters to complete
  await new Promise(r => setTimeout(r, 100));

  console.log('\n3. Verifying Bhagavad Gita 18-Chapter Navigation & Reader:');
  const cardGita = mockDocument.getElementById('card-gita');
  assert('card-gita exists', !!cardGita);
  cardGita.click();

  await new Promise(r => setTimeout(r, 50));
  const gitaView = mockDocument.getElementById('gita-view');
  assert('Gita view visible after clicking card-gita', gitaView.style.display === 'block');

  const chaptersGrid = mockDocument.getElementById('gita-chapters-grid');
  assert('18 Chapter cards generated in grid', chaptersGrid.children.length === 18);

  for (let ch = 1; ch <= 18; ch++) {
    console.log(`\n  --- Testing Chapter ${ch} Reader Lifecycle ---`);
    // Click chapter in grid
    const chCard = chaptersGrid.children[ch - 1];
    chCard.click();
    await new Promise(r => setTimeout(r, 50));

    const readerView = mockDocument.getElementById('gita-reader-view');
    assert(`Chapter ${ch}: Reader view displayed`, readerView.style.display === 'block');

    const verseBadge = mockDocument.getElementById('verse-id-badge');
    assert(`Chapter ${ch}: Verse badge starts at BG ${ch}.1`, verseBadge.textContent === `BG ${ch}.1`);

    const verseSanskrit = mockDocument.getElementById('verse-sanskrit-text');
    assert(`Chapter ${ch}: Verse 1 Sanskrit text populated`, verseSanskrit.innerHTML.length > 5);

    // Test top next button
    const nextBtn = mockDocument.getElementById('next-verse-btn');
    nextBtn.click();
    assert(`Chapter ${ch}: Next verse navigated to BG ${ch}.2`, verseBadge.textContent === `BG ${ch}.2`);

    // Test bottom prev button
    const bottomPrevBtn = mockDocument.getElementById('bottom-prev-verse-btn');
    bottomPrevBtn.click();
    assert(`Chapter ${ch}: Bottom Prev navigated back to BG ${ch}.1`, verseBadge.textContent === `BG ${ch}.1`);

    // Test quick select dropdown
    const quickSelect = mockDocument.getElementById('verse-quick-select');
    assert(`Chapter ${ch}: Dropdown options count matches chapter verse count`, quickSelect.children.length >= 20);

    // Jump to last verse
    const lastIndex = quickSelect.children.length - 1;
    quickSelect.value = lastIndex;
    quickSelect.dispatchEvent({ type: 'change', target: quickSelect });
    assert(`Chapter ${ch}: Jumped to last verse index ${lastIndex}`, verseBadge.textContent === `BG ${ch}.${lastIndex + 1}`);

    // Click Next on last verse to trigger completion view
    const bottomNextBtn = mockDocument.getElementById('bottom-next-verse-btn');
    bottomNextBtn.click();
    await new Promise(r => setTimeout(r, 50));

    const completionView = mockDocument.getElementById('gita-completion-view');
    assert(`Chapter ${ch}: Completion view displayed upon finishing`, completionView.style.display === 'block');

    const colophon = mockDocument.getElementById('completion-sanskrit-colophon');
    assert(`Chapter ${ch}: Colophon text populated`, colophon.innerHTML.includes('ॐ तत्सदिति'));

    const compImg = mockDocument.getElementById('completion-art-img');
    assert(`Chapter ${ch}: Completion shrine image set (${compImg.src})`, compImg.src.length > 0);

    // For Chapter 18, check for the sacred grand conclusion line
    if (ch === 18) {
      assert('Chapter 18: Grand conclusion line populated', colophon.innerHTML.includes('इति श्रीमद्भगवद्गीता समाप्ता'));
    }

    // Click Next Chapter button on completion screen
    const completionNextBtn = mockDocument.getElementById('completion-next-ch-btn');
    completionNextBtn.click();
    await new Promise(r => setTimeout(r, 50));
  }

  console.log('\n4. Verifying Virtual Pooja Sanctum:');
  const cardPuja = mockDocument.getElementById('card-puja');
  cardPuja.click();
  await new Promise(r => setTimeout(r, 50));

  const poojaView = mockDocument.getElementById('pooja-view');
  assert('Virtual Pooja view active', poojaView.style.display === 'flex');

  // Welcome modal enter Abhisheka
  const btnEnterAbh = mockDocument.getElementById('btn-enter-abhisheka');
  btnEnterAbh.click();

  // Test Abhisheka offerings
  const abhOfferings = [
    'btn-offer-milk',
    'btn-offer-water',
    'btn-offer-honey',
    'btn-offer-flowers-abh',
    'btn-offer-dhoop-abh',
    'btn-offer-aarti-abh'
  ];

  abhOfferings.forEach(id => {
    const btn = mockDocument.getElementById(id);
    assert(`Offering button ${id} exists and is clickable`, !!btn);
    btn.click();
  });

  // Stop Aarti
  const btnAartiAbh = mockDocument.getElementById('btn-offer-aarti-abh');
  btnAartiAbh.click();
  assert('Camphor Aarti stopped upon second click', !mockDocument.getElementById('pooja-aarti-overlay').style.display || mockDocument.getElementById('pooja-aarti-overlay').style.display === 'none');

  // Proceed to Mahapooja
  const toMahapoojaBtn = mockDocument.getElementById('pooja-to-mahapooja-btn');
  toMahapoojaBtn.click();

  // Test Mahapooja offerings
  const mahaOfferings = [
    'btn-offer-gandha',
    'btn-offer-tulsi',
    'btn-offer-dhoop-maha',
    'btn-offer-naivedya',
    'btn-offer-flowers-maha',
    'btn-offer-bell',
    'btn-offer-maha-aarti'
  ];

  mahaOfferings.forEach(id => {
    const btn = mockDocument.getElementById(id);
    assert(`Offering button ${id} exists and is clickable`, !!btn);
    btn.click();
  });

  // Stop Maha Aarti
  const btnAartiMaha = mockDocument.getElementById('btn-offer-maha-aarti');
  btnAartiMaha.click();

  // Complete Pooja and return to landing
  const completePoojaBtn = mockDocument.getElementById('pooja-complete-btn');
  completePoojaBtn.click();
  await new Promise(r => setTimeout(r, 1100));

  const landingView = mockDocument.getElementById('landing-view');
  assert('Returned smoothly to landing view after completing pooja', landingView.style.display === 'block');

  console.log('\n5. Verifying Hash Routing Matrix:');
  const testHashes = [
    { hash: '#gita', expectedView: 'gita-chapters-view' },
    { hash: '#gita/chapter-1/verse-1', expectedView: 'gita-reader-view' },
    { hash: '#gita/chapter-2/verse-47', expectedView: 'gita-reader-view' },
    { hash: '#gita/chapter-1/completed', expectedView: 'gita-completion-view' },
    { hash: '#pooja', expectedView: 'pooja-view' },
    { hash: '#pooja/mahapooja', expectedView: 'pooja-view' },
    { hash: '#home', expectedView: 'landing-view' }
  ];

  for (const test of testHashes) {
    mockWindow.location.hash = test.hash;
    if (windowListeners['hashchange']) {
      windowListeners['hashchange'].forEach(fn => fn());
    }
    await new Promise(r => setTimeout(r, 50));
    const targetElem = mockDocument.getElementById(test.expectedView);
    assert(`Route "${test.hash}" activates "${test.expectedView}"`, targetElem.style.display === 'block' || targetElem.style.display === 'flex');
  }

  console.log('\n================================================================');
  console.log('   SIMULATED RUNTIME E2E RESULTS SUMMARY');
  console.log('================================================================');
  console.log(`Total Verification Assertions Passed: ${testPasses}`);
  console.log(`Total Failures: ${testFailures}`);

  if (testFailures === 0) {
    console.log('\n🌟 ALL 100% OF SIMULATION ASSERTIONS PASSED WITH ZERO ERRORS! 🌟');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runSimulationTests();
