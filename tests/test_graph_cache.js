'use strict';

// node tests/test_graph_cache.js — 실제 그래프 IIFE를 실행하는 의존성 없는 회귀 검사
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../images/script.js'), 'utf8');
const graphStart = source.indexOf('  (function () {', source.indexOf('태그 그래프 ('));
const graphEnd = source.indexOf('\n  })();', graphStart) + '\n  })();'.length;
assert.ok(graphStart >= 0 && graphEnd > graphStart, '그래프 IIFE 경계');
const graphSource = source.slice(graphStart, graphEnd);
const CACHE_KEY = 'devlog-graph-v2';
const post = (title, tags) => ({ title, link: '/' + title, cat: '분류', tags });

function eventTarget(extra = {}) {
  const listeners = new Map();
  return Object.assign({
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(fn);
    },
    removeEventListener(type, fn) {
      listeners.set(type, (listeners.get(type) || []).filter(item => item !== fn));
    },
    dispatch(type) { (listeners.get(type) || []).forEach(fn => fn({ type })); },
    style: {},
    classList: { add() {}, remove() {} },
    dataset: {},
    setAttribute(name, value) { this[name] = String(value); },
    getAttribute(name) { return this[name] || null; }
  }, extra);
}

function harness(options = {}) {
  let now = 1800000000000;
  const stored = new Map(options.rawCache === undefined ? [] : [[CACHE_KEY, options.rawCache]]);
  const removed = [];
  const requests = [];
  const frames = new Map();
  const timers = [];
  const fixtures = new Map();
  const drawing = { names: [], arcs: [] };
  let frameId = 0;
  let requestedFrames = 0;
  const noop = () => {};
  const ctx = {
    setTransform: noop, save: noop, restore: noop, translate: noop, scale: noop,
    beginPath: noop, moveTo: noop, lineTo: noop, stroke: noop, fill: noop,
    clearRect() { drawing.names = []; drawing.arcs = []; },
    arc(x, y) { drawing.arcs.push([x, y]); },
    fillText(text) { drawing.names.push(text); }
  };
  const stage = eventTarget({
    getBoundingClientRect: () => ({ width: 960, height: 640, left: 0, top: 0, right: 960, bottom: 640 }),
    getClientRects: () => [{}],
    closest: () => null
  });
  const pane = eventTarget({ getBoundingClientRect: stage.getBoundingClientRect });
  const msg = eventTarget({ textContent: '', hidden: false });
  const canvas = { getContext: () => ctx, width: 960, height: 640 };
  const elements = { graphPane: pane, graphStage: stage, graphCanvas: canvas, graphMsg: msg };
  const document = eventTarget({
    body: { id: 'tt-body-index' }, documentElement: {}, hidden: false,
    getElementById: id => elements[id] || null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ set innerHTML(value) { this.value = value; } })
  });
  class DOMParser {
    parseFromString(text, type) {
      assert.equal(type, 'application/xml');
      assert.ok(fixtures.has(text), '테스트에 등록한 XML 문서만 파싱');
      return fixtures.get(text);
    }
  }
  const sandbox = eventTarget({
    d: document, document, body: document.body, innerHeight: 844,
    $: () => null, $$: () => [],
    location: { pathname: '/', origin: 'https://example.test' },
    getComputedStyle: () => ({ getPropertyValue: () => '', fontFamily: 'sans-serif' }),
    localStorage: {
      getItem(key) { if (options.denyStorage) throw new Error('denied'); return stored.get(key) || null; },
      setItem(key, value) { if (options.denyStorage) throw new Error('denied'); stored.set(key, value); },
      removeItem(key) { if (options.denyStorage) throw new Error('denied'); removed.push(key); stored.delete(key); }
    },
    Date: class extends Date { static now() { return now; } },
    DOMParser,
    fetch(url, init) {
      return new Promise((resolve, reject) => requests.push({ url, init, resolve, reject }));
    },
    requestAnimationFrame(fn) { requestedFrames++; frames.set(++frameId, fn); return frameId; },
    cancelAnimationFrame(id) { frames.delete(id); },
    setTimeout(fn) { timers.push(fn); return timers.length; },
    clearTimeout: noop
  });
  sandbox.window = sandbox;
  vm.runInNewContext(graphSource, sandbox, { filename: 'images/script.js (graph)' });
  while (timers.length) timers.shift()();

  function rss(posts, kind = 'rss') {
    const xml = kind === 'rss' ? '<rss data-fixture="' + fixtures.size + '"><channel>' + posts.map(p =>
      '<item><title>' + p.title + '</title><link>' + p.link + '</link>' +
      [p.cat].concat(p.tags).map(tag => '<category>' + tag + '</category>').join('') + '</item>'
    ).join('') + '</channel></rss>' : kind === 'html' ? '<html><body>error</body></html>' : '<rss><broken';
    // XML 파싱 자체는 브라우저가 담당하며, 여기서는 반환된 DOM을 쓰는 실제 그래프 로직을 검사한다.
    const items = posts.map(p => ({
      querySelectorAll: selector => selector === 'category'
        ? [p.cat].concat(p.tags).map(textContent => ({ textContent })) : [],
      querySelector: selector => selector === 'title' ? { textContent: p.title }
        : selector === 'link' ? { textContent: p.link } : null
    }));
    const channel = {};
    fixtures.set(xml, {
      documentElement: { nodeName: kind, localName: kind },
      querySelectorAll: selector => selector === 'item' ? items : [],
      querySelector: selector => {
        if (selector === 'parsererror') return kind === 'malformed' ? {} : null;
        if (selector === 'rss > channel' || selector === 'channel') return kind === 'rss' ? channel : null;
        if (selector === 'rss') return kind === 'rss' ? {} : null;
        return null;
      }
    });
    return xml;
  }
  async function respond(posts, kind = 'rss') {
    const request = requests[requests.length - 1];
    assert.ok(request, 'RSS 요청 존재');
    request.resolve({ ok: true, text: () => Promise.resolve(rss(posts, kind)) });
    await flushPromises();
  }
  function drainFrames() {
    let limit = 1000;
    while (frames.size && --limit) {
      const [id, fn] = frames.entries().next().value;
      frames.delete(id); fn();
    }
    assert.ok(limit, '그래프 애니메이션이 수렴');
  }
  return {
    pane, msg, document, requests, stored, removed, drawing, respond, drainFrames,
    get requestedFrames() { return requestedFrames; },
    get cache() { return JSON.parse(stored.get(CACHE_KEY) || 'null'); },
    async fail() { requests[requests.length - 1].reject(new Error('offline')); await flushPromises(); },
    revisit(seconds = 61) { now += seconds * 1000; document.hidden = false; document.dispatch('visibilitychange'); }
  };
}

async function flushPromises() {
  for (let i = 0; i < 8; i++) await Promise.resolve();
}

const validCache = posts => JSON.stringify({ at: 1800000000000, posts });
const count = (h, type) => Number(h.pane.getAttribute('data-' + type + '-count') || h.pane.dataset[type + 'Count']);

async function main() {
  const oldPosts = [post('이전글', ['옛태그'])];
  const newPosts = [post('새글', ['새태그', '추가태그']), post('두번째글', ['새태그'])];

  const empty = harness({ rawCache: validCache([]) });
  assert.ok(empty.removed.includes(CACHE_KEY), '기존 빈 캐시 제거');
  assert.equal(empty.requests.length, 1, '빈 캐시여도 RSS 요청');
  assert.equal(empty.requests[0].init.cache, 'no-cache', '브라우저 HTTP 캐시도 재검증');
  await empty.respond(newPosts);
  empty.drainFrames();
  assert.equal(count(empty, 'post'), 2);
  assert.equal(count(empty, 'tag'), 2);
  assert.equal(empty.cache.posts.length, 2, '정상 결과만 저장');

  const stale = harness({ rawCache: validCache(oldPosts) });
  stale.drainFrames();
  assert.equal(count(stale, 'post'), 1, '캐시를 먼저 표시');
  assert.equal(stale.requests.length, 1, '정상 캐시도 RSS 재검증');
  await stale.respond(newPosts);
  stale.drainFrames();
  assert.equal(count(stale, 'post'), 2, '새 글로 교체');
  assert.equal(count(stale, 'tag'), 2, '이전 태그를 누적하지 않음');
  assert.ok(!stale.drawing.names.includes('옛태그'), '삭제된 태그가 그래프에 남지 않음');
  assert.ok(stale.drawing.names.includes('추가태그'), '새 태그가 실제 캔버스에 그려짐');

  const same = harness({ rawCache: validCache(oldPosts) });
  same.drainFrames();
  const before = { frames: same.requestedFrames, arcs: JSON.stringify(same.drawing.arcs) };
  await same.respond(oldPosts);
  assert.equal(same.requestedFrames, before.frames, '같은 RSS이면 애니메이션 재시작 없음');
  assert.equal(JSON.stringify(same.drawing.arcs), before.arcs, '같은 RSS이면 노드 위치 유지');

  const deleted = harness({ rawCache: validCache(oldPosts) });
  await deleted.respond([]);
  deleted.drainFrames();
  assert.equal(deleted.cache, null, '정상 빈 RSS는 캐시 제거');
  assert.equal(count(deleted, 'post'), 0, '삭제된 글을 정상 빈 RSS로 제거');
  assert.equal(count(deleted, 'tag'), 0);
  assert.equal(deleted.msg.hidden, false, '정상 빈 RSS 안내 표시');

  for (const kind of ['malformed', 'html']) {
    const invalid = harness({ rawCache: validCache(oldPosts) });
    await invalid.respond([], kind);
    invalid.drainFrames();
    assert.equal(count(invalid, 'post'), 1, kind + ' 응답에서 정상 캐시 그래프 보존');
    assert.equal(invalid.cache.posts[0].title, '이전글');
  }
  const offline = harness({ rawCache: validCache(oldPosts) });
  await offline.fail();
  assert.equal(count(offline, 'tag'), 1, '네트워크 실패에서 정상 캐시 보존');
  const firstFailure = harness();
  await firstFailure.fail();
  assert.match(firstFailure.msg.textContent, /불러오지 못했습니다/, '캐시 없는 실패 안내');
  firstFailure.revisit();
  await firstFailure.respond(newPosts);
  assert.equal(count(firstFailure, 'post'), 2, '일시 실패 후 탭 재방문에서 복구');
  assert.equal(firstFailure.msg.hidden, true, '복구 후 실패 안내 숨김');

  const failureToEmpty = harness();
  await failureToEmpty.fail();
  failureToEmpty.revisit();
  await failureToEmpty.respond([]);
  assert.match(failureToEmpty.msg.textContent, /아직 표시할 태그가 없습니다/, '실패 후 정상 빈 RSS는 빈 그래프 안내로 복구');
  assert.equal(failureToEmpty.msg.hidden, false);

  const firstEmpty = harness();
  await firstEmpty.respond([]);
  assert.equal(firstEmpty.cache, null, '최초 빈 RSS도 저장하지 않음');
  assert.equal(count(firstEmpty, 'post'), 0);
  firstEmpty.revisit();
  await firstEmpty.fail();
  assert.match(firstEmpty.msg.textContent, /불러오지 못했습니다/, '빈 그래프 뒤 실패 안내');
  firstEmpty.revisit();
  await firstEmpty.respond([]);
  assert.match(firstEmpty.msg.textContent, /아직 표시할 태그가 없습니다/, '빈 RSS→실패→빈 RSS에서도 정상 안내로 복구');
  assert.equal(firstEmpty.cache, null);

  for (const rawCache of ['{broken', validCache({}), validCache([{}]), JSON.stringify({ at: 1, posts: oldPosts })]) {
    const invalid = harness({ rawCache });
    assert.ok(invalid.removed.includes(CACHE_KEY), '오류·만료 캐시 제거');
    await invalid.respond(newPosts);
    assert.equal(count(invalid, 'post'), 2, '오류 캐시에서 복구');
  }
  const denied = harness({ denyStorage: true });
  await denied.respond(newPosts);
  assert.equal(count(denied, 'post'), 2, '저장소 차단 상태에서도 정상 표시');

  const revisit = harness();
  await revisit.respond(oldPosts);
  revisit.revisit(10);
  assert.equal(revisit.requests.length, 1, '짧은 탭 전환은 요청 억제');
  revisit.revisit();
  assert.equal(revisit.requests.length, 2, '다시 열린 탭에서 재검증');
  revisit.revisit();
  assert.equal(revisit.requests.length, 2, '진행 중인 요청 중복 방지');
  await revisit.respond(newPosts);
  assert.equal(count(revisit, 'tag'), 2, '탭 재방문에서 새 태그 반영');

  console.log('PASS: 그래프 빈 캐시·새 RSS 교체·오류 보존·저장소 차단·탭 재방문 회귀 검사');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
