# 은혜한인교회 웹사이트 설계

- **작성일**: 2026-07-29
- **저장소**: `grace-korean-church/grace-korean-church.github.io`
- **로컬 경로**: `~/workspace/grace-korean-church/`
- **템플릿 출처**: `~/workspace/gkc_claude` (페낭한인교회, https://www.pkc1994.org)

## 1. 목표

미국 일리노이주 몰린(Quad Cities)에 있는 **은혜한인교회 / Grace Korean Church**의 공식 웹사이트를 구축한다. 페낭한인교회 Jekyll 사이트의 레이아웃과 CSS를 재사용하되, 콘텐츠·브랜딩·배포 설정은 전부 새로 만든다.

이번 작업은 **교회 한 곳을 위한 사이트**다. 재사용 가능한 범용 템플릿을 만드는 것이 목표가 아니다. 세 번째 교회가 생기면 그때 템플릿화를 검토한다 (YAGNI).

## 2. 교회 정보

| 항목 | 값 |
|---|---|
| 한글명 | 은혜한인교회 |
| 영문명 | Grace Korean Church |
| 주소 | 4915 21st Ave A, Moline, IL 61265, USA |
| 지도 | https://maps.app.goo.gl/eXbKCooB82qSZeou7 |
| 담임목사 | 오규섭 목사 |
| 페이스북 | https://www.facebook.com/GKC.Moline/ |
| 유튜브 | https://www.youtube.com/@gracekoreanchurchassemblyo5929 |
| 설립 연도 | **TODO** — 확인 필요 |
| 교단 | **TODO** — 유튜브 채널명(`…assemblyo…`)으로 미루어 하나님의성회(Assemblies of God)로 추정. 확인 필요 |
| 전화 / 이메일 | **TODO** |
| 예배 시간 | **TODO** — 주일예배 외 전체 확인 필요 |

## 3. 범위

### 만드는 것

**한국어 (기본 언어)**

| URL | 내용 |
|---|---|
| `/` | 홈 — 히어로, 예배시간, 위치·지도, 최근 소식 |
| `/about/` | 교회 소개 — 인사말, 담임목사, 표어 |
| `/services/` | 예배 안내 — 예배 시간표, 주차·방문 안내 |
| `/visit/` | 찾아오시는 길 — 주소, 구글맵, 교통 |
| `/news/` | 소식 목록 |
| `/news/:year/:month/:day/:title/` | 개별 소식 |

**영어 (제한적)**

| URL | 내용 |
|---|---|
| `/en/` | Welcome — 예배시간·위치·연락처·짧은 소개를 한 페이지에 |
| `/en/about/` | About Us |

### 만들지 않는 것

- **사역 & 부서 페이지** — 콘텐츠 확보 후 추가
- **교회 연혁 페이지** — 설립 연도조차 미확인, 확보 후 추가
- **주간 섬김이 명단** — 매주 수기 갱신 부담이 크고, 교인 실명이 웹에 노출된다. 주보 본문에 이미 포함되므로 중복이다
- **영어판 주보** — 매주 번역은 유지 불가능. 소식은 한국어만
- **한/영 완전 미러** — 지금은 비대칭. 확장 경로는 §5에 기술

## 4. 아키텍처

### 4.1 저장소와 배포

- 페낭 저장소를 파일 단위로 복사하되 **git 히스토리는 가져오지 않는다.** 페낭 저장소 히스토리에는 마스킹 전 교인 실명이 남아 있다 (예: 커밋 `69c73eb` "최윤수 → 최*수"). 새 저장소는 `git init`으로 시작한다.
- `grace-korean-church.github.io`는 **조직 사이트 저장소**이므로 루트 도메인으로 서비스된다.
  - `url: "https://grace-korean-church.github.io"`
  - `baseurl: ""` — 프로젝트 저장소와 달리 경로 접두사가 없다
- 커스텀 도메인이 정해지면 `CNAME` 파일 추가 + `_config.yml`의 `url` 변경만으로 전환된다. 모든 링크가 `relative_url` 필터를 쓰므로 안전하다.

### 4.2 빌드: GitHub Actions

GitHub Pages 기본 빌드는 `github-pages` gem에 묶여 Jekyll 3.10을 쓴다. 현재 `Gemfile`은 Jekyll 4.3이므로 **로컬과 운영의 버전이 어긋난다.** GitHub Actions로 빌드해 이 불일치를 없앤다.

워크플로 `.github/workflows/deploy.yml`:

- 트리거: `push`(main 브랜치) + `workflow_dispatch`
- 권한: `contents: read`, `pages: write`, `id-token: write`
- 동시성: `group: "pages"`, `cancel-in-progress: false`
- 단계: `actions/checkout` → `ruby/setup-ruby`(bundler-cache) → `actions/configure-pages` → `bundle exec jekyll build` → `actions/upload-pages-artifact` → `actions/deploy-pages`

**설정 시 함정 두 가지 — 반드시 처리한다:**

1. **Pages 소스 변경**: GitHub 저장소 Settings → Pages → Build and deployment → Source를 `GitHub Actions`로 변경해야 한다. 누락하면 워크플로는 성공하지만 사이트가 갱신되지 않는다. 이 단계는 웹 UI 작업이므로 사용자가 직접 수행한다.
2. **`Gemfile.lock` 플랫폼**: macOS(arm64)에서 생성한 lock을 리눅스 러너가 쓰면 `bundle install`이 실패한다. `bundle lock --add-platform x86_64-linux`를 실행해 lock에 리눅스 플랫폼을 추가하고 커밋한다.

빌드 실패 시 직전 배포본이 유지되므로 사이트가 깨진 채 노출되지 않는다.

### 4.3 이중 언어 처리

플러그인을 쓰지 않는다. `jekyll-polyglot`은 GitHub Pages 기본 빌드 화이트리스트에 없고, Actions 빌드로 전환하면 쓸 수는 있으나 지금 범위에는 과하다.

**UI 문구 — `_data/i18n.yml`**

```yaml
ko:
  nav: { home: "홈", about: "교회 소개", services: "예배 안내", news: "소식", visit: "오시는 길" }
  cta: { directions: "오시는 길", service_info: "예배 안내" }
  footer: { address: "주소", contact: "연락처", follow: "함께하기" }
en:
  nav: { home: "Home", about: "About", services: "Services", news: "News", visit: "Visit" }
  cta: { directions: "Get Directions", service_info: "Service Times" }
  footer: { address: "Address", contact: "Contact", follow: "Connect" }
```

`_includes/header.html`과 `footer.html`은 다음 한 줄로 언어를 잡고 `{{ t.nav.home }}` 형태로 출력한다. **언어별로 include를 복제하지 않는다.**

```liquid
{% assign t = site.data.i18n[page.lang | default: 'ko'] %}
```

**페이지 — front matter로 언어 선언**

```yaml
---
layout: page
lang: ko
permalink: /about/
alt_lang: en
alt_url: /en/about/
---
```

`alt_lang`/`alt_url`은 대응 페이지가 있을 때만 넣는다.

**레이아웃 — `_layouts/default.html`이 나머지를 처리**

- `<html lang="{{ page.lang | default: 'ko' }}">`
- `alt_url`이 있으면 `<link rel="alternate" hreflang="…">`를 양방향으로 출력
- Open Graph `og:locale`을 `ko_KR` / `en_US`로 분기

**언어 토글**

헤더에 `KO | EN`. `alt_url`이 있으면 대응 페이지로, 없으면 해당 언어의 홈(`/` 또는 `/en/`)으로 보낸다. 죽은 링크가 생기지 않는다.

### 4.4 디자인

레이아웃·타이포그래피·컴포넌트는 페낭 CSS를 그대로 쓴다. **`assets/css/style.css`의 CSS 변수만 교체한다.**

| 변수 | 페낭 | 은혜한인교회 |
|---|---|---|
| `--color-primary` (라이트) | `#4fa9ff` | `#1f4e79` |
| `--color-primary-soft` (라이트) | `#e0f0ff` | `#e8f0f9` |
| `--color-primary` (다크) | `#5eb3ff` | `#4a86c5` |
| `--color-primary-soft` (다크) | `#1e3a52` | `#1a3550` |

다크모드에서는 명도를 올려 대비를 확보한다. 배경·텍스트·보더 변수는 그대로 둔다.

**단, 교회 로고 색이 네이비와 충돌하면 로고 색을 우선한다.** 로고 파일 수령 후 재확인한다.

## 5. 확장 경로 — 한/영 완전 병기

지금 설계는 확장을 막지 않는다.

- `_data/i18n.yml`의 UI 문구는 **그대로 재사용**된다
- 페이지 추가는 `/en/services/`, `/en/visit/` 파일을 만들고 `alt_url`을 서로 걸어주면 끝난다. 구조 변경이 없다
- Actions 빌드이므로 `jekyll-polyglot`이 필요해지면 도입할 수 있다

**확장의 실제 비용은 기술이 아니라 번역 콘텐츠 작성이다.** 페이지 파일 추가는 짧게 끝나지만, 소개글·사역 설명·주보를 영어로 유지하는 일은 계속 발생한다. 영어권 성도의 실제 요청이 생길 때 넓힌다.

## 6. 콘텐츠 마이그레이션

| 대상 | 처리 |
|---|---|
| `_posts/` 39개 | 전부 삭제. 사이트 개설 안내 1건만 새로 작성 |
| `_data/church_info.yml` | 은혜한인교회 정보로 전면 교체 |
| `_data/services.yml` | 구조 유지, 값은 확인 후 채움 (TODO) |
| `_data/ministries.yml` | 삭제 (범위 밖) |
| `_data/events.yml` | 삭제 (범위 밖) |
| `_data/weekly_servers.yml` | 삭제 (§3 사유) |
| `_data/i18n.yml` | **신규 생성** |
| `index.md` | 구조 유지, 문구 전면 교체 |
| `pages/about.md` → `about.md` | 문구 교체 + permalink 변경 |
| `pages/services.md` → `services.md` | 문구 교체 + permalink 변경 |
| `pages/location.md` → `visit.md` | 문구 교체 + permalink 변경 |
| `pages/ministries.md`, `pages/history.md` | 삭제 |
| `en/index.md`, `en/about.md` | **신규 생성** |
| `_includes/faq-schema.html` | 페낭 FAQ 8건 → 은혜한인교회 FAQ로 교체 |
| `_includes/header.html`, `footer.html` | i18n 적용 + 언어 토글 + 소셜 링크 교체 |
| `_layouts/default.html` | hreflang·og:locale 분기 추가 |
| `_config.yml` | url·GA·교회정보·키워드·좌표 전면 교체 |
| `assets/images/` | 페낭 이미지 전부 삭제, 은혜한인교회 자산으로 교체 |
| `README.md` | 새 교회 기준 재작성 |
| `.github/workflows/deploy.yml` | **신규 생성** |

`pages/` 디렉토리를 없애고 페이지를 루트로 옮기므로, `_config.yml`의 `defaults` 항목 중 `scope.path: "pages"`로 `layout: page`를 걸어둔 규칙이 더 이상 매칭되지 않는다. 각 페이지 front matter에 `layout: page`를 명시하거나 `defaults` 규칙을 새 경로에 맞게 고친다. 이걸 놓치면 페이지가 레이아웃 없이 렌더링된다.

### 지역 정보 교체

| 항목 | 페낭 | 은혜한인교회 |
|---|---|---|
| 좌표 | `5.4601, 100.2834` | 몰린 주소 기준 (구글맵에서 확인) |
| `geo.region` | `MY-07` | `US-IL` |
| 타임존 | **없음** (UTC로 빌드 → 날짜 밀림 위험) | `America/Chicago` |
| 소셜 | 다음카페 | 페이스북 + 유튜브 |
| 구글맵 임베드 | 페낭 Menara Asas | 4915 21st Ave A, Moline, IL |

### Google Analytics

`_config.yml`의 `google_analytics`를 **빈 값**으로 둔다. 페낭 측정 ID(`G-BFEVR64TEW`)가 새 사이트에 남으면 데이터가 오염된다. 레이아웃에서 값이 비어 있으면 추적 스크립트를 아예 출력하지 않도록 조건 처리한다. 나중에 GA4 속성을 만들면 ID만 넣으면 동작한다.

## 7. 이미지 자산

교회 로고와 사진이 확보 가능하다. 수령할 파일 규격:

| 파일 | 규격 | 용도 |
|---|---|---|
| `logo-text-color.png` | 가로형, 폭 800px | 헤더 (라이트) |
| `logo-text-white.png` | 가로형, 폭 800px | 헤더 (다크) |
| `hero-bg.jpg` | 1920×1080 | 홈 전면 배경 |
| `hero-bg-mobile.jpg` | 800×1200 | 모바일 배경 |
| `og-image.jpg` | 1200×630 | 카톡·페이스북 공유 |
| `pastor.jpg` | 600×600 | 담임목사 |
| `favicon-16x16.png` / `favicon-32x32.png` / `apple-touch-icon.png` | 16 / 32 / 180px | 브라우저 탭·iOS |

원본만 받으면 리사이즈와 WebP 변환은 작업 중 처리한다.

**자산 도착 전에는 단색 네이비 그라데이션 히어로로 대체한다.** 이미지가 없어도 사이트가 완성된 형태로 보이며, 파일이 오면 교체만 하면 된다.

## 8. 검증 기준

작업 완료 조건:

1. **페낭 잔재 0건** — `grep -riE "페낭|penang|pkc1994|BFEVR|이충원|Menara|Tanjung"` 결과가 없어야 한다 (이 설계 문서 자체는 제외)
2. **로컬 빌드 성공** — `bundle exec jekyll build`가 경고 없이 끝난다
3. **링크 무결성** — 내부 링크에 404가 없다. 언어 토글이 양방향으로 동작한다
4. **양쪽 언어 렌더링** — `/`와 `/en/`이 각각 올바른 `<html lang>`과 hreflang을 출력한다
5. **반응형** — 모바일(375px)·데스크톱(1440px)에서 레이아웃이 깨지지 않는다
6. **다크모드** — 네이비 포인트 컬러가 다크모드에서 대비를 유지한다
7. **GA 미출력** — `google_analytics`가 빈 값일 때 추적 스크립트가 HTML에 없다
8. **배포 성공** — Actions 워크플로가 통과하고 `https://grace-korean-church.github.io/`가 실제로 뜬다

## 9. 미해결 항목

구현을 시작할 수 있으나, 아래는 확인되면 채운다. 그때까지 눈에 띄는 `TODO` 주석으로 표시한다.

- 설립 연도 (연혁 페이지 추가 여부도 여기에 달려 있음)
- 교단 정식 표기
- 전체 예배 시간표
- 전화번호, 이메일
- 교회 표어 / 연간 주제
- 담임목사 약력
- 교회 소개글 본문

페이스북 페이지와 유튜브 채널에서 확인 가능한 항목은 구현 중 먼저 채운다.
