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
_data/videos.yml         유튜브 영상 목록 (script/fetch-videos가 자동 갱신)
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
videos.html en/videos.html   예배 영상 (한/영)
script/test              빌드 검증 스크립트
script/fetch-videos      유튜브 채널 피드 수집 스크립트
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

## 예배 영상

`/videos/` 페이지는 `_data/videos.yml`을 보여줍니다. 이 파일은 손으로 고칠
필요가 없습니다.

- `.github/workflows/fetch-videos.yml`이 **매주 월·화 아침(시카고 기준)**
  유튜브 채널 RSS를 읽어 새 영상을 추가하고, 변경이 있으면 커밋한 뒤 배포를
  호출합니다.
- 바로 반영하고 싶으면 **Actions → Fetch YouTube videos → Run workflow**를
  누르거나, 로컬에서 `script/fetch-videos`를 돌려 커밋합니다.
- 채널에서 내린 영상은 자동으로 빠지지 않습니다. `_data/videos.yml`에서
  해당 항목을 지우면 됩니다.
- 피드는 최근 15편만 줍니다. 그보다 오래된 영상을 넣으려면 같은 형식으로
  항목을 직접 추가합니다.

**주의**: 저장소에 60일간 커밋이 없으면 GitHub가 예약 워크플로를 자동으로
멈춥니다. 매주 영상이 올라오면 봇 커밋이 활동으로 잡혀 계속 돌지만, 멈췄을
때는 Actions 탭에서 워크플로를 열어 **Enable workflow**를 누르면 됩니다.

## 검색 노출 (SEO · AI 검색)

사이트에 이미 들어 있는 것: 페이지별 제목·설명, 한/영 hreflang, Open Graph,
교회·기사·영상 구조화 데이터, sitemap, RSS, `llms.txt`(AI 크롤러용
요약), robots.txt의 AI 크롤러 허용.

**직접 하셔야 하는 일**

1. [Google Search Console](https://search.google.com/search-console)에 사이트를
   등록하고, HTML 태그 방식의 인증 코드를 `_config.yml`의
   `google_site_verification`에 넣습니다. 등록 후 sitemap 주소
   `https://grace-korean-church.github.io/sitemap.xml`을 제출합니다.
2. [네이버 서치어드바이저](https://searchadvisor.naver.com)에 등록하고 인증
   코드를 `naver_site_verification`에 넣습니다. 한인 검색은 네이버 비중이 큽니다.
3. (선택) Bing Webmaster Tools 인증 코드를 `bing_site_verification`에.
4. Google 비즈니스 프로필(지도)의 주소가 4915로 되어 있어 사이트·간판(4815)과
   다릅니다. 지역 검색은 이름·주소·전화 일치를 중시하므로 한쪽으로 맞춰야 합니다.
5. 페이스북·유튜브 채널 소개란에 사이트 주소를 넣습니다.

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

2026년 8월 16일자 주보를 반영해 설립일·표어·예배시간·연락처·교단·선교 현황이
모두 채워졌습니다. 남은 항목은 아래와 같습니다.

```bash
grep -rn "TODO" --include="*.md" --include="*.html" --include="*.yml" . \
  | grep -v "^./docs/" | grep -v "^./_site/"
```

- 교회 로고 (→ 헤더·푸터 워드마크, 파비콘 3종)
- 담임목사 사진과 약력
- 교회 건물 정확한 좌표 (현재는 몰린 시 기준 근사값)
- Google Analytics 측정 ID (`_config.yml` 의 `google_analytics`)

### 주보에서 의도적으로 제외한 것

주보에는 교인 실명이 다수 포함되어 있습니다 — 십일조·감사헌금 봉헌자 명단,
예배위원, 목장별 참석인원과 헌금액, 찬양대·주일학교 교사 성함.

**이 정보는 사이트에 넣지 않습니다.** 저장소와 사이트 모두 공개되어 검색엔진에
색인되며, 특히 헌금 내역은 개인의 재정 정보입니다. 소식 글을 쓸 때 이름이
꼭 필요하면 `김*수` 형태로 마스킹하세요.
- 오시는 길 상세 안내 (주요 도로, 주차 위치, 건물 입구)
- 부서별 예배(어린이부·학생부 등) 운영 여부
- 로고 · 파비콘 · 담임목사 사진 (현재 상태는 `assets/images/README.md` 참고)
- 정확한 교회 좌표
- Google Analytics 측정 ID (`_config.yml` 의 `google_analytics`)

교단은 하나님의성회(Assembly of God)로 확인되어 `about.md` 에 반영했습니다.
