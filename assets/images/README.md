# 이미지 자산

## 반영 완료

교회에서 받은 사진으로 아래 파일을 만들어 두었습니다.

| 파일명 | 규격 | 용도 | 출처 |
|---|---|---|---|
| `hero-bg.jpg` / `.webp` | 1920×1080 | 홈 전면 배경 (데스크톱) | 교회 외관·간판 (겨울) |
| `hero-bg-mobile.jpg` / `.webp` | 800×1200 | 홈 전면 배경 (모바일) | 같은 사진 세로 크롭 |
| `og-image.jpg` | 1200×630 | 카카오톡·페이스북 공유 미리보기 | 교회 정면 (여름) |
| `church-exterior.jpg` / `.webp` | 1024×768 | 교회 소개 페이지 | 교회 정면 (여름) |

원본은 `_source/교회전경1.jpg`(외관·간판), `_source/교회전경2.jpg`(정면)입니다.
`_source/`는 gitignore 대상이라 저장소에는 없고 로컬에만 있습니다. 다시
만들어야 하면 ImageMagick으로 처리했습니다. `-strip`은 필수입니다 — EXIF에
촬영 위치·기기 정보가 남아 있으면 그대로 공개 이미지에 딸려 나갑니다:

```bash
magick _source/교회전경1.jpg -strip -resize 1920x1080^ -gravity center -extent 1920x1080 -quality 82 hero-bg.jpg
magick _source/교회전경1.jpg -strip -resize 800x1200^  -gravity east   -extent 800x1200  -quality 82 hero-bg-mobile.jpg
magick _source/교회전경2.jpg -strip -resize 1200x630^  -gravity center -extent 1200x630  -quality 85 og-image.jpg
magick _source/교회전경2.jpg -strip -resize 1024x768 -quality 85 church-exterior.jpg
cwebp -q 80 hero-bg.jpg -o hero-bg.webp   # 나머지도 동일
```

## 아직 필요한 것

| 파일명 | 규격 | 용도 |
|---|---|---|
| `logo-text-color.png` | 가로형, 폭 800px, 투명 배경 | 헤더·푸터 (라이트 모드) |
| `logo-text-white.png` | 가로형, 폭 800px, 투명 배경 | 헤더·푸터 (다크 모드) |
| `logo.png` | 512×512 정사각 | 구조화 데이터 |
| `favicon-16x16.png` | 16×16 | 브라우저 탭 |
| `favicon-32x32.png` | 32×32 | 브라우저 탭 |
| `apple-touch-icon.png` | 180×180 | iOS 홈 화면 |
| `pastor.jpg` | 600×600 | 담임목사 사진 |

로고가 없어서 헤더와 푸터는 교회명을 텍스트로 표시하고 있고, 파비콘이 없어
브라우저가 `/favicon.ico`를 찾다 404를 냅니다. 로고를 받으면 둘 다 해결됩니다.

파비콘 3종은 로고 원본만 있으면 만들 수 있습니다:

```bash
magick logo.png -strip -resize 32x32 favicon-32x32.png
magick logo.png -strip -resize 16x16 favicon-16x16.png
magick logo.png -strip -resize 180x180 apple-touch-icon.png
```

## 반영 방법

원본 사진만 있으면 리사이즈와 WebP 변환은 작업 시 처리합니다.

파일을 넣은 뒤 아래 위치의 `TODO` 주석을 찾아 주석 처리된 코드를 되살리면 됩니다.

- `_includes/header.html` — 로고 텍스트 폴백 → `img` 태그
- `_includes/footer.html` — 로고 텍스트 폴백 → `img` 태그
- `_layouts/default.html` — 파비콘 링크 (`{% comment %}` 블록 안에 들어 있음)
- `about.md` — 담임목사 사진

**로고 관련 주의:** 헤더·푸터 로고를 `img`로 되돌릴 때 `assets/css/style.css`와
`_layouts/default.html`의 크리티컬 CSS 양쪽에 이미 `.site-logo-*` / `.footer-logo-*`
규칙이 남아 있습니다. 두 곳이 항상 같아야 첫 페인트에 깜빡임이 없습니다.

변경 후 `script/test` 를 실행해 깨진 참조가 없는지 확인하세요.

## 사람이 나온 사진에 대하여

전교인 단체사진을 홈 '처음 오시는 분께' 섹션 배경으로 쓰고 있습니다
(`congregation.jpg` / `.webp`, 모바일용 `congregation-mobile.*`).

배경으로만 쓰고 그 위에 어두운 그라데이션을 깔아, 갤러리처럼 얼굴이
전면에 드러나지는 않게 했습니다. 그래도 얼굴이 식별되는 사진이고
미성년자가 포함되어 있으므로, 교회에서 게시를 원치 않으면
`index.md`의 `section-photo section-photo-congregation` 클래스만 지우면
됩니다. 배경이 사라지고 글씨는 원래 색으로 돌아갑니다.

주일학교 수련회 단체사진은 아직 쓰지 않았습니다.
