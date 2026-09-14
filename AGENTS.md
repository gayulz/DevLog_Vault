# DevLog Vault 작업 지침

- 프로젝트 설명과 기본 설치는 `README.md`를 읽는다.
- 소스 구조·프리뷰·릴리스 규칙은 `CLAUDE.md`와 `docs/DEVELOPING.md`가 정본이다.
- 빌드 없는 정적 티스토리 스킨이다. `skin.html`, `style.css`, `images/script.js`, `index.xml`의 역할을 유지한다.
- CSS를 수정할 때 반응형 규칙은 `style.css`의 20번 섹션에 둔다. 홈 전용 display 규칙은 기존 id 선택자 우선순위를 확인한다.
- 프리뷰: `python3 build_preview.py`
- 릴리스 zip: `python3 build_release.py`
- 테스트·린트·npm을 새로 전제하지 않는다. 생성된 프리뷰와 `dist/`는 직접 편집하지 않는다.
- 버전을 올릴 때 `index.xml`과 `CHANGELOG.md`를 함께 확인한다.
