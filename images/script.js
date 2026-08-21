/**
 * DevLog Vault — Tistory Custom Skin
 * Obsidian 기반 3컬럼 개발자 블로그 스킨
 */
(function () {
  'use strict';

  var d = document;
  var html = d.documentElement;
  var body = d.body;

  function $(sel, ctx) { return (ctx || d).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || d).querySelectorAll(sel)); }
  function icon(id, cls) {
    return '<svg class="ic ' + (cls || 'ic-sm') + '"><use href="#' + id + '"/></svg>';
  }

  /* ===================================================================
     Canonical URL
     =================================================================== */
  if (!$('link[rel="canonical"]')) {
    var canonical = d.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = location.origin + location.pathname;
    d.head.appendChild(canonical);
  }

  /* ===================================================================
     SEO 보정
     티스토리가 이미 넣어 주는 것(description · og · twitter · canonical ·
     BlogPosting)은 건드리지 않고, 빠져 있는 것만 채운다.
     =================================================================== */
  (function () {
    /* ① 글 페이지에서는 h1 이 하나만 남도록 홈 헤더를 걷어낸다.
          (CSS 로만 숨기면 마크업상 h1 이 두 개로 남는다) */
    if (body.id !== 'tt-body-index') {
      var hh = $('#homeHeader');
      if (hh && hh.parentNode) hh.parentNode.removeChild(hh);
    }

    /* ② 검색 결과 페이지는 색인하지 않는다 (링크는 따라가게 둔다) */
    if (body.id === 'tt-body-search' && !$('meta[name="robots"]')) {
      var rb = d.createElement('meta');
      rb.setAttribute('name', 'robots');
      rb.setAttribute('content', 'noindex, follow');
      d.head.appendChild(rb);
    }

    /* ③ <time> 에 기계가 읽는 날짜를 넣는다 (2026. 8. 10. 20:29 → 2026-08-10) */
    $$('time').forEach(function (t) {
      if (t.getAttribute('datetime')) return;
      var m = (t.textContent || '').match(/(\d{4})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})/);
      if (!m) return;
      var iso = m[1] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2);
      var hm = (t.textContent || '').match(/(\d{1,2}):(\d{2})/);
      if (hm) iso += 'T' + ('0' + hm[1]).slice(-2) + ':' + hm[2];
      t.setAttribute('datetime', iso);
    });

    /* ④ alt 속성이 아예 없는 이미지는 장식용으로 표시한다 (스크린리더가 건너뛴다) */
    $$('img:not([alt])').forEach(function (i) { i.setAttribute('alt', ''); });

    /* ⑤ 글 페이지에 이동 경로(BreadcrumbList) 구조화 데이터를 넣는다.
          티스토리는 BlogPosting 만 넣어 주고 경로는 넣어 주지 않는다. */
    if (body.id !== 'tt-body-page' && body.id !== 'tt-body-notice') return;
    if ($('script[data-seo="breadcrumb"]')) return;

    var titleEl = $('.post-single .inline-title');
    if (!titleEl) return;

    // "category" 프로퍼티 줄에서 카테고리 링크를 찾는다 (href 형태는 블로그마다 다르다)
    var catLink = null;
    $$('.post-single .prop').forEach(function (row) {
      if (catLink) return;
      var k = row.querySelector('.prop-k');
      if (k && /category/i.test(k.textContent || '')) catLink = row.querySelector('a');
    });
    if (!catLink) catLink = $('.post-single .prop-v a[href*="/category/"]');

    var items = [{ '@type': 'ListItem', position: 1, name: '홈', item: location.origin + '/' }];

    if (catLink) {
      var names = (catLink.textContent || '').split('/')
        .map(function (x) { return x.trim(); }).filter(Boolean);
      var href = catLink.getAttribute('href') || '';
      var segs = href.indexOf('/category/') !== -1
        ? href.replace(/^.*\/category\//, '').split('/').filter(Boolean)
        : [];

      var path = '';
      names.forEach(function (name, idx) {
        path += '/' + (segs[idx] || encodeURIComponent(name));
        items.push({
          '@type': 'ListItem',
          position: idx + 2,
          name: name,
          item: location.origin + '/category' + path
        });
      });
    }
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: (titleEl.textContent || '').trim(),
      item: location.origin + location.pathname
    });

    var tag = d.createElement('script');
    tag.type = 'application/ld+json';
    tag.setAttribute('data-seo', 'breadcrumb');
    tag.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items
    });
    d.head.appendChild(tag);
  })();

  /* ===================================================================
     테마 토글
     =================================================================== */
  var THEME_KEY = 'devlog-theme';

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    // 테마가 바뀌면 배경이 바뀌므로 글자 명암 보정을 다시 계산한다
    if (typeof window.__devlogFixInk === 'function') window.__devlogFixInk();
  }

  // 스킨 옵션에서 강조 색상을 바꿔도 콜아웃·뱃지의 반투명 배경이 따라오도록
  // --interactive-accent 값을 읽어 --accent-rgb(R, G, B)를 다시 계산한다.
  function syncAccentRgb() {
    var v = getComputedStyle(html).getPropertyValue('--interactive-accent').trim();
    if (!v) return;
    var r, g, b, m;
    if (v.charAt(0) === '#') {
      var hex = v.slice(1);
      if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      if (hex.length < 6) return;
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else if ((m = v.match(/rgba?\(\s*(\d+)\D+(\d+)\D+(\d+)/))) {
      r = +m[1]; g = +m[2]; b = +m[3];
    } else {
      return;
    }
    if ([r, g, b].some(isNaN)) return;
    html.style.setProperty('--accent-rgb', r + ', ' + g + ', ' + b);
  }
  syncAccentRgb();

  var themeBtn = $('#themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
      syncAccentRgb();
    });
  }

  /* ===================================================================
     모바일 — 사이드바 열기 버튼을 상단 바(리본) 안으로 옮긴다
     떠 있는 버튼이 본문 위에 겹쳐 보이던 문제를 없앤다.
     =================================================================== */
  (function () {
    var btn = $('#mobileSidebarToggle');
    var ribbon = $('.ribbon');
    if (!btn || !ribbon || !window.matchMedia) return;
    var mq = window.matchMedia('(max-width: 760px)');
    function place() {
      if (mq.matches) {
        if (btn.parentNode !== ribbon) ribbon.insertBefore(btn, ribbon.firstChild);
      } else if (btn.parentNode !== body) {
        body.appendChild(btn);
      }
    }
    place();
    if (mq.addEventListener) mq.addEventListener('change', place);
    else if (mq.addListener) mq.addListener(place);
  })();

  /* ===================================================================
     페이지 컨텍스트
     =================================================================== */
  // 2페이지 이후에는 홈 전용 블록(북마크·타일·고정글)을 숨긴다
  (function () {
    var pageParam = (location.search.match(/[?&]page=(\d+)/) || [])[1];
    var pagePath = (location.pathname.match(/\/page\/(\d+)/) || [])[1];
    var n = parseInt(pageParam || pagePath || '1', 10);
    if (n > 1) body.classList.add('not-first-page');
  })();

  // 고정글(공지) — 스킨 옵션 개수만큼만 남기고, 하나도 없으면 헤더까지 숨김
  (function () {
    var pinnedSec = $('#pinnedSec');
    if (!pinnedSec) return;

    var lim = parseInt(pinnedSec.getAttribute('data-notice-limit'), 10);
    if (!(lim > 0)) lim = 3;          // 옵션 미치환/이상값이면 기본 3개
    if (lim > 3) lim = 3;             // 홈에서는 최대 3개까지만

    $$('.notice-callout').slice(lim).forEach(function (el) { el.remove(); });
    if (!$('.notice-callout')) pinnedSec.style.display = 'none';
  })();

  // 탭 제목 정리 ("글제목 :: 블로그명" → "글제목")
  var tabTitle = $('#tabTitle');
  if (tabTitle) {
    var tt = tabTitle.textContent.trim();
    var cut = tt.split(/\s*::\s*/)[0];
    if (cut) tabTitle.textContent = cut;
    tabTitle.parentNode.setAttribute('title', cut || tt);
  }

  /* ===================================================================
     모바일 사이드바
     =================================================================== */
  var sidebarToggle = $('#mobileSidebarToggle');
  var sidebarLeft = $('.side-l');
  var overlay = $('#mobileOverlay');

  function openSidebar() {
    if (sidebarLeft) sidebarLeft.classList.add('open');
    if (overlay) overlay.classList.add('active');
    if (sidebarToggle) sidebarToggle.setAttribute('aria-expanded', 'true');
  }
  function closeSidebar() {
    if (sidebarLeft) sidebarLeft.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    if (sidebarToggle) sidebarToggle.setAttribute('aria-expanded', 'false');
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function () {
      if (sidebarLeft && sidebarLeft.classList.contains('open')) closeSidebar();
      else openSidebar();
    });
  }
  if (overlay) overlay.addEventListener('click', closeSidebar);
  if (sidebarLeft) {
    sidebarLeft.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeSidebar();
    });
  }
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSidebar();
  });

  /* ===================================================================
     검색 포커스 (리본 버튼 + "/" 단축키)
     =================================================================== */
  function focusSearch() {
    var input = $('.searchbox input');
    if (!input) return;
    if (window.innerWidth <= 1100) openSidebar();
    setTimeout(function () {
      input.focus();
      input.scrollIntoView({ block: 'center' });
    }, 60);
  }
  var ribbonSearch = $('#ribbonSearch');
  if (ribbonSearch) ribbonSearch.addEventListener('click', focusSearch);

  d.addEventListener('keydown', function (e) {
    var t = e.target;
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === '/') { e.preventDefault(); focusSearch(); }
    if (e.key === 't' && themeBtn) themeBtn.click();
  });

  /* ===================================================================
     방문 통계 — 어제 대비 오늘 추이

     티스토리가 스킨에 내려주는 방문 데이터는 [##_count_yesterday_##],
     [##_count_today_##], [##_count_total_##] 세 개뿐이라 일자별 그래프는
     만들 수 없다. 대신 실제로 있는 두 값(어제 / 오늘)으로 막대를 그린다.
     =================================================================== */
  (function () {
    var box = $('#visitTrend');
    if (!box) return;

    function num(el) {
      if (!el) return NaN;
      var t = (el.textContent || '').replace(/[^0-9]/g, '');
      return t === '' ? NaN : parseInt(t, 10);
    }

    var y = num($('#cntY'));
    var t = num($('#cntT'));
    if (isNaN(y) || isNaN(t)) return;      // 치환자가 안 들어오면 그냥 숨긴 채로 둔다

    var base = Math.max(y, t, 1);
    var fill = $('.tb-fill', box);
    var mark = $('.tb-mark', box);
    var lab = $('.trend-d', box);

    fill.style.width = Math.max(2, Math.round((t / base) * 100)) + '%';
    mark.style.left = 'calc(' + Math.round((y / base) * 100) + '% - 1px)';

    var diff = t - y;
    if (diff > 0) { lab.textContent = '어제 대비 +' + diff; lab.className = 'trend-d up'; }
    else if (diff < 0) { lab.textContent = '어제 대비 ' + diff; lab.className = 'trend-d'; }
    else { lab.textContent = '어제와 동일'; lab.className = 'trend-d'; }

    box.setAttribute('title', '어제 ' + y + ' → 오늘 ' + t);
    box.removeAttribute('hidden');
  })();

  /* ===================================================================
     프로필 링크 아이콘 자동 매핑
     =================================================================== */
  (function () {
    var map = [
      ['newpost', 'i-pen'],
      ['manage', 'i-settings'],
      ['github', 'i-github'],
      ['mailto', 'i-mail'],
      ['mail', 'i-mail'],
      ['tistory', 'i-book'],
      ['rss', 'i-rss']
    ];
    $$('.profile-links a').forEach(function (a) {
      var hay = ((a.getAttribute('href') || '') + ' ' + (a.title || '')).toLowerCase();
      var id = 'i-link';
      for (var i = 0; i < map.length; i++) {
        if (hay.indexOf(map[i][0]) !== -1) { id = map[i][1]; break; }
      }
      a.innerHTML = icon(id, 'ic');
    });
  })();

  /* ===================================================================
     스크롤 버튼
     =================================================================== */
  var topBtn = $('#backToTop');
  var bottomBtn = $('#backToBottom');
  if (topBtn) topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  if (bottomBtn) bottomBtn.addEventListener('click', function () {
    window.scrollTo({ top: d.body.scrollHeight, behavior: 'smooth' });
  });

  /* ===================================================================
     글 관리 (소유자 전용)
     =================================================================== */
  (function () {
    var manageWrap = $('#postManage');
    var manageBtn = $('#postManageBtn');
    var manageMenu = $('#postManageMenu');
    if (!manageWrap || !manageBtn || !manageMenu) return;

    var entryInfo = window.T && window.T.entryInfo;
    var entryId = entryInfo ? entryInfo.entryId : null;
    var blogUrl = window.TistoryBlog ? window.TistoryBlog.url : '';
    var isOwner = window.T && window.T.config && window.T.config.ROLE === 'owner';

    if (!isOwner || !entryId) { manageWrap.style.display = 'none'; return; }
    manageWrap.style.display = 'grid';

    var editLink = $('#postEditLink');
    if (editLink) editLink.href = blogUrl + '/manage/newpost/' + entryId + '?type=post';

    var privateLink = $('#postPrivateLink');
    if (privateLink) {
      privateLink.addEventListener('click', function (e) {
        e.preventDefault();
        if (!confirm('이 글을 비공개로 변경하시겠습니까?')) return;
        var xhr = new XMLHttpRequest();
        xhr.open('POST', blogUrl + '/manage/post/visibility.json', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function () { location.reload(); };
        xhr.send('entryId=' + entryId + '&visibility=0');
      });
    }

    var deleteLink = $('#postDeleteLink');
    if (deleteLink) {
      deleteLink.addEventListener('click', function (e) {
        e.preventDefault();
        if (!confirm('이 글을 삭제하시겠습니까? 되돌릴 수 없습니다.')) return;
        location.href = blogUrl + '/manage/post/delete/' + entryId;
      });
    }

    manageBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = manageMenu.classList.toggle('open');
      manageBtn.setAttribute('aria-expanded', open);
    });
    d.addEventListener('click', function () { manageMenu.classList.remove('open'); });
  })();

  /* ===================================================================
     본문 관련 기능
     =================================================================== */
  var singleBody = $('.post-single .post-body');

  /* --- 읽는 시간 --- */
  (function () {
    var readEl = $('#readTime');
    if (!readEl || !singleBody) return;
    var text = (singleBody.textContent || '').replace(/\s+/g, '');
    var min = Math.max(1, Math.round(text.length / 500));
    var cmt = $('.comment-area .tt_num_g, .comment-area .tt_box_total');
    readEl.textContent = min + '분';
    if (cmt) {
      var n = (cmt.textContent || '').replace(/\D/g, '');
      if (n) readEl.textContent += ' · 댓글 ' + n;
    }
  })();

  /* --- 읽기 진행 바 --- */
  (function () {
    var bar = $('#readingProgress');
    if (!bar || !singleBody) return;
    function update() {
      var rect = singleBody.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      var scrolled = -rect.top;
      var pct = total > 0 ? Math.min(100, Math.max(0, (scrolled / total) * 100)) : 0;
      bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  /* --- 코드블록: Obsidian 스타일 헤더 + 복사 버튼 --- */
  (function () {
    if (!singleBody) return;
    $$('pre', singleBody).forEach(function (pre) {
      if (pre.parentNode && pre.parentNode.classList.contains('cb')) return;

      var code = pre.querySelector('code');
      var lang = pre.getAttribute('data-ke-language') || '';
      if (!lang && code) {
        var m = (code.className || '').match(/(?:language-|lang-)([a-z0-9+#]+)/i);
        if (m) lang = m[1];
      }
      if (lang === 'plain') lang = '';

      var wrap = d.createElement('div');
      wrap.className = 'cb';
      pre.parentNode.insertBefore(wrap, pre);

      var head = d.createElement('div');
      head.className = 'cb-h';
      head.innerHTML = '<span class="cb-lang">' + (lang || 'code') + '</span>' +
        '<button type="button" class="cb-copy">' + icon('i-copy') + '복사</button>';
      wrap.appendChild(head);
      wrap.appendChild(pre);

      head.querySelector('.cb-copy').addEventListener('click', function () {
        var btn = this;
        var text = (code || pre).innerText;
        navigator.clipboard.writeText(text).then(function () {
          btn.innerHTML = icon('i-check') + '복사됨';
          setTimeout(function () { btn.innerHTML = icon('i-copy') + '복사'; }, 1500);
        });
      });
    });
  })();

  /* --- 개요(TOC) --- */
  (function () {
    var pane = $('#tocPane');
    var list = $('#tocList');
    if (!pane || !list || !singleBody) return;

    var headings = $$('h2, h3', singleBody).filter(function (h) {
      return (h.textContent || '').trim().length > 0;
    });
    if (headings.length < 2) return;

    headings.forEach(function (h, i) {
      if (!h.id) h.id = 'h-' + i;
      var li = d.createElement('li');
      if (h.tagName === 'H3') li.className = 'd2';
      var a = d.createElement('a');
      a.href = '#' + h.id;
      a.textContent = (h.textContent || '').trim();
      li.appendChild(a);
      list.appendChild(li);
    });
    pane.classList.add('has-items');

    var items = $$('li', list);
    function spy() {
      var active = 0;
      for (var i = 0; i < headings.length; i++) {
        if (headings[i].getBoundingClientRect().top <= 90) active = i;
      }
      items.forEach(function (li, i) { li.classList.toggle('toc-active', i === active); });
    }
    window.addEventListener('scroll', spy, { passive: true });
    spy();
  })();

  /* --- 글자 크기 조절 --- */
  (function () {
    var inc = $('#fontIncrease');
    var dec = $('#fontDecrease');
    if (!inc || !dec || !singleBody) return;
    var size = 16;
    function apply() { singleBody.style.fontSize = size + 'px'; }
    inc.addEventListener('click', function () { if (size < 22) { size++; apply(); } });
    dec.addEventListener('click', function () { if (size > 13) { size--; apply(); } });
  })();

  /* --- 부드러운 앵커 스크롤 --- */
  d.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (!id) return;
    var el = d.getElementById(id);
    if (!el) return;
    e.preventDefault();
    var y = el.getBoundingClientRect().top + window.pageYOffset - 70;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });

  /* ===================================================================
     글 목록: 카드 전체 클릭 + NEW/HOT 뱃지
     =================================================================== */
  (function () {
    var items = $$('.post-list-item');
    if (!items.length) return;
    var now = new Date();

    items.forEach(function (card) {
      var link = $('.pi-t a', card);
      if (!link) return;

      card.style.cursor = 'pointer';
      card.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;
        location.href = link.href;
      });

      var titleEl = $('.pi-t', card);
      if (!titleEl) return;

      // NEW — 7일 이내
      var dateEl = $('.pi-date', card);
      if (dateEl) {
        var parts = dateEl.textContent.replace(/\./g, '-').replace(/\s/g, '')
          .match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
        if (parts) {
          var diff = (now - new Date(parts[1], parts[2] - 1, parts[3])) / 86400000;
          if (diff >= 0 && diff <= 7) {
            var nb = d.createElement('span');
            nb.className = 'pill new';
            nb.textContent = 'NEW';
            titleEl.appendChild(nb);
          }
        }
      }

      // HOT — 댓글 5개 이상
      var cmtEl = $('.pi-cmt', card);
      if (cmtEl) {
        var cnt = parseInt(cmtEl.textContent.replace(/\D/g, ''), 10) || 0;
        if (cnt >= 5) {
          var hb = d.createElement('span');
          hb.className = 'pill hot';
          hb.textContent = 'HOT';
          titleEl.appendChild(hb);
        }
      }
    });
  })();

  /* ===================================================================
     북마크 카드 — 아직 링크를 지정하지 않은 카드는 숨긴다
     (깨진 링크가 방문자에게 노출되지 않도록)
     =================================================================== */
  (function () {
    var box = $('.bm');
    var sec = d.getElementById('bmSec');
    if (!box) return;

    var alive = 0;
    $$('.bm-card', box).forEach(function (a) {
      var href = (a.getAttribute('href') || '').trim();
      var unset = !href || href === '#' ||
                  href.indexOf('여기에-링크-입력') !== -1 ||
                  href.indexOf('[##_') !== -1;      // 스킨 옵션이 치환되지 않은 경우
      if (unset) { a.style.display = 'none'; return; }

      // 치환되지 않은 제목·부제목은 지운다
      $$('.bm-t, .bm-d, .bm-img', a).forEach(function (el) {
        if (el.textContent.indexOf('[##_') !== -1) {
          el.textContent = el.textContent.replace(/\[##_[^#]*_##\]/g, '').trim();
        }
      });
      alive++;
    });

    if (!alive) {
      box.style.display = 'none';
      if (sec) sec.style.display = 'none';
    }
    // 카드가 5장 이상이면 모바일에서 조금 촘촘하게 (style.css 20번 섹션)
    box.classList.toggle('bm-many', alive > 4);
  })();

  /* ===================================================================
     카테고리: "분류 전체보기" → "전체 글", 홈으로 연결
     =================================================================== */
  (function () {
    var root = $('#category_0 a');
    if (root) {
      root.href = '/';
      root.innerHTML = root.innerHTML.replace('분류 전체보기', '전체 글');
    }
    var listTitle = $('.list-title');
    if (listTitle) {
      Array.prototype.forEach.call(listTitle.childNodes, function (node) {
        if (node.nodeType === 3 && node.textContent.indexOf('분류 전체보기') !== -1) {
          node.textContent = node.textContent.replace('분류 전체보기', '전체 글');
        }
      });
    }
  })();

  /* ===================================================================
     고정글 자동 채우기
     주소만 넣으면 그 글을 읽어와 제목과 카테고리를 채운다.
     같은 블로그(같은 출처)라서 추가 권한 없이 읽을 수 있고,
     한 번 읽은 값은 브라우저에 7일간 저장해 두어 다시 불러오지 않는다.
     =================================================================== */
  (function () {
    var cards = $$('.pin-auto');
    if (!cards.length) return;

    var TTL = 7 * 24 * 60 * 60 * 1000;

    function cacheGet(k) {
      try {
        var v = JSON.parse(localStorage.getItem(k) || 'null');
        return (v && v.t && (Date.now() - v.at) < TTL) ? v : null;
      } catch (e) { return null; }
    }
    function cacheSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

    function fill(card, data) {
      var t = card.querySelector('.pin-t');
      var c = card.querySelector('.pin-c');
      if (t && data.t) t.textContent = data.t;
      if (c) c.textContent = data.c || '';
    }

    cards.forEach(function (card) {
      var url = (card.getAttribute('href') || '').trim();
      if (!url || url.indexOf('[##_') !== -1) { card.remove(); return; }

      // 불러오기 전에도 빈 카드로 보이지 않도록 주소를 임시로 넣어 둔다
      var t = card.querySelector('.pin-t');
      if (t && !t.textContent.trim()) {
        t.textContent = url.replace(/^https?:\/\/[^/]+/, '') || url;
      }

      var key = 'devlog-pin:' + url;
      var hit = cacheGet(key);
      if (hit) { fill(card, hit); return; }

      if (!window.fetch || !window.DOMParser) return;

      fetch(url, { credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.text() : Promise.reject(new Error(r.status)); })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var og = doc.querySelector('meta[property="og:title"]');
          var title = og ? (og.getAttribute('content') || '')
                         : (doc.title || '').split(/\s*::\s*/)[0];
          var catEl = doc.querySelector('.props .prop-v a[href*="/category/"]')
                   || doc.querySelector('a[href*="/category/"]');
          var cat = catEl ? (catEl.textContent || '').replace(/\s+/g, ' ').trim() : '';

          title = (title || '').trim();
          if (!title) return;
          var data = { t: title, c: cat, at: Date.now() };
          cacheSet(key, data);
          fill(card, data);
        })
        .catch(function () { /* 못 읽으면 주소만 남는다 */ });
    });
  })();

  /* ===================================================================
     사이드바 목록 개수 제한 (스킨 옵션 data-limit)
     항목이 하나도 없으면 패널 자체를 숨긴다
     =================================================================== */
  $$('[data-limit]').forEach(function (box) {
    var sel = '.recent-list > li, .plist > article';
    var items = $$(sel, box);
    var msg = box.getAttribute('data-empty');

    function empty() {
      // data-empty 가 있으면 패널을 남기고 안내 문구를 보여준다
      if (!msg) { box.style.display = 'none'; return; }
      var list = box.querySelector('.recent-list');
      if (!list) { box.style.display = 'none'; return; }
      var li = d.createElement('li');
      li.className = 'empty-note';
      li.textContent = msg;
      list.appendChild(li);
    }

    if (!items.length) { empty(); return; }

    var n = parseInt(box.getAttribute('data-limit'), 10);
    if (n > 0) items.slice(n).forEach(function (el) { el.remove(); });
    if (!box.querySelector(sel)) empty();
  });

  /* ===================================================================
     본문 페이지에서 최근 글 / 최근 댓글 패널을 접어 둔다
     (홈에서는 그대로 펼쳐 둔다)
     =================================================================== */
  (function () {
    if (body.id !== 'tt-body-page' && body.id !== 'tt-body-notice') return;

    ['.pane-recent-posts', '.pane-popular-posts', '.pane-recent-comments'].forEach(function (sel) {
      var pane = $(sel);
      if (!pane) return;
      var head = $('.pane-h', pane);
      if (!head) return;

      pane.classList.add('collapsible', 'collapsed');

      var chev = d.createElement('span');
      chev.className = 'pane-toggle';
      chev.innerHTML = icon('i-chev');
      head.appendChild(chev);

      head.setAttribute('role', 'button');
      head.setAttribute('tabindex', '0');
      head.setAttribute('aria-expanded', 'false');

      function toggle() {
        var collapsed = pane.classList.toggle('collapsed');
        head.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      }

      head.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;   // 헤더 안의 링크는 그대로 이동
        toggle();
      });
      head.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
  })();

  /* ===================================================================
     제목 형광펜 — 화면에 들어올 때 그어지는 효과
     (관찰이 불가능한 브라우저에서는 처음부터 칠해진 상태로 둔다)
     =================================================================== */
  (function () {
    var heads = $$('.post-body h1, .post-body h2, .post-body h3');
    if (!heads.length || !window.IntersectionObserver) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    d.documentElement.classList.add('js-hl');

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('hl-on');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    heads.forEach(function (h) { io.observe(h); });
  })();

  /* ===================================================================
     스크롤을 시작하면 <html> 에 .is-scrolled 를 붙인다.
     PC 에서 좌측 사이드바 프로필을 접어 카테고리·스킨 정보가
     화면에 함께 남도록 하기 위해서다. (배치는 style.css 21번 섹션)
     =================================================================== */
  (function () {
    var ON = 160, OFF = 90;      // 값이 튀지 않도록 켜고 끄는 기준을 다르게 둔다
    var ticking = false, on = false;
    function apply() {
      ticking = false;
      var y = window.pageYOffset || d.documentElement.scrollTop || 0;
      if (!on && y > ON) { on = true; html.classList.add('is-scrolled'); }
      else if (on && y < OFF) { on = false; html.classList.remove('is-scrolled'); }
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(apply);
    }, { passive: true });
    apply();
  })();

  /* ===================================================================
     페이지네이션 — 현재 페이지 표시
     티스토리 실제 출력:
       <a href="/?page=7"><span class="selected">7</span></a>   ← 현재 페이지
       <a href="/?page=8"><span class="">8</span></a>
       <a><span class="">···</span></a>                          ← 생략(주소 없음)
     "selected" 가 <a> 가 아니라 안쪽 <span> 에 붙어서 스타일이 걸리지 않는다.
     그래서 클래스를 <a> 로 끌어올린다.
     =================================================================== */
  (function () {
    $$('.page-numbers > a').forEach(function (a) {
      var inner = a.firstElementChild;
      if (inner && inner.classList.contains('selected')) a.classList.add('selected');
      if (!a.getAttribute('href')) a.classList.add('is-gap');
    });
  })();

  /* ===================================================================
     광고 자리 비우기
     광고 코드를 넣지 않은 자리에도 줄바꿈·공백이 남아 있어서
     CSS 의 :empty 가 걸리지 않는다. 그래서 위아래 여백만 남는 빈 상자가 생긴다.
     내용이 없으면 진짜로 비워서 자리 자체가 사라지게 한다.
     =================================================================== */
  (function () {
    $$('.ad-slot, .pane-ad').forEach(function (slot) {
      if (slot.firstElementChild) return;
      if ((slot.textContent || '').trim()) return;
      slot.innerHTML = '';
    });
  })();

  /* ===================================================================
     본문 표 — 좁은 화면에서 가로로 넘겨 볼 수 있게 감싼다
     티스토리 에디터는 표에 픽셀 폭을 직접 박아 두는 일이 많아서,
     화면이 좁아지면 칸이 뭉개지거나 화면 밖으로 넘친다.
     =================================================================== */
  (function () {
    var tables = $$('.post-body table');
    if (!tables.length) return;

    // 에디터가 셀마다 박아 두는 "기본 흰색" 배경을 걷어낸다.
    // 이게 남아 있으면 스킨의 줄무늬가 가려져서 표가 밋밋해 보인다.
    // 뜻이 있는 색(형광펜처럼 칠한 색)은 그대로 두고 오히려 확실히 살린다.
    (function () {
      function rgb(c) {
        var m = c && c.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?/);
        if (!m) return null;
        return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
      }
      $$('.post-body table [style], .post-body table tr[style]').forEach(function (cell) {
        var tag = cell.tagName;
        if (tag !== 'TD' && tag !== 'TH' && tag !== 'TR') return;
        var c = rgb(cell.style.backgroundColor);
        if (!c || c.a === 0) return;
        var l = (c.r * .299 + c.g * .587 + c.b * .114) / 255;
        if (l > .9 || l < .06) {                 // 흰색·검정 = 에디터 기본값
          cell.style.removeProperty('background-color');
          cell.style.removeProperty('background');
        } else {                                  // 일부러 칠한 색은 다크모드에서도 살린다
          cell.style.setProperty('background-color', cell.style.backgroundColor, 'important');
        }
      });
    })();

    tables.forEach(function (t) {
      // 머리글이 없는 표(<th> 가 하나도 없는 표) 표시 — 줄무늬로만 구분한다
      if (!t.querySelector('th')) t.classList.add('no-head');

      // 카카오 에디터가 표를 감싸 둔 figure 안이면 그대로 둔다
      var parent = t.parentNode;
      if (parent && parent.classList && parent.classList.contains('table-wrap')) return;

      var wrap = d.createElement('div');
      wrap.className = 'table-wrap';
      parent.insertBefore(wrap, t);
      wrap.appendChild(t);
    });

    function syncScroll() {
      $$('.table-wrap').forEach(function (w) {
        var t = w.firstElementChild;
        if (!t) return;
        // 칸이 3개 이상인 표만 가로 스크롤로 바꾼다 (2칸 표는 접혀도 읽을 만하다)
        var firstRow = t.rows && t.rows[0];
        var cols = firstRow ? firstRow.cells.length : 0;
        var narrow = w.clientWidth < 520 && cols >= 3;
        w.classList.toggle('is-scroll', narrow);
      });
    }
    syncScroll();
    window.addEventListener('resize', syncScroll);
  })();

  /* ===================================================================
     본문 가독성 가드
     다른 곳에서 복사해 붙여넣은 글에는 그 사이트의 글자색·투명도가
     그대로 따라오는 일이 있다. 그러면 글이 배경에 묻혀 안 보인다.
     본문 안의 "글자를 가진 요소"를 전부 훑어서

       ① 거의 투명한 요소(opacity < .35)는 다시 보이게 돌린다
       ② 배경 대비 명암비가 3.2 미만이면 읽히는 색으로 바꾼다
          (배경이 밝으면 진한 글자, 어두우면 밝은 글자)
       ③ 이미 잘 보이면 손대지 않는다

     테마를 바꾸거나 광고·늦게 붙는 요소가 배경을 바꾸면 다시 계산한다.
     코드블록은 문법 색을 지켜야 하므로 제외한다.
     =================================================================== */
  (function () {
    function parse(c) {
      if (!c) return null;
      var m = c.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?/);
      if (!m) return null;
      return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
    }
    function lum(c) {
      function ch(v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }
      return .2126 * ch(c.r) + .7152 * ch(c.g) + .0722 * ch(c.b);
    }
    function ratio(a, b) {
      var l1 = lum(a), l2 = lum(b);
      if (l1 < l2) { var t = l1; l1 = l2; l2 = t; }
      return (l1 + .05) / (l2 + .05);
    }
    function over(fg, bg) {   // 반투명 색을 배경 위에 합성
      var a = fg.a;
      return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
    }
    // 요소 뒤에 실제로 깔린 색 (부모를 거슬러 올라가며 합성)
    function backdrop(el) {
      var stack = [], n = el;
      while (n && n.nodeType === 1) {
        var c = parse(getComputedStyle(n).backgroundColor);
        if (c && c.a > 0) { stack.push(c); if (c.a >= .999) break; }
        n = n.parentElement;
      }
      var base = { r: 255, g: 255, b: 255, a: 1 };
      if (html.getAttribute('data-theme') === 'dark') base = { r: 30, g: 30, b: 30, a: 1 };
      for (var i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
      return base;
    }

    var DARK_INK = '#17181b';
    var LIGHT_INK = '#f0f0f2';
    var MIN_RATIO = 3.2;      // 이 아래면 "안 보인다"고 본다
    var MIN_ALPHA = 0.35;     // 이 아래면 "투명해서 안 보인다"고 본다
    var SKIP = { PRE: 1, CODE: 1, SCRIPT: 1, STYLE: 1, IFRAME: 1, INS: 1, SVG: 1, CANVAS: 1 };

    // 이 글자 뒤에 "에디터가 직접 칠한 배경(형광펜)"이 있는가?
    // 있으면 그 배경은 테마와 무관하게 고정이므로 밝기로 글자색을 정한다.
    // 없으면 배경은 스킨(테마)의 것이므로 --text-normal 을 쓰는 게 항상 옳다.
    // → 테마 전환 애니메이션 도중에 잘못 재더라도 색이 뒤집히지 않는다.
    function hasEditorBg(el) {
      var n = el;
      while (n && n.nodeType === 1) {
        if (n.classList && n.classList.contains('post-body')) return false;
        if (n.style && n.style.backgroundColor) {
          var c = parse(n.style.backgroundColor);
          if (c && c.a > 0) return true;
        }
        n = n.parentElement;
      }
      return false;
    }

    // 손대기 전의 인라인 값을 되돌린다 (없었으면 아예 지운다)
    function restore(el, prop, attr) {
      var orig = el.getAttribute(attr);
      el.removeAttribute(attr);
      if (orig) el.style.setProperty(prop, orig);
      else el.style.removeProperty(prop);
    }

    // 자기 자신이 직접 글자를 들고 있는 요소만 고른다
    // (부모까지 손대면 자식 색을 통째로 덮어써서 강조 표시가 사라진다)
    function hasOwnText(el) {
      for (var i = 0; i < el.childNodes.length; i++) {
        var n = el.childNodes[i];
        if (n.nodeType === 3 && n.nodeValue && n.nodeValue.trim()) return true;
      }
      return false;
    }

    function targets() {
      var body = $('.post-body');
      if (!body) return [];
      var out = [];
      var all = body.querySelectorAll('*');
      for (var i = 0; i < all.length; i++) {
        var el = all[i];
        if (SKIP[el.tagName]) continue;
        if (el.closest('pre, code, .cb')) continue;   // 코드블록의 문법 색은 그대로 둔다
        out.push(el);
      }
      out.push(body);
      return out;
    }

    function fixInk() {
      targets().forEach(function (el) {
        var cs = getComputedStyle(el);

        // ① 거의 투명한 요소 되살리기 (복사해 온 애니메이션 잔재 등)
        //    다시 잴 때를 대비해 원래 인라인 값을 기억해 두고 되돌린다
        if (el.getAttribute('data-unfade') !== null) {
          restore(el, 'opacity', 'data-unfade');
          cs = getComputedStyle(el);
        }
        var op = parseFloat(cs.opacity);
        if (!isNaN(op) && op < MIN_ALPHA && cs.display !== 'none' && cs.visibility !== 'hidden') {
          el.setAttribute('data-unfade', el.style.opacity || '');
          el.style.setProperty('opacity', '1', 'important');
          cs = getComputedStyle(el);
        }

        // ② 글자 명암
        if (!hasOwnText(el)) return;
        if (el.getAttribute('data-ink') !== null) {          // 이전 계산을 되돌리고 다시 잰다
          restore(el, 'color', 'data-ink');
          restore(el, '-webkit-text-fill-color', 'data-fill');
          cs = getComputedStyle(el);
        }
        var fg = parse(cs.webkitTextFillColor && cs.webkitTextFillColor !== 'currentcolor'
                       ? cs.webkitTextFillColor : cs.color);
        if (!fg) return;
        var bg = backdrop(el);
        var eff = fg.a < 1 ? over(fg, bg) : fg;
        if (ratio(eff, bg) >= MIN_RATIO) return;             // 이미 잘 보인다
        var dark = lum(bg) > .45;
        var ink = hasEditorBg(el) ? (dark ? DARK_INK : LIGHT_INK)
                                  : 'var(--text-normal)';
        el.setAttribute('data-ink', el.style.color || '');
        el.setAttribute('data-fill', el.style.webkitTextFillColor || '');
        el.style.setProperty('color', ink, 'important');
        el.style.setProperty('-webkit-text-fill-color', ink, 'important');
      });
    }

    var pending = null;
    function scheduleFix(delay) {
      clearTimeout(pending);
      pending = setTimeout(fixInk, typeof delay === 'number' ? delay : 120);
    }

    // 손댄 것을 전부 원래대로 (테마 전환이 끝나기 전까지 잘못된 색이 남지 않게)
    function revertAll() {
      $$('.post-body [data-ink], .post-body [data-unfade]').forEach(function (el) {
        if (el.getAttribute('data-ink') !== null) {
          restore(el, 'color', 'data-ink');
          restore(el, '-webkit-text-fill-color', 'data-fill');
        }
        if (el.getAttribute('data-unfade') !== null) restore(el, 'opacity', 'data-unfade');
      });
    }

    /* 테마를 바꾸면 배경색이 .2초에 걸쳐 서서히 바뀐다.
       그 도중에 재면 "바뀌기 전 배경"을 읽어서 글자색을 정반대로 칠하게 된다.
       (라이트→다크로 바꾼 순간 흰 배경으로 읽혀 검은 글자를 넣고,
        전환이 끝나면 어두운 배경 위 검은 글자가 되어 글이 사라진다)
       그래서 먼저 되돌리고, 전환이 끝난 뒤에 다시 잰다. */
    function onThemeChange() {
      revertAll();
      scheduleFix(360);
    }

    window.__devlogFixInk = onThemeChange;
    fixInk();
    // 이미지·광고처럼 늦게 붙는 것들이 배경을 바꿀 수 있어 한 번 더 본다
    window.addEventListener('load', function () { scheduleFix(150); });
    if (d.fonts && d.fonts.ready && d.fonts.ready.then) {
      d.fonts.ready.then(function () { scheduleFix(150); });
    }
  })();

  /* ===================================================================
     콘텐츠 보호 (스킨 옵션)
     · copy-source   : 복사한 글 끝에 출처를 자동으로 붙인다
     · protect-content: 본문 우클릭 / 드래그를 막는다 (코드블록은 예외)
     완전한 차단은 불가능하다. 개발자도구 · 소스보기 · 인쇄로 우회된다.
     =================================================================== */
  (function () {
    function on(name) {
      var v = (body.getAttribute(name) || '').trim().toLowerCase();
      if (v.indexOf('[##_') !== -1) return false;      // 치환되지 않음
      return v === 'true' || v === 's_t3' || v === '1';
    }

    var post = $('.post-body');
    if (!post) return;

    /* ① 복사할 때 출처 자동 첨부 */
    if (on('data-copy-source')) {
      d.addEventListener('copy', function (e) {
        var sel = window.getSelection();
        if (!sel || sel.isCollapsed) return;
        var node = sel.anchorNode;
        var el = node && (node.nodeType === 1 ? node : node.parentElement);
        if (!el || !el.closest('.post-body')) return;              // 본문에서 복사할 때만
        if (el.closest('.cb, pre, code')) return;                  // 코드블록은 그대로 둔다

        var text = sel.toString();
        if (text.length < 40) return;                              // 짧은 복사는 건드리지 않는다

        var titleEl = $('.post-single .inline-title');
        var title = titleEl ? titleEl.textContent.trim() : d.title;
        var note = '\n\n출처: ' + title + '\n' + location.origin + location.pathname;

        if (e.clipboardData) {
          e.clipboardData.setData('text/plain', text + note);
          e.preventDefault();
        }
      });
    }

    /* ② 우클릭 · 드래그 막기 */
    if (on('data-protect')) {
      body.classList.add('no-copy');

      post.addEventListener('contextmenu', function (e) {
        if (e.target.closest('.cb, pre, code, a, input, textarea')) return;
        e.preventDefault();
      });

      post.addEventListener('dragstart', function (e) {
        if (e.target.closest('.cb, pre, code')) return;
        e.preventDefault();
      });
    }
  })();

  /* ===================================================================
     태그 그래프 (옵시디언 그래프 뷰 스타일)

     · 노드 = 글 / 태그, 선 = "이 글에 이 태그가 달렸다"
     · 처음에는 RSS 한 번만 읽어서 최근 글과 그 태그를 그린다.
       (관리 > 블로그 의 RSS 공개 개수를 올리면 더 많이 그려진다)
     · 점을 누르면 그때 한 번만 더 읽어서 이어진 글·태그를 붙인다.
     · 읽은 내용은 하루 동안 브라우저에 저장해 다시 읽지 않는다.
     · 외부 라이브러리 없이 canvas 와 간단한 힘 계산으로 그린다.
     =================================================================== */
  (function () {
    var pane = d.getElementById('graphPane');
    if (!pane) return;

    var stage = d.getElementById('graphStage');
    var canvas = d.getElementById('graphCanvas');
    var msg = d.getElementById('graphMsg');
    if (!stage || !canvas || !canvas.getContext || !window.fetch || !window.DOMParser) {
      pane.style.display = 'none';
      return;
    }

    var ctx = canvas.getContext('2d');
    var MAX_NODES = 220;
    var CACHE_KEY = 'devlog-graph-v1';
    var CACHE_TTL = 24 * 60 * 60 * 1000;

    var nodes = [], links = [], byId = {}, linkSet = {};
    var view = { x: 0, y: 0, k: 1 };
    var hover = null, focus = null, dragNode = null;
    var panning = false, moved = 0, lastPt = null;
    var alpha = 0, raf = null, dpr = 1;
    var colors = {};

    /* ---------- 색 (테마를 따라간다) ---------- */
    function readColors() {
      var cs = getComputedStyle(d.documentElement);
      function v(name, fb) { return (cs.getPropertyValue(name) || '').trim() || fb; }
      colors = {
        accent: v('--interactive-accent', '#8b6cef'),
        faint: v('--text-faint', '#8a8a8a'),
        muted: v('--text-muted', '#b0b0b0'),
        normal: v('--text-normal', '#dcdcdc'),
        line: v('--background-modifier-border', '#3a3a3a'),
        bg: v('--background-primary-alt', v('--background-primary', '#1e1e1e'))
      };
    }

    /* ---------- 노드 색 ----------
       글은 카테고리별로, 태그는 이름별로 색을 나눈다.
       같은 카테고리 글끼리 같은 색이라 무리가 눈에 들어온다. */
    var PALETTE = ['#8b6cef', '#4d92e8', '#00b3a4', '#5aa84f', '#d6a72a',
                   '#e0714f', '#d95f8b', '#a56cd0', '#3fa3c9', '#9c8b5e'];
    var groupIdx = {}, groupN = 0;

    function hashOf(str) {
      var h = 0;
      for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
      return h;
    }

    function colorOf(n) {
      if (n.type === 'post') {
        var g = n.group || '기타';
        if (!(g in groupIdx)) { groupIdx[g] = groupN % PALETTE.length; groupN++; }
        return PALETTE[groupIdx[g]];
      }
      return PALETTE[hashOf(n.label) % PALETTE.length];
    }

    /* ---------- 노드 · 선 ---------- */
    function addNode(type, label, url, group) {
      label = (label || '').trim();
      if (!label) return null;
      var id = type + ':' + label;
      if (byId[id]) return byId[id];
      if (nodes.length >= MAX_NODES) return null;
      var a = Math.random() * Math.PI * 2, r = 40 + Math.random() * 90;
      var n = {
        id: id, type: type, label: label, url: url || '', group: group || '',
        x: Math.cos(a) * r, y: Math.sin(a) * r, vx: 0, vy: 0,
        deg: 0, loaded: false
      };
      nodes.push(n); byId[id] = n;
      return n;
    }

    function addLink(a, b) {
      if (!a || !b || a === b) return;
      var k = a.id < b.id ? a.id + '|' + b.id : b.id + '|' + a.id;
      if (linkSet[k]) return;
      linkSet[k] = 1;
      links.push({ a: a, b: b });
      a.deg++; b.deg++;
    }

    function radius(n) {
      var base = n.type === 'post' ? 4.2 : 3.2;
      return base + Math.min(5.5, n.deg * 0.55);
    }

    /* ---------- 힘 계산 ---------- */
    function tick() {
      var i, j, n1, n2, dx, dy, d2, dist, f;

      for (i = 0; i < nodes.length; i++) {
        n1 = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          n2 = nodes[j];
          dx = n2.x - n1.x; dy = n2.y - n1.y;
          d2 = dx * dx + dy * dy;
          if (d2 > 62500) continue;            // 250px 넘게 떨어진 쌍은 무시
          if (d2 < 1) d2 = 1;
          dist = Math.sqrt(d2);
          f = 620 / d2;
          dx = dx / dist * f; dy = dy / dist * f;
          n1.vx -= dx; n1.vy -= dy;
          n2.vx += dx; n2.vy += dy;
        }
      }

      for (i = 0; i < links.length; i++) {
        var l = links[i];
        dx = l.b.x - l.a.x; dy = l.b.y - l.a.y;
        dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        f = (dist - 52) * 0.022;
        dx = dx / dist * f; dy = dy / dist * f;
        l.a.vx += dx; l.a.vy += dy;
        l.b.vx -= dx; l.b.vy -= dy;
      }

      for (i = 0; i < nodes.length; i++) {
        n1 = nodes[i];
        n1.vx -= n1.x * 0.0045;
        n1.vy -= n1.y * 0.0045;
        n1.vx *= 0.85; n1.vy *= 0.85;
        if (n1 !== dragNode) { n1.x += n1.vx * alpha; n1.y += n1.vy * alpha; }
      }
      alpha *= 0.982;
    }

    function kick(a) {
      alpha = Math.max(alpha, a || 0.85);
      if (!raf) raf = requestAnimationFrame(loop);
    }

    var fitted = false;
    function fit() {
      if (!nodes.length) return;
      var r = stage.getBoundingClientRect();
      var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
      nodes.forEach(function (n) {
        if (n.x < minX) minX = n.x; if (n.x > maxX) maxX = n.x;
        if (n.y < minY) minY = n.y; if (n.y > maxY) maxY = n.y;
      });
      var gw = Math.max(1, maxX - minX) + 60, gh = Math.max(1, maxY - minY) + 60;
      view.k = Math.max(.35, Math.min(3.4, Math.min(r.width / gw, r.height / gh)));
      view.x = -((minX + maxX) / 2) * view.k;
      view.y = -((minY + maxY) / 2) * view.k;
    }

    function loop() {
      tick(); draw();
      if (alpha > 0.03 || dragNode) raf = requestAnimationFrame(loop);
      else {
        raf = null;
        if (!fitted) { fitted = true; fit(); }
        draw();
      }
    }

    /* ---------- 그리기 ---------- */
    function resize() {
      var r = stage.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      draw();
    }

    function neighborsOf(n) {
      var set = {};
      if (!n) return set;
      for (var i = 0; i < links.length; i++) {
        if (links[i].a === n) set[links[i].b.id] = 1;
        else if (links[i].b === n) set[links[i].a.id] = 1;
      }
      return set;
    }

    function draw() {
      var w = canvas.width / dpr, h = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (!nodes.length) return;

      var hi = hover || focus;
      var near = neighborsOf(hi);

      ctx.save();
      ctx.translate(w / 2 + view.x, h / 2 + view.y);
      ctx.scale(view.k, view.k);

      ctx.lineWidth = 1 / view.k;
      for (var i = 0; i < links.length; i++) {
        var l = links[i];
        var on = hi && (l.a === hi || l.b === hi);
        ctx.strokeStyle = on ? colorOf(l.a.type === 'tag' ? l.a : l.b) : colors.line;
        ctx.globalAlpha = hi ? (on ? .9 : .14) : .45;
        ctx.beginPath();
        ctx.moveTo(l.a.x, l.a.y);
        ctx.lineTo(l.b.x, l.b.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      for (i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var lit = !hi || n === hi || near[n.id];
        ctx.globalAlpha = (lit ? 1 : .22) * (n.type === 'post' ? 1 : .72);
        ctx.fillStyle = colorOf(n);
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius(n), 0, Math.PI * 2);
        ctx.fill();
        if (n.type === 'post') {                     // 글은 테두리를 둘러 태그와 구분
          ctx.globalAlpha = lit ? .9 : .2;
          ctx.strokeStyle = colors.bg;
          ctx.lineWidth = 1.4 / view.k;
          ctx.stroke();
        }
        if (n === hi) {
          ctx.globalAlpha = 1;
          ctx.strokeStyle = colors.normal;
          ctx.lineWidth = 1.6 / view.k;
          ctx.stroke();
        }
      }

      // 이름표 — 마우스가 올라간 점과 그 이웃, 그리고 크게 자란 점만
      ctx.globalAlpha = 1;
      ctx.font = (11 / view.k).toFixed(1) + 'px ' +
        (getComputedStyle(d.body).fontFamily || 'sans-serif');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      var small = w < 420;
      var maxLen = small ? 12 : 20;
      for (i = 0; i < nodes.length; i++) {
        var m = nodes[i];
        var show = hi ? (m === hi || near[m.id])
                      : (!small && (m.deg >= 4 || view.k > 1.6));
        if (!show) continue;
        var label = m.label.length > maxLen ? m.label.slice(0, maxLen - 1) + '…' : m.label;
        ctx.fillStyle = m === hi ? colors.normal : colors.faint;
        ctx.fillText(label, m.x, m.y + radius(m) + 3 / view.k);
      }
      ctx.restore();
    }

    /* ---------- 좌표 변환 · 히트 테스트 ---------- */
    function toGraph(e) {
      var r = stage.getBoundingClientRect();
      var w = r.width, h = r.height;
      return {
        x: ((e.clientX - r.left) - w / 2 - view.x) / view.k,
        y: ((e.clientY - r.top) - h / 2 - view.y) / view.k
      };
    }

    function pick(pt) {
      var best = null, bestD = 14 / view.k;
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var dx = n.x - pt.x, dy = n.y - pt.y;
        var dist = Math.sqrt(dx * dx + dy * dy) - radius(n);
        if (dist < bestD) { bestD = dist; best = n; }
      }
      return best;
    }

    /* ---------- 데이터 읽기 ---------- */
    function decodeEnt(s) {
      if (!s || s.indexOf('&') === -1) return (s || '').trim();
      var el = d.createElement('textarea');
      el.innerHTML = s;
      return (el.value || '').trim();
    }

    function tagUrl(label) { return '/tag/' + encodeURIComponent(label); }

    function fromRss(text) {
      var doc = new DOMParser().parseFromString(text, 'application/xml');
      var items = [].slice.call(doc.querySelectorAll('item'));
      return items.map(function (it) {
        var cats = [].slice.call(it.querySelectorAll('category'))
          .map(function (c) { return decodeEnt(c.textContent); })
          .filter(Boolean);
        var titleEl = it.querySelector('title');
        var linkEl = it.querySelector('link');
        return {
          title: decodeEnt(titleEl ? titleEl.textContent : ''),
          link: (linkEl ? linkEl.textContent : '').trim(),
          cat: (cats[0] || '').split('/').pop(),   // 첫 번째는 카테고리 — 색을 나누는 데 쓴다
          tags: cats.slice(1)
        };
      }).filter(function (x) { return x.title && x.tags.length; });
    }

    function build(posts) {
      posts.forEach(function (p) {
        var pn = addNode('post', p.title, p.link, p.cat);
        if (!pn) return;
        p.tags.slice(0, 10).forEach(function (t) {
          addLink(pn, addNode('tag', t, tagUrl(t)));
        });
      });
    }

    function cacheGet() {
      try {
        var v = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
        return (v && v.at && (Date.now() - v.at) < CACHE_TTL) ? v.posts : null;
      } catch (e) { return null; }
    }
    function cacheSet(posts) {
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), posts: posts })); } catch (e) {}
    }

    /* ---------- 점을 누르면 펼쳐진다 ---------- */
    function expand(n) {
      if (!n || n.loaded) return;
      n.loaded = true;
      var url = n.type === 'tag' ? (n.url || tagUrl(n.label)) : n.url;
      if (!url) return;

      fetch(url, { credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.text() : Promise.reject(new Error(r.status)); })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          if (n.type === 'tag') {
            [].slice.call(doc.querySelectorAll('.plist .pi-t a')).slice(0, 12)
              .forEach(function (a) {
                addLink(n, addNode('post', a.textContent, a.getAttribute('href')));
              });
          } else {
            [].slice.call(doc.querySelectorAll('.post-tags a')).slice(0, 12)
              .forEach(function (a) {
                var name = (a.textContent || '').replace(/^#/, '');
                addLink(n, addNode('tag', name, a.getAttribute('href')));
              });
          }
          kick(1);
        })
        .catch(function () { /* 못 읽으면 그대로 둔다 */ });
    }

    /* ---------- 입력 ---------- */
    stage.addEventListener('mousedown', function (e) {
      var pt = toGraph(e);
      var n = pick(pt);
      moved = 0; lastPt = { x: e.clientX, y: e.clientY };
      if (n) { dragNode = n; n.vx = n.vy = 0; }
      else { panning = true; stage.classList.add('is-drag'); }
      kick(.5);
    });

    d.addEventListener('mousemove', function (e) {
      if (dragNode) {
        var pt = toGraph(e);
        dragNode.x = pt.x; dragNode.y = pt.y;
        moved += Math.abs(e.clientX - lastPt.x) + Math.abs(e.clientY - lastPt.y);
        lastPt = { x: e.clientX, y: e.clientY };
        kick(.4);
        return;
      }
      if (panning) {
        view.x += e.clientX - lastPt.x;
        view.y += e.clientY - lastPt.y;
        moved += Math.abs(e.clientX - lastPt.x) + Math.abs(e.clientY - lastPt.y);
        lastPt = { x: e.clientX, y: e.clientY };
        draw();
        return;
      }
      var r = stage.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
        if (hover) { hover = null; draw(); }
        return;
      }
      var h2 = pick(toGraph(e));
      if (h2 !== hover) { hover = h2; stage.style.cursor = h2 ? 'pointer' : ''; draw(); }
    });

    d.addEventListener('mouseup', function (e) {
      var wasDrag = dragNode, wasMoved = moved;
      dragNode = null; panning = false;
      stage.classList.remove('is-drag');
      if (wasDrag && wasMoved < 4) {
        focus = wasDrag;
        expand(wasDrag);
        kick(.6);
      }
    });

    stage.addEventListener('dblclick', function (e) {
      var n = pick(toGraph(e));
      if (n && n.url) location.href = n.url;
    });

    stage.addEventListener('wheel', function (e) {
      if (!stage.closest('.graph-modal') && !e.ctrlKey) return;   // 사이드바에서는 페이지 스크롤 우선
      e.preventDefault();
      var f = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      view.k = Math.max(.35, Math.min(3.2, view.k * f));
      draw();
    }, { passive: false });

    /* ---------- 크게 보기 ---------- */
    var modal = null;
    function openModal() {
      if (modal) return;
      modal = d.createElement('div');
      modal.className = 'graph-modal';
      var inner = d.createElement('div');
      inner.className = 'graph-modal-inner';
      var close = d.createElement('button');
      close.className = 'graph-close';
      close.setAttribute('aria-label', '닫기');
      close.setAttribute('title', '닫기 (Esc)');
      close.textContent = '✕';
      inner.appendChild(stage);
      inner.appendChild(close);
      modal.appendChild(inner);
      d.body.appendChild(modal);
      resize(); fitted = false; kick(.7);
      close.addEventListener('click', closeModal);
      modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
      d.addEventListener('keydown', escClose);
    }
    function closeModal() {
      if (!modal) return;
      pane.insertBefore(stage, pane.querySelector('.graph-hint'));
      modal.parentNode.removeChild(modal);
      modal = null;
      d.removeEventListener('keydown', escClose);
      resize(); fitted = false; kick(.5);
    }
    function escClose(e) { if (e.key === 'Escape') closeModal(); }

    var btnExpand = d.getElementById('graphExpand');
    if (btnExpand) btnExpand.addEventListener('click', openModal);

    var btnReset = d.getElementById('graphReset');
    if (btnReset) btnReset.addEventListener('click', function () {
      focus = null;
      fit();
      draw();
      kick(.4);
    });

    /* ---------- 시작 ---------- */
    function start(posts) {
      // 지금 보고 있는 글을 중심에 둔다 (옵시디언의 로컬 그래프처럼)
      if (body.id === 'tt-body-page' || body.id === 'tt-body-notice') {
        var t = $('.post-single .inline-title');
        if (t) {
          var catEl = $('.post-single .prop-v a[href*="/category/"]');
          var here = addNode('post', t.textContent, location.pathname,
                             catEl ? (catEl.textContent || '').split('/').pop().trim() : '');
          if (here) {
            here.loaded = true; here.x = 0; here.y = 0;
            $$('.post-tags a').forEach(function (a) {
              addLink(here, addNode('tag', (a.textContent || '').replace(/^#/, ''), a.getAttribute('href')));
            });
            focus = here;
          }
        }
      }
      build(posts || []);

      if (!nodes.length) {
        msg.textContent = '아직 표시할 태그가 없습니다. 글에 태그를 달면 여기에 나타납니다.';
        return;
      }
      msg.hidden = true;
      readColors();
      resize();
      kick(1);
    }

    var cached = cacheGet();
    if (cached) {
      start(cached);
    } else {
      fetch('/rss', { credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.text() : Promise.reject(new Error(r.status)); })
        .then(function (text) {
          var posts = fromRss(text);
          cacheSet(posts);
          start(posts);
        })
        .catch(function () {
          start(null);
          if (!nodes.length) msg.textContent = '그래프를 불러오지 못했습니다.';
        });
    }

    window.addEventListener('resize', resize);

    // 테마가 바뀌면 색을 다시 읽는다
    if (window.MutationObserver) {
      new MutationObserver(function () { readColors(); draw(); })
        .observe(d.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }
  })();

  /* ===================================================================
     공유 버튼
     =================================================================== */
  (function () {
    var url = encodeURIComponent(location.href);
    var title = encodeURIComponent(d.title);

    var copyBtn = $('#shareCopyUrl');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        navigator.clipboard.writeText(location.href).then(function () {
          copyBtn.innerHTML = icon('i-check');
          setTimeout(function () { copyBtn.innerHTML = icon('i-link'); }, 1500);
        });
      });
    }

    var tw = $('#shareTwitter');
    if (tw) tw.href = 'https://twitter.com/intent/tweet?url=' + url + '&text=' + title;

    var fb = $('#shareFacebook');
    if (fb) fb.href = 'https://www.facebook.com/sharer/sharer.php?u=' + url;

    var li = $('#shareLinkedin');
    if (li) li.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + url;

    var nv = $('#shareNaver');
    if (nv) nv.href = 'https://blog.naver.com/openapi/share?url=' + url + '&title=' + title;

    var kakao = $('#shareKakao');
    if (kakao) {
      kakao.addEventListener('click', function (e) {
        e.preventDefault();
        if (navigator.share) {
          navigator.share({ title: d.title, url: location.href });
        } else {
          window.open('https://sharer.kakao.com/talk/friends/picker/link?url=' + url,
            '_blank', 'width=600,height=500');
        }
      });
    }
  })();

})();
