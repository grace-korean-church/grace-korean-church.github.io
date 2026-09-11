# SEO · GEO · AEO 보강 설계

- **작성일**: 2026-09-11
- **저장소**: `grace-korean-church/grace-korean-church.github.io`
- **선행 문서**: `2026-07-29-grace-korean-church-site-design.md`, `2026-09-11-worship-videos-design.md`

## 1. 목표

검색 엔진(SEO), 생성형 AI 검색(GEO), 답변 엔진(AEO)이 은혜한인교회를 정확히
찾고 인용하게 한다. 기존 기반(제목·설명, canonical, hreflang, Open Graph, Church
구조화 데이터, sitemap, robots, RSS)은 유지하고 빈 곳만 채운다.

## 2. 점검 결과

| 항목 | 상태 | 판단 |
|---|---|---|
| 홈 `<title>` | `은혜한인교회 \| 은혜한인교회 (Grace Korean Church)` | 중복. 지역 키워드 없음 |
| FAQ 스키마 | 홈에 JSON-LD만 있고 화면에 Q&A 없음 | 구글은 2026-05-07부터 FAQ 리치 결과를 표시하지 않는다. 스키마는 유효하나 효과 없음. 화면 Q&A가 AEO·GEO에 필요 |
| 소식 글 | Article 스키마 없음 | 게시일·수정일 전달 안 됨 |
| Church·WebSite 스키마 | `@id` 없이 따로 존재 | 연결 필요. 전화번호 국제 형식 아님 |
| 예배 영상 | VideoObject 없음 | 동영상 검색·AI 인용 대상에서 빠짐 |
| 404 | 없음 | GitHub 기본 화면 |
| 사이트 인증 | 구글·네이버·Bing 메타태그 없음 | `_config.yml`로 주입 가능하게 |
| AI 크롤러 | robots.txt `*` 허용 | 명시 없음. `llms.txt` 없음 |
| 히어로 이미지 preload | 모든 페이지에서 출력 | 홈 외 페이지 낭비 + 콘솔 경고 |
| 영상 썸네일 | 전부 `loading="lazy"` | 첫 줄 LCP 지연 |
| sitemap `lastmod` | 페이지는 빌드 시각 | 매 배포마다 "전부 변경"으로 보임 |

## 3. 결정

### 3.1 제목

- 레이아웃에 `page.seo_title` 지원. 있으면 `<title>`·`og:title`·`twitter:title`에
  그대로 쓰고, 없으면 기존 규칙(`페이지 제목 | 사이트 제목`).
- 홈: `은혜한인교회 | 몰린·Quad Cities 한인교회 (Grace Korean Church, Moline IL)`
- 영어 홈: `Grace Korean Church | Korean Church in Moline, IL (Quad Cities)`
- 나머지 페이지는 그대로.

### 3.2 화면에 보이는 FAQ

- 홈 "처음 오시는 분께" 섹션 아래에 "자주 묻는 질문" 섹션을 넣는다. 질문·답은
  `_data/faq.yml`(ko/en)에 두고, 화면과 FAQ 스키마가 같은 데이터를 읽는다.
  두 곳이 어긋나는 일이 구조적으로 없어진다.
- 질문 5개(기존 스키마 내용 그대로): 예배 시간, 위치, 처음 방문, 언어, 교단.
  답은 한 문단, 예배 시간 등 사실은 `_config.yml` 값을 쓴다.
- 영어 홈에도 같은 섹션(영어 데이터).
- 마크업: `<section>` + `<h2>` + `<details>`/`<summary>` 대신 항상 펼쳐진
  `<h3>` 질문 + `<p>` 답. 접힌 내용은 AI·검색 엔진이 덜 신뢰한다.
- FAQ 스키마(`faq-schema.html`)는 `_data/faq.yml`을 읽도록 바꾸고 홈·영어 홈에
  출력한다. 구글 효과는 없지만 Bing·AI 크롤러가 읽고, 비용이 없다.

### 3.3 구조화 데이터 정리

- Church 스키마에 `"@id": "{{ site.url }}/#church"` 추가. WebSite 스키마의
  `publisher`를 `{"@id": ".../#church"}`로 연결.
- `telephone`을 `+1-309-764-3550` 형식으로(`site.church.phone`에서 변환).
- `openingHoursSpecification`에 수요 오전 성경공부(10:00–11:00) 추가. 예배
  안내 페이지와 맞춘다.
- `hasMap`: `site.church.map_url`.
- `areaServed`: Moline, Quad Cities.
- 소식 글(`post.html`): `NewsArticle` 스키마. `headline`, `datePublished`,
  `dateModified`(`last_modified_at` 있으면 그것, 없으면 `date`), `author`·
  `publisher`는 `#church` 참조, `inLanguage: ko`, `mainEntityOfPage`.
- 예배 영상: `ItemList` 안에 `VideoObject` 목록. 항목마다 `name`(날짜 제목),
  `description`(유튜브 원제목), `thumbnailUrl`, `uploadDate`, `embedUrl`
  (`youtube-nocookie.com/embed/<id>`), `contentUrl`(`youtube.com/watch?v=`),
  `publisher` `#church`. 한/영 페이지 모두.

### 3.4 404 페이지

- `404.html`, 레이아웃 `default`, `permalink: /404.html`, `sitemap: false`,
  `robots: noindex`. 한/영 안내 한 화면(GitHub Pages는 404 하나만 쓴다).
  홈·예배 안내·오시는 길 링크.
- sitemap에서 제외(`page.sitemap == false` 처리 추가).
- 레이아웃에 `page.robots` 지원: 있으면 `<meta name="robots">`에 그 값.

### 3.5 사이트 인증

`_config.yml`에 빈 값으로 추가하고, 레이아웃은 값이 있을 때만 출력한다.

```yaml
# 검색 엔진 사이트 소유 확인. 비워두면 출력하지 않는다.
google_site_verification: ""
naver_site_verification: ""
bing_site_verification: ""   # msvalidate.01
```

### 3.6 AI 크롤러 · llms.txt

- `robots.txt`에 GPTBot, ClaudeBot, Claude-Web, anthropic-ai, PerplexityBot,
  Google-Extended, Applebot-Extended, CCBot, Bytespider를 `Allow: /`로 명시.
  주석으로 "AI 검색에 교회 정보가 정확히 인용되길 원해 허용"을 적는다.
- `/llms.txt`(Jekyll 페이지, `layout: null`): 마크다운. 교회 한 줄 소개, 핵심
  사실(주소·전화·이메일·예배 시간·언어·교단·설립·SNS), 페이지 목록(절대 URL,
  한/영), FAQ 요약. 값은 전부 `_config.yml`·`_data/faq.yml`에서 가져와 다른
  페이지와 어긋나지 않게 한다.
- `<link rel="alternate" type="text/markdown" href="/llms.txt">`는 표준이 아니라
  넣지 않는다.

### 3.7 성능

- 히어로 이미지 preload를 `page.url == "/" or page.url == "/en/"`일 때만 출력.
- 영상 페이지 첫 3장 썸네일은 `loading="eager"`, 첫 장에 `fetchpriority="high"`.
  나머지는 lazy 유지.
- sitemap: 페이지 `lastmod`는 `last_modified_at`이 있을 때만 출력. 글은 그대로.

### 3.8 검증 (`script/test`)

- 새 섹션 "SEO": 
  - 홈 `<title>`이 새 문자열과 일치, `은혜한인교회 | 은혜한인교회` 없음
  - 홈에 `자주 묻는 질문` 문자열과 `<h3>` 질문 5개
  - `_site/404.html` 생성, `noindex` 포함, sitemap에 `/404.html` 없음
  - `_site/llms.txt` 생성, 주소·전화·`/videos/` 포함
  - robots.txt에 `GPTBot`
  - 인증 메타 미설정 시 `google-site-verification` 없음
  - 영상 페이지에 `"@type": "VideoObject"`, 소식 글에 `"@type": "NewsArticle"`
  - 홈 외 페이지(`/videos/`)에 `hero-bg.webp` preload 없음, 홈에는 있음
- 모든 페이지의 JSON-LD 블록을 Ruby `JSON.parse`로 파싱해 문법 오류가 없는지
  확인한다(홈, 영어 홈, 소식 글, 영상, 소개).

### 3.9 하지 않는 것

- 키워드 반복, 콘텐츠 양산, 유료 SEO 도구.
- `Speakable`, `Event` 스키마(매주 예배를 이벤트로 올리는 것은 구글 가이드
  위반 소지).
- 파비콘·매니페스트(로고 자산 대기 중, 별도 TODO 유지).
- sitemap의 hreflang 확장(페이지 `<link>`로 충분).

## 4. 사용자가 직접 할 일 (README에 기록)

1. Google Search Console 등록 → 인증 코드를 `google_site_verification`에.
2. 네이버 서치어드바이저 등록 → `naver_site_verification`에.
3. Bing Webmaster(선택) → `bing_site_verification`에.
4. Google 비즈니스 프로필의 주소(4915)와 사이트·간판(4815) 불일치 해소.
5. 페이스북·유튜브 채널 소개란에 사이트 주소 등록.
