#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""skin.html 의 티스토리 치환자를 샘플 데이터로 바꿔 로컬 프리뷰를 만든다."""
import re, io, sys

SRC = open('skin.html', encoding='utf-8').read()


def block_re(tag):
    return re.compile(r'<%s>(.*?)</%s>' % (tag, tag), re.S)


def drop(tag, html):
    return block_re(tag).sub('', html)


def unwrap(tag, html):
    return block_re(tag).sub(lambda m: m.group(1), html)


def repeat(tag, html, rows):
    """블록 내부를 rows 개수만큼 반복하며 dict 값으로 치환"""
    def rep(m):
        inner = m.group(1)
        out = []
        for row in rows:
            chunk = inner
            for k, v in row.items():
                chunk = chunk.replace('[##_%s_##]' % k, str(v))
            out.append(chunk)
        return ''.join(out)
    return block_re(tag).sub(rep, html)


# ---------------------------------------------------------------- 샘플 데이터
CATEGORY_HTML = '''
<div id="treeWrap">
  <table id="treeComponent"><tbody><tr><td>
    <table id="category_0"><tbody><tr><td class="ib"><img onclick="void 0"></td><td><table id="imp0"><tbody><tr><td class="branch3" onclick="window.location.href='/category'"><div id="text_0">BᴀᴄᴋEɴᴅ Dᴇᴠᴇʟᴏᴘᴇʀ<span class="c_cnt"> (224)</span></div></td></tr></tbody></table></td></tr></tbody></table>
    <table id="category_696069"><tbody><tr><td class="ib"><a class="click" onclick="void 0"><img></a></td><td><table><tbody><tr><td class="branch3" onclick="window.location.href='/category/☃︎%20Dιαry'"><div id="text_696069">☃︎ Dιαry<span class="c_cnt"> (9)</span></div></td></tr></tbody></table></td></tr></tbody></table>
    <div id="category_696069_children"></div>
    <table id="category_697925"><tbody><tr><td class="ib"><a class="click" onclick="void 0"><img></a></td><td><table><tbody><tr><td class="branch3" onclick="window.location.href='/category/📍%20Lαɴɢυαɢe'"><div id="text_697925">📍 Lαɴɢυαɢe<span class="c_cnt"> (84)</span></div></td></tr></tbody></table></td></tr></tbody></table>
    <div id="category_697925_children"><table onclick="window.location.href='/category/Jαvα'"><tbody><tr><td class="ib"><a class="click" onclick="void 0"><img></a></td><td><table><tbody><tr><td class="branch3"><div id="text_670563">Jαvα<span class="c_cnt"> (50)</span></div></td></tr></tbody></table></td></tr></tbody></table><table onclick="window.location.href='/category/Alɢorιтнм'"><tbody><tr><td class="ib"><a class="click" onclick="void 0"><img></a></td><td><table><tbody><tr><td class="branch3"><div id="text_670564">Alɢorιтнм<span class="c_cnt"> (12)</span></div></td></tr></tbody></table></td></tr></tbody></table><table onclick="window.location.href='/category/JαvαScrιpт'"><tbody><tr><td class="ib"><a class="click" onclick="void 0"><img></a></td><td><table><tbody><tr><td class="branch3"><div id="text_670565">JαvαScrιpт<span class="c_cnt"> (17)</span></div></td></tr></tbody></table></td></tr></tbody></table><table onclick="window.location.href='/category/Pyтнoɴ'"><tbody><tr><td class="ib"><a class="click" onclick="void 0"><img></a></td><td><table><tbody><tr><td class="branch3"><div id="text_670566">Pyтнoɴ<span class="c_cnt"> (5)</span></div></td></tr></tbody></table></td></tr></tbody></table></div>
    <table id="category_700001"><tbody><tr><td class="ib"><a class="click" onclick="void 0"><img></a></td><td><table><tbody><tr><td class="branch3" onclick="window.location.href='/category/🌱%20Frαмeworĸ'"><div id="text_700001">🌱 Frαмeworĸ<span class="c_cnt"> (10)</span></div></td></tr></tbody></table></td></tr></tbody></table>
    <div id="category_700001_children"></div>
    <table id="category_700002"><tbody><tr><td class="ib"><a class="click" onclick="void 0"><img></a></td><td><table><tbody><tr><td class="branch3" onclick="window.location.href='/category/🖥️%20DevOpѕ'"><div id="text_700002"><a href="/category/DevOps">🖥️ DevOpѕ</a><span class="c_cnt"> (6)</span></div></td></tr></tbody></table></td></tr></tbody></table>
    <table id="category_700003"><tbody><tr><td class="ib"><a class="click" onclick="void 0"><img></a></td><td><table><tbody><tr><td class="branch3" onclick="window.location.href='/category/🚫%20Error'"><div id="text_700003">🚫 Error<span class="c_cnt"> (3)</span></div></td></tr></tbody></table></td></tr></tbody></table>
    <table id="category_700004"><tbody><tr><td class="ib"><a class="click" onclick="void 0"><img></a></td><td><table><tbody><tr><td class="branch3" onclick="window.location.href='/category/⚠️%20Iɴғrα'"><div id="text_700004">⚠️ Iɴғrα<span class="c_cnt"> (17)</span></div></td></tr></tbody></table></td></tr></tbody></table>
    <div id="category_700004_children"><table onclick="window.location.href='/category/Mαcвooĸ%20Seттιɴɢ👩🏻‍💻'"><tbody><tr><td class="ib"><a class="click" onclick="void 0"><img></a></td><td><table><tbody><tr><td class="branch3"><div id="text_700041">Mαcвooĸ Seттιɴɢ👩🏻‍💻<span class="c_cnt"> (11)</span></div></td></tr></tbody></table></td></tr></tbody></table><table onclick="window.location.href='/category/KeyMαp👩🏻‍💻'"><tbody><tr><td class="ib"><a class="click" onclick="void 0"><img></a></td><td><table><tbody><tr><td class="branch3"><div id="text_700042">KeyMαp👩🏻‍💻<span class="c_cnt"> (6)</span></div></td></tr></tbody></table></td></tr></tbody></table></div>
    <table id="category_700005"><tbody><tr><td class="ib"><a class="click" onclick="void 0"><img></a></td><td><table><tbody><tr><td class="branch3" onclick="window.location.href='/category/Acαdeмy%2023-24'"><div id="text_700005">Acαdeмy 23-24<span class="c_cnt"> (76)</span></div></td></tr></tbody></table></td></tr></tbody></table>
    <table id="category_700006"><tbody><tr><td class="ib"><a class="click" onclick="void 0"><img></a></td><td><table><tbody><tr><td class="branch3" onclick="window.location.href='/category/보물창고(나만봄)'"><div id="text_700006">보물창고(나만봄)<span class="c_cnt"> (18)</span></div></td></tr></tbody></table></td></tr></tbody></table>
  </td></tr></tbody></table>
</div>
'''

CALENDAR_HTML = '''
<table><caption><a href="#">&lsaquo;</a> 2026. 08 <a href="#">&rsaquo;</a></caption>
<thead><tr><th>일</th><th>월</th><th>화</th><th>수</th><th>목</th><th>금</th><th>토</th></tr></thead>
<tbody>
<tr><td></td><td></td><td></td><td></td><td></td><td></td><td>1</td></tr>
<tr><td>2</td><td><a href="#">3</a></td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td></tr>
<tr><td><a href="#">9</a></td><td>10</td><td>11</td><td>12</td><td>13</td><td><a href="#">14</a></td><td>15</td></tr>
<tr><td>16</td><td><a href="#">17</a></td><td>18</td><td class="cal_day_today">19</td><td>20</td><td>21</td><td>22</td></tr>
<tr><td>23</td><td>24</td><td>25</td><td>26</td><td>27</td><td>28</td><td>29</td></tr>
</tbody></table>
'''

MENU_HTML = '''<ul><li class="selected"><a href="/">홈</a></li>
<li><a href="/pages/about">소개</a></li>
<li><a href="/category/Spring">Spring 연재</a></li>
<li><a href="/tag">태그</a></li>
<li><a href="/guestbook">방명록</a></li></ul>'''

POST_BODY = '''
<p>고도화 프로젝트에서 주문 저장 로직에 로그 테이블 적재를 붙이는 작업을 하다가,
<code>REQUIRES_NEW</code>를 분명히 붙였는데도 상위 트랜잭션이 롤백되면 로그까지 같이
사라지는 현상을 만났습니다.</p>

<blockquote><p>결론부터 말하면 원인은 전파 속성이 아니라 <strong>자기 호출(self-invocation)</strong>이었습니다.</p></blockquote>

<h2>같은 클래스 안에서 부르면 프록시를 안 탄다</h2>
<p>Spring AOP는 기본적으로 프록시 기반입니다. 외부에서 빈을 통해 호출될 때만 어드바이스가
끼어들 수 있습니다. <a href="#">프록시 기반 AOP의 한계</a>에서 다뤘던 내용이 여기서 그대로 문제가 됩니다.</p>

<pre data-ke-language="java"><code class="language-java"><span class="hljs-meta">@Service</span>
<span class="hljs-meta">@RequiredArgsConstructor</span>
<span class="hljs-keyword">public class</span> <span class="hljs-title">OrderService</span> {

    <span class="hljs-comment">// 같은 클래스 내부 호출 → 프록시를 타지 않는다</span>
    <span class="hljs-meta">@Transactional</span>
    <span class="hljs-keyword">public void</span> <span class="hljs-title">place</span>(OrderRequest req) {
        orderRepository.save(req.toEntity());
        writeLog(req);   <span class="hljs-comment">// self-invocation</span>
    }

    <span class="hljs-meta">@Transactional</span>(propagation = Propagation.<span class="hljs-number">REQUIRES_NEW</span>)
    <span class="hljs-keyword">public void</span> <span class="hljs-title">writeLog</span>(OrderRequest req) {
        logRepository.save(<span class="hljs-keyword">new</span> OrderLog(req));
    }
}</code></pre>

<h2>해결 — 별도 빈으로 분리한다</h2>
<p>가장 단순하고 안전한 방법은 새 트랜잭션이 필요한 로직을 별도 빈으로 빼는 것입니다.</p>

<h3>주의할 점</h3>
<p>분리한 빈을 다시 같은 서비스에서 호출할 때는 순환 참조가 생기지 않는지 확인해야 합니다.</p>

<pre data-ke-language="java"><code class="language-java"><span class="hljs-meta">@Service</span>
<span class="hljs-keyword">public class</span> <span class="hljs-title">OrderLogService</span> {
    <span class="hljs-meta">@Transactional</span>(propagation = Propagation.<span class="hljs-number">REQUIRES_NEW</span>)
    <span class="hljs-keyword">public void</span> <span class="hljs-title">write</span>(OrderRequest req) {
        logRepository.save(<span class="hljs-keyword">new</span> OrderLog(req));
    }
}</code></pre>

<h2>정리</h2>
<ul>
<li>전파 속성은 &ldquo;어떤 트랜잭션에 참여할 것인가&rdquo;만 정의한다</li>
<li>그 이전에 <strong>어드바이스가 적용되는지</strong>를 먼저 확인해야 한다</li>
<li>같은 클래스 내부 호출은 프록시를 우회하므로 애초에 적용되지 않는다</li>
</ul>

<table>
<thead><tr><th>전파 속성</th><th>기존 트랜잭션이 있을 때</th><th>없을 때</th></tr></thead>
<tbody>
<tr><td>REQUIRED</td><td>참여</td><td>새로 생성</td></tr>
<tr><td>REQUIRES_NEW</td><td>보류 후 새로 생성</td><td>새로 생성</td></tr>
<tr><td>SUPPORTS</td><td>참여</td><td>트랜잭션 없이 실행</td></tr>
</tbody></table>

<h3>에디터가 만든 표 (머리글 없이 td 로만 나온다)</h3>
<table style="border-collapse: collapse; width: 100%;">
<tbody>
<tr><td style="width: 24%; background-color: rgb(255, 255, 255);">pyproject.toml 도입 배경</td>
    <td style="width: 76%; background-color: rgb(255, 255, 255);">과거 파이썬 패키징은 주로 setup.py 파일을 사용했다.
    이 파일은 파이썬 코드로 작성되어 있어 유연성이 높았다. 하지만 빌드 도구와 설정 방식이 통일되지 않아 파편화되는 문제가 발생했다.</td></tr>
<tr><td style="width: 24%; background-color: rgb(255, 255, 255);">프론트엔드 · 백엔드</td>
    <td style="width: 76%; background-color: rgb(255, 255, 255);">패키지 빌드 및 설치 과정은 일반적으로 '프론트엔드'(설치 도구)와 '백엔드'(실제 빌드 도구)의 상호작용으로 진행된다.</td></tr>
<tr><td style="width: 24%; background-color: rgb(255, 255, 255);">PEP 517 / 518</td>
    <td style="width: 76%; background-color: rgb(255, 255, 255);">PEP 518 에서 빌드 시스템의 요구사항을, PEP 517 에서 빌드 시스템과 설치 도구의 상호작용 방식을 정의했다.</td></tr>
</tbody></table>

<h3>다른 곳에서 복사해 붙여넣어 색·투명도가 따라온 글 (가독성 가드 시험)</h3>
<p style="text-align: center; color: rgba(0, 0, 0, 0.08);">거의 투명한 검정으로 붙여넣어진 문장 — 보정 전에는 배경에 묻힌다.</p>
<p style="text-align: center; color: rgb(250, 250, 250);">흰색으로 붙여넣어진 문장 — 라이트 모드에서 안 보이던 경우.</p>
<div style="opacity: 0.05;"><p>opacity 0.05 로 붙여넣어진 문단 — 애니메이션 잔재.</p></div>
<p><span style="-webkit-text-fill-color: rgba(0,0,0,.06); color: rgba(0,0,0,.06);">text-fill-color 로만 흐려진 글자</span></p>

<h3>형광펜 · 글자색을 직접 칠한 문장</h3>
<p><span style="background-color: rgb(250, 200, 205);">setuptools 를 설치하고 나서야 openpyxl 이 정상적으로 깔렸다 😱</span></p>
<p><span style="background-color: #2d5f8b;">어두운 배경에 칠한 글자도 읽혀야 한다</span></p>
<p><span style="color: rgb(0, 0, 0);">에디터에서 검은색으로 지정한 글자</span> ·
   <span style="color: rgb(255, 255, 255); background-color: rgb(255, 241, 143);">흰 글자에 노란 형광펜</span></p>
'''

COMMENT_HTML = '''
<div class="tt_comment_cont">
  <div class="tt_box_total"><span class="tt_txt_g">댓글</span> <span class="tt_num_g">12</span></div>
  <ul class="tt_list_comment">
    <li><a href="#" class="tt_link_user">devkim</a> <span class="tt_date">2026.08.17 14:22</span>
      <p class="tt_p_content">덕분에 프록시 동작을 확실히 이해했습니다. 감사합니다!</p></li>
    <li><a href="#" class="tt_link_user">backend_lee</a> <span class="tt_date">2026.08.17 18:03</span>
      <p class="tt_p_content">self-invocation은 늘 헷갈리는 부분이었는데 예제가 명확하네요.</p></li>
  </ul>
</div>
'''

def thumb(label, color):
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="220">'
           '<rect width="320" height="220" fill="' + color + '"/>'
           '<text x="160" y="122" font-size="30" font-family="sans-serif" fill="#ffffff"'
           ' text-anchor="middle" opacity="0.85">' + label + '</text></svg>')
    return 'data:image/svg+xml;utf8,' + svg.replace('#', '%23').replace('"', "'")


POSTS = [
    dict(article_rep_link='#', article_rep_title='@Transactional 전파 속성, 실무에서 진짜 헷갈렸던 3가지',
         article_rep_category='Spring / Spring Boot', article_rep_category_link='#',
         article_rep_summary='REQUIRES_NEW를 썼는데 롤백이 같이 되던 상황을 프록시 동작 원리부터 되짚어 봤습니다. 자기 호출 문제와 예외 타입까지 정리했습니다.',
         article_rep_date='2026.08.17', article_rep_rp_cnt='12',
         article_rep_thumbnail_url=thumb('Spring', '#4f7a35')),
    dict(article_rep_link='#', article_rep_title='N+1 문제, fetch join 말고도 방법이 있었다',
         article_rep_category='JPA / DB', article_rep_category_link='#',
         article_rep_summary='@BatchSize와 EntityGraph, 그리고 DTO 프로젝션까지. 각 방법의 쿼리 실행 계획을 실제로 찍어 비교했습니다.',
         article_rep_date='2026.08.14', article_rep_rp_cnt='7',
         article_rep_thumbnail_url=thumb('JPA', '#3b6ea5')),
    dict(article_rep_link='#', article_rep_title='Spring Batch 청크 사이즈를 1000으로 올렸더니 OOM이 났다',
         article_rep_category='Spring / Spring Batch', article_rep_category_link='#',
         article_rep_summary='힙 덤프를 떠서 원인을 추적한 기록. 청크 사이즈와 커서 기반 리더, 그리고 영속성 컨텍스트의 관계를 다룹니다.',
         article_rep_date='2026.08.09', article_rep_rp_cnt='3',
         article_rep_thumbnail_url=thumb('Batch', '#5b4b8a')),
    dict(article_rep_link='#', article_rep_title='JVM GC 로그 읽는 법 — G1GC 기준으로 한 번에 정리',
         article_rep_category='Java / JVM', article_rep_category_link='#',
         article_rep_summary='Young / Mixed / Full GC 구간을 로그에서 어떻게 구분하는지, 그리고 어떤 지표를 먼저 봐야 하는지 짚었습니다.',
         article_rep_date='2026.08.03', article_rep_rp_cnt='5'),
]

NOTICES = [
    dict(notice_rep_link='#', notice_rep_title='신입 백엔드 1년, 고도화 프로젝트에서 배운 것들',
         notice_rep_summary='레거시 배치를 Spring Batch로 걷어내며 겪은 시행착오와 설계 판단을 정리했습니다.',
         notice_rep_date='2026.07.28'),
    dict(notice_rep_link='#', notice_rep_title='이 블로그 사용 설명서 / 글 분류 기준',
         notice_rep_summary='카테고리 구조와 시리즈 연재 규칙, 검색 팁을 한 곳에 모았습니다.',
         notice_rep_date='2026.05.02'),
    dict(notice_rep_link='#', notice_rep_title='Spring Boot 3 마이그레이션 체크리스트 (총정리)',
         notice_rep_summary='Jakarta 전환부터 Security 6 변경점까지 실무 기준으로 정리한 문서입니다.',
         notice_rep_date='2026.03.14'),
]

POPULAR = [
    dict(rctps_rep_link='#', rctps_rep_title='주니어 백엔드 개발자가 반드시 알아야 할 실무 지식',
         rctps_rep_category='DevOps', rctps_rep_category_link='#', rctps_rep_rp_cnt='18',
         rctps_rep_simple_date='2026.05.16', rctps_rep_thumbnail=thumb('DB', '#3b6ea5')),
    dict(rctps_rep_link='#', rctps_rep_title='JVM GC 로그 읽는 법 — G1GC 기준으로 한 번에 정리',
         rctps_rep_category='Java / JVM', rctps_rep_category_link='#', rctps_rep_rp_cnt='12',
         rctps_rep_simple_date='2026.08.03', rctps_rep_thumbnail=''),
    dict(rctps_rep_link='#', rctps_rep_title='N+1 문제, fetch join 말고도 방법이 있었다',
         rctps_rep_category='JPA / DB', rctps_rep_category_link='#', rctps_rep_rp_cnt='9',
         rctps_rep_simple_date='2026.08.14', rctps_rep_thumbnail=thumb('JPA', '#4f7a35')),
    dict(rctps_rep_link='#', rctps_rep_title='Spring Boot 3 마이그레이션 체크리스트',
         rctps_rep_category='Framework', rctps_rep_category_link='#', rctps_rep_rp_cnt='7',
         rctps_rep_simple_date='2026.03.14', rctps_rep_thumbnail=''),
    dict(rctps_rep_link='#', rctps_rep_title='@Transactional 전파 속성, 실무에서 헷갈렸던 3가지',
         rctps_rep_category='Spring Boot', rctps_rep_category_link='#', rctps_rep_rp_cnt='5',
         rctps_rep_simple_date='2026.08.17', rctps_rep_thumbnail=thumb('Spring', '#5b4b8a')),
]

RECENT = [dict(rctps_rep_link='#', rctps_rep_title=p['article_rep_title'][:30]) for p in POSTS]
COMMENTS = [
    dict(rctrp_rep_link='#', rctrp_rep_desc='덕분에 프록시 동작을 확실히 이해했습니다'),
    dict(rctrp_rep_link='#', rctrp_rep_desc='BatchSize 옵션은 처음 알았네요, 감사합니다'),
    dict(rctrp_rep_link='#', rctrp_rep_desc='힙 덤프 뜨는 방법도 다뤄주시면 좋겠어요'),
]
LINKS = [
    dict(link_url='https://github.com/yuuri', link_site='GitHub'),
    dict(link_url='mailto:me@example.com', link_site='Mail'),
    dict(link_url='/manage', link_site='manage'),
]
RELATED = [
    dict(article_related_rep_link='#', article_related_rep_title='트랜잭션이 도대체 어디서 시작되는가', article_related_rep_date='2026.07.30'),
    dict(article_related_rep_link='#', article_related_rep_title='프록시 기반 AOP의 한계', article_related_rep_date='2026.08.05'),
    dict(article_related_rep_link='#', article_related_rep_title='JPA 영속성 컨텍스트 정리', article_related_rep_date='2026.06.21'),
    dict(article_related_rep_link='#', article_related_rep_title='MySQL 락 모니터링 쿼리 모음', article_related_rep_date='2026.06.02'),
]
# 실제 티스토리 출력을 그대로 흉내 낸다(2026-08 확인).
#   <a href="/?page=7"><span class="selected">7</span></a>   ← 현재 페이지
#   <a href="/?page=8"><span class="">8</span></a>
#   <a><span class="">···</span></a>                          ← 생략(주소 없음)
_PAGE_SEQ = ['1', '...', '4', '5', '6', '7', '8', '9', '10', '...', '38']
_CURRENT = '7'
PAGES = [
    dict(
        paging_rep_link=('' if n == '...' else 'href="#"'),
        paging_rep_link_num=(
            '<span class="">···</span>' if n == '...'
            else '<span class="%s">%s</span>' % ('selected' if n == _CURRENT else '', n)
        ),
    )
    for n in _PAGE_SEQ
]


def apply_thumb(chunk, row):
    """썸네일 값이 있으면 s_article_rep_thumbnail 블록을 남기고, 없으면 제거"""
    if row.get('article_rep_thumbnail_url'):
        return unwrap('s_article_rep_thumbnail', chunk)
    return drop('s_article_rep_thumbnail', chunk)


# ---------------------------------------------------------------- 스킨 옵션(변수)
# 관리자 > 스킨 편집에서 설정하는 값. 여기서는 미리보기용 샘플.
#  bm1 : 이미지 없음(배경색 + 제목)   bm2 : 이미지 있음
#  bm3 : 이미지 없음                  bm4 : 링크 비움 → 표시되지 않음
def _img(label, color):
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" width="480" height="270">'
           '<rect width="480" height="270" fill="' + color + '"/>'
           '<text x="240" y="150" font-size="40" font-family="sans-serif" fill="#fff"'
           ' text-anchor="middle">' + label + '</text></svg>')
    return 'data:image/svg+xml;utf8,' + svg.replace('#', '%23').replace('"', "'")


VARS = {
    'accent-color': '#8b6cef',
    'about-text': 'Java · Spring 백엔드 개발자 — 고도화 프로젝트에서 배운 것을 기록합니다.',
    'stack1': 'java', 'stack2': 'spring', 'stack3': 'backend', 'stack4': '',
    'stack5': '', 'stack6': '',
    'home-recent': 'true', 'home-popular': 'true',
    'home-notice': 'true', 'home-notice-count': '3',
    'copyright-text': '이 글의 저작권은 작성자에게 있습니다.\n출처를 밝힌 인용은 자유롭게 하셔도 되며, 무단 전재·재배포·AI 학습 데이터 사용을 금합니다.',
    'copy-source': 'true', 'protect-content': '',
    'graph-show': 'true',
    'pin1-url': '/123', 'pin2-url': '', 'pin3-url': '',
    'home-popular-count': '5', 'popular-first': 'true',
    'show-recent': 'true', 'recent-count': '5',
    'show-popular': 'true', 'popular-count': '3',
    'show-comments': 'true', 'comments-count': '5',
    'bg-primary': '#1e1e1e',
    'bg-secondary': '#161616',

    # 북마크 — 최대 8장(한 줄에 4장씩 두 줄). 8번은 링크를 비워 "안 나오는 카드"를 확인한다
    'bm1-on': 'true', 'bm2-on': 'true', 'bm3-on': 'true', 'bm4-on': 'true',
    'bm5-on': 'true', 'bm6-on': 'true', 'bm7-on': 'true', 'bm8-on': '',

    'bm1-title': 'GitHub', 'bm1-desc': 'Study 기록 보관용',
    'bm1-url': 'https://github.com/', 'bm1-image': '', 'bm1-color': '#24292f',

    'bm2-title': '포트폴리오', 'bm2-desc': '이력 · 프로젝트 상세',
    'bm2-url': 'https://gayul.vercel.app/', 'bm2-image': _img('Portfolio', '#3b6ea5'),
    'bm2-color': '#3b6ea5',

    'bm3-title': 'Spring 시리즈', 'bm3-desc': 'Boot · Batch · Security 연재',
    'bm3-url': '/category/Framework', 'bm3-image': '', 'bm3-color': '#4f7a35',

    'bm4-title': '오늘의 학습', 'bm4-desc': '매일 쌓는 짧은 기록',
    'bm4-url': '/category/Diary', 'bm4-image': '', 'bm4-color': '#5b4b8a',

    'bm5-title': '알고리즘 노트', 'bm5-desc': '풀이와 삽질 기록',
    'bm5-url': '/category/Algorithm', 'bm5-image': _img('Algorithm', '#8a5b4b'),
    'bm5-color': '#8a5b4b',

    'bm6-title': 'DevOps', 'bm6-desc': '배포 · 인프라 삽질',
    'bm6-url': '/category/DevOps', 'bm6-image': '', 'bm6-color': '#3a7d7a',

    'bm7-title': '읽은 책', 'bm7-desc': '기술서 정리',
    'bm7-url': '/category/Book', 'bm7-image': '', 'bm7-color': '#8a6f2f',

    'bm8-title': '준비 중', 'bm8-desc': '아직 링크를 안 넣은 카드',
    'bm8-url': '', 'bm8-image': '', 'bm8-color': '#7a3f52',
}


def apply_vars(html):
    """<s_if_var_X> / <s_not_var_X> 조건 블록과 [##_var_X_##] 치환자를 처리"""
    for key, val in VARS.items():
        has = bool(val)
        html = block_re('s_if_var_' + key).sub((lambda m: m.group(1)) if has else '', html)
        html = block_re('s_not_var_' + key).sub('' if has else (lambda m: m.group(1)), html)
        html = html.replace('[##_var_%s_##]' % key, val)
    return html

COMMON = {
    'blog_link': '#',
    'title': 'yuuri.log',
    'blogger': 'yuuri',
    'desc': 'LazyInitializationException은 갑자기 온다. . . . 🌱\n    Java · Spring 백엔드 개발자\n    고도화 프로젝트 기록 중',
    'image': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="%238b6cef"/><text x="40" y="52" font-size="36" font-family="sans-serif" fill="white" text-anchor="middle">Y</text></svg>',
    'rss_url': '#', 'taglog_link': '#', 'guestbook_link': '#',
    'count_yesterday': '312', 'count_today': '487', 'count_total': '98,210',
    'search_name': 'search', 'search_text': '', 'search_onclick_submit': 'return false;',
    'body_id': 'tt-body-index',
    'category': CATEGORY_HTML, 'calendar': CALENDAR_HTML, 'blog_menu': MENU_HTML,
    'revenue_list_upper': '', 'revenue_list_lower': '',
    'comment_group': COMMENT_HTML, 'guestbook_group': '',
    'list_conform': '전체 글', 'list_count': '142',
    'article_rep_desc': POST_BODY,
    'tag_label_rep': '<a href="#">transaction</a><a href="#">aop</a><a href="#">spring</a><a href="#">jpa</a>',
    'article_prev_link': '#', 'article_prev_title': '프록시 기반 AOP의 한계',
    'article_next_link': '#', 'article_next_title': '격리 수준과 실제 락 동작',
    'prev_page': 'href="#"', 'next_page': 'href="#"',
    'no_more_prev': '', 'no_more_next': '',
    'page_title': 'yuuri.log',
    'article_dissolve': 'return false;', 'article_password': 'pw',
}

# (티스토리는 일자별 방문 데이터를 스킨에 주지 않는다 — chartData 주입 제거)


PIN_SAMPLE = ('신입 백엔드가 처음 겪은 N+1', '📍 Language/JPA')


def fill_pin_sample(h):
    """미리보기에서는 실제 글을 읽어올 수 없으므로 샘플 값으로 채워 둔다"""
    h = h.replace('<span class="pin-t"></span>', '<span class="pin-t">%s</span>' % PIN_SAMPLE[0], 1)
    h = h.replace('<span class="callout-c pin-c"></span>',
                  '<span class="callout-c pin-c">%s</span>' % PIN_SAMPLE[1], 1)
    return h


GRAPH_SEED = """<script>
/* 미리보기 전용 — 네트워크 없이 그래프가 보이도록 샘플 데이터를 심어 둔다 */
try {
  localStorage.setItem('devlog-graph-v1', JSON.stringify({ at: Date.now(), posts: [
    {title:'@Transactional 전파 속성 정리', link:'#', cat:'Spring', tags:['spring','transaction','aop','jpa']},
    {title:'N+1 문제와 fetch join', link:'#', cat:'JPA', tags:['jpa','spring','성능','쿼리']},
    {title:'Spring Batch 청크 사이즈', link:'#', cat:'Spring', tags:['spring','batch','성능','oom']},
    {title:'JVM GC 로그 읽는 법', link:'#', cat:'Java', tags:['java','jvm','성능','gc']},
    {title:'Executor 프레임워크로 스레드 풀 다루기', link:'#', cat:'Java', tags:['java','thread','concurrent']},
    {title:'네트워크 타임아웃 예외의 원리', link:'#', cat:'Java', tags:['java','exception','network']},
    {title:'백엔드가 반드시 잡는 예외 모음', link:'#', cat:'Java', tags:['java','exception','spring']},
    {title:'StrictHttpFirewall이 동작하는 순간', link:'#', cat:'Spring', tags:['spring','security','http']},
    {title:'GitLab CI/CD 빌드 환경 맞추기', link:'#', cat:'DevOps', tags:['gradle','ci','devops']},
    {title:'DB 성능·풀스캔·인덱스 9가지', link:'#', cat:'DB', tags:['db','인덱스','성능']}
  ]}));
} catch (e) {}
</script>"""

def common_pass(h):
    h = h.replace('[##_category_##]', CATEGORY_HTML)
    h = h.replace('[##_calendar_##]', CALENDAR_HTML)
    h = h.replace('[##_blog_menu_##]', MENU_HTML)
    h = unwrap('s_sidebar', h)
    h = unwrap('s_sidebar_element', h)
    h = unwrap('s_search', h)
    h = repeat('s_link_rep', h, LINKS)
    def _pop(m):
        out = []
        for row in POPULAR:
            chunk = m.group(1)
            chunk = (unwrap('s_rctps_rep_thumbnail', chunk)
                     if row.get('rctps_rep_thumbnail') else
                     drop('s_rctps_rep_thumbnail', chunk))
            for k, v in row.items():
                chunk = chunk.replace('[##_%s_##]' % k, str(v))
            out.append(chunk)
        return ''.join(out)
    h = block_re('s_rctps_popular_rep').sub(_pop, h)
    h = repeat('s_rctps_rep', h, RECENT)
    h = repeat('s_rctrp_rep', h, COMMENTS)
    h = unwrap('s_rp_count', h)
    h = unwrap('s_rp', h)
    h = unwrap('s_t3', h)
    h = apply_vars(h)
    for k, v in COMMON.items():
        h = h.replace('[##_%s_##]' % k, v)
    h = re.sub(r'\[##_[a-z0-9_]+_##\]', '', h)
    h = h.replace('<script src="./images/script.js" defer></script>',
                  GRAPH_SEED + '\n<script src="./images/script.js" defer></script>')
    h = fill_ad_samples(h)
    return h


AD_SAMPLE = ('<div style="width:%dpx;height:%dpx;display:flex;align-items:center;'
             'justify-content:center;background:#3a3f4b;color:#c9ccd4;font-size:12px;'
             'border-radius:4px">광고 자리 %d×%d</div>')


def fill_ad_samples(h):
    """미리보기에서만 광고 자리에 회색 상자를 넣어 배치를 눈으로 확인한다."""
    h = h.replace('<div class="ad-slot ad-list">\n\n        </div>',
                  '<div class="ad-slot ad-list">' + AD_SAMPLE % (728, 90, 728, 90) + '</div>')
    h = h.replace('<div class="ad-slot ad-post">\n\n                  </div>',
                  '<div class="ad-slot ad-post">' + AD_SAMPLE % (300, 250, 300, 250) + '</div>')
    h = h.replace('<div class="pane pane-ad ad-slot ad-side">\n\n      </div>',
                  '<div class="pane pane-ad ad-slot ad-side">' + AD_SAMPLE % (160, 600, 160, 600) + '</div>')
    h = h.replace('<div class="pane pane-ad ad-slot ad-side-m">\n\n    </div>',
                  '<div class="pane pane-ad ad-slot ad-side-m">' + AD_SAMPLE % (250, 250, 250, 250) + '</div>')
    return h


def build_home():
    h = SRC
    h = drop('s_permalink_article_rep', h)
    h = drop('s_cover', h)
    h = drop('s_article_protected', h)
    h = drop('s_page_rep', h)
    h = drop('s_tag', h)
    h = drop('s_guest', h)
    h = drop('s_list', h)
    h = repeat('s_index_article_rep', h, [{}])          # 래퍼만 제거
    h = block_re('s_notice_rep').sub(
        lambda m: ''.join(
            re.sub(r'\[##_(\w+)_##\]', lambda mm: str(row.get(mm.group(1), mm.group(0))), m.group(1))
            for row in NOTICES), h)
    h = block_re('s_article_rep').sub(
        lambda m: ''.join(
            re.sub(r'\[##_(\w+)_##\]', lambda mm: str(row.get(mm.group(1), mm.group(0))),
                   apply_thumb(m.group(1), row))
            for row in POSTS), h)
    h = repeat('s_paging_rep', h, PAGES)
    h = unwrap('s_paging', h)
    h = common_pass(h)
    return h


def build_post():
    h = SRC.replace('id="[##_body_id_##]"', 'id="tt-body-page"')
    h = drop('s_index_article_rep', h)
    h = drop('s_cover', h)
    h = drop('s_notice_rep', h)
    h = drop('s_article_protected', h)
    h = drop('s_page_rep', h)
    h = drop('s_tag', h)
    h = drop('s_guest', h)
    h = drop('s_list', h)
    h = drop('s_paging', h)
    h = drop('s_article_rep_thumbnail', h)
    post = POSTS[0]
    h = block_re('s_article_rep').sub(
        lambda m: re.sub(r'\[##_(\w+)_##\]',
                         lambda mm: str(post.get(mm.group(1), mm.group(0))), m.group(1)), h)
    h = unwrap('s_tag_label', h)
    h = unwrap('s_article_prev', h)
    h = unwrap('s_article_next', h)
    h = repeat('s_article_related_rep', h, RELATED)
    h = unwrap('s_article_related', h)
    h = common_pass(h)
    h = h.replace('[##_page_title_##]', post['article_rep_title'])
    h = h.replace('>yuuri.log</span>', '>' + post['article_rep_title'] + '</span>')
    return h


open('preview.html', 'w', encoding='utf-8').write(fill_pin_sample(build_home()))
open('preview-post.html', 'w', encoding='utf-8').write(build_post())
print('preview.html / preview-post.html 생성 완료')
