'use strict';

// node tests/test_heading_alignment.js — 실제 제목 IIFE를 실행하는 의존성 없는 회귀 검사
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../images/script.js'), 'utf8');
const start = source.indexOf('  (function () {', source.indexOf('제목 형광펜 —'));
const end = source.indexOf('\n  })();', start) + '\n  })();'.length;
assert.ok(start >= 0 && end > start, '제목 IIFE 경계');
const headingSource = source.slice(start, end);

function run(options = {}) {
  const fixtures = [
    { name: '기본 LTR', expected: 'left' },
    { name: '인라인 왼쪽', style: { textAlign: 'left' }, expected: 'left' },
    { name: '인라인 가운데', style: { textAlign: 'center' }, expected: 'center' },
    { name: '인라인 오른쪽', style: { textAlign: 'right' }, expected: 'right' },
    { name: '상속 가운데', parent: { textAlign: 'center' }, expected: 'center' },
    { name: '상속 오른쪽', parent: { textAlign: 'right' }, expected: 'right' },
    { name: '인라인이 상속보다 우선', style: { textAlign: 'left' }, parent: { textAlign: 'center' }, expected: 'left' },
    { name: '양쪽 정렬', style: { textAlign: 'justify' }, expected: 'justify' },
    { name: 'LTR start', style: { textAlign: 'start' }, expected: 'left' },
    { name: 'LTR end', style: { textAlign: 'end' }, expected: 'right' },
    { name: 'RTL start', style: { textAlign: 'start', direction: 'rtl' }, expected: 'right' },
    { name: '상속 RTL end', parent: { textAlign: 'end', direction: 'rtl' }, expected: 'left' },
    { name: 'RTL 명시적 오른쪽', style: { textAlign: 'right', direction: 'rtl' }, expected: 'right' }
  ];
  const heads = options.empty ? [] : fixtures.map(fixture => Object.assign({}, fixture, {
    style: fixture.style || {}, attributes: {}, classes: [],
    setAttribute(name, value) { this.attributes[name] = value; },
    classList: { add(name) { this.owner.classes.push(name); } }
  }));
  heads.forEach(h => { h.classList.owner = h; });
  const originalStyles = JSON.stringify(heads.map(h => h.style));
  const observed = [], rootClasses = [];
  let intersect;
  class IntersectionObserver {
    constructor(callback) { intersect = callback; }
    observe(h) { observed.push(h); }
    unobserve(h) { observed.splice(observed.indexOf(h), 1); }
  }
  const sandbox = {
    d: { documentElement: { classList: { add(name) { rootClasses.push(name); } } } },
    $$(selector) {
      assert.equal(selector, '.post-body h1, .post-body h2, .post-body h3');
      return heads;
    },
    getComputedStyle(h) {
      return Object.assign({ textAlign: 'start', direction: 'ltr' }, h.parent, h.style);
    },
    IntersectionObserver: options.noObserver ? undefined : IntersectionObserver,
    matchMedia: () => ({ matches: !!options.reducedMotion })
  };
  sandbox.window = sandbox;
  vm.runInNewContext(headingSource, sandbox, { filename: 'images/script.js (heading)' });
  heads.forEach(h => assert.equal(h.attributes['data-heading-align'], h.expected, h.name));
  assert.equal(JSON.stringify(heads.map(h => h.style)), originalStyles, '작성자 인라인 스타일 보존');
  const animates = !options.noObserver && !options.reducedMotion && heads.length > 0;
  assert.equal(rootClasses.includes('js-hl'), animates, '애니메이션 활성 조건 유지');
  assert.equal(observed.length, animates ? heads.length : 0, '관찰 대상 유지');
  if (animates) {
    intersect([{ target: heads[0], isIntersecting: false }]);
    assert.equal(heads[0].classes.length, 0, '화면 밖 제목은 대기');
    intersect([{ target: heads[0], isIntersecting: true }]);
    assert.ok(heads[0].classes.includes('hl-on'), '화면에 들어온 제목의 형광펜 활성');
    assert.equal(observed.length, heads.length - 1, '활성 후 관찰 해제');
  }
}

run();
run({ noObserver: true });
run({ reducedMotion: true });
run({ empty: true });
console.log('PASS: 제목 정렬·부모 상속·LTR/RTL·모션 축소·관찰 미지원·형광펜 회귀 검사');
