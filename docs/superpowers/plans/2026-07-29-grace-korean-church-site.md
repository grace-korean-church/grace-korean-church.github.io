# 은혜한인교회 웹사이트 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 페낭한인교회 Jekyll 템플릿을 기반으로 은혜한인교회(Grace Korean Church, Moline IL)의 공식 웹사이트를 구축하고 GitHub Actions로 GitHub Pages에 배포한다.

**Architecture:** 한국어를 기본 언어로 하는 정적 사이트에 영어 축약 페이지(`/en/`)를 곁들인 비대칭 이중 언어 구조. UI 문구는 `_data/i18n.yml`에 분리하고 페이지 언어는 `_config.yml`의 `defaults`가 자동 지정한다. Jekyll 플러그인은 `jekyll-feed` 외에 쓰지 않으며, 빌드는 GitHub Actions에서 로컬과 동일한 Jekyll 4.x로 수행한다.

**Tech Stack:** Jekyll 4.4 · Ruby 3.4 · kramdown · Liquid · GitHub Actions · GitHub Pages

## Global Constraints

이 절의 항목은 **모든 태스크의 요구사항에 암묵적으로 포함된다.**

- **저장소**: `git@github.com:grace-korean-church/grace-korean-church.github.io.git`, 브랜치 `main`
- **작업 디렉토리**: `/Users/hyeongjinjang/workspace/grace-korean-church`
- **템플릿 원본**: `/Users/hyeongjinjang/workspace/gkc_claude` — **읽기 전용. 절대 수정하지 않는다** (운영 중인 페낭 사이트다)
- **`baseurl`은 빈 문자열** `""` — 조직 사이트 저장소이므로 경로 접두사가 없다
- **`url`**: `https://grace-korean-church.github.io`
- **포인트 컬러**: 라이트 `#1f4e79` / `#e8f0f9`, 다크 `#4a86c5` / `#1a3550`
- **타임존**: `America/Chicago`
- **Jekyll 플러그인 추가 금지** — `jekyll-feed`만 사용한다
- **모든 내부 링크에 `relative_url` 필터 사용** — 커스텀 도메인 전환 시 안전성 확보
- **교인 실명을 저장소에 넣지 않는다** — 이름이 필요하면 `김*수` 형태로 마스킹
- **페낭 잔재 0건** — `페낭` `penang` `pkc1994` `BFEVR` `이충원` `Menara` `Tanjung` `cafe.daum.net` 문자열이 `_site/`에 남으면 안 된다
- **미확인 정보는 `TODO:` 주석으로 남긴다** — 추측으로 채우지 않는다

### 설계 문서와의 차이 (의도된 변경)

설계 문서 §6은 `_data/church_info.yml`을 "은혜한인교회 정보로 전면 교체"한다고 기술했으나, 구현 조사 결과 **`_data/` 하위 5개 파일(310줄) 전부가 어떤 템플릿에서도 참조되지 않는 죽은 코드**임을 확인했다 (`grep -rn "site\.data\." --include="*.html" --include="*.md"` 결과 0건). 템플릿은 `_config.yml`의 `site.church.*`와 마크다운 하드코딩만 사용한다.

따라서 **`_data/` 디렉토리는 통째로 가져오지 않고**, 실제로 사용될 `_data/i18n.yml`만 새로 만든다.

## File Structure

### 새로 만드는 파일

| 파일 | 책임 |
|---|---|
| `_data/i18n.yml` | 한/영 UI 문구 사전. 헤더·푸터·버튼 문구의 유일한 출처 |
| `en/index.md` | 영어 Welcome 랜딩 — 예배시간·위치·연락처·소개 |
| `en/about.md` | 영어 About Us |
| `about.md` | 한국어 교회 소개 (Task 7에서 신규 작성) |
| `services.md` | 한국어 예배 안내 (Task 7에서 신규 작성) |
| `visit.md` | 한국어 찾아오시는 길 (Task 7에서 신규 작성) |
| `.github/workflows/deploy.yml` | Actions 빌드·배포 워크플로 |
| `script/test` | 빌드 + 출력물 검증 스크립트. 이 프로젝트의 테스트 하네스 |
| `assets/images/README.md` | 교회에서 받을 이미지 자산 규격 |
| `_posts/2026-07-29-website-launch.md` | 사이트 개설 안내 |

### 수정하는 파일 (템플릿에서 복사 후)

| 파일 | 변경 내용 |
|---|---|
| `_config.yml` | 사이트·교회 정보 전면 교체, `timezone`, `defaults`에 `lang` 규칙 |
| `_layouts/default.html` | GA 조건부화, hreflang, `<html lang>` 동적화, JSON-LD, geo 메타, 네이버 토큰 제거, 크리티컬 CSS 색상 |
| `_includes/header.html` | i18n 적용 + 언어 토글 + 네비게이션 URL |
| `_includes/footer.html` | i18n 적용 + 연락처·소셜 링크 |
| `_includes/navigation-schema.html` | 새 URL 구조와 교회 정보 |
| `_includes/breadcrumb-schema.html` | `/pages/` 경로 판정 제거 |
| `_includes/faq-schema.html` | 은혜한인교회 FAQ로 교체 |
| `_includes/website-schema.html` | 존재하지 않는 로고 참조 제거 |
| `assets/css/style.css` | CSS 변수 색상 + 히어로 플레이스홀더 |
| `assets/js/analytics.js` | 주석의 교회명 |
| `news.html` | 문구·permalink |
| `index.md` | 전면 재작성 |
| `.gitignore` | `Gemfile.lock` 무시 해제 (Actions 빌드에 필요) |
| `.ruby-version` | `3.4.1`로 갱신 (로컬과 일치) |
| `README.md` | 전면 재작성 |

### 가져오지 않는 파일

`_data/` 전체 · `_posts/` 전체 · **`pages/` 전체** · `assets/images/` 전체 · `PKC LOGO.ai` · `history.png` · `.git/`

`pages/` 를 통째로 제외하는 이유: Task 7이 세 페이지를 처음부터 새로 쓰므로 복사본이 살아남지 않는데, 템플릿의 `pages/services.md`에는 페낭교회 은행 계좌번호와 예금주 실명이, `pages/about.md`에는 교인 실명이 들어 있다. 복사하면 public 저장소의 git 히스토리에 영구히 남는다.

---

## Task 1: 저장소 뼈대와 검증 스크립트

템플릿 파일을 복사하고, 이후 모든 태스크가 기댈 테스트 하네스를 만든다. 이 프로젝트에는 단위 테스트 프레임워크가 없으므로 **빌드 결과물(`_site/`)에 대한 assertion 스크립트가 테스트 역할**을 한다.

**Files:**
- Create: `script/test`
- Create (복사): `_layouts/`, `_includes/`, `assets/css/`, `assets/js/`, `index.md`, `news.html`, `feed.xml`, `sitemap.xml`, `robots.txt`, `_config.yml`, `Gemfile`, `.gitignore`, `.ruby-version`
- **복사하지 않음**: `pages/` 전체 (개인정보 포함 — Step 1 참고)

**Interfaces:**
- Consumes: 없음 (첫 태스크)
- Produces: `script/test` — 인자 없이 실행하면 `bundle exec jekyll build` 후 assertion을 돌리고 실패 시 exit code 1. 제공 함수: `assert_built <_site기준 상대경로> <설명>`, `assert_contains <파일경로> <문자열> <설명>`, `assert_absent <파일경로> <문자열> <설명>`, `assert_no_residue`, `assert_no_account_numbers`. 이후 모든 태스크가 이 함수들로 assertion을 추가한다.

- [ ] **Step 1: 템플릿 파일 복사**

```bash
cd /Users/hyeongjinjang/workspace/grace-korean-church
SRC=/Users/hyeongjinjang/workspace/gkc_claude

cp -R "$SRC/_layouts" .
cp -R "$SRC/_includes" .
mkdir -p assets
cp -R "$SRC/assets/css" assets/
cp -R "$SRC/assets/js" assets/

cp "$SRC/_config.yml" "$SRC/Gemfile" "$SRC/.gitignore" "$SRC/.ruby-version" .
cp "$SRC/index.md" "$SRC/news.html" "$SRC/feed.xml" "$SRC/sitemap.xml" "$SRC/robots.txt" .

mkdir -p _posts assets/images script
```

**`pages/` 하위 파일은 복사하지 않는다.** Task 7이 `about.md`·`services.md`·`visit.md`를 처음부터 새로 작성하므로 복사본은 한 줄도 살아남지 않는다. 그런데 템플릿의 `pages/services.md`에는 페낭교회 **은행 계좌번호와 예금주 실명**이, `pages/about.md`에는 **교인 실명**이 들어 있다. 복사하면 이 저장소의 git 히스토리에 영구히 남는다 — 이 저장소는 무료 GitHub Pages를 쓰기 위해 public이어야 한다. 얻는 것 없이 개인정보만 들여오는 셈이므로 복사하지 않는다.

Task 1~6 구간에는 `/about/`·`/services/`·`/visit/` URL이 존재하지 않는다. 정상이다.

같은 이유로 **`_includes/faq-schema.html`도 원본을 쓰지 않는다.** 템플릿의 FAQ 본문에 페낭교회 은행 계좌번호·예금주 실명·연락처가 들어 있다. Task 6이 전면 교체하므로, Task 1에서는 아래 스텁으로 만든다. `_layouts/default.html`이 이 파일을 `include` 하므로 파일 자체는 존재해야 빌드가 된다.

```html
<!-- FAQ Structured Data (JSON-LD) -->
<!-- TODO: Task 6에서 은혜한인교회 FAQ로 채운다.
     템플릿 원본의 FAQ에는 다른 교회의 은행 계좌번호와 예금주 실명이
     들어 있어 복사하지 않았다. 이 저장소는 무료 GitHub Pages를 쓰기 위해
     public이어야 하므로 히스토리에 남으면 안 된다. -->
```

`_config.yml`과 `_includes/footer.html`에 남는 페낭 대표 전화·이메일은 해당 교회가 웹사이트에 공개한 기관 연락처이고 Task 2·4에서 교체된다. 개인 계좌·실명과 성격이 달라 그대로 둔다.

- [ ] **Step 2: `.gitignore`에서 `Gemfile.lock` 무시 해제**

`Gemfile.lock`은 GitHub Actions 러너가 동일한 의존성을 재현하는 데 필요하므로 반드시 커밋해야 한다. 현재 템플릿은 이를 무시하고 있다.

`.gitignore`에서 아래 줄을 삭제한다:

```
Gemfile.lock
```

같은 자리에 다음 주석을 넣는다:

```
# Gemfile.lock은 커밋한다 — GitHub Actions 빌드 재현성에 필요
```

- [ ] **Step 3: `.ruby-version`을 로컬과 일치시킨다**

`.ruby-version` 파일 전체를 다음 한 줄로 교체:

```
3.4.1
```

- [ ] **Step 4: 검증 스크립트 작성**

`script/test` 파일을 다음 내용으로 생성:

```bash
#!/usr/bin/env bash
# 은혜한인교회 사이트 빌드 검증
# 사용법: script/test
set -uo pipefail

cd "$(dirname "$0")/.." || exit 1

FAILED=0
GREEN=$'\033[32m'; RED=$'\033[31m'; DIM=$'\033[2m'; RESET=$'\033[0m'

pass() { printf '  %s✓%s %s\n' "$GREEN" "$RESET" "$1"; }
fail() { printf '  %s✗%s %s\n' "$RED" "$RESET" "$1"; FAILED=1; }
section() { printf '\n%s%s%s\n' "$DIM" "$1" "$RESET"; }

# _site 기준 상대경로의 파일이 생성되었는지
assert_built() {
  if [ -f "_site/$1" ]; then pass "$2"; else fail "$2 — _site/$1 없음"; fi
}

# 파일이 문자열을 포함하는지
assert_contains() {
  if [ ! -f "$1" ]; then fail "$3 — 파일 없음: $1"; return; fi
  if grep -qF -- "$2" "$1"; then pass "$3"; else fail "$3 — '$2' 없음"; fi
}

# 파일이 문자열을 포함하지 않는지
assert_absent() {
  if [ ! -f "$1" ]; then fail "$3 — 파일 없음: $1"; return; fi
  if grep -qF -- "$2" "$1"; then fail "$3 — '$2' 발견됨"; else pass "$3"; fi
}

# 빌드 결과물 전체에 페낭 잔재가 없는지
assert_no_residue() {
  local hits
  hits=$(grep -rilE '페낭|penang|pkc1994|BFEVR|이충원|Menara|Tanjung|cafe\.daum\.net' _site 2>/dev/null || true)
  if [ -z "$hits" ]; then
    pass "페낭 잔재 없음"
  else
    fail "페낭 잔재 발견:"
    printf '%s\n' "$hits" | while IFS= read -r p; do printf '      %s\n' "$p"; done
  fi
}

# 계좌번호 형태의 숫자열이 사이트에 노출되지 않는지.
# 개인정보를 검사 대상 문자열로 이 파일에 적어두면 그 자체가 유출이므로,
# 이름이 아니라 계좌번호의 '형태'를 본다.
assert_no_account_numbers() {
  local hits
  hits=$(grep -rlE '[0-9]{4}[ -][0-9]{4}[ -][0-9]{4}' _site 2>/dev/null || true)
  if [ -z "$hits" ]; then
    pass "계좌번호 형태 문자열 없음"
  else
    fail "계좌번호로 보이는 숫자열 발견:"
    printf '%s\n' "$hits" | while IFS= read -r p; do printf '      %s\n' "$p"; done
  fi
}

section "빌드"
if bundle exec jekyll build --quiet 2>build.log; then
  pass "jekyll build 성공"
else
  fail "jekyll build 실패"
  sed 's/^/      /' build.log
  rm -f build.log
  exit 1
fi
if [ -s build.log ]; then
  fail "빌드 경고 발생"
  sed 's/^/      /' build.log
fi
rm -f build.log

section "출력물"
assert_built "index.html" "홈 생성됨"

section "잔재 검사"
assert_no_residue
assert_no_account_numbers

printf '\n'
if [ "$FAILED" -eq 0 ]; then
  printf '%s모든 검증 통과%s\n' "$GREEN" "$RESET"
else
  printf '%s검증 실패%s\n' "$RED" "$RESET"
fi
exit "$FAILED"
```

- [ ] **Step 5: 실행 권한 부여 후 의존성 설치**

```bash
chmod +x script/test
bundle install
bundle lock --add-platform x86_64-linux
```

`bundle lock --add-platform x86_64-linux`는 macOS(arm64)에서 만든 `Gemfile.lock`을 리눅스 러너가 쓸 수 있게 한다. 이걸 빼면 Actions에서 `bundle install`이 실패한다.

- [ ] **Step 6: 테스트를 실행해 실패를 확인한다**

Run: `script/test`

Expected: `jekyll build 성공`과 `홈 생성됨`은 PASS, **`페낭 잔재 발견:`으로 FAIL**. 아직 콘텐츠를 교체하지 않았으므로 정상이다. 이 실패가 이후 태스크의 목표다.

- [ ] **Step 7: `Gemfile.lock`에 리눅스 플랫폼이 들어갔는지 확인**

Run: `grep -A5 '^PLATFORMS' Gemfile.lock`

Expected: 출력에 `x86_64-linux` 포함

- [ ] **Step 8: 커밋**

```bash
git add -A
git commit -m "$(cat <<'EOF'
템플릿 뼈대 복사 및 빌드 검증 스크립트 추가

페낭한인교회 사이트에서 레이아웃·인클루드·CSS·JS를 가져오고,
_site 출력물을 검사하는 script/test를 추가했다. 현재는 페낭 잔재
검사가 의도적으로 실패하며 이후 태스크에서 해소한다.

_data/는 가져오지 않았다. 5개 파일 310줄 전부가 어떤 템플릿에서도
참조되지 않는 죽은 코드였다.

Gemfile.lock은 GitHub Actions 재현성을 위해 커밋 대상으로 바꾸고
x86_64-linux 플랫폼을 추가했다.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: 사이트 설정 교체

`_config.yml`을 은혜한인교회 정보로 바꾼다. 이 파일이 교회 정보의 유일한 출처다.

**Files:**
- Modify: `_config.yml` (전체 교체)
- Modify: `script/test` (assertion 추가)

**Interfaces:**
- Consumes: Task 1의 `script/test`
- Produces: `site.church.*` 네임스페이스 — `name`, `name_en`, `address`, `address_locality`, `address_region`, `postal_code`, `address_country`, `map_url`, `latitude`, `longitude`, `phone`, `email`. 그리고 `site.google_analytics`(빈 문자열), `site.social.facebook`, `site.social.youtube`, `site.pastor`, `site.established`. 이후 모든 태스크가 이 키를 참조한다.

- [ ] **Step 1: 설정 검증을 테스트에 먼저 추가**

`script/test`의 `section "출력물"` 블록 바로 아래에 다음을 삽입:

```bash
section "사이트 설정"
assert_contains "_site/index.html" "은혜한인교회" "교회명 출력됨"
assert_contains "_site/index.html" "Moline" "주소에 Moline 포함"
assert_absent "_site/index.html" "G-BFEVR64TEW" "페낭 GA ID 없음"
assert_absent "_site/index.html" "naver-site-verification" "페낭 네이버 인증 토큰 없음"
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `script/test`

Expected: `교회명 출력됨`, `주소에 Moline 포함`, `페낭 GA ID 없음`, `페낭 네이버 인증 토큰 없음` 4건 FAIL

- [ ] **Step 3: `_config.yml` 전체 교체**

```yaml
# Site settings
title: "은혜한인교회 (Grace Korean Church)"
description: "미국 일리노이주 몰린(Quad Cities)에서 함께 예배하는 한인 교회입니다"
url: "https://grace-korean-church.github.io"
baseurl: ""
pastor: "오규섭 목사"
# TODO: 설립 연도 확인 후 채울 것. 채우면 JSON-LD에 foundingDate가 출력된다.
established: ""

# SEO settings
author: "은혜한인교회"
keywords: "은혜한인교회, Grace Korean Church, 몰린 한인교회, Moline 한인교회, Quad Cities 한인교회, 일리노이 한인교회, 미주 한인교회, 한인 예배, 주일예배"
locale: "ko_KR"
lang: "ko"

# Church information
church:
  name: "은혜한인교회"
  name_en: "Grace Korean Church"
  address: "4915 21st Ave A, Moline, IL 61265, USA"
  address_locality: "Moline"
  address_region: "IL"
  postal_code: "61265"
  address_country: "US"
  map_url: "https://maps.app.goo.gl/eXbKCooB82qSZeou7"
  # TODO: 몰린 시 기준 근사 좌표. 교회 건물 정확한 좌표로 교체할 것
  latitude: "41.5067"
  longitude: "-90.5151"
  # TODO: 대표 전화번호 확인 후 채울 것. 비어 있으면 푸터에 표시되지 않는다.
  phone: ""
  # TODO: 대표 이메일 확인 후 채울 것. 비어 있으면 푸터에 표시되지 않는다.
  email: ""

# Social media
social:
  facebook: "https://www.facebook.com/GKC.Moline/"
  instagram: ""
  youtube: "https://www.youtube.com/@gracekoreanchurchassemblyo5929"

# Analytics
# 비워두면 추적 스크립트를 아예 출력하지 않는다.
# GA4 속성을 만들면 측정 ID(G-XXXXXXXXXX)를 여기 넣기만 하면 동작한다.
google_analytics: ""

# Build settings
markdown: kramdown
timezone: America/Chicago
permalink: /news/:year/:month/:day/:title/
future: true

# Defaults
defaults:
  - scope:
      path: ""
      type: "posts"
    values:
      layout: "post"
      lang: "ko"
  - scope:
      path: ""
      type: "pages"
    values:
      lang: "ko"
  - scope:
      path: "en"
      type: "pages"
    values:
      lang: "en"

# Exclude from build
exclude:
  - Gemfile
  - Gemfile.lock
  - README.md
  - docs
  - script
  - vendor
```

`defaults`의 `type: "pages"` 규칙이 모든 페이지에 `lang: ko`를 주고, `path: "en"` 규칙이 `en/` 하위를 `lang: en`으로 덮어쓴다. 페이지마다 `lang`을 손으로 적을 필요가 없다. `docs`와 `script`를 `exclude`에 넣어 계획 문서와 테스트 스크립트가 사이트에 배포되지 않게 한다.

- [ ] **Step 4: 테스트 실행 — 부분 통과 확인**

Run: `script/test`

Expected: 빌드는 성공. `교회명 출력됨`·`주소에 Moline 포함`은 아직 FAIL(마크다운 콘텐츠가 페낭 그대로), `페낭 GA ID 없음`·`페낭 네이버 인증 토큰 없음`도 FAIL(레이아웃에 하드코딩됨).

빌드가 실패하면 YAML 문법 오류이므로 먼저 고친다.

- [ ] **Step 5: 커밋**

```bash
git add _config.yml script/test
git commit -m "$(cat <<'EOF'
사이트 설정을 은혜한인교회 기준으로 교체

url·교회정보·소셜링크·키워드를 몰린 교회 기준으로 바꾸고
America/Chicago 타임존을 명시했다. 타임존이 없으면 UTC로 빌드되어
중부시간 기준 주보 날짜가 하루 밀릴 수 있다.

google_analytics는 빈 값으로 두어 페낭 측정 ID가 새 사이트 데이터를
오염시키지 않게 했다.

defaults에 lang 규칙을 추가해 en/ 하위 페이지가 자동으로 영어로
분류되게 했다.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: 딥 네이비 테마 적용

색상 변수를 교체한다. **주의: 색상 변수가 두 곳에 중복 정의되어 있다** — `assets/css/style.css`와 `_layouts/default.html`의 크리티컬 인라인 CSS. 한 곳만 바꾸면 첫 페인트에 하늘색이 번쩍이고 나중에 네이비로 바뀐다.

**Files:**
- Modify: `assets/css/style.css` (`:root` 및 `[data-theme="dark"]` 블록)
- Modify: `_layouts/default.html` (크리티컬 인라인 CSS, `theme-color` 메타)
- Modify: `script/test`

**Interfaces:**
- Consumes: Task 2의 `_config.yml`
- Produces: CSS 변수 `--color-primary: #1f4e79` (라이트) / `#4a86c5` (다크), `--color-primary-soft: #e8f0f9` (라이트) / `#1a3550` (다크)

- [ ] **Step 1: 색상 검증을 테스트에 추가**

`script/test`의 `section "사이트 설정"` 블록 아래에 삽입:

```bash
section "테마"
assert_contains "_site/assets/css/style.css" "#1f4e79" "style.css에 네이비 적용됨"
assert_absent "_site/assets/css/style.css" "#4fa9ff" "style.css에 페낭 하늘색 없음"
assert_contains "_site/index.html" "#1f4e79" "크리티컬 CSS에 네이비 적용됨"
assert_absent "_site/index.html" "#4fa9ff" "크리티컬 CSS에 페낭 하늘색 없음"
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `script/test`

Expected: 테마 관련 4건 모두 FAIL

- [ ] **Step 3: `assets/css/style.css`의 라이트 모드 변수 교체**

`:root` 블록에서 아래 두 줄을 찾아

```css
  --color-primary: #4fa9ff;
  --color-primary-soft: #e0f0ff;
```

다음으로 교체:

```css
  --color-primary: #1f4e79;
  --color-primary-soft: #e8f0f9;
```

- [ ] **Step 4: `assets/css/style.css`의 다크 모드 변수 교체**

`[data-theme="dark"]` 블록에서 아래 두 줄을 찾아

```css
  --color-primary: #5eb3ff;
  --color-primary-soft: #1e3a52;
```

다음으로 교체:

```css
  --color-primary: #4a86c5;
  --color-primary-soft: #1a3550;
```

다크 배경(`#1a1a1a`)에서 `#1f4e79`는 대비가 부족하므로 명도를 올린 `#4a86c5`를 쓴다.

- [ ] **Step 5: 크리티컬 CSS의 색상 변수 교체**

`_layouts/default.html`의 `<style>` 블록에서 `--color-primary:#4fa9ff;--color-primary-soft:#e0f0ff;` 를 찾아 다음으로 교체:

```
--color-primary:#1f4e79;--color-primary-soft:#e8f0f9;
```

이어서 `--color-primary:#5eb3ff;--color-primary-soft:#1e3a52;` 를 찾아 다음으로 교체:

```
--color-primary:#4a86c5;--color-primary-soft:#1a3550;
```

- [ ] **Step 6: `theme-color` 메타태그 교체**

`_layouts/default.html`에서 다음 줄을 찾아

```html
  <meta name="theme-color" content="#2563eb">
```

다음으로 교체:

```html
  <meta name="theme-color" content="#1f4e79">
```

- [ ] **Step 7: 히어로 버튼 텍스트 색 교체**

`.btn-hero-primary` 규칙에 `#1a365d`가 하드코딩되어 있다. 모든 발생 위치를 `#1f4e79`로 바꾼다.

Run: `grep -n "1a365d" assets/css/style.css _layouts/default.html`

찾은 각 위치의 `color:#1a365d` 또는 `color: #1a365d` 를 다음으로 교체:

```
color: #1f4e79
```

교체 후 재확인:

Run: `grep -n "1a365d" assets/css/style.css _layouts/default.html`

Expected: 출력 없음

- [ ] **Step 8: 테스트 실행 — 통과 확인**

Run: `script/test`

Expected: 테마 관련 4건 모두 PASS

- [ ] **Step 9: 커밋**

```bash
git add assets/css/style.css _layouts/default.html script/test
git commit -m "$(cat <<'EOF'
포인트 컬러를 딥 네이비(#1f4e79)로 교체

색상 변수가 style.css와 default.html의 크리티컬 인라인 CSS 두 곳에
중복 정의되어 있어 양쪽을 함께 바꿨다. 한쪽만 바꾸면 첫 페인트에
이전 색이 번쩍인다.

다크모드는 대비 확보를 위해 명도를 올린 #4a86c5를 쓴다.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: i18n 데이터와 헤더·푸터

UI 문구를 데이터로 분리하고 헤더·푸터에 적용한다. 언어 토글도 여기서 만든다.

**Files:**
- Create: `_data/i18n.yml`
- Modify: `_includes/header.html` (전체 교체)
- Modify: `_includes/footer.html` (전체 교체)
- Modify: `assets/css/style.css` (푸터 소셜·언어 토글 스타일 추가)
- Modify: `script/test`

**Interfaces:**
- Consumes: Task 2의 `site.church.*`, `site.social.*`, `site.pastor`
- Produces: `site.data.i18n.ko` / `site.data.i18n.en` — 각각 `nav`(`home`/`about`/`services`/`news`/`visit`), `footer`(`address`/`phone`/`email`/`pastor`/`map`/`follow`/`rights`), `lang_switch`(`to_other`/`other_home`), `theme_toggle`, `menu_toggle` 키를 가진다.

`en.nav`의 `services`/`news`/`visit`은 현재 영어 네비게이션에 노출되지 않지만, 설계 문서 §5의 확장 경로(영어 페이지 추가)에서 바로 쓰이도록 대칭을 유지한다. 버튼 문구는 페이지가 이미 언어별로 분리되어 있으므로 각 마크다운에 직접 쓴다 — i18n에 넣으면 참조되지 않는 죽은 키가 된다.

- [ ] **Step 1: i18n 검증을 테스트에 추가**

`script/test`의 `section "테마"` 블록 아래에 삽입:

```bash
section "이중 언어"
assert_contains "_site/index.html" 'href="/en/"' "한국어 페이지에 EN 토글 있음"
assert_contains "_site/index.html" ">홈<" "한국어 네비게이션 출력됨"
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `script/test`

Expected: `한국어 페이지에 EN 토글 있음` FAIL

- [ ] **Step 3: `_data/i18n.yml` 생성**

```yaml
# 사이트 UI 문구 사전
# 헤더·푸터·버튼 등 화면 구성 요소의 문구는 전부 여기서 관리한다.
# 페이지 본문 콘텐츠는 각 마크다운 파일에 둔다.

ko:
  nav:
    home: "홈"
    about: "교회 소개"
    services: "예배 안내"
    news: "소식"
    visit: "오시는 길"
  footer:
    address: "주소"
    phone: "전화"
    email: "이메일"
    pastor: "담임목사"
    map: "지도 열기"
    follow: "함께하기"
    rights: "All rights reserved."
  lang_switch:
    to_other: "English"
    other_home: "/en/"
  theme_toggle: "테마 전환"
  menu_toggle: "메뉴 열기"

en:
  nav:
    home: "Home"
    about: "About"
    services: "Services"
    news: "News"
    visit: "Visit"
  footer:
    address: "Address"
    phone: "Phone"
    email: "Email"
    pastor: "Senior Pastor"
    map: "Open in Maps"
    follow: "Connect"
    rights: "All rights reserved."
  lang_switch:
    to_other: "한국어"
    other_home: "/"
  theme_toggle: "Toggle theme"
  menu_toggle: "Open menu"
```

- [ ] **Step 4: `_includes/header.html` 전체 교체**

```liquid
{%- assign lang = page.lang | default: 'ko' -%}
{%- assign t = site.data.i18n[lang] -%}
{%- if lang == 'en' -%}
  {%- assign home_url = '/en/' -%}
{%- else -%}
  {%- assign home_url = '/' -%}
{%- endif -%}
{%- comment -%}
  언어 토글 목적지: 대응 페이지(alt_url)가 있으면 그쪽으로,
  없으면 상대 언어의 홈으로 보낸다. 죽은 링크를 만들지 않는다.
{%- endcomment -%}
{%- assign switch_url = page.alt_url | default: t.lang_switch.other_home -%}

<header class="site-header">
  <div class="container header-inner">
    <div class="site-logo">
      <a href="{{ home_url | relative_url }}" aria-label="{{ site.church.name }}">
        <img src="{{ '/assets/images/logo-text-color.png' | relative_url }}"
             alt="{{ site.church.name }}"
             class="site-logo-img site-logo-light"
             width="800" height="198"
             loading="eager"
             decoding="async">
        <img src="{{ '/assets/images/logo-text-white.png' | relative_url }}"
             alt=""
             class="site-logo-img site-logo-dark"
             width="800" height="198"
             loading="eager"
             decoding="async"
             aria-hidden="true">
      </a>
    </div>

    <button class="menu-toggle" aria-label="{{ t.menu_toggle }}">
      <span class="hamburger"></span>
    </button>

    <nav class="site-nav">
      {%- if lang == 'en' %}
      <a href="{{ '/en/' | relative_url }}" class="nav-link">{{ t.nav.home }}</a>
      <a href="{{ '/en/about/' | relative_url }}" class="nav-link">{{ t.nav.about }}</a>
      {%- else %}
      <a href="{{ '/' | relative_url }}" class="nav-link">{{ t.nav.home }}</a>
      <a href="{{ '/about/' | relative_url }}" class="nav-link">{{ t.nav.about }}</a>
      <a href="{{ '/services/' | relative_url }}" class="nav-link">{{ t.nav.services }}</a>
      <a href="{{ '/news/' | relative_url }}" class="nav-link">{{ t.nav.news }}</a>
      <a href="{{ '/visit/' | relative_url }}" class="nav-link">{{ t.nav.visit }}</a>
      {%- endif %}
      <a href="{{ switch_url | relative_url }}" class="nav-link nav-lang" hreflang="{% if lang == 'en' %}ko{% else %}en{% endif %}">{{ t.lang_switch.to_other }}</a>
      <button class="theme-toggle" aria-label="{{ t.theme_toggle }}" title="{{ t.theme_toggle }}">🌙</button>
    </nav>
  </div>
</header>
```

로고 `img` 태그는 Task 9에서 텍스트 폴백으로 교체한다. 지금은 템플릿 구조를 유지한다.

- [ ] **Step 5: `_includes/footer.html` 전체 교체**

전화·이메일은 `_config.yml`에서 비어 있으므로 값이 있을 때만 출력한다. TODO 상태에서도 푸터가 깨지지 않는다.

```liquid
{%- assign lang = page.lang | default: 'ko' -%}
{%- assign t = site.data.i18n[lang] -%}

<footer class="site-footer">
  <div class="container footer-inner">
    <div class="footer-info">
      <div class="footer-logo">
        <img src="{{ '/assets/images/logo-text-color.png' | relative_url }}"
             alt="{{ site.church.name }}"
             class="footer-logo-img footer-logo-light"
             width="800" height="198"
             loading="lazy"
             decoding="async">
        <img src="{{ '/assets/images/logo-text-white.png' | relative_url }}"
             alt=""
             class="footer-logo-img footer-logo-dark"
             width="800" height="198"
             loading="lazy"
             decoding="async"
             aria-hidden="true">
      </div>
      <p class="footer-address">
        <strong>{{ t.footer.address }}:</strong>
        <span class="address-text">{{ site.church.address }}</span>
        <a href="{{ site.church.map_url }}" target="_blank" rel="noopener noreferrer" class="map-link">{{ t.footer.map }}</a><br>
        {%- if site.church.phone != "" %}
        <strong>{{ t.footer.phone }}:</strong> <a href="tel:{{ site.church.phone }}">{{ site.church.phone }}</a><br>
        {%- endif %}
        {%- if site.church.email != "" %}
        <strong>{{ t.footer.email }}:</strong> <a href="mailto:{{ site.church.email }}">{{ site.church.email }}</a><br>
        {%- endif %}
      </p>
      <p class="footer-pastor">{{ t.footer.pastor }}: {{ site.pastor }}</p>

      <p class="footer-social">
        <strong>{{ t.footer.follow }}:</strong>
        {%- if site.social.facebook != "" %}
        <a href="{{ site.social.facebook }}" target="_blank" rel="noopener noreferrer">Facebook</a>
        {%- endif %}
        {%- if site.social.youtube != "" %}
        <a href="{{ site.social.youtube }}" target="_blank" rel="noopener noreferrer">YouTube</a>
        {%- endif %}
      </p>
    </div>

    <div class="footer-copyright">
      <p>&copy; {{ site.time | date: "%Y" }} {{ site.church.name }}. {{ t.footer.rights }}</p>
    </div>
  </div>
</footer>
```

- [ ] **Step 6: 소셜 링크와 언어 토글 스타일 추가**

`assets/css/style.css` 맨 끝에 추가:

```css
/* ==========================================================================
   Footer social & language toggle
   ========================================================================== */

.footer-social {
  margin-top: var(--space-xs);
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.footer-social a {
  margin-right: var(--space-sm);
}

.nav-lang {
  font-weight: 600;
  color: var(--color-primary);
}
```

- [ ] **Step 7: 테스트 실행 — 통과 확인**

Run: `script/test`

Expected: `한국어 페이지에 EN 토글 있음`, `한국어 네비게이션 출력됨` PASS. 페낭 잔재 검사는 여전히 FAIL (마크다운 콘텐츠 미교체).

- [ ] **Step 8: 커밋**

```bash
git add _data/i18n.yml _includes/header.html _includes/footer.html assets/css/style.css script/test
git commit -m "$(cat <<'EOF'
i18n 데이터 도입 및 헤더·푸터 이중 언어화

UI 문구를 _data/i18n.yml로 분리하고 헤더·푸터가 page.lang에 따라
문구와 링크를 고르게 했다. include를 언어별로 복제하지 않는다.

언어 토글은 page.alt_url이 있으면 대응 페이지로, 없으면 상대 언어의
홈으로 보내 죽은 링크가 생기지 않게 했다.

전화·이메일은 아직 미확인이라 값이 있을 때만 출력한다.
소셜 링크는 페이스북·유튜브로 교체했다.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: 레이아웃 정리

`_layouts/default.html`에서 페낭 하드코딩을 걷어내고 이중 언어 메타데이터를 넣는다.

**Files:**
- Modify: `_layouts/default.html`
- Modify: `assets/js/analytics.js` (주석)
- Modify: `script/test`

**Interfaces:**
- Consumes: Task 2의 `site.church.*`, `site.google_analytics`, `site.established`; Task 4의 `page.alt_url`, `page.alt_lang`
- Produces: 모든 페이지에 `<html lang>`, `hreflang` 상호 링크, 조건부 GA 스크립트

- [ ] **Step 1: 레이아웃 검증을 테스트에 추가**

`script/test`의 `section "이중 언어"` 블록 안에 추가:

```bash
assert_contains "_site/index.html" '<html lang="ko">' "한국어 페이지 lang 속성"
assert_absent "_site/index.html" "googletagmanager" "GA 미설정 시 스크립트 미출력"
assert_absent "_site/index.html" "analytics.js" "GA 미설정 시 이벤트 스크립트 미출력"
assert_contains "_site/index.html" '"addressCountry": "US"' "JSON-LD 국가 코드 US"
assert_contains "_site/index.html" 'content="US-IL"' "geo.region US-IL"
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `script/test`

Expected: 위 5건 FAIL

- [ ] **Step 3: `<html>` 태그와 language 메타 동적화**

`<html lang="{{ site.lang | default: 'ko' }}">` 를 다음으로 교체:

```html
<html lang="{{ page.lang | default: 'ko' }}">
```

`<meta name="language" content="{{ site.lang | default: 'ko' }}">` 를 다음으로 교체:

```html
  <meta name="language" content="{{ page.lang | default: 'ko' }}">
```

- [ ] **Step 4: canonical 아래에 hreflang 블록 추가**

`<link rel="canonical" href="{{ page.url | absolute_url }}">` 바로 아래에 삽입:

```html
  {%- if page.alt_url %}
  <link rel="alternate" hreflang="{{ page.lang | default: 'ko' }}" href="{{ page.url | absolute_url }}">
  <link rel="alternate" hreflang="{{ page.alt_lang }}" href="{{ page.alt_url | absolute_url }}">
  <link rel="alternate" hreflang="x-default" href="{{ '/' | absolute_url }}">
  {%- endif %}
```

- [ ] **Step 5: `og:locale` 분기**

`<meta property="og:locale" content="{{ site.locale | default: 'ko_KR' }}">` 를 다음으로 교체:

```html
  <meta property="og:locale" content="{% if page.lang == 'en' %}en_US{% else %}ko_KR{% endif %}">
  {%- if page.alt_url %}
  <meta property="og:locale:alternate" content="{% if page.lang == 'en' %}ko_KR{% else %}en_US{% endif %}">
  {%- endif %}
```

- [ ] **Step 6: JSON-LD Church 스키마 교체**

`"@type": "Church"` 가 들어 있는 `<script type="application/ld+json">` 블록 전체를 다음으로 교체:

```html
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Church",
    "name": "{{ site.church.name }}",
    "alternateName": "{{ site.church.name_en }}",
    "url": "{{ site.url }}{{ site.baseurl }}",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "{{ site.church.address }}",
      "addressLocality": "{{ site.church.address_locality }}",
      "postalCode": "{{ site.church.postal_code }}",
      "addressRegion": "{{ site.church.address_region }}",
      "addressCountry": "{{ site.church.address_country }}"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": {{ site.church.latitude }},
      "longitude": {{ site.church.longitude }}
    },
    {% if site.church.phone != "" %}"telephone": "{{ site.church.phone }}",{% endif %}
    {% if site.church.email != "" %}"email": "{{ site.church.email }}",{% endif %}
    {% if site.established != "" %}"foundingDate": "{{ site.established }}",{% endif %}
    "description": "{{ site.description }}",
    "sameAs": [
      {%- assign links = "" | split: "" -%}
      {%- if site.social.facebook != "" %}{%- assign links = links | push: site.social.facebook -%}{%- endif -%}
      {%- if site.social.instagram != "" %}{%- assign links = links | push: site.social.instagram -%}{%- endif -%}
      {%- if site.social.youtube != "" %}{%- assign links = links | push: site.social.youtube -%}{%- endif -%}
      {%- for link in links -%}
      "{{ link }}"{% unless forloop.last %},{% endunless %}
      {%- endfor %}
    ]
  }
  </script>
```

원본은 `sameAs` 배열의 쉼표 처리가 잘못되어 있었다 — 인스타그램이 비어 있으면 `"facebook",` 뒤에 바로 `]`가 와서 JSON이 깨진다. 위 방식은 값이 있는 링크만 모아 `forloop.last`로 쉼표를 처리하므로 어떤 조합에서도 유효하다. `logo`/`image`는 아직 존재하지 않는 파일을 가리키므로 제외했고, `openingHoursSpecification`과 `priceRange`는 예배 시간 미확인이라 제거했다.

- [ ] **Step 7: 네이버 인증 토큰 제거**

다음 줄을 삭제한다:

```html
  <meta name="naver-site-verification" content="c51673d897229c805b54a1aa9c40381ce260949a" />
```

이 토큰은 페낭 사이트 소유권 증명용이라 새 사이트에서는 무의미하다.

- [ ] **Step 8: geo 메타태그 교체**

다음 두 줄을 찾아

```html
  <meta name="geo.region" content="MY-07">
  <meta name="geo.placename" content="Penang">
```

다음으로 교체:

```html
  <meta name="geo.region" content="US-IL">
  <meta name="geo.placename" content="{{ site.church.address_locality }}">
```

- [ ] **Step 9: 히어로 이미지 preload 제거**

`<link rel="preload" as="image" ...>` 두 블록(`hero-bg.webp`, `hero-bg-mobile.webp`)을 삭제하고 그 자리에 다음 주석을 남긴다:

```html
  <!-- TODO: hero-bg.webp / hero-bg-mobile.webp 자산이 준비되면 preload 링크를 되살릴 것 -->
```

아직 파일이 없어 404를 유발하고 콘솔 경고가 뜬다.

- [ ] **Step 10: Google Analytics 조건부화**

`<!-- Google tag (gtag.js) ... -->` 주석과 그 아래 `<script>` 블록 전체를 다음으로 교체:

```html
  {%- if site.google_analytics != "" %}
  <!-- Google tag (gtag.js) — 렌더 중 강제 리플로를 피하려 지연 로드 -->
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.addEventListener('load', function() {
      var s = document.createElement('script');
      s.src = 'https://www.googletagmanager.com/gtag/js?id={{ site.google_analytics }}';
      s.async = true;
      document.head.appendChild(s);
      gtag('js', new Date());
      gtag('config', '{{ site.google_analytics }}');
    });
  </script>
  {%- endif %}
```

- [ ] **Step 11: 이벤트 추적 스크립트도 조건부화**

`<script defer src="{{ '/assets/js/analytics.js' | relative_url }}"></script>` 를 다음으로 교체:

```html
  {%- if site.google_analytics != "" %}
  <script defer src="{{ '/assets/js/analytics.js' | relative_url }}"></script>
  {%- endif %}
```

`analytics.js`는 `gtag`가 없으면 콘솔 경고를 찍고 종료한다. GA를 안 쓸 때는 아예 로드하지 않는 편이 낫다.

- [ ] **Step 12: 비활성화된 Tawk.to 블록 삭제**

`<!-- Tawk.to Live Chat (temporarily disabled)` 로 시작하는 주석 블록 전체를 삭제한다. 페낭 계정 ID가 들어 있고 사용하지 않는 코드다.

- [ ] **Step 13: `analytics.js` 주석 교체**

`assets/js/analytics.js`에서 다음 줄을 찾아

```
 * 페낭한인교회 웹사이트 사용자 동작 추적
```

다음으로 교체:

```
 * 은혜한인교회 웹사이트 사용자 동작 추적
```

- [ ] **Step 13b: `analytics.js`의 다음카페 링크 처리 함수 제거**

`assets/js/analytics.js`에는 `updateCafeLinksForMobile()` 함수가 있다. 모바일 브라우저에서 `https://cafe.daum.net/PenangChurch` 링크를 `m.cafe.daum.net` 주소로 바꿔주는 코드다. 새 사이트에는 다음카페 링크가 없으므로 죽은 코드이고, 페낭 잔재로 남아 Task 7의 잔재 검사가 통과하지 못하게 막는다.

함수 정의 전체(위의 JSDoc 주석 포함)와 `initAnalytics()` 안의 호출부 두 곳을 삭제한다. `initAnalytics()`는 `document.readyState`에 따라 분기하므로 호출이 두 번 나올 수 있다 — 모두 지운다.

삭제 후 확인:

Run: `grep -ni 'daum\|cafe' assets/js/analytics.js`

Expected: 출력 없음

- [ ] **Step 14: 테스트 실행 — 통과 확인**

Run: `script/test`

Expected: 이중 언어·JSON-LD·geo 검증 5건 PASS. 페낭 잔재는 여전히 FAIL (마크다운 콘텐츠 남음).

- [ ] **Step 15: JSON-LD 문법 검증**

Run:

```bash
ruby -rjson -e '
  html = File.read("_site/index.html")
  blocks = html.scan(%r{<script type="application/ld\+json">(.*?)</script>}m).flatten
  blocks.each_with_index do |b, i|
    begin
      JSON.parse(b)
      puts "  OK   블록 #{i + 1}"
    rescue JSON::ParserError => e
      puts "  FAIL 블록 #{i + 1}: #{e.message}"
      exit 1
    end
  end
  puts "JSON-LD #{blocks.size}개 모두 유효"
'
```

Expected: 모든 블록 `OK`, 마지막에 `JSON-LD N개 모두 유효`

- [ ] **Step 16: 커밋**

```bash
git add _layouts/default.html assets/js/analytics.js script/test
git commit -m "$(cat <<'EOF'
레이아웃에서 페낭 하드코딩 제거 및 이중 언어 메타데이터 추가

- html lang과 og:locale을 page.lang 기반으로 동적화
- alt_url이 있으면 hreflang 상호 링크 출력
- JSON-LD 주소를 site.church.* 참조로 바꾸고 sameAs 배열의
  쉼표 처리 버그를 수정 (인스타그램이 비면 JSON이 깨졌다)
- 페낭 네이버 소유권 인증 토큰 제거
- geo 메타를 US-IL로 교체
- GA를 site.google_analytics 조건부로 변경, 빈 값이면 미출력
- 존재하지 않는 히어로 이미지 preload 제거
- 미사용 Tawk.to 블록 삭제

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: 구조화 데이터 인클루드 교체

네비게이션·브레드크럼·FAQ 스키마를 새 URL 구조와 교회 정보에 맞춘다.

**Files:**
- Modify: `_includes/navigation-schema.html` (전체 교체)
- Modify: `_includes/breadcrumb-schema.html` (전체 교체)
- Modify: `_includes/faq-schema.html` (전체 교체)
- Modify: `script/test`

**Interfaces:**
- Consumes: Task 2의 `site.church.*`, Task 5의 레이아웃
- Produces: 없음 (말단 인클루드)

- [ ] **Step 1: 스키마 검증을 테스트에 추가**

`script/test`의 `section "이중 언어"` 블록 아래에 새 섹션 추가:

```bash
section "구조화 데이터"
assert_contains "_site/index.html" '"@type": "FAQPage"' "FAQ 스키마 출력됨"
```

`구 URL 경로 없음`(`/pages/` 부재) 검사는 여기 넣지 않는다. `index.md`가 아직 페낭 원본이고 그 히어로 버튼이 `/pages/services/`를 가리키므로, 이 태스크에서는 통과시킬 수 없다. `index.md`를 새로 쓰는 **Task 7에서 추가한다.**

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `script/test`

Expected: `FAQ 스키마 출력됨` FAIL (현재 `faq-schema.html`은 스텁이라 JSON을 출력하지 않는다)

- [ ] **Step 3: `_includes/navigation-schema.html` 전체 교체**

```liquid
<!-- Site Navigation Schema for Sitelinks -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "SiteNavigationElement",
      "position": 1,
      "name": "교회 소개",
      "description": "{{ site.church.name }}의 비전과 섬기는 이들을 소개합니다",
      "url": "{{ site.url }}{{ site.baseurl }}/about/"
    },
    {
      "@type": "SiteNavigationElement",
      "position": 2,
      "name": "예배 안내",
      "description": "주일예배를 비롯한 예배 시간과 장소 안내",
      "url": "{{ site.url }}{{ site.baseurl }}/services/"
    },
    {
      "@type": "SiteNavigationElement",
      "position": 3,
      "name": "찾아오시는 길",
      "description": "{{ site.church.name }} 위치, 지도, 주차 안내",
      "url": "{{ site.url }}{{ site.baseurl }}/visit/"
    },
    {
      "@type": "SiteNavigationElement",
      "position": 4,
      "name": "소식",
      "description": "교회 소식, 주보, 행사 안내",
      "url": "{{ site.url }}{{ site.baseurl }}/news/"
    },
    {
      "@type": "SiteNavigationElement",
      "position": 5,
      "name": "Welcome",
      "description": "Service times, location, and contact information in English",
      "url": "{{ site.url }}{{ site.baseurl }}/en/"
    }
  ]
}
</script>
```

- [ ] **Step 4: `_includes/breadcrumb-schema.html` 전체 교체**

기존 파일은 `page.url contains '/pages/'` 로 페이지 여부를 판정하는데, 새 구조에는 `/pages/` 경로가 없어 모든 정적 페이지가 브레드크럼에서 빠진다.

```liquid
<!-- BreadcrumbList Structured Data -->
{% if page.url != "/" and page.url != "/en/" %}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "{% if page.lang == 'en' %}Home{% else %}홈{% endif %}",
      "item": "{% if page.lang == 'en' %}{{ site.url }}{{ site.baseurl }}/en/{% else %}{{ site.url }}{{ site.baseurl }}/{% endif %}"
    }
    {% if page.url contains '/news/' and page.url != '/news/' %}
    ,{
      "@type": "ListItem",
      "position": 2,
      "name": "소식",
      "item": "{{ site.url }}{{ site.baseurl }}/news/"
    }
    ,{
      "@type": "ListItem",
      "position": 3,
      "name": "{{ page.title }}",
      "item": "{{ page.url | absolute_url }}"
    }
    {% elsif page.title %}
    ,{
      "@type": "ListItem",
      "position": 2,
      "name": "{{ page.title }}",
      "item": "{{ page.url | absolute_url }}"
    }
    {% endif %}
  ]
}
</script>
{% endif %}
```

개별 소식 글은 `홈 → 소식 → 글 제목` 3단계, 나머지 페이지는 `홈 → 페이지 제목` 2단계가 된다. 영어 홈은 브레드크럼 대상에서 제외했다.

- [ ] **Step 5: `_includes/faq-schema.html` 전체 교체**

예배 시간과 연락처가 미확인이므로 **확인된 정보만으로 답할 수 있는 질문 3개**로 줄인다. 사실이 아닌 내용을 구조화 데이터로 내보내면 검색엔진에 잘못된 정보가 색인된다.

```liquid
<!-- FAQ Structured Data (JSON-LD) -->
<!-- TODO: 예배 시간·연락처가 확정되면 아래 질문을 늘릴 것
     (예: "예배 시간은 언제인가요?", "주차는 어떻게 하나요?") -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "{{ site.church.name }}은 어디에 있나요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{{ site.church.name }}({{ site.church.name_en }})은 {{ site.church.address }}에 있습니다. 미국 일리노이주 몰린, Quad Cities 지역입니다."
      }
    },
    {
      "@type": "Question",
      "name": "처음 방문해도 괜찮을까요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{{ site.church.name }}은 처음 오시는 모든 분을 환영합니다. 예약이나 사전 연락 없이 편하게 오시면 됩니다. 궁금한 점은 교회 페이스북 페이지로 문의하실 수 있습니다."
      }
    },
    {
      "@type": "Question",
      "name": "예배는 한국어로 드리나요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{{ site.church.name }}은 한인 교회로 한국어로 예배를 드립니다. 영어권 방문자를 위한 안내는 홈페이지의 English 페이지에서 확인하실 수 있습니다."
      }
    }
  ]
}
</script>
```

- [ ] **Step 6: 테스트 실행 — 통과 확인**

Run: `script/test`

Expected: 구조화 데이터 2건 PASS

- [ ] **Step 7: JSON-LD 재검증**

Run: Task 5 Step 15의 Ruby 명령을 다시 실행

Expected: 모든 블록 `OK`

- [ ] **Step 8: 커밋**

```bash
git add _includes/navigation-schema.html _includes/breadcrumb-schema.html _includes/faq-schema.html script/test
git commit -m "$(cat <<'EOF'
구조화 데이터를 새 URL 구조와 교회 정보에 맞게 교체

네비게이션 스키마의 /pages/ 접두사를 제거하고 영어 페이지를 추가했다.
브레드크럼은 /pages/ 경로 판정 때문에 새 구조에서 모든 정적 페이지가
누락되던 문제를 고쳤다.

FAQ는 페낭 8문항을 확인된 사실만으로 답할 수 있는 3문항으로 줄였다.
예배 시간이 미확인 상태에서 추측으로 채우면 잘못된 정보가 검색에
색인된다.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: 한국어 페이지 작성

홈·교회 소개·예배 안내·오시는 길을 새로 쓴다. 미확인 정보는 `TODO` 주석으로 남기되, 화면에는 어색하지 않은 문구가 나오게 한다.

**Files:**
- Modify: `index.md` (전체 교체)
- Create: `about.md` (Task 1에서 복사하지 않았으므로 신규 생성)
- Create: `services.md` (신규 생성)
- Create: `visit.md` (신규 생성)
- Modify: `news.html` (front matter와 헤더)
- Modify: `script/test`

**Interfaces:**
- Consumes: Task 2의 `site.church.*`, `site.social.*`, `site.pastor`
- Produces: `/`, `/about/`, `/services/`, `/visit/`, `/news/` URL. Task 8의 영어 페이지가 `alt_url`로 `/`와 `/about/`을 참조한다.

**순서 주의:** 이 태스크의 `index.md`는 `hero-placeholder` 클래스를 사용하지만 해당 CSS는 Task 9에서 정의한다. Task 7~8 구간에서는 히어로 배경이 존재하지 않는 페낭 이미지를 가리켜 단색으로 보인다. 정상이며 Task 9에서 해소된다. 이 태스크의 검증 대상은 페이지 생성과 페낭 잔재 제거이지 히어로 외관이 아니다.

- [ ] **Step 1: 페이지 검증을 테스트에 추가**

`script/test`의 `section "출력물"` 블록에 추가:

```bash
assert_built "about/index.html" "교회 소개 생성됨"
assert_built "services/index.html" "예배 안내 생성됨"
assert_built "visit/index.html" "찾아오시는 길 생성됨"
assert_built "news/index.html" "소식 목록 생성됨"
```

그리고 `section "구조화 데이터"` 블록에 다음 한 줄을 추가한다 (Task 6에서 이리로 옮겨온 검사다 — `index.md`가 새로 쓰이는 이 태스크에서야 통과할 수 있다):

```bash
assert_absent "_site/index.html" "/pages/" "구 URL 경로 없음"
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `script/test`

Expected: 위 4건 FAIL (아직 permalink 미지정)

- [ ] **Step 3: `index.md` 전체 교체**

```markdown
---
layout: default
title: "은혜한인교회"
description: "미국 일리노이주 몰린(Quad Cities)에서 함께 예배하는 한인 교회. 은혜한인교회 예배 안내와 오시는 길"
keywords: "은혜한인교회, Grace Korean Church, 몰린 한인교회, Quad Cities 한인교회, 일리노이 한인교회"
permalink: /
alt_lang: en
alt_url: /en/
---

<!-- Hero Section -->
<section class="hero-fullscreen hero-placeholder">
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <h1 class="hero-title">은혜한인교회</h1>
    <p class="hero-tagline">Grace Korean Church</p>
    <p class="hero-text">몰린과 Quad Cities에서 함께 예배하는 한인 교회입니다</p>
    <!-- TODO: 예배 시간이 확정되면 여기에 "주일예배 오전 OO시" 문구를 추가할 것 -->
    <div class="hero-actions">
      <a href="{{ '/services/' | relative_url }}" class="btn btn-hero-primary">예배 안내</a>
      <a href="{{ '/visit/' | relative_url }}" class="btn btn-hero-outline" style="border: 2px solid #fff; color: #fff;">오시는 길</a>
    </div>
  </div>
</section>

<!-- Location Section -->
<section class="section-fullwidth section-white">
  <div class="container">
    <div class="two-column location-grid">
      <div class="column-info-lifehouse">
        <h2 class="location-time">함께 드리는 예배</h2>
        <p class="location-address">
          <span class="address-text">{{ site.church.address }}</span>
        </p>
        <div class="location-buttons">
          <a href="{{ site.church.map_url }}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">📍 구글맵</a>
        </div>
      </div>
      <div class="column-map">
        <iframe
          title="은혜한인교회 위치 - Google Maps"
          src="https://www.google.com/maps?q=4915%2021st%20Ave%20A,%20Moline,%20IL%2061265&output=embed"
          width="100%"
          height="350"
          style="border:0; border-radius: 12px;"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      </div>
    </div>
  </div>
</section>

<!-- Intro Section -->
<section class="section-fullwidth">
  <div class="container">
    <div class="text-center">
      <h2>처음 오시는 분께</h2>
      <p>
        은혜한인교회는 처음 오시는 모든 분을 환영합니다.
        예약이나 사전 연락 없이 편하게 오셔서 함께 예배드리시면 됩니다.
        궁금한 점은 교회 <a href="{{ site.social.facebook }}" target="_blank" rel="noopener noreferrer">페이스북</a>으로 문의해 주세요.
      </p>
      <p>
        <a href="{{ '/about/' | relative_url }}" class="btn btn-outline">교회 소개 보기</a>
      </p>
    </div>
  </div>
</section>

<!-- Recent News -->
{% if site.posts.size > 0 %}
<section class="section-fullwidth section-white">
  <div class="container">
    <h2 class="text-center">최근 소식</h2>
    <div class="card-grid">
      {% for post in site.posts limit: 3 %}
      <article class="card">
        <div class="card-meta">
          <span>{{ post.date | date: "%Y년 %m월 %d일" }}</span>
          {% if post.category %}<span class="card-category">{{ post.category }}</span>{% endif %}
        </div>
        <h3 class="card-title"><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
        {% if post.summary %}<p class="card-summary">{{ post.summary }}</p>{% endif %}
        <a href="{{ post.url | relative_url }}" class="card-link">자세히 보기 →</a>
      </article>
      {% endfor %}
    </div>
    <p class="text-center"><a href="{{ '/news/' | relative_url }}" class="btn btn-outline">소식 전체 보기</a></p>
  </div>
</section>
{% endif %}
```

- [ ] **Step 4: `about.md` 전체 교체**

```markdown
---
layout: page
title: "교회 소개"
subtitle: "은혜한인교회를 소개합니다"
description: "은혜한인교회(Grace Korean Church) 소개. 미국 일리노이주 몰린 Quad Cities 지역의 한인 교회입니다"
keywords: "은혜한인교회 소개, Grace Korean Church, 몰린 한인교회, 오규섭 목사"
permalink: /about/
alt_lang: en
alt_url: /en/about/
---

## 환영합니다

은혜한인교회는 미국 일리노이주 몰린(Moline), Quad Cities 지역에서 한국어로 예배드리는 한인 교회입니다.

낯선 땅에서 신앙의 뿌리를 함께 내리고, 서로의 삶을 나누며, 이웃을 섬기는 공동체가 되기를 원합니다. 오래 이 지역에 사신 분도, 이제 막 오신 분도 모두 환영합니다.

<!-- TODO: 교회 인사말·비전·표어를 교회로부터 받아 이 섹션을 교체할 것 -->

---

## 섬기는 이

**담임목사** — {{ site.pastor }}

<!-- TODO: 담임목사 약력과 사진(assets/images/pastor.jpg)을 받아 추가할 것 -->

---

## 함께하기

교회 소식과 예배 영상은 아래에서 보실 수 있습니다.

- **페이스북** — [{{ site.church.name }}]({{ site.social.facebook }})
- **유튜브** — [예배 영상 보기]({{ site.social.youtube }})

처음 방문하시거나 궁금한 점이 있으시면 페이스북 메시지로 편하게 연락 주세요.

<!-- TODO: 전화번호·이메일이 확정되면 _config.yml의 church.phone / church.email을
     채울 것. 채우면 푸터에 자동으로 표시된다. -->
```

- [ ] **Step 5: `services.md` 전체 교체**

```markdown
---
layout: page
title: "예배 안내"
subtitle: "은혜한인교회의 예배를 안내합니다"
description: "은혜한인교회 예배 안내. 미국 일리노이주 몰린 Quad Cities 한인교회의 예배 시간과 장소"
keywords: "은혜한인교회 예배시간, 주일예배, 몰린 한인교회 예배, Quad Cities 한인 예배"
permalink: /services/
---

## 주일 예배

은혜한인교회는 매주 주일 함께 모여 하나님을 예배합니다.

<!-- TODO: 아래 문단을 교회에서 확인한 실제 예배 시간표로 교체할 것.
     확정 전까지는 시간을 명시하지 않는다. 잘못된 시간을 올리면
     실제로 방문하는 분에게 피해가 간다. -->

예배 시간은 교회 [페이스북 페이지]({{ site.social.facebook }})에서 안내하고 있습니다. 정확한 시간을 확인하신 후 방문해 주세요.

지난 예배 영상은 [유튜브 채널]({{ site.social.youtube }})에서 보실 수 있습니다.

---

## 처음 오시는 분께

- **복장** — 특별한 격식은 없습니다. 편안한 옷차림으로 오셔도 좋습니다.
- **자녀와 함께** — 아이와 함께 오셔도 괜찮습니다.

<!-- TODO: 주차 안내와 부서별 예배(어린이부·학생부 등) 운영 여부를
     확인해 이 섹션을 보완할 것.
     주차는 확인 전까지 적지 않는다 — 없는 주차 공간을 안내하면
     방문자가 곤란해진다. 예배 시간을 추측하지 않는 것과 같은 이유다. -->

---

## 예배 장소

{{ site.church.address }}

[구글맵에서 열기]({{ site.church.map_url }})

자세한 길 안내는 [찾아오시는 길]({{ '/visit/' | relative_url }}) 페이지를 참고해 주세요.
```

- [ ] **Step 6: `visit.md` 전체 교체**

```markdown
---
layout: page
title: "찾아오시는 길"
subtitle: "은혜한인교회 위치를 안내합니다"
description: "은혜한인교회 위치와 오시는 길. 4915 21st Ave A, Moline, IL 61265"
keywords: "은혜한인교회 위치, 몰린 한인교회 주소, Moline Korean church, Quad Cities 한인교회 오시는 길"
permalink: /visit/
---

## 주소

**{{ site.church.address }}**

[구글맵에서 열기]({{ site.church.map_url }})

<div class="map-container">
  <iframe
    title="은혜한인교회 위치 - Google Maps"
    src="https://www.google.com/maps?q=4915%2021st%20Ave%20A,%20Moline,%20IL%2061265&output=embed"
    width="100%"
    height="420"
    style="border:0; border-radius: 12px;"
    allowfullscreen=""
    loading="lazy"
    referrerpolicy="no-referrer-when-downgrade">
  </iframe>
</div>

---

## 오시는 길

은혜한인교회는 일리노이주 몰린(Moline), Quad Cities 지역에 있습니다. 네비게이션에 위 주소를 입력하시면 됩니다.

<!-- TODO: 주요 도로 기준 접근 방법, 주차 위치, 건물 입구 안내를
     교회로부터 확인해 보완할 것 -->

---

## 문의

방문 전 궁금한 점은 교회 [페이스북 페이지]({{ site.social.facebook }})로 문의해 주세요.

{% if site.church.phone != "" %}
전화: [{{ site.church.phone }}](tel:{{ site.church.phone }})
{% endif %}
```

- [ ] **Step 7: `news.html`의 front matter와 헤더 교체**

파일 첫 부분(front matter부터 `</header>`까지)을 다음으로 교체:

```html
---
layout: default
title: "소식"
permalink: /news/
description: "은혜한인교회의 최근 소식과 공지사항"
---

<div class="container">
  <header class="page-header">
    <h1 class="page-title">소식</h1>
    <p class="page-subtitle">은혜한인교회의 최근 소식과 공지사항을 확인하세요</p>
  </header>
```

나머지(포스트 반복 블록)는 그대로 둔다.

- [ ] **Step 8: 구 `pages/` 디렉토리 잔재 확인**

Run: `ls pages 2>/dev/null && echo "존재함" || echo "없음"`

Expected: `없음`. `존재함`이 나오면 `rm -rf pages` 를 실행한다.

- [ ] **Step 9: 테스트 실행 — 통과 확인**

Run: `script/test`

Expected: 페이지 생성 4건 PASS, `교회명 출력됨`·`주소에 Moline 포함` PASS. **페낭 잔재 검사도 이 시점에 PASS해야 한다.**

FAIL이 남으면 스크립트가 어느 파일인지 출력하므로 해당 파일을 확인한다.

- [ ] **Step 10: 커밋**

```bash
git add index.md about.md services.md visit.md news.html script/test
git commit -m "$(cat <<'EOF'
한국어 페이지 작성 및 URL 구조 평탄화

홈·교회소개·예배안내·찾아오시는길을 은혜한인교회 내용으로 새로 쓰고,
permalink를 /about/ /services/ /visit/ 로 정리해 URL에서 pages/
접두사를 없앴다.

예배 시간은 미확인이므로 추측해서 표를 채우지 않고 페이스북 안내로
연결했다. 잘못된 시간을 올리면 실제 방문자에게 피해가 간다.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: 영어 페이지 작성

영어권 방문자가 실제로 필요로 하는 정보만 담은 두 페이지를 만든다.

**Files:**
- Create: `en/index.md`
- Create: `en/about.md`
- Modify: `script/test`

**Interfaces:**
- Consumes: Task 4의 `site.data.i18n.en`, Task 7의 `/`와 `/about/` (alt_url 상호 참조)
- Produces: `/en/`, `/en/about/` URL

- [ ] **Step 1: 영어 페이지 검증을 테스트에 추가**

`script/test`의 `section "이중 언어"` 블록에 추가:

```bash
assert_built "en/index.html" "영어 홈 생성됨"
assert_built "en/about/index.html" "영어 소개 생성됨"
assert_contains "_site/en/index.html" '<html lang="en">' "영어 페이지 lang 속성"
assert_contains "_site/en/index.html" ">Home<" "영어 네비게이션 출력됨"
assert_contains "_site/index.html" 'hreflang="en"' "한국어 홈에 hreflang 링크"
assert_contains "_site/en/index.html" 'hreflang="ko"' "영어 홈에 hreflang 링크"
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `script/test`

Expected: 위 6건 FAIL

- [ ] **Step 3: `en/index.md` 생성**

```markdown
---
layout: default
title: "Welcome"
description: "Grace Korean Church — a Korean-speaking congregation in Moline, Illinois, serving the Quad Cities area."
keywords: "Grace Korean Church, Korean church Moline, Korean church Quad Cities, Korean church Illinois"
permalink: /en/
alt_lang: ko
alt_url: /
---

<section class="hero-fullscreen hero-placeholder">
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <h1 class="hero-title">Grace Korean Church</h1>
    <p class="hero-tagline">은혜한인교회</p>
    <p class="hero-text">A Korean-speaking congregation in Moline, Illinois</p>
    <div class="hero-actions">
      <a href="{{ site.church.map_url }}" target="_blank" rel="noopener noreferrer" class="btn btn-hero-primary">Get Directions</a>
    </div>
  </div>
</section>

<div class="container page-container">
  <div class="page-content">

    <h2>Welcome</h2>

    <p>
      Grace Korean Church is a Korean-speaking congregation serving the Quad Cities
      area from Moline, Illinois. Whether you have lived here for years or have just
      arrived, you are welcome to join us.
    </p>

    <p><strong>Please note:</strong> our services are held in Korean.</p>

    <h2>Service Times</h2>

    <!-- TODO: Replace with confirmed service times once the church provides them. -->
    <p>
      Current service times are announced on our
      <a href="{{ site.social.facebook }}" target="_blank" rel="noopener noreferrer">Facebook page</a>.
      Please check there before visiting. Past services are available on our
      <a href="{{ site.social.youtube }}" target="_blank" rel="noopener noreferrer">YouTube channel</a>.
    </p>

    <h2>Location</h2>

    <p>
      <strong>{{ site.church.address }}</strong><br>
      <a href="{{ site.church.map_url }}" target="_blank" rel="noopener noreferrer">Open in Google Maps</a>
    </p>

    <div class="map-container">
      <iframe
        title="Grace Korean Church location - Google Maps"
        src="https://www.google.com/maps?q=4915%2021st%20Ave%20A,%20Moline,%20IL%2061265&output=embed"
        width="100%"
        height="420"
        style="border:0; border-radius: 12px;"
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade">
      </iframe>
    </div>

    <h2>Contact</h2>

    <p>
      The quickest way to reach us is through our
      <a href="{{ site.social.facebook }}" target="_blank" rel="noopener noreferrer">Facebook page</a>.
      {% if site.church.phone != "" %}
      You can also call us at <a href="tel:{{ site.church.phone }}">{{ site.church.phone }}</a>.
      {% endif %}
    </p>

    <p>
      <a href="{{ '/en/about/' | relative_url }}" class="btn btn-outline">More about us</a>
    </p>

  </div>
</div>
```

- [ ] **Step 4: `en/about.md` 생성**

```markdown
---
layout: page
title: "About Us"
subtitle: "Grace Korean Church, Moline, Illinois"
description: "About Grace Korean Church — a Korean-speaking congregation serving the Quad Cities area from Moline, Illinois."
keywords: "Grace Korean Church about, Korean church Moline Illinois, Quad Cities Korean congregation"
permalink: /en/about/
alt_lang: ko
alt_url: /about/
---

## Who We Are

Grace Korean Church (은혜한인교회) is a Korean-speaking congregation in Moline,
Illinois, serving the Quad Cities area.

We gather to worship, to share life with one another, and to serve our neighbors.
Long-time residents and newcomers alike are welcome.

<!-- TODO: Replace with the church's own vision and welcome message once provided. -->

---

## Leadership

**Senior Pastor** — {{ site.pastor }}

<!-- TODO: Add pastor biography and photo once provided. -->

---

## Language

Our worship services are conducted **in Korean**. If you do not speak Korean but
would like to visit, please reach out through our
[Facebook page]({{ site.social.facebook }}) and we will do our best to help.

---

## Connect

- **Facebook** — [{{ site.church.name_en }}]({{ site.social.facebook }})
- **YouTube** — [Watch past services]({{ site.social.youtube }})

---

## Visit Us

**{{ site.church.address }}**

[Open in Google Maps]({{ site.church.map_url }})
```

- [ ] **Step 5: 테스트 실행 — 통과 확인**

Run: `script/test`

Expected: 영어 페이지 관련 6건 PASS

- [ ] **Step 6: 언어 토글 상호 이동 확인**

Run:

```bash
echo "── 한국어 홈 → ──"; grep -o 'nav-lang" hreflang="[a-z]*">[^<]*' _site/index.html
echo "── 영어 홈 → ──";   grep -o 'nav-lang" hreflang="[a-z]*">[^<]*' _site/en/index.html
echo "── 한국어 소개의 토글 링크 ──"; grep -o 'href="[^"]*" class="nav-link nav-lang"' _site/about/index.html
echo "── 영어 소개의 토글 링크 ──";   grep -o 'href="[^"]*" class="nav-link nav-lang"' _site/en/about/index.html
```

Expected: 한국어 소개는 `/en/about/`, 영어 소개는 `/about/` 을 가리킨다. 각 링크에 대응하는 파일이 `_site/` 에 실제로 존재하는지 확인한다.

- [ ] **Step 7: 커밋**

```bash
git add en/ script/test
git commit -m "$(cat <<'EOF'
영어 페이지 추가 (/en/, /en/about/)

영어권 방문자가 실제로 필요한 정보 — 예배가 한국어로 진행된다는 안내,
위치, 연락 방법 — 만 담은 두 페이지를 만들었다. 한국어 사이트의
미러가 아니다.

한/영 페이지를 alt_url로 상호 연결해 언어 토글과 hreflang이 양방향으로
동작한다.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: 히어로 플레이스홀더와 이미지 참조 정리

이미지 자산이 도착하기 전까지 사이트가 완성된 형태로 보이게 한다. 존재하지 않는 이미지 참조는 전부 제거하거나 대체한다.

**Files:**
- Modify: `assets/css/style.css`
- Modify: `_layouts/default.html`
- Modify: `_includes/header.html`, `_includes/footer.html`
- Modify: `_includes/website-schema.html`
- Create: `assets/images/README.md`
- Modify: `script/test`

**Interfaces:**
- Consumes: Task 3의 색상 변수
- Produces: `.hero-placeholder` CSS 클래스 — 배경 이미지 없이 네이비 그라데이션으로 히어로를 렌더링한다. Task 7·8의 페이지가 이미 이 클래스를 사용 중이다. `.site-logo-fallback` — 로고 파일 부재 시 교회명 텍스트 스타일.

- [ ] **Step 1: 깨진 이미지 참조 검증을 테스트에 추가**

`script/test`에 새 섹션 추가:

```bash
section "이미지 참조"
# CSS는 ../images/ 상대경로도 쓰므로 두 형태를 모두 잡는다.
# 절대경로만 보면 style.css의 참조를 통째로 놓친다.
missing=""
for ref in $(grep -rhoE '(/assets/images/|\.\./images/)[A-Za-z0-9._-]+' _site --include='*.html' --include='*.css' | sort -u); do
  [ -f "_site$ref" ] || missing="$missing $ref"
done
if [ -z "$missing" ]; then
  pass "깨진 이미지 참조 없음"
else
  fail "존재하지 않는 이미지 참조:"
  printf '      %s\n' $missing
fi
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `script/test`

Expected: `존재하지 않는 이미지 참조:` FAIL. `logo-text-color.png`, `logo-text-white.png`, `logo.png`, `og-image.jpg`, `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png` 가 나열된다.

- [ ] **Step 3: `assets/css/style.css`의 히어로 배경에서 이미지 제거**

`.hero-fullscreen` 규칙에서 `background: linear-gradient(...), url('/assets/images/hero-bg.webp');` 선언을 찾아 다음으로 교체:

```css
  background-color: var(--color-primary);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
```

모바일 미디어쿼리 안의 `.hero-fullscreen { background-image: ...url('/assets/images/hero-bg-mobile.webp') }` 선언에서도 `background-image` 줄을 삭제한다.

- [ ] **Step 4: 플레이스홀더 스타일 추가**

`assets/css/style.css` 맨 끝에 추가:

```css
/* ==========================================================================
   Hero placeholder — 사진 자산 도착 전까지 사용
   ========================================================================== */

/* 이미지가 준비되면 각 페이지에서 .hero-placeholder 클래스를 제거하고
   .hero-fullscreen에 background-image를 복원한다. */
.hero-fullscreen.hero-placeholder {
  background-image: linear-gradient(135deg, #1f4e79 0%, #2f6ea8 55%, #4a86c5 100%);
  background-color: #1f4e79;
}

.hero-fullscreen.hero-placeholder .hero-overlay {
  background: rgba(0, 0, 0, 0.15);
}

/* 로고 파일이 없는 동안 교회명을 텍스트로 표시 */
.site-logo-fallback {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-primary);
  letter-spacing: -0.02em;
}
```

- [ ] **Step 5: 크리티컬 CSS의 히어로 배경 교체**

`_layouts/default.html`의 `<style>` 블록에서 `.hero-fullscreen{...}` 규칙 안의

```
background:linear-gradient(rgba(0,0,0,.4),rgba(0,0,0,.4)),url('/assets/images/hero-bg.webp');
```

를 다음으로 교체:

```
background-color:#1f4e79;
```

같은 `<style>` 블록의 모바일 미디어쿼리에서

```
.hero-fullscreen{min-height:50vh;background-image:linear-gradient(rgba(0,0,0,.4),rgba(0,0,0,.4)),url('/assets/images/hero-bg-mobile.webp')}
```

를 다음으로 교체:

```
.hero-fullscreen{min-height:50vh}
```

그리고 `.hero-fullscreen{...}` 규칙 바로 뒤에 플레이스홀더 규칙을 삽입:

```
.hero-fullscreen.hero-placeholder{background-image:linear-gradient(135deg,#1f4e79 0%,#2f6ea8 55%,#4a86c5 100%);background-color:#1f4e79}.hero-fullscreen.hero-placeholder .hero-overlay{background:rgba(0,0,0,.15)}.site-logo-fallback{font-size:1.15rem;font-weight:800;color:var(--color-primary);letter-spacing:-.02em}
```

- [ ] **Step 6: 헤더 로고를 텍스트 폴백으로 교체**

`_includes/header.html`의 `<div class="site-logo">` 블록 전체를 다음으로 교체:

```liquid
    <div class="site-logo">
      <a href="{{ home_url | relative_url }}" aria-label="{{ site.church.name }}">
        <!-- TODO: 로고 파일(logo-text-color.png / logo-text-white.png)이 도착하면
             아래 텍스트 폴백을 지우고 img 태그로 교체할 것.
             다크모드 전환은 .site-logo-light / .site-logo-dark 클래스가 처리한다. -->
        <span class="site-logo-fallback">{{ site.church.name }}</span>
      </a>
    </div>
```

- [ ] **Step 7: 푸터 로고를 텍스트 폴백으로 교체**

`_includes/footer.html`의 `<div class="footer-logo">` 블록 전체를 다음으로 교체:

```liquid
      <!-- TODO: 로고 파일이 도착하면 img 태그로 교체할 것 -->
      <p class="footer-logo"><strong>{{ site.church.name }}</strong> ({{ site.church.name_en }})</p>
```

- [ ] **Step 8: 파비콘 링크를 주석 처리**

**주의 — HTML 주석으로는 안 된다.** Liquid는 `<!-- -->` 안의 `{{ }}`도 그대로 렌더링한다. HTML 주석으로 감싸면 존재하지 않는 파비콘 경로가 빌드 출력에 남아 이 태스크의 `깨진 이미지 참조 없음` 검사가 영구히 실패한다. Jekyll의 `{% comment %}...{% endcomment %}`를 쓴다 — 이건 빌드 단계에서 내용을 통째로 제거하면서 소스에는 복원용 코드가 남는다.

`_layouts/default.html`의 파비콘 3줄을 다음으로 교체:

```html
  <!-- TODO: 파비콘 자산(favicon-16x16.png / favicon-32x32.png / apple-touch-icon.png)이
       도착하면 아래 링크를 복원할 것
  <link rel="icon" type="image/png" sizes="32x32" href="{{ '/assets/images/favicon-32x32.png' | relative_url }}">
  <link rel="icon" type="image/png" sizes="16x16" href="{{ '/assets/images/favicon-16x16.png' | relative_url }}">
  <link rel="apple-touch-icon" sizes="180x180" href="{{ '/assets/images/apple-touch-icon.png' | relative_url }}">
  -->
```

- [ ] **Step 9: OG·트위터 이미지를 조건부로 변경**

`og:image` 블록(`{% if page.image %}` … `{% endif %}` 와 `og:image:width`/`height` 포함)을 다음으로 교체:

```html
  {%- if page.image %}
  <meta property="og:image" content="{{ page.image | absolute_url }}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  {%- endif %}
```

`twitter:image` 블록을 다음으로 교체:

```html
  {%- if page.image %}
  <meta name="twitter:image" content="{{ page.image | absolute_url }}">
  {%- endif %}
```

- [ ] **Step 10: `website-schema.html`의 로고 참조 제거**

`_includes/website-schema.html`의 `publisher` 블록을 다음으로 교체:

```liquid
  "publisher": {
    "@type": "Organization",
    "name": "{{ site.church.name }}"
  },
```

- [ ] **Step 11: `assets/images/README.md` 생성**

```markdown
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
- `index.md`, `en/index.md` — `hero-placeholder` 클래스 제거

변경 후 `script/test` 를 실행해 깨진 참조가 없는지 확인하세요.
```

- [ ] **Step 12: 테스트 실행 — 통과 확인**

Run: `script/test`

Expected: `깨진 이미지 참조 없음` PASS. **전체 검증 통과 (`모든 검증 통과`)**

- [ ] **Step 13: 시각 확인**

Run: `bundle exec jekyll serve --port 4000`

브라우저에서 `http://localhost:4000/` 과 `http://localhost:4000/en/` 을 연다. 확인 항목:

- 히어로가 네이비 그라데이션으로 채워지고 텍스트가 읽힌다
- 헤더에 교회명이 텍스트로 표시된다
- 언어 토글이 동작하고 되돌아온다
- 브라우저 콘솔에 404 오류가 없다
- 다크모드 토글 시 대비가 유지된다
- 창을 375px 폭으로 줄여도 레이아웃이 깨지지 않고 햄버거 메뉴가 동작한다

확인 후 `Ctrl+C`로 서버를 종료한다.

- [ ] **Step 14: 커밋**

```bash
git add assets/css/style.css assets/images/README.md _layouts/default.html _includes/header.html _includes/footer.html _includes/website-schema.html script/test
git commit -m "$(cat <<'EOF'
이미지 자산 부재 상태에서도 완성된 형태로 보이게 처리

히어로를 네이비 그라데이션 플레이스홀더로 대체하고, 로고는 교회명
텍스트로 폴백했다. 존재하지 않는 파비콘·OG 이미지 참조는 주석으로
남겨 자산 도착 시 되살릴 수 있게 했다.

깨진 이미지 참조를 검출하는 assertion을 테스트에 추가했다.

assets/images/README.md에 교회에서 받을 파일 규격과 반영 방법을
정리했다.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: 첫 소식 작성

소식 기능이 실제로 동작하는지 확인할 수 있는 글 하나를 쓴다.

**Files:**
- Create: `_posts/2026-07-29-website-launch.md`
- Modify: `script/test`

**Interfaces:**
- Consumes: Task 7의 `news.html`, 템플릿의 `_layouts/post.html`
- Produces: `/news/2026/07/29/website-launch/` URL

- [ ] **Step 1: 소식 검증을 테스트에 추가**

`script/test`의 `section "출력물"` 블록에 추가:

```bash
assert_built "news/2026/07/29/website-launch/index.html" "소식 글 생성됨"
assert_contains "_site/news/index.html" "홈페이지를 열었습니다" "소식 목록에 글 노출됨"
assert_contains "_site/index.html" "홈페이지를 열었습니다" "홈에 최근 소식 노출됨"
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `script/test`

Expected: 위 3건 FAIL

- [ ] **Step 3: `_posts/2026-07-29-website-launch.md` 생성**

```markdown
---
title: "은혜한인교회 홈페이지를 열었습니다"
date: 2026-07-29
category: "공지"
tags: ["홈페이지", "안내"]
summary: "은혜한인교회 홈페이지를 새로 열었습니다. 예배 안내와 오시는 길, 교회 소식을 이곳에서 확인하실 수 있습니다."
---

은혜한인교회 홈페이지를 열었습니다.

앞으로 이곳에서 교회 소식과 공지를 전해 드리겠습니다. 예배 안내와 찾아오시는 길도 홈페이지에서 확인하실 수 있습니다.

## 무엇을 보실 수 있나요

- [교회 소개]({{ '/about/' | relative_url }}) — 은혜한인교회가 어떤 공동체인지
- [예배 안내]({{ '/services/' | relative_url }}) — 예배 시간과 처음 오시는 분 안내
- [찾아오시는 길]({{ '/visit/' | relative_url }}) — 주소와 지도

영어권 가족이나 이웃에게는 [English 페이지]({{ '/en/' | relative_url }})를 안내해 주세요.

## 함께 채워 주세요

홈페이지는 이제 시작입니다. 교회 사진, 사역 소개, 행사 소식 등 함께 채워 갈 내용이 많습니다.

추가했으면 하는 내용이나 잘못된 정보를 발견하시면 교회 [페이스북]({{ site.social.facebook }})으로 알려 주세요.
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `script/test`

Expected: 소식 관련 3건 PASS. 전체 통과.

- [ ] **Step 5: 내부 링크 무결성 검사를 테스트에 추가**

모든 페이지가 갖춰진 지금 시점에 내부 링크가 실제 파일을 가리키는지 자동 검사한다. `script/test`의 `section "이미지 참조"` 블록 아래에 추가:

```bash
section "내부 링크"
broken=""
# href="/..." 형태의 내부 링크만 추출 (외부 URL·앵커·mailto·tel 제외)
for link in $(grep -rhoE 'href="/[^"#]*"' _site --include='*.html' \
                | sed 's/href="//; s/"$//' | sort -u); do
  case "$link" in
    *.xml|*.txt|*.css|*.js|*.png|*.jpg|*.jpeg|*.webp|*.ico) target="_site$link" ;;
    */) target="_site${link}index.html" ;;
    *)  target="_site$link" ;;
  esac
  [ -e "$target" ] || broken="$broken $link"
done
if [ -z "$broken" ]; then
  pass "깨진 내부 링크 없음"
else
  fail "깨진 내부 링크:"
  printf '      %s\n' $broken
fi
```

- [ ] **Step 6: 테스트 실행 — 링크 검사 확인**

Run: `script/test`

Expected: `깨진 내부 링크 없음` PASS

FAIL이 나면 스크립트가 깨진 경로를 나열한다. 흔한 원인은 `permalink`와 링크에 쓴 경로가 어긋난 경우다. 해당 페이지의 front matter `permalink`와 이를 참조하는 링크를 대조해 맞춘다.

- [ ] **Step 7: 커밋**

```bash
git add _posts/2026-07-29-website-launch.md script/test
git commit -m "$(cat <<'EOF'
사이트 개설 안내 소식 추가 및 내부 링크 검사

소식 목록·개별 글·홈 최근소식 섹션이 실제로 동작하는지 확인할 수
있는 첫 글을 작성했다.

모든 페이지가 갖춰졌으므로 내부 링크가 실제 파일을 가리키는지
검사하는 assertion을 추가했다.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: GitHub Actions 배포와 문서

배포 파이프라인을 만들고 README를 재작성한 뒤 실제로 배포한다.

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md` (전체 교체)

**Interfaces:**
- Consumes: Task 1의 `Gemfile.lock`(x86_64-linux 포함), `.ruby-version`
- Produces: `main` 푸시 시 자동 배포되는 파이프라인

- [ ] **Step 1: `.github/workflows/deploy.yml` 생성**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

# 배포는 동시에 하나만. 진행 중인 배포는 취소하지 않는다.
concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: .ruby-version
          bundler-cache: true

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Build site
        run: bundle exec jekyll build --trace
        env:
          JEKYLL_ENV: production

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

`ruby-version: .ruby-version` 은 저장소의 `.ruby-version` 파일(`3.4.1`)을 읽는다. 로컬과 CI의 Ruby 버전이 자동으로 일치한다.

- [ ] **Step 2: 워크플로 YAML 문법 검증**

Run:

```bash
ruby -ryaml -e 'YAML.load_file(".github/workflows/deploy.yml"); puts "YAML 유효"'
```

Expected: `YAML 유효`

- [ ] **Step 3: `README.md` 전체 교체**

````markdown
# 은혜한인교회 웹사이트 (Grace Korean Church)

미국 일리노이주 몰린(Quad Cities) 은혜한인교회의 공식 웹사이트입니다.
Jekyll로 만들었고 GitHub Actions를 통해 GitHub Pages에 배포됩니다.

- **사이트**: https://grace-korean-church.github.io/
- **페이스북**: https://www.facebook.com/GKC.Moline/
- **유튜브**: https://www.youtube.com/@gracekoreanchurchassemblyo5929

## 구조

```
_config.yml              사이트·교회 정보 (교회 정보의 유일한 출처)
_data/i18n.yml           한/영 UI 문구 사전
_layouts/                default · page · post 레이아웃
_includes/               헤더 · 푸터 · 구조화 데이터(JSON-LD)
_posts/                  소식 & 공지
assets/css/style.css     전체 스타일시트
assets/js/               테마 토글 · 모바일 메뉴 · GA 이벤트
assets/images/           이미지 자산 (README.md에 규격 정리)
index.md                 홈
about.md services.md visit.md   한국어 페이지
en/                      영어 페이지
news.html                소식 목록
script/test              빌드 검증 스크립트
docs/superpowers/        설계 문서 · 구현 계획
```

## 로컬 개발

```bash
bundle install
bundle exec jekyll serve
```

`http://localhost:4000` 에서 확인합니다.

## 검증

변경 후에는 반드시 검증 스크립트를 실행합니다.

```bash
script/test
```

빌드 성공 여부, 페이지 생성 여부, 깨진 이미지 참조, 이중 언어 메타데이터를
확인합니다.

## 배포

`main` 브랜치에 푸시하면 GitHub Actions가 자동으로 빌드·배포합니다.

```bash
git push origin main
```

진행 상황은 저장소의 **Actions** 탭에서 볼 수 있습니다. 빌드가 실패하면
직전 배포본이 그대로 유지되므로 사이트가 깨지지 않습니다.

### 최초 1회 설정

저장소 **Settings → Pages → Build and deployment → Source** 를
**`GitHub Actions`** 로 지정해야 합니다. 이 설정을 하지 않으면 워크플로가
성공해도 사이트가 갱신되지 않습니다.

## 소식 추가

`_posts/` 에 `YYYY-MM-DD-제목.md` 형식으로 파일을 만듭니다.

```markdown
---
title: "소식 제목"
date: 2026-08-02
category: "공지"
tags: ["태그"]
summary: "목록에 표시될 한 줄 요약"
---

본문을 씁니다.
```

**교인 이름을 쓸 때는 `김*수` 형태로 가운데 글자를 마스킹합니다.**
홈페이지는 검색엔진에 공개됩니다.

## 이중 언어

한국어가 기본이고 영어는 `/en/` 아래 핵심 페이지만 제공합니다.

- UI 문구(네비게이션·푸터·버튼)는 `_data/i18n.yml` 에서 관리합니다
- 페이지 언어는 `_config.yml` 의 `defaults` 가 자동으로 지정합니다
  (`en/` 하위는 영어, 나머지는 한국어)
- 대응하는 다른 언어 페이지가 있으면 front matter에 `alt_lang` 과 `alt_url` 을
  적습니다. 언어 토글과 `hreflang` 이 자동으로 연결됩니다

영어 페이지를 늘리려면 `en/` 아래에 파일을 추가하고 양쪽 `alt_url` 을 서로
걸어주면 됩니다.

## 커스텀 도메인 연결

도메인이 준비되면:

1. 저장소 루트에 `CNAME` 파일을 만들고 도메인만 한 줄 적습니다
2. `_config.yml` 의 `url` 을 새 도메인으로 바꿉니다
3. DNS에서 `grace-korean-church.github.io` 로 CNAME 레코드를 만듭니다
4. **Settings → Pages** 에서 도메인을 등록하고 HTTPS를 켭니다

`baseurl` 은 계속 빈 문자열로 둡니다.

## 남은 작업

`TODO:` 로 표시된 항목들입니다.

```bash
grep -rn "TODO" --include="*.md" --include="*.html" --include="*.yml" . \
  | grep -v "^./docs/" | grep -v "^./_site/"
```

- 설립 연도, 교단 정식 표기
- 전체 예배 시간표
- 전화번호, 이메일
- 교회 표어 / 연간 주제
- 담임목사 약력
- 교회 소개글 본문
- 이미지 자산 (`assets/images/README.md` 참고)
- 정확한 교회 좌표
- Google Analytics 측정 ID (`_config.yml` 의 `google_analytics`)
````

- [ ] **Step 4: 전체 검증**

Run: `script/test`

Expected: 모든 항목 PASS, 마지막 줄에 `모든 검증 통과`

- [ ] **Step 5: TODO 목록 확인**

Run:

```bash
grep -rn "TODO" --include="*.md" --include="*.html" --include="*.yml" . \
  | grep -v "^./docs/" | grep -v "^./_site/"
```

Expected: 남은 작업이 파일·줄 번호와 함께 나열된다. README의 "남은 작업" 절과 대조해 빠진 항목이 없는지 확인한다.

- [ ] **Step 6: 커밋**

```bash
git add .github/workflows/deploy.yml README.md
git commit -m "$(cat <<'EOF'
GitHub Actions 배포 워크플로 및 README 추가

로컬과 동일한 Jekyll 버전으로 빌드하도록 ruby/setup-ruby가
.ruby-version을 읽게 했다. GitHub Pages 기본 빌드를 쓰면 Jekyll
3.10에 묶여 로컬(4.4)과 어긋난다.

README에 검증 스크립트 사용법, 소식 작성 시 실명 마스킹 규칙,
커스텀 도메인 연결 절차, 남은 TODO를 정리했다.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 7: 원격 저장소에 푸시**

```bash
git push -u origin main
```

- [ ] **Step 8: Pages 소스 설정 (사용자 작업)**

이 단계는 웹 UI 작업이라 자동화할 수 없다. 사용자에게 다음을 요청하고 완료 확인을 기다린다:

> GitHub에서 `grace-korean-church/grace-korean-church.github.io` 저장소를 열고
> **Settings → Pages → Build and deployment → Source** 를
> **`GitHub Actions`** 로 바꿔 주세요.

- [ ] **Step 9: 배포 확인**

Run:

```bash
gh run list --limit 3
```

Expected: 최근 워크플로가 `completed  success`

실패했다면 로그를 확인한다:

```bash
gh run view --log-failed
```

- [ ] **Step 10: 실제 사이트 응답 확인**

Run:

```bash
for path in / /about/ /services/ /visit/ /news/ /en/ /en/about/; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "https://grace-korean-church.github.io$path")
  printf '  %s  %s\n' "$code" "$path"
done
```

Expected: 모든 경로가 `200`

배포 직후에는 전파에 1~2분 걸릴 수 있다. 404가 나오면 잠시 후 다시 실행한다.

---

## 완료 기준

전체 태스크가 끝나면 다음이 모두 성립해야 한다.

1. `script/test` 가 모든 항목 PASS로 종료한다
2. `grep -riE '페낭|penang|pkc1994|BFEVR|이충원|Menara|Tanjung' _site` 결과가 없다
3. `https://grace-korean-church.github.io/` 의 7개 경로가 모두 200을 반환한다
4. 한국어 홈과 영어 홈이 각각 `lang="ko"` / `lang="en"` 을 출력하고 서로 `hreflang` 으로 연결된다
5. `_site/index.html` 에 `googletagmanager` 문자열이 없다
6. 브라우저 콘솔에 404가 없다
7. 375px 폭에서 레이아웃이 깨지지 않고, 다크모드에서 네이비 대비가 유지된다
