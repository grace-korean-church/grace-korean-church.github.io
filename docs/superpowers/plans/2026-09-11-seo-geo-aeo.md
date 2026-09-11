# SEO · GEO · AEO 보강 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 검색 엔진·AI 검색·답변 엔진이 교회 정보를 정확히 찾고 인용하도록 제목, 화면 FAQ, 구조화 데이터, 404, 인증 태그, llms.txt, 성능을 보강한다.

**Architecture:** 사실 데이터는 `_config.yml`과 새 `_data/faq.yml` 한 곳에서 읽어 화면·스키마·llms.txt가 어긋나지 않게 한다. 레이아웃은 `seo_title`, `robots`, 인증 값을 조건부로 출력한다. 검증은 `script/test`에 "SEO" 섹션과 JSON-LD 파싱 검사를 추가한다.

**Tech Stack:** Jekyll 4.x · Liquid · Ruby(검증용 JSON 파싱)

**Spec:** `docs/superpowers/specs/2026-09-11-seo-geo-aeo-design.md`

## Global Constraints

- **작업 디렉토리**: `/Users/hyeongjinjang/workspace/grace-korean-church`
- **Jekyll 플러그인 추가 금지**
- **모든 내부 링크에 `relative_url`**, 스키마·llms.txt의 URL은 `absolute_url`
- **교회 사실(주소·전화·시간)은 `_config.yml`에서만** — 페이지에 직접 쓰지 않는다
- **검증은 `script/test`** — 모든 태스크 끝에 통과
- 커밋 메시지는 한국어, 제목 + 이유. 끝에:
  ```
  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01VzpFXUPKk27MZgudmDLP5T
  ```

---

## File Structure

| 파일 | 책임 |
|---|---|
| `_data/faq.yml` | 한/영 FAQ 질문·답 (화면·스키마·llms.txt 공용) |
| `_includes/faq-section.html` | 화면 FAQ 섹션 (lang 인자) |
| `_includes/faq-schema.html` | `_data/faq.yml` 기반 FAQPage JSON-LD |
| `_includes/video-schema.html` | VideoObject ItemList JSON-LD |
| `_layouts/default.html` | seo_title, robots, 인증 메타, 조건부 preload, `@id` |
| `_layouts/post.html` | NewsArticle JSON-LD |
| `_includes/website-schema.html` | publisher `@id` 연결 |
| `404.html`, `llms.txt`, `robots.txt`, `sitemap.xml` | 신규/수정 |
| `index.md`, `en/index.md` | seo_title, FAQ 섹션 include |
| `videos.html`, `en/videos.html` | 스키마 include, eager 썸네일 |
| `_config.yml` | 인증 값 3개 |
| `assets/css/style.css` | `.faq-*` 스타일 |
| `script/test` | "SEO" 섹션, JSON-LD 파싱 |
| `README.md` | 사용자가 할 일 |

---

### Task 1: 검증 먼저 — "SEO" 섹션과 JSON-LD 파싱 검사

**Files:** Modify `script/test` (`section "사이트 설정"` 앞에 삽입)

- [ ] **Step 1: 검증 추가**

```bash
section "SEO"
assert_contains "_site/index.html" "<title>은혜한인교회 | 몰린·Quad Cities 한인교회 (Grace Korean Church, Moline IL)</title>" "홈 제목에 지역 키워드"
assert_absent "_site/index.html" "은혜한인교회 | 은혜한인교회" "홈 제목 중복 없음"
assert_contains "_site/en/index.html" "<title>Grace Korean Church | Korean Church in Moline, IL (Quad Cities)</title>" "영어 홈 제목"
assert_contains "_site/index.html" "자주 묻는 질문" "홈에 FAQ 섹션"
faq_count=$(grep -c 'class="faq-question"' _site/index.html)
if [ "$faq_count" = "5" ]; then pass "홈 FAQ 질문 5개"; else fail "홈 FAQ 질문 수: $faq_count"; fi
assert_contains "_site/en/index.html" 'class="faq-question"' "영어 홈에 FAQ 섹션"
assert_built "404.html" "404 페이지 생성됨"
assert_contains "_site/404.html" 'content="noindex' "404 페이지 noindex"
assert_absent "_site/sitemap.xml" "/404.html" "sitemap에 404 없음"
assert_built "llms.txt" "llms.txt 생성됨"
assert_contains "_site/llms.txt" "Moline" "llms.txt에 주소"
assert_contains "_site/llms.txt" "/videos/" "llms.txt에 영상 페이지"
assert_contains "_site/robots.txt" "GPTBot" "robots.txt에 AI 크롤러 명시"
assert_absent "_site/index.html" "google-site-verification" "인증 미설정 시 메타 미출력"
assert_contains "_site/videos/index.html" '"@type": "VideoObject"' "영상 페이지 VideoObject"
assert_contains "_site/news/2026/07/29/website-launch/index.html" '"@type": "NewsArticle"' "소식 글 NewsArticle"
assert_contains "_site/index.html" '"@id": "https://grace-korean-church.github.io/#church"' "Church 스키마 @id"
assert_contains "_site/index.html" '"telephone": "+1-309-764-3550"' "전화번호 국제 형식"
assert_contains "_site/index.html" "hero-bg.webp" "홈에 히어로 preload"
assert_absent "_site/videos/index.html" "hero-bg.webp" "영상 페이지에 히어로 preload 없음"
assert_contains "_site/videos/index.html" 'fetchpriority="high"' "첫 썸네일 우선 로드"
# JSON-LD 문법 검사: 모든 <script type="application/ld+json"> 블록을 파싱한다
jsonld_bad=$(bundle exec ruby -rjson -e '
  bad = []
  %w[index.html en/index.html about/index.html videos/index.html en/videos/index.html news/2026/07/29/website-launch/index.html 404.html].each do |f|
    html = File.read("_site/#{f}")
    html.scan(%r{<script type="application/ld\+json">(.*?)</script>}m).each_with_index do |(block), i|
      JSON.parse(block)
    rescue JSON::ParserError => e
      bad << "#{f} 블록 #{i + 1}: #{e.message[0, 80]}"
    end
  end
  puts bad
' 2>&1)
if [ -z "$jsonld_bad" ]; then
  pass "JSON-LD 문법 오류 없음"
else
  fail "JSON-LD 문법 오류:"; printf '%s\n' "$jsonld_bad" | sed 's/^/      /'
fi

```

- [ ] **Step 2: 실패 확인** — `script/test 2>&1 | sed -n '/^.*SEO/,/사이트 설정/p'` → ✗ 다수.

---

### Task 2: 제목 · 인증 · robots 메타 · preload · 스키마 연결 (`default.html`, `website-schema.html`, `_config.yml`)

- [ ] **Step 1: `_config.yml`** — `google_analytics: ""` 아래에:

```yaml
# 검색 엔진 사이트 소유 확인 코드. 비워두면 메타태그를 출력하지 않는다.
# Google Search Console → 설정 → 소유권 확인 → HTML 태그의 content 값
google_site_verification: ""
# 네이버 서치어드바이저 → 사이트 관리 → 소유확인 → HTML 태그의 content 값
naver_site_verification: ""
# Bing Webmaster Tools → msvalidate.01 의 content 값
bing_site_verification: ""
```

- [ ] **Step 2: `default.html` 제목** — `<title>`, `meta name="title"`, `og:title`, `twitter:title` 네 곳의 `{% if page.title %}{{ page.title }} | {% endif %}{{ site.title }}`를 아래 캡처 변수로 교체. `<head>` 첫 줄(`<meta charset>` 앞)에:

```liquid
{%- capture page_title -%}{% if page.seo_title %}{{ page.seo_title }}{% elsif page.title %}{{ page.title }} | {{ site.title }}{% else %}{{ site.title }}{% endif %}{%- endcapture -%}
```
그리고 네 곳을 `{{ page_title }}`로.

- [ ] **Step 3: robots 메타** — 기존 `<meta name="robots" content="index, follow, …">`를:

```liquid
<meta name="robots" content="{{ page.robots | default: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' }}">
```
`<meta name="googlebot" content="index, follow">` 줄은 삭제(robots와 중복이며 noindex 페이지에서 모순).

- [ ] **Step 4: 인증 메타** — `<!-- Additional SEO -->` 위에:

```liquid
{%- if site.google_site_verification != "" %}
<meta name="google-site-verification" content="{{ site.google_site_verification }}">
{%- endif %}
{%- if site.naver_site_verification != "" %}
<meta name="naver-site-verification" content="{{ site.naver_site_verification }}">
{%- endif %}
{%- if site.bing_site_verification != "" %}
<meta name="msvalidate.01" content="{{ site.bing_site_verification }}">
{%- endif %}
```

- [ ] **Step 5: preload 조건부** — 두 `<link rel="preload" as="image"`를 `{%- if page.url == "/" or page.url == "/en/" %} … {%- endif %}`로 감싼다.

- [ ] **Step 6: Church 스키마** — `"@type": "Church",` 다음 줄에 `"@id": "{{ site.url }}{{ site.baseurl }}/#church",`. `telephone`을 `"+1-{{ site.church.phone }}"`로. `openingHoursSpecification`에 수요 10:00–11:00 항목(설명 `수요 성경공부·영어 성경공부 / Wednesday Bible Study`) 추가. `"description"` 앞에 `"hasMap": "{{ site.church.map_url }}", "areaServed": ["Moline, IL", "Quad Cities"],`.

- [ ] **Step 7: `website-schema.html`** — publisher를 `{ "@id": "{{ site.url }}{{ site.baseurl }}/#church" }`로. `inLanguage: ["ko", "en"]` 추가.

- [ ] **Step 8: `index.md`·`en/index.md` front matter** — `seo_title` 추가(3.1 문자열).

- [ ] **Step 9: 검증** — SEO 섹션 중 제목·@id·전화·preload·인증 항목 ✓. 커밋: `제목·인증 메타·스키마 연결 보강`.

---

### Task 3: 화면 FAQ + 스키마 데이터 공유

- [ ] **Step 1: `_data/faq.yml`**

```yaml
# 자주 묻는 질문. 홈 화면 FAQ 섹션, FAQ 구조화 데이터, llms.txt가 모두 이 파일을 읽는다.
# 예배 시간이 바뀌면 services.md, _layouts/default.html(openingHoursSpecification)과 함께 고칠 것.
ko:
  title: "자주 묻는 질문"
  items:
    - q: "예배 시간은 언제인가요?"
      a: "주일 예배는 오전 10시 30분에 드리고, 교회학교도 같은 시간에 모입니다. 주중에는 수요 성경공부(오전 10시·저녁 7시), 영어 성경공부(수요일 오전 10시), 금요 기도회(저녁 7시)가 있습니다."
    - q: "교회는 어디에 있나요?"
      a: "은혜한인교회(Grace Korean Church)는 4815 21st Ave A, Moline, IL 61265에 있습니다. 미국 일리노이주 몰린, Quad Cities 지역입니다."
    - q: "처음 방문해도 괜찮을까요?"
      a: "처음 오시는 모든 분을 환영합니다. 예약이나 사전 연락 없이 편하게 오시면 됩니다. 특별한 격식 없이 편안한 옷차림으로 오셔도 좋고, 주일 예배 후에는 친교 시간이 있습니다."
    - q: "예배는 한국어로 드리나요?"
      a: "주일 예배는 한국어로 드리며 영어 통역이 함께 제공됩니다. 영어권 성도를 위한 영어 성경공부 모임이 수요일 오전 10시에 따로 있습니다."
    - q: "어느 교단 소속인가요?"
      a: "은혜한인교회는 하나님의성회(Assemblies of God) 소속이며, 1982년 8월 15일에 설립되었습니다."
en:
  title: "Frequently Asked Questions"
  items:
    - q: "When are the services?"
      a: "Sunday worship is at 10:30 AM, and Sunday school meets at the same time. During the week we have Wednesday Bible study (10:00 AM and 7:00 PM), an English Bible study on Wednesday at 10:00 AM, and a Friday prayer meeting at 7:00 PM."
    - q: "Where is the church?"
      a: "Grace Korean Church is at 4815 21st Ave A, Moline, IL 61265, in the Quad Cities area of Illinois."
    - q: "Can I just show up as a first-time visitor?"
      a: "Yes. Everyone is welcome, and no reservation or advance contact is needed. Dress is casual, and there is a fellowship meal after Sunday worship."
    - q: "Are the services in Korean?"
      a: "Sunday worship is held in Korean with English interpretation. There is also a separate English Bible study on Wednesday mornings at 10:00 AM."
    - q: "What denomination is the church?"
      a: "Grace Korean Church is part of the Assemblies of God and was founded on August 15, 1982."
```

주소 문자열은 `_config.yml`과 같아야 한다. (Liquid를 데이터 파일에서 쓸 수 없으므로 여기만 예외적으로 직접 쓴다. `script/test`가 `site.church.address`와 일치하는지 검사한다 — Step 5.)

- [ ] **Step 2: `_includes/faq-section.html`**

```liquid
{%- assign faq = site.data.faq[include.lang] -%}
<section class="section-fullwidth section-white faq-section" id="faq">
  <div class="container">
    <h2 class="text-center">{{ faq.title }}</h2>
    <div class="faq-list">
      {%- for item in faq.items %}
      <div class="faq-item">
        <h3 class="faq-question">{{ item.q }}</h3>
        <p class="faq-answer">{{ item.a }}</p>
      </div>
      {%- endfor %}
    </div>
  </div>
</section>
```

- [ ] **Step 3: `_includes/faq-schema.html`** 전체 교체

```liquid
<!-- FAQ 구조화 데이터. 구글은 2026-05부터 FAQ 리치 결과를 표시하지 않지만
     Bing·AI 크롤러는 읽는다. 내용은 _data/faq.yml — 화면 FAQ와 같은 출처. -->
{%- assign faq = site.data.faq[page.lang | default: 'ko'] %}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "inLanguage": "{{ page.lang | default: 'ko' }}",
  "mainEntity": [
    {%- for item in faq.items %}
    {
      "@type": "Question",
      "name": {{ item.q | jsonify }},
      "acceptedAnswer": { "@type": "Answer", "text": {{ item.a | jsonify }} }
    }{% unless forloop.last %},{% endunless %}
    {%- endfor %}
  ]
}
</script>
```

`default.html`의 `{% if page.url == "/" %}{% include faq-schema.html %}{% endif %}`를 `{% if page.url == "/" or page.url == "/en/" %}`로.

- [ ] **Step 4: 홈에 삽입** — `index.md`의 "Intro Section" 뒤, "Recent News" 앞에 `{% include faq-section.html lang="ko" %}`. `en/index.md`는 `</div></div>`(page-container 닫힘) 뒤에 `{% include faq-section.html lang="en" %}`.

- [ ] **Step 5: 스타일** — `style.css`의 `.highlight-box` 앞에:

```css
/* 자주 묻는 질문 — 항상 펼쳐 둔다. 접힌 답은 검색·AI가 덜 신뢰한다. */
.faq-list {
  max-width: 800px;
  margin: var(--space-lg) auto 0;
}

.faq-item {
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-border);
}

.faq-item:last-child {
  border-bottom: 0;
}

.faq-question {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: var(--space-xs);
}

.faq-answer {
  color: var(--color-text-muted);
  line-height: 1.7;
}
```

- [ ] **Step 6: 주소 일치 검사** — `script/test` SEO 섹션에 추가:

```bash
addr=$(grep -m1 '^  address:' _config.yml | sed 's/.*address: *"\(.*\)"/\1/' | sed 's/, USA$//')
if grep -qF "$addr" _data/faq.yml; then pass "FAQ 주소가 _config.yml과 일치"; else fail "FAQ 주소 불일치: $addr"; fi
```

- [ ] **Step 7: 검증·커밋** — `홈에 자주 묻는 질문 섹션 추가, FAQ 스키마와 데이터 공유`.

---

### Task 4: NewsArticle · VideoObject · 404 · llms.txt · robots · sitemap

- [ ] **Step 1: `post.html`** — `<div class="container post-container">` 앞에:

```liquid
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": {{ page.title | jsonify }},
  "description": {{ page.summary | default: page.excerpt | strip_html | strip | jsonify }},
  "datePublished": "{{ page.date | date_to_xmlschema }}",
  "dateModified": "{{ page.last_modified_at | default: page.date | date_to_xmlschema }}",
  "inLanguage": "ko",
  "mainEntityOfPage": "{{ page.url | absolute_url }}",
  "author": { "@id": "{{ site.url }}{{ site.baseurl }}/#church" },
  "publisher": { "@id": "{{ site.url }}{{ site.baseurl }}/#church" },
  "image": "{{ page.image | default: '/assets/images/og-image.jpg' | absolute_url }}"
}
</script>
```

- [ ] **Step 2: `_includes/video-schema.html`**

```liquid
{%- comment -%}
  예배 영상 목록 구조화 데이터. include 인자 lang(ko|en). 제목 규칙은 videos.html과 같다.
{%- endcomment -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": {% if include.lang == 'en' %}"Worship Videos"{% else %}"예배 영상"{% endif %},
  "itemListElement": [
    {%- for v in site.data.videos %}
    {%- assign epoch = v.published | date: "%s" | plus: 0 -%}
    {%- if include.lang == 'en' -%}
      {%- assign day = epoch | date: "%B %-d, %Y" -%}
    {%- else -%}
      {%- assign day = epoch | date: "%Y년 %-m월 %-d일" -%}
    {%- endif -%}
    {%- assign lower = v.title | downcase -%}
    {%- if lower contains "worship" -%}
      {%- if include.lang == 'en' -%}{%- capture name -%}Sunday Worship · {{ day }}{%- endcapture -%}{%- else -%}{%- capture name -%}{{ day }} 주일 예배{%- endcapture -%}{%- endif -%}
    {%- else -%}
      {%- assign name = v.title -%}
    {%- endif %}
    {
      "@type": "ListItem",
      "position": {{ forloop.index }},
      "item": {
        "@type": "VideoObject",
        "name": {{ name | jsonify }},
        "description": {{ v.title | jsonify }},
        "thumbnailUrl": "https://i.ytimg.com/vi/{{ v.id }}/hqdefault.jpg",
        "uploadDate": "{{ v.published }}",
        "embedUrl": "https://www.youtube-nocookie.com/embed/{{ v.id }}",
        "contentUrl": "https://www.youtube.com/watch?v={{ v.id }}",
        "inLanguage": "ko",
        "publisher": { "@id": "{{ site.url }}{{ site.baseurl }}/#church" }
      }
    }{% unless forloop.last %},{% endunless %}
    {%- endfor %}
  ]
}
</script>
```

`videos.html`·`en/videos.html`의 `<div class="container">` 앞에 `{% include video-schema.html lang="ko" %}` / `lang="en"`. 썸네일 `<img>`를:

```liquid
<img src="…" alt="" width="480" height="360"{% if forloop.index <= 3 %} loading="eager"{% if forloop.first %} fetchpriority="high"{% endif %}{% else %} loading="lazy"{% endif %}>
```

- [ ] **Step 3: `404.html`**

```liquid
---
layout: default
title: "페이지를 찾을 수 없습니다"
seo_title: "페이지를 찾을 수 없습니다 | 은혜한인교회"
permalink: /404.html
sitemap: false
robots: "noindex, follow"
---

<div class="container page-container">
  <header class="page-header">
    <h1 class="page-title">페이지를 찾을 수 없습니다</h1>
    <p class="page-subtitle">Page not found</p>
  </header>
  <div class="page-content">
    <p>주소가 바뀌었거나 잘못 입력된 것 같습니다. 아래에서 원하시는 페이지로 이동해 주세요.</p>
    <p>The page you are looking for does not exist. Please use one of the links below.</p>
    <p>
      <a href="{{ '/' | relative_url }}" class="btn btn-primary">홈 · Home</a>
      <a href="{{ '/services/' | relative_url }}" class="btn btn-ghost">예배 안내</a>
      <a href="{{ '/visit/' | relative_url }}" class="btn btn-ghost">오시는 길</a>
      <a href="{{ '/en/' | relative_url }}" class="btn btn-ghost">English</a>
    </p>
  </div>
</div>
```

- [ ] **Step 4: `sitemap.xml`** — 페이지 루프의 `unless`에 `or page.sitemap == false or page.url contains 'llms.txt'` 추가. 페이지 `lastmod`는 `{% if page.last_modified_at %}<lastmod>…</lastmod>{% endif %}`만 남긴다(빌드 시각 폴백 제거).

- [ ] **Step 5: `robots.txt`**

```
---
layout: null
---
User-agent: *
Allow: /

# AI 검색·답변 엔진에 교회 정보가 정확히 인용되기를 원하므로 명시적으로 허용한다.
User-agent: GPTBot
User-agent: ChatGPT-User
User-agent: OAI-SearchBot
User-agent: ClaudeBot
User-agent: Claude-Web
User-agent: anthropic-ai
User-agent: PerplexityBot
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: CCBot
User-agent: Bytespider
Allow: /

Sitemap: {{ site.url }}{{ site.baseurl }}/sitemap.xml
```

- [ ] **Step 6: `llms.txt`**

```liquid
---
layout: null
permalink: /llms.txt
---
{%- assign faq_ko = site.data.faq.ko -%}
{%- assign faq_en = site.data.faq.en -%}
# {{ site.church.name }} ({{ site.church.name_en }})

> {{ site.description }} {{ site.motto_en }}.

- 주소 / Address: {{ site.church.address }}
- 지도 / Map: {{ site.church.map_url }}
- 전화 / Phone: +1-{{ site.church.phone }} (휴대전화 / Mobile: +1-{{ site.church.mobile }})
- 이메일 / Email: {{ site.church.email }}
- 담임목사 / Senior Pastor: {{ site.pastor }} ({{ site.pastor_en }})
- 교단 / Denomination: {{ site.denomination }} ({{ site.denomination_en }})
- 설립 / Established: {{ site.established }}
- 언어 / Language: 한국어 예배, 영어 통역 제공 / Korean with English interpretation
- 페이스북 / Facebook: {{ site.social.facebook }}
- 유튜브 / YouTube: {{ site.social.youtube }}

## 예배 시간 / Service Times

- 주일 예배 / Sunday Worship: 오전 10:30 / 10:30 AM
- 교회학교 / Sunday School: 오전 10:30 / 10:30 AM
- 수요 성경공부 / Wednesday Bible Study: 오전 10:00, 저녁 7:00 / 10:00 AM, 7:00 PM
- 영어 성경공부 / Wednesday English Bible Study: 오전 10:00 / 10:00 AM
- 금요 기도회 / Friday Prayer Meeting: 저녁 7:00 / 7:00 PM

## 페이지 / Pages

- [홈]({{ '/' | absolute_url }}): 예배 시간, 위치, 자주 묻는 질문
- [교회 소개]({{ '/about/' | absolute_url }}): 인사말, 담임목사, 표어
- [예배 안내]({{ '/services/' | absolute_url }}): 예배·모임 시간표, 처음 오시는 분 안내
- [예배 영상]({{ '/videos/' | absolute_url }}): 매주 올라오는 주일 예배 영상
- [소식]({{ '/news/' | absolute_url }}): 교회 소식과 공지
- [오시는 길]({{ '/visit/' | absolute_url }}): 주소, 지도, 교통
- [Welcome (English)]({{ '/en/' | absolute_url }}): Service times, location, contact
- [About Us (English)]({{ '/en/about/' | absolute_url }})
- [Worship Videos (English)]({{ '/en/videos/' | absolute_url }})

## 자주 묻는 질문
{% for item in faq_ko.items %}
**Q. {{ item.q }}**
{{ item.a }}
{% endfor %}
## Frequently Asked Questions
{% for item in faq_en.items %}
**Q. {{ item.q }}**
{{ item.a }}
{% endfor %}
```

- [ ] **Step 7: 검증·커밋** — SEO 섹션 전체 ✓, "모든 검증 통과". 커밋: `NewsArticle·VideoObject 스키마, 404, llms.txt, AI 크롤러 허용 추가`.

---

### Task 5: README와 배포 확인

- [ ] **Step 1: README** — "## 이중 언어" 앞에 절 추가:

```markdown
## 검색 노출 (SEO · AI 검색)

사이트에 이미 들어 있는 것: 페이지별 제목·설명, 한/영 hreflang, Open Graph,
교회·기사·영상 구조화 데이터, 화면 FAQ, sitemap, RSS, `llms.txt`(AI 크롤러용
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

FAQ 내용은 `_data/faq.yml` 한 곳에서 관리합니다. 홈 화면, 구조화 데이터,
`llms.txt`가 모두 이 파일을 읽습니다.
```

- [ ] **Step 2: 검증·커밋·푸시** — `script/test` 통과 → 커밋 → `git push` → 배포 성공 확인 → 실제 사이트에서 `/llms.txt`, `/404.html`, 홈 제목 확인.
