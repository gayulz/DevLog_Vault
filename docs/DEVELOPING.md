# 개발 노트

스킨을 고치거나 기여하실 분을 위한 문서입니다.
**그냥 쓰기만 할 때는 읽지 않으셔도 됩니다** — [README](../README.md) 만 보시면 됩니다.

---

## 파일 구조

```
skin.html            HTML 템플릿 (티스토리 치환자)
style.css            스타일 — 디자인 토큰 + 컴포넌트 + 티스토리 오버라이드
images/script.js     JS — 테마 · 개요 · 코드블록 · 그래프 · 가독성 보정 등
index.xml            스킨 메타데이터 + 스킨 편집 옵션 정의
build_preview.py     로컬 미리보기 생성 (티스토리 업로드 불필요)
build_release.py     스킨 등록용 zip 생성
preview*.jpg / .gif  스킨 등록용 썸네일
```

## 로컬 미리보기

티스토리에 올리지 않고 브라우저에서 바로 확인할 수 있습니다.

```bash
python3 build_preview.py
# → preview.html       (홈)
# → preview-post.html  (글 본문)
```

`skin.html` 의 티스토리 치환자를 샘플 데이터로 바꿔 만든 파일입니다.
카테고리 트리 · 달력 · 댓글 · 표 · 광고 자리까지 실제 티스토리가 내보내는 모양을 흉내 냅니다.
브라우저에서 `preview.html` 을 열면 됩니다. (생성 파일이라 저장소에는 올리지 않습니다)

---

## style.css 의 구조 — ⚠️ 섹션 순서가 중요합니다

파일은 번호가 붙은 섹션으로 나뉘어 있고, **뒤쪽 섹션이 앞쪽을 덮습니다.**

| 섹션 | 내용 |
|---|---|
| 01 | 디자인 토큰 (CSS 변수) |
| 02 ~ 12 | 리셋 · 앱 셸 · 컴포넌트 · 티스토리 오버라이드 |
| 13 | 프린트 / 모션 축소 |
| 14 ~ 18 | 페이지별 표시 제어 · 사이드바 순서 · 홈 목록 |
| 19 | 본문 표 · 글자 가독성 보정 |
| **20** | **반응형 (미디어쿼리)** |
| **21** | **왼쪽 사이드바 고정 (PC)** |

### 반응형 규칙은 반드시 20번 섹션에 넣으세요

17번 섹션에 `.side-r { display: flex }` 같은 선언이 있습니다.
미디어쿼리를 파일 중간에 두면 **명시도가 같아도 뒤쪽이 이겨서** 화면을 줄여도 적용되지 않습니다.

> 실제로 v3.8.0 이전에 이 문제로,
> 오른쪽 사이드바가 안 숨겨진 채 본문 아래 다른 행으로 밀려 내려가
> **페이지 하단에 1,900px 짜리 빈 여백**이 생기고 **그래프가 20px 폭으로 납작**해졌습니다.

### 홈 전용 요소의 display 를 바꿀 때

16번 섹션에 `body#tt-body-index .home-only { display: block }` 이 있습니다.
id 선택자라 명시도가 높아서 `.notice-callout { display: grid }` 같은 규칙을 눌러 버립니다.
홈에 나오는 요소의 배치를 바꿀 때는 16번 섹션에도 아래처럼 함께 적어 주세요.

```css
body#tt-body-index .내클래스.home-only { display: grid; }
```

### 폭 구간

| 폭 | 배치 |
|---|---|
| 1501+ | 4열 |
| 1181 ~ 1500 | 왼쪽 사이드바 축소 4열 |
| 1001 ~ 1180 | 3열 (오른쪽 사이드바 접힘) |
| 761 ~ 1000 | 왼쪽 사이드바 서랍 |
| ~760 | 모바일 |

`--sidebar-r`(280px)은 **줄이지 마세요.** 사이드바 광고 안쪽 폭 256px 규격이 깨집니다.

---

## 티스토리 치환자에서 걸려 넘어지기 쉬운 것

### 페이지네이션 — `selected` 는 `<a>` 가 아니라 안쪽 `<span>` 에 붙습니다

실제 출력(2026-08 확인):

```html
<a href="/?page=7"><span class="selected">7</span></a>   <!-- 현재 페이지, href 도 있습니다 -->
<a href="/?page=8"><span class="">8</span></a>
<a><span class="">···</span></a>                          <!-- 생략 표시, href 없음 -->
```

`[##_paging_rep_link_num_##]` 은 숫자가 아니라 **`<span>` 통째로** 치환됩니다.
그래서 `script.js` 가 `selected` 를 `<a>` 로 끌어올리고,
CSS 는 `.page-numbers a.selected` (+ `:has(> .selected)` 예비)로 잡습니다.

**템플릿의 `<a [##_paging_rep_link_##]>` 에 class 를 직접 적지 마세요.**
치환자가 넣는 class 와 충돌해 앞의 것만 살아남습니다.

화살표의 "더 갈 곳 없음" 클래스는 `no_more_prev` / `no_more_next` 입니다(`no_more` 아님).

### 카테고리는 `<table>` + 인라인 스타일로 렌더링됩니다

그래서 CSS `!important` 로 덮어씁니다. 구조를 건드리면 쉽게 깨집니다.

### 댓글 · 구독은 나중에 마운트되는 React 컴포넌트입니다

`data-tistory-react-app` 으로 붙습니다. 다크 모드 색은 오버라이드로 처리했습니다.

### 옵션 입력칸에는 `<script>` 를 넣을 수 없습니다

저장할 때 걸러집니다. 그래서 광고·분석 코드는 `skin.html` 의 표시 주석 자리에 직접 넣습니다.

---

## 본문 가독성 보정 — ⚠️ 테마 전환 중에는 재면 안 됩니다

`script.js` 가 본문의 글자 요소를 훑어서
① `opacity < 0.35` 를 되살리고 ② 배경 대비 명암비가 3.2 미만이면 색을 바꿉니다.

**v3.8.2 에서 실제로 터진 버그** — `setTheme()` 이 `data-theme` 를 바꾸자마자 보정을 호출했습니다.
그런데 `body` · `.leaf` 의 배경은 `transition: background .2s` 로 **서서히** 바뀝니다.
라이트 → 다크로 바꾼 순간 "아직 흰 배경"을 읽고 **검은 글자**를 인라인 `!important` 로 박아 버려서,
전환이 끝나면 어두운 배경 위 검은 글자가 되어 본문이 사라졌습니다. 반대 방향도 같습니다.
인라인 스타일이 있는 문단만 대상이라 **글마다 증상이 있기도 없기도** 했습니다.

지금 구조(되돌리지 마세요):

- 테마가 바뀌면 `revertAll()` 로 **먼저 전부 되돌리고**, `360ms` 뒤에 다시 잽니다
- 배경이 **에디터 형광펜**이면 그 밝기로 색을 정하고(테마와 무관하게 고정),
  배경이 **스킨(테마)의 것**이면 `var(--text-normal)` 을 씁니다
  → 잘못 재더라도 색이 뒤집히지 않습니다
- 손대기 전 인라인 값을 `data-ink` / `data-fill` / `data-unfade` 에 기억해 두고 복원합니다

---

## 그 밖의 함정 모음

### `:empty` 는 줄바꿈 공백 때문에 매칭되지 않습니다

`.ad-slot:empty { display: none }` 만으로는 빈 광고 자리가 사라지지 않습니다.
`script.js` 가 내용 없는 슬롯의 `innerHTML` 을 비워서 `:empty` 가 걸리게 합니다.

### `grid-row: 1 / -1` 은 `grid-template-rows` 를 명시해야 동작합니다

행을 적지 않으면 `-1` 이 첫 줄을 가리켜서 두 행을 걸치지 못합니다.
모바일 글 목록(`.pitem`)과 고정글 콜아웃(`.notice-callout`) 둘 다 이걸로 한 번씩 걸렸습니다.

### 본문 표는 에디터가 인라인 스타일을 박아 둡니다

머리글을 켜지 않으면 표 전체가 `<td>` 로만 나오고,
셀마다 `background-color: rgb(255,255,255)` 와 `border-collapse: collapse` 가 붙습니다.
→ `border-collapse: separate !important`, 셀 테두리 `!important`,
줄무늬는 **`tr`** 에(셀은 투명), 흰색·검정 인라인 배경은 `script.js` 가 걷어냅니다.

### 구글 자동 광고는 데스크톱 폭으로 자리를 잡습니다

760px 짜리 `<ins>` 가 좁은 화면에서 본문을 덮습니다.
→ `.post-body ins.adsbygoogle` 계열에 `max-width: 100% !important`.

### 명암비 토큰은 더 옅게 되돌리지 마세요

WCAG AA(4.5:1)에 맞춘 값입니다.

| 토큰 | 다크 | 라이트 |
|---|---|---|
| `--text-faint` | `#858585` | `#6b6f75` |
| `--sx-cmt` (코드 주석) | `#858585` | `#6a6e74` |

---

## 서체 바꾸기

`style.css` 맨 위 `:root` 의 세 변수만 고치면 전체가 따라 바뀝니다.

```css
:root {
  --font-ui:   'NaturalSans', 'Pretendard', ...;   /* 화면 전체 */
  --font-mono: 'Monoplexkr', 'JetBrains Mono', ...; /* 카테고리 트리 등 고정폭 */
  --font-code: 'IBM Plex Mono', 'IbmPlexSans', ...; /* 코드블록 · 인라인 코드 */
}
```

파일 맨 위의 `@font-face` 선언에서 실제 서체 파일을 불러옵니다.
쓰지 않는 서체의 `@font-face` 는 지우면 그만큼 덜 받습니다.

| 변수 | 현재 서체 | 라이선스 |
|---|---|---|
| `--font-ui` | 자연 산스 (Project Noonnu) | 무료 |
| `--font-mono` | 모노플렉스KR (김양수) | SIL OFL 1.1 |
| `--font-code` | IBM Plex Mono + IBM Plex Sans KR | SIL OFL 1.1 |

코드블록은 영문·숫자·기호를 IBM Plex Mono(고정폭)가, 한글을 IBM Plex Sans KR 이 맡습니다.
한글까지 통일하고 싶으면 `--font-code` 맨 앞의 `'IBM Plex Mono'` 만 지우면 됩니다.

---

## 스킨 옵션(변수) 추가하기

1. `index.xml` 의 `<variables>` 안에 `<variable>` 을 추가합니다

```xml
<variable>
  <name>my-option</name>
  <label>내 옵션</label>
  <type>STRING</type>   <!-- STRING | BOOL | COLOR | IMAGE | SELECT -->
  <default></default>
</variable>
```

2. `skin.html` 에서 값을 씁니다

```html
[##_var_my-option_##]                          <!-- 값 -->
<s_if_var_my-option>값이 있을 때</s_if_var_my-option>
<s_not_var_my-option>값이 없을 때</s_not_var_my-option>
```

3. `build_preview.py` 의 `VARS` 에도 샘플 값을 넣어 두면 미리보기에 반영됩니다

> ⚠️ 옵션을 추가하면 `index.xml` 을 다시 올려야 합니다.
> 그러면 기존에 저장해 둔 옵션 값이 초기화될 수 있으니, 이용자에게 안내해 주세요.

---

## 회귀 검사

브라우저 자동화(Playwright)로 확인하면 사람 눈으로 놓치는 것을 잡을 수 있습니다.
`preview.html` / `preview-post.html` 을 `file://` 로 열고 폭 1920 ~ 360 을 훑으며 확인합니다.

**꼭 확인할 것**

| 항목 | 판정 |
|---|---|
| 하단 빈 여백 | `document.scrollHeight` 와 마지막 요소의 `bottom` 차이가 120px 초과면 버그 |
| 가로 스크롤 | `scrollWidth > clientWidth` 면 버그 |
| JS 오류 | `pageerror` / `console.error` |
| **테마 토글** | `#themeToggle` 을 3회 왕복하며 전환 **후** 명암비가 3.2 미만인 글자가 있으면 버그 |
| 표 · 페이지네이션 · 사이드바 순서 | 계산된 스타일로 확인 |

`file://` 미리보기에서는 아래 오류가 정상적으로 납니다. 무시하세요.

- `file:///123` fetch 오류 (그래프가 RSS를 읽으려다 실패)
- `Failed to load resource` (외부 이미지)
- 폰트 CDN 의 CORS 차단 메시지

**색을 확인할 때는 스크린샷을 눈으로 보지 말고 픽셀 값을 직접 찍으세요.**
잘라낸 이미지가 명암이 뒤집혀 보이는 경우가 있습니다.

---

## 배포용 / 개인용 두 벌로 관리하기

광고·분석 코드를 `skin.html` 에 직접 넣으면 스킨을 새 버전으로 바꿀 때마다 날아갑니다.
폴더를 두 벌로 나누고, 개인 코드를 자동으로 끼워 넣는 스크립트를 두면 편합니다.

```
my-skin/          ← 배포용 (이 저장소). 광고 코드 0개
my-skin-personal/ ← 개인용
  ├─ build_personal.py
  └─ personal/
       ├─ head.html      <head> 안 — 애드센스 · GTM · 사이트 인증
       ├─ body-top.html  <body> 직후 — GTM noscript
       ├─ ad-list.html   목록 상단 광고
       ├─ ad-post.html   글 본문 아래 광고
       ├─ ad-side.html   사이드바 광고 (PC)
       ├─ ad-side-m.html 사이드바 광고 (모바일)
       ├─ body-end.html  </body> 직전 — 광고 로더 스크립트
       └─ options.json   스킨 편집 옵션 값 → index.xml 기본값으로 주입
```

`build_personal.py` 가 배포용 `skin.html` 을 읽어 표시 주석 자리에 조각을 끼워 넣고,
개인용 `skin.html` 과 `index.xml` 을 만듭니다. 여러 번 돌려도 결과가 같습니다(멱등).

새 버전이 나오면 **배포용만 갈아끼우고 스크립트를 다시 돌리면** 됩니다.
`options.json` 값이 `index.xml` 의 기본값으로 박히기 때문에,
`index.xml` 을 다시 올려 옵션이 초기화되어도 값이 되살아납니다.

> 새 광고 자리를 스킨에 추가했다면 `build_personal.py` 에 끼워 넣는 코드도 함께 추가해야 합니다.

---

## SEO — 스킨이 하는 일 / 티스토리가 하는 일

티스토리가 **이미 넣어 주는 것**은 건드리지 않습니다. 중복이 더 해롭습니다.

| 티스토리가 넣음 | 스킨이 보강함 |
|---|---|
| `description` · `og:*` · `twitter:*` | `BreadcrumbList` 구조화 데이터 |
| `canonical` | `<time datetime>` 기계 판독 날짜 |
| `BlogPosting` 구조화 데이터 | alt 없는 이미지에 장식용 표시 |
| | 검색 결과 페이지 `noindex, follow` |
| | 글 페이지에서 `h1` 이 하나만 남도록 홈 헤더 제거 |
| | `<main>` 랜드마크 · 본문 바로가기 링크 |
