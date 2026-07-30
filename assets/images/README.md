# 이미지 자산

아직 교회 이미지 자산이 반영되지 않았습니다. 아래 파일을 이 디렉토리에 넣으면
사이트에 반영됩니다.

| 파일명 | 규격 | 용도 |
|---|---|---|
| `logo-text-color.png` | 가로형, 폭 800px, 투명 배경 | 헤더·푸터 (라이트 모드) |
| `logo-text-white.png` | 가로형, 폭 800px, 투명 배경 | 헤더·푸터 (다크 모드) |
| `logo.png` | 512×512 정사각 | 구조화 데이터 |
| `hero-bg.jpg` | 1920×1080 | 홈 전면 배경 (데스크톱) |
| `hero-bg-mobile.jpg` | 800×1200 | 홈 전면 배경 (모바일) |
| `og-image.jpg` | 1200×630 | 카카오톡·페이스북 공유 미리보기 |
| `pastor.jpg` | 600×600 | 담임목사 사진 |
| `favicon-16x16.png` | 16×16 | 브라우저 탭 |
| `favicon-32x32.png` | 32×32 | 브라우저 탭 |
| `apple-touch-icon.png` | 180×180 | iOS 홈 화면 |

## 반영 방법

원본 사진만 있으면 리사이즈와 WebP 변환은 작업 시 처리합니다.

파일을 넣은 뒤 아래 위치의 `TODO` 주석을 찾아 주석 처리된 코드를 되살리면 됩니다.

- `_includes/header.html` — 로고 텍스트 폴백 → `img` 태그
- `_includes/footer.html` — 로고 텍스트 폴백 → `img` 태그
- `_layouts/default.html` — 파비콘 링크, 히어로 preload
- `assets/css/style.css` — `.hero-placeholder` 규칙 제거 후 `background-image` 복원
- `_layouts/default.html`의 `<style>` 크리티컬 CSS — `.hero-fullscreen.hero-placeholder` 규칙이
  `assets/css/style.css`와 동일하게 여기에도 (압축된 형태로) 들어있다. 두 곳을
  같이 고치지 않으면 페이지가 배경 그라디언트로 먼저 그려졌다가 사진으로
  바뀌는 깜빡임이 생긴다.
- `index.md`, `en/index.md` — `hero-placeholder` 클래스 제거

변경 후 `script/test` 를 실행해 깨진 참조가 없는지 확인하세요.
