# 예배 영상 페이지 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 교회 유튜브 채널의 새 영상이 예약 워크플로를 통해 `_data/videos.yml`에 쌓이고, 한/영 "예배 영상" 페이지에 썸네일 격자로 자동 표시되게 한다.

**Architecture:** Ruby 표준 라이브러리로 만든 `script/fetch-videos`가 채널 RSS를 읽어 `_data/videos.yml`에 새 영상만 추가한다. GitHub Actions 예약 워크플로가 매주 이 스크립트를 돌려 변경이 있으면 커밋하고 기존 배포 워크플로를 호출한다. 페이지는 Liquid만으로 데이터 파일을 렌더링하고, 클릭 시에만 유튜브 iframe을 삽입한다.

**Tech Stack:** Jekyll 4.x · Ruby 3.4.1 (`net/http`, `rexml`, `yaml`) · Liquid · GitHub Actions · `gh` CLI (러너 기본 탑재)

**Spec:** `docs/superpowers/specs/2026-09-11-worship-videos-design.md`

## Global Constraints

- **작업 디렉토리**: `/Users/hyeongjinjang/workspace/grace-korean-church`, 브랜치 `main`
- **채널 ID**: `UCnheEKAjecPzdQpjWYPw37A`
- **Jekyll 플러그인·gem 추가 금지** — 스크립트는 Ruby 표준 라이브러리만 쓴다
- **모든 내부 링크에 `relative_url` 필터 사용**
- **UI 문구(메뉴)는 `_data/i18n.yml`**, 페이지 본문 문구는 페이지 파일에 둔다
- **재생 전 HTML에 `youtube.com/embed`가 나오면 안 된다** — 임베드는 클릭 시 JS가 넣는다
- **임베드 도메인은 `www.youtube-nocookie.com`**
- **`script/`는 `_config.yml`의 `exclude`에 있어 빌드에 포함되지 않는다** — 픽스처를 여기에 둬도 발행되지 않는다
- **검증은 `script/test`** — 모든 태스크 끝에 통과해야 한다
- 커밋 메시지는 한국어, 제목 한 줄 + 이유 설명. 끝에 아래 두 줄:
  ```
  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01VzpFXUPKk27MZgudmDLP5T
  ```

---

## File Structure

| 파일 | 책임 |
|---|---|
| `script/fetch-videos` | 피드 → `_data/videos.yml` 병합. CLI 인자 `--feed`, `--out` |
| `script/fixtures/videos-feed.xml` | 스크립트 테스트용 샘플 피드(항목 3개) |
| `script/test` | 스크립트 병합 검증 + 빌드 결과 검증 추가 |
| `_data/videos.yml` | 영상 목록 데이터(스크립트가 채움) |
| `.github/workflows/fetch-videos.yml` | 예약 수집·커밋·배포 호출 |
| `_data/i18n.yml` | `nav.videos` 문구 |
| `_includes/header.html` | 메뉴 항목 |
| `videos.html`, `en/videos.html` | 페이지 |
| `assets/js/videos.js` | 클릭 시 iframe 삽입 |
| `assets/css/style.css` | `.video-thumb` 스타일 |
| `_layouts/default.html` | `video_player` 페이지에서 `videos.js` 로드 |
| `README.md` | 구조·운영 설명 |

---

### Task 1: 수집 스크립트 `script/fetch-videos`

**Files:**
- Create: `script/fetch-videos`
- Create: `script/fixtures/videos-feed.xml`
- Modify: `script/test` (섹션 "영상 수집 스크립트" 추가, `section "빌드"` 앞)

**Interfaces:**
- Produces: 실행 파일 `script/fetch-videos [--feed <path|url>] [--out <path>]`. 출력 YAML은 배열이고 각 항목은 `id`(String), `title`(String), `published`(String, ISO 8601 UTC). `published` 내림차순. 변경이 없으면 파일을 쓰지 않는다. 표준 출력 한 줄: `N new video(s) added` 또는 `no new videos`.

- [ ] **Step 1: 샘플 피드 작성**

`script/fixtures/videos-feed.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
 <title>Sample Channel</title>
 <entry>
  <id>yt:video:NEW222222222</id>
  <yt:videoId>NEW222222222</yt:videoId>
  <title>09062026 Sunday Worship Service</title>
  <published>2026-09-07T04:50:36+00:00</published>
 </entry>
 <entry>
  <id>yt:video:NEW111111111</id>
  <yt:videoId>NEW111111111</yt:videoId>
  <title>083026 Worship</title>
  <published>2026-08-31T04:47:37+00:00</published>
 </entry>
 <entry>
  <id>yt:video:OLD000000000</id>
  <yt:videoId>OLD000000000</yt:videoId>
  <title>082326 Worship</title>
  <published>2026-08-24T04:38:14+00:00</published>
 </entry>
</feed>
```

- [ ] **Step 2: `script/test`에 실패하는 검증 추가**

`section "빌드"` 바로 앞에 삽입:

```bash
section "영상 수집 스크립트"
tmp=$(mktemp -d)
# 기존 항목 1개(OLD)만 든 파일에서 시작
cat > "$tmp/videos.yml" <<'YAML'
- id: OLD000000000
  title: "082326 Worship"
  published: "2026-08-24T04:38:14+00:00"
YAML
if script/fetch-videos --feed script/fixtures/videos-feed.xml --out "$tmp/videos.yml" >"$tmp/out1" 2>&1; then
  pass "fetch-videos 실행 성공"
else
  fail "fetch-videos 실행 실패"; sed 's/^/      /' "$tmp/out1"
fi
assert_contains "$tmp/out1" "2 new video(s) added" "새 영상 2편 추가 보고"
assert_contains "$tmp/videos.yml" "NEW222222222" "새 영상 추가됨"
assert_contains "$tmp/videos.yml" "OLD000000000" "기존 영상 유지됨"
if [ "$(grep -c '^- id:' "$tmp/videos.yml")" = "3" ]; then
  pass "영상 3편(중복 없음)"
else
  fail "영상 편수 불일치: $(grep -c '^- id:' "$tmp/videos.yml")편"
fi
if [ "$(grep '^- id:' "$tmp/videos.yml" | head -1)" = "- id: NEW222222222" ]; then
  pass "최신순 정렬"
else
  fail "최신순 정렬 아님: $(grep '^- id:' "$tmp/videos.yml" | head -1)"
fi
before=$(stat -f %m "$tmp/videos.yml" 2>/dev/null || stat -c %Y "$tmp/videos.yml")
sleep 1
script/fetch-videos --feed script/fixtures/videos-feed.xml --out "$tmp/videos.yml" >"$tmp/out2" 2>&1
assert_contains "$tmp/out2" "no new videos" "재실행 시 새 영상 없음 보고"
after=$(stat -f %m "$tmp/videos.yml" 2>/dev/null || stat -c %Y "$tmp/videos.yml")
if [ "$before" = "$after" ]; then pass "변경 없으면 파일 미수정"; else fail "변경 없는데 파일 다시 씀"; fi
if script/fetch-videos --feed "$tmp/does-not-exist.xml" --out "$tmp/videos.yml" >/dev/null 2>&1; then
  fail "피드 실패 시 0이 아닌 종료 코드"
else
  pass "피드 실패 시 0이 아닌 종료 코드"
fi
rm -rf "$tmp"
```

- [ ] **Step 3: 실패 확인**

Run: `script/test 2>&1 | sed -n '/영상 수집 스크립트/,/빌드/p'`
Expected: "fetch-videos 실행 실패" 등 ✗ 여러 개 (파일이 없으므로).

- [ ] **Step 4: 스크립트 작성**

`script/fetch-videos`:

```ruby
#!/usr/bin/env ruby
# frozen_string_literal: true
#
# 유튜브 채널 RSS를 읽어 _data/videos.yml에 새 영상을 추가한다.
#
# 사용법:
#   script/fetch-videos                      # 채널 피드 → _data/videos.yml
#   script/fetch-videos --feed feed.xml      # 로컬 파일로 테스트
#   script/fetch-videos --out /tmp/v.yml
#
# - 이미 있는 영상(id 기준)은 건드리지 않는다. 채널에서 내린 영상도 지우지 않는다.
# - published 내림차순으로 저장한다.
# - 새 영상이 없으면 파일을 다시 쓰지 않는다 (불필요한 커밋 방지).
# - 피드를 못 읽으면 기존 파일을 그대로 두고 1로 종료한다.
#
# 표준 라이브러리만 쓴다. Jekyll 때문에 Ruby가 이미 있으므로 gem을 늘리지 않는다.

require "net/http"
require "rexml/document"
require "yaml"
require "json"
require "optparse"

CHANNEL_ID = "UCnheEKAjecPzdQpjWYPw37A"
DEFAULT_FEED = "https://www.youtube.com/feeds/videos.xml?channel_id=#{CHANNEL_ID}"
DEFAULT_OUT = File.expand_path("../_data/videos.yml", __dir__)

HEADER = <<~YAML
  # 유튜브 채널 영상 목록. script/fetch-videos가 자동으로 채운다.
  # 최신순. 한 번 들어온 항목은 스크립트가 지우지 않는다.
  # 채널에서 내린 영상은 여기서 손으로 지운다.
YAML

options = { feed: DEFAULT_FEED, out: DEFAULT_OUT }
OptionParser.new do |o|
  o.on("--feed SRC", "피드 URL 또는 파일 경로") { |v| options[:feed] = v }
  o.on("--out PATH", "출력 YAML 경로") { |v| options[:out] = v }
end.parse!

def read_feed(src)
  return File.read(src) unless src.start_with?("http://", "https://")

  res = Net::HTTP.get_response(URI(src))
  raise "HTTP #{res.code}" unless res.is_a?(Net::HTTPSuccess)

  res.body
end

def parse_feed(xml)
  doc = REXML::Document.new(xml)
  entries = []
  doc.elements.each("feed/entry") do |e|
    id = e.elements["yt:videoId"]&.text.to_s.strip
    title = e.elements["title"]&.text.to_s.strip
    published = e.elements["published"]&.text.to_s.strip
    next if id.empty? || published.empty?

    entries << { "id" => id, "title" => title, "published" => published }
  end
  raise "no entries found" if entries.empty?

  entries
end

def load_existing(path)
  return [] unless File.exist?(path)

  data = YAML.safe_load(File.read(path)) || []
  raise "#{path} is not a list" unless data.is_a?(Array)

  data
end

def to_yaml(videos)
  body = videos.map do |v|
    "- id: #{v['id']}\n" \
    "  title: #{v['title'].to_json}\n" \
    "  published: \"#{v['published']}\"\n"
  end.join
  HEADER + body
end

begin
  fetched = parse_feed(read_feed(options[:feed]))
  existing = load_existing(options[:out])
rescue StandardError => e
  warn "fetch-videos: #{e.message}"
  exit 1
end

known = existing.map { |v| v["id"] }
added = fetched.reject { |v| known.include?(v["id"]) }

if added.empty?
  puts "no new videos"
  exit 0
end

merged = (existing + added).sort_by { |v| v["published"] }.reverse
File.write(options[:out], to_yaml(merged))
puts "#{added.size} new video(s) added"
```

`title`은 `to_json`으로 감싼다. 따옴표·콜론이 든 제목도 안전하게 YAML 문자열이 된다(JSON 문자열은 YAML 이중따옴표 문자열과 호환).

- [ ] **Step 5: 실행 권한 부여 후 검증**

Run: `chmod +x script/fetch-videos && script/test 2>&1 | sed -n '/영상 수집 스크립트/,/빌드/p'`
Expected: 섹션의 모든 항목 ✓.

- [ ] **Step 6: 커밋**

```bash
git add script/fetch-videos script/fixtures/videos-feed.xml script/test
git commit -m "유튜브 채널 피드를 _data/videos.yml에 누적하는 스크립트 추가

채널 RSS(최근 15편)를 읽어 새 영상만 추가하고 최신순으로 저장한다.
표준 라이브러리만 써서 gem이 늘지 않는다. 샘플 피드로 병합·정렬·
멱등성·실패 종료 코드를 script/test에서 검증한다.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VzpFXUPKk27MZgudmDLP5T"
```

---

### Task 2: 첫 데이터 수집 `_data/videos.yml`

**Files:**
- Create: `_data/videos.yml` (스크립트 실행 결과)

**Interfaces:**
- Consumes: Task 1의 `script/fetch-videos`
- Produces: `site.data.videos` — Liquid에서 배열로 접근. 각 항목 `id`, `title`, `published`.

- [ ] **Step 1: 실제 피드로 실행**

Run: `script/fetch-videos`
Expected: `15 new video(s) added`

- [ ] **Step 2: 결과 확인**

Run: `head -8 _data/videos.yml && grep -c '^- id:' _data/videos.yml`
Expected: 헤더 주석 3줄 다음 `- id: YC4qBdk-ZiA` / `title: "09062026 Sunday Worship Service"` / `published: "2026-09-07T04:50:36+00:00"`, 편수 15.

- [ ] **Step 3: Jekyll이 데이터를 읽는지 확인**

Run: `bundle exec ruby -e 'require "yaml"; d = YAML.safe_load(File.read("_data/videos.yml")); puts d.size, d.first.inspect'`
Expected: `15` 와 `{"id"=>"YC4qBdk-ZiA", "title"=>"09062026 Sunday Worship Service", "published"=>"2026-09-07T04:50:36+00:00"}` (published가 String이어야 한다. Time으로 파싱되면 따옴표가 빠진 것이다.)

- [ ] **Step 4: 커밋**

```bash
git add _data/videos.yml
git commit -m "유튜브 채널 영상 15편 초기 데이터 추가

script/fetch-videos를 처음 돌린 결과. 피드가 최근 15편만 주므로
그보다 오래된 영상은 필요하면 같은 형식으로 손으로 추가한다.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VzpFXUPKk27MZgudmDLP5T"
```

---

### Task 3: 페이지·메뉴·스타일·재생 스크립트

**Files:**
- Modify: `_data/i18n.yml` (`ko.nav`, `en.nav`에 `videos` 추가)
- Modify: `_includes/header.html` (메뉴 항목 2곳)
- Create: `videos.html`, `en/videos.html`
- Create: `assets/js/videos.js`
- Modify: `assets/css/style.css` (Cards 섹션 끝, `.card-link` 규칙 뒤)
- Modify: `_layouts/default.html` (`mobile-menu.js` 로드 뒤)
- Modify: `script/test` (섹션 "예배 영상" 추가, `section "사이트 설정"` 앞)

**Interfaces:**
- Consumes: `site.data.videos` (Task 2)
- Produces: URL `/videos/`, `/en/videos/`. 카드 마크업: `<a class="video-thumb" href="https://www.youtube.com/watch?v=<id>" data-video-id="<id>">`. `videos.js`는 `.video-thumb[data-video-id]` 클릭을 가로챈다.

- [ ] **Step 1: `script/test`에 실패하는 검증 추가**

`section "사이트 설정"` 바로 앞에 삽입:

```bash
section "예배 영상"
first_video=$(grep -m1 '^- id:' _data/videos.yml | awk '{print $3}')
assert_built "videos/index.html" "예배 영상 페이지 생성됨"
assert_built "en/videos/index.html" "영어 영상 페이지 생성됨"
assert_contains "_site/videos/index.html" "$first_video" "한국어 영상 페이지에 최신 영상"
assert_contains "_site/en/videos/index.html" "$first_video" "영어 영상 페이지에 최신 영상"
assert_contains "_site/videos/index.html" "주일 예배" "한국어 날짜 제목"
assert_contains "_site/en/videos/index.html" "Sunday Worship" "영어 날짜 제목"
assert_contains "_site/videos/index.html" "2026년 9월 6일" "시카고 기준 예배 날짜(일요일)"
assert_absent "_site/videos/index.html" "youtube.com/embed" "재생 전 iframe 없음"
assert_contains "_site/videos/index.html" "/assets/js/videos.js" "영상 페이지에 재생 스크립트"
assert_absent "_site/index.html" "/assets/js/videos.js" "홈에는 재생 스크립트 없음"
assert_contains "_site/index.html" ">예배 영상<" "한국어 메뉴에 예배 영상"
assert_contains "_site/en/index.html" ">Videos<" "영어 메뉴에 Videos"
assert_contains "_site/videos/index.html" 'hreflang="en"' "한국어 영상 페이지 hreflang"
assert_contains "_site/en/videos/index.html" 'hreflang="ko"' "영어 영상 페이지 hreflang"
```

- [ ] **Step 2: 실패 확인**

Run: `script/test 2>&1 | sed -n '/예배 영상/,/사이트 설정/p'`
Expected: ✗ 다수 (페이지 없음).

- [ ] **Step 3: i18n 문구 추가**

`_data/i18n.yml`의 `ko.nav`에 `services` 다음 줄로:
```yaml
    videos: "예배 영상"
```
`en.nav`에 `services` 다음 줄로:
```yaml
    videos: "Videos"
```

- [ ] **Step 4: 헤더 메뉴 항목 추가**

`_includes/header.html`에서

영어 블록의 `/en/about/` 링크 다음 줄에:
```liquid
      <a href="{{ '/en/videos/' | relative_url }}" class="nav-link">{{ t.nav.videos }}</a>
```
한국어 블록의 `/services/` 링크 다음 줄에:
```liquid
      <a href="{{ '/videos/' | relative_url }}" class="nav-link">{{ t.nav.videos }}</a>
```

- [ ] **Step 5: 한국어 페이지 `videos.html`**

```liquid
---
layout: default
title: "예배 영상"
permalink: /videos/
description: "은혜한인교회 주일 예배 영상. 매주 유튜브에 올라오는 예배 실황을 모아 보실 수 있습니다."
keywords: "은혜한인교회 예배 영상, 주일예배 영상, 몰린 한인교회 설교, Quad Cities 한인교회 예배"
alt_lang: en
alt_url: /en/videos/
video_player: true
---

<div class="container">
  <header class="page-header">
    <h1 class="page-title">예배 영상</h1>
    <p class="page-subtitle">매주 주일 예배 실황을 유튜브에서 다시 보실 수 있습니다</p>
  </header>

  {% if site.data.videos and site.data.videos.size > 0 %}
  <div class="card-grid">
    {% for v in site.data.videos %}
    {%- comment -%}
      published는 UTC 문자열. 에포크 정수를 거쳐야 date 필터가 _config.yml의
      timezone(America/Chicago)을 적용한다. 바로 포맷하면 UTC 날짜(월요일)가 나온다.
      제목에 worship이 있으면 날짜 제목, 아니면 유튜브 원제목을 쓴다.
    {%- endcomment -%}
    {%- assign epoch = v.published | date: "%s" | plus: 0 -%}
    {%- assign day = epoch | date: "%Y년 %-m월 %-d일" -%}
    {%- assign lower = v.title | downcase -%}
    <article class="card card-video">
      <a class="video-thumb" href="https://www.youtube.com/watch?v={{ v.id }}" data-video-id="{{ v.id }}" aria-label="{{ day }} 예배 영상 재생">
        <img src="https://i.ytimg.com/vi/{{ v.id }}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360">
        <span class="video-play" aria-hidden="true"></span>
      </a>
      <div class="card-meta"><span>{{ day }}</span></div>
      {%- if lower contains "worship" %}
      <h3 class="card-title">{{ day }} 주일 예배</h3>
      <p class="card-summary">{{ v.title }}</p>
      {%- else %}
      <h3 class="card-title">{{ v.title }}</h3>
      {%- endif %}
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="text-center" style="padding: 3rem 0;">
    <p style="color: var(--color-text-muted); font-size: 1.1rem;">
      아직 등록된 영상이 없습니다.
    </p>
  </div>
  {% endif %}

  <p class="text-center" style="margin-top: var(--space-xl);">
    <a href="{{ site.social.youtube }}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">유튜브 채널 바로가기</a>
  </p>
</div>
```

- [ ] **Step 6: 영어 페이지 `en/videos.html`**

```liquid
---
layout: default
title: "Worship Videos"
permalink: /en/videos/
description: "Sunday worship service recordings from Grace Korean Church in Moline, Illinois, uploaded weekly to YouTube."
keywords: "Grace Korean Church worship videos, Korean church Moline sermons, Quad Cities Korean church service"
alt_lang: ko
alt_url: /videos/
video_player: true
---

<div class="container">
  <header class="page-header">
    <h1 class="page-title">Worship Videos</h1>
    <p class="page-subtitle">Watch our Sunday worship services, uploaded every week</p>
  </header>

  {% if site.data.videos and site.data.videos.size > 0 %}
  <div class="card-grid">
    {% for v in site.data.videos %}
    {%- assign epoch = v.published | date: "%s" | plus: 0 -%}
    {%- assign day = epoch | date: "%B %-d, %Y" -%}
    {%- assign lower = v.title | downcase -%}
    <article class="card card-video">
      <a class="video-thumb" href="https://www.youtube.com/watch?v={{ v.id }}" data-video-id="{{ v.id }}" aria-label="Play worship service of {{ day }}">
        <img src="https://i.ytimg.com/vi/{{ v.id }}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360">
        <span class="video-play" aria-hidden="true"></span>
      </a>
      <div class="card-meta"><span>{{ day }}</span></div>
      {%- if lower contains "worship" %}
      <h3 class="card-title">Sunday Worship · {{ day }}</h3>
      <p class="card-summary">{{ v.title }}</p>
      {%- else %}
      <h3 class="card-title">{{ v.title }}</h3>
      {%- endif %}
    </article>
    {% endfor %}
  </div>
  {% else %}
  <div class="text-center" style="padding: 3rem 0;">
    <p style="color: var(--color-text-muted); font-size: 1.1rem;">
      No videos yet.
    </p>
  </div>
  {% endif %}

  <p class="text-center" style="margin-top: var(--space-xl);">
    <a href="{{ site.social.youtube }}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">Visit our YouTube channel</a>
  </p>
</div>
```

- [ ] **Step 7: 재생 스크립트 `assets/js/videos.js`**

```javascript
// 예배 영상 페이지: 썸네일을 누르면 그 자리에 유튜브 플레이어를 넣는다.
// 재생 전에는 유튜브 스크립트를 전혀 불러오지 않는다.
// JS가 꺼져 있으면 링크가 유튜브로 이동하므로 그대로 동작한다.
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.video-thumb[data-video-id]').forEach(function (thumb) {
    thumb.addEventListener('click', function (event) {
      // 새 탭·창으로 열려는 클릭(⌘/Ctrl/가운데 버튼)은 링크에 맡긴다.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();

      var id = thumb.getAttribute('data-video-id');
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      iframe.title = thumb.getAttribute('aria-label') || '';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.setAttribute('loading', 'lazy');

      var player = document.createElement('div');
      player.className = 'video-thumb video-playing';
      player.appendChild(iframe);
      thumb.replaceWith(player);
    });
  });
});
```

- [ ] **Step 8: 스타일 추가**

`assets/css/style.css`의 `.card-link { … }` 규칙 바로 뒤에:

```css
/* 예배 영상 카드 — 썸네일 16:9, 클릭 시 같은 박스에 iframe */
.card-video {
  padding: 0;
  overflow: hidden;
}

.card-video .card-meta,
.card-video .card-title,
.card-video .card-summary {
  padding-left: var(--space-lg);
  padding-right: var(--space-lg);
}

.card-video .card-meta {
  padding-top: var(--space-md);
}

.card-video .card-title {
  margin-bottom: var(--space-xs);
}

.card-video .card-summary {
  padding-bottom: var(--space-lg);
  font-size: 0.85rem;
}

.card-video .card-title:last-child {
  padding-bottom: var(--space-lg);
}

.video-thumb {
  position: relative;
  display: block;
  aspect-ratio: 16 / 9;
  background-color: #000;
}

.video-thumb img,
.video-thumb iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  object-fit: cover;
}

.video-play {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 64px;
  height: 44px;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 12px;
  transition: background-color 0.2s ease;
}

.video-play::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-40%, -50%);
  border-style: solid;
  border-width: 10px 0 10px 18px;
  border-color: transparent transparent transparent #fff;
}

.video-thumb:hover .video-play {
  background-color: var(--color-primary);
}
```

- [ ] **Step 9: 레이아웃에서 조건부 로드**

`_layouts/default.html`의 `mobile-menu.js` 스크립트 태그 다음에:

```liquid
  {%- if page.video_player %}
  <!-- 예배 영상: 썸네일 클릭 시 플레이어 삽입 -->
  <script defer src="{{ '/assets/js/videos.js' | relative_url }}"></script>
  {%- endif %}
```

- [ ] **Step 10: 검증**

Run: `script/test`
Expected: 모든 항목 ✓, 마지막 줄 "모든 검증 통과". 특히 "시카고 기준 예배 날짜(일요일)"이 통과해야 한다. 실패하면 `_data/videos.yml`의 `published`가 따옴표 없이 저장돼 YAML이 Time으로 읽었을 가능성이 크다.

- [ ] **Step 11: 브라우저 확인**

Run: `bundle exec jekyll serve --quiet & sleep 4; open http://localhost:4000/videos/`
확인: 3열 격자에 썸네일 15개, 첫 카드 제목 "2026년 9월 6일 주일 예배", 썸네일 클릭 시 그 자리에서 재생, 다크 모드 전환 시 카드 배경이 바뀜, 모바일 폭(400px)에서 1열. 확인 후 `kill %1`.

- [ ] **Step 12: 커밋**

```bash
git add _data/i18n.yml _includes/header.html videos.html en/videos.html assets/js/videos.js assets/css/style.css _layouts/default.html script/test
git commit -m "예배 영상 페이지 추가 (한/영)

_data/videos.yml을 썸네일 격자로 보여준다. 유튜브 제목이 들쭉날쭉해서
(\"09062026 Sunday Worship Service\", \"080926 Worship\") 제목 대신 시카고
기준 예배 날짜를 제목으로 쓴다. 썸네일을 누를 때만 쿠키 없는 임베드를
넣어 페이지 진입 시 유튜브 스크립트가 로드되지 않는다.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VzpFXUPKk27MZgudmDLP5T"
```

---

### Task 4: 예약 워크플로와 README

**Files:**
- Create: `.github/workflows/fetch-videos.yml`
- Modify: `README.md` (구조 목록, "소식 추가" 뒤에 "예배 영상" 절)

**Interfaces:**
- Consumes: `script/fetch-videos` (Task 1), `deploy.yml`의 `workflow_dispatch` 트리거(기존)

- [ ] **Step 1: 워크플로 작성**

`.github/workflows/fetch-videos.yml`:

```yaml
name: Fetch YouTube videos

on:
  schedule:
    # 월·화 08:00 CDT (07:00 CST). 주일 밤 업로드를 월요일에 잡고,
    # 예약 지연이나 늦은 업로드를 화요일에 한 번 더 잡는다.
    - cron: "0 13 * * 1,2"
  workflow_dispatch:

permissions:
  contents: write   # _data/videos.yml 커밋·푸시
  actions: write    # 배포 워크플로 호출

concurrency:
  group: fetch-videos
  cancel-in-progress: false

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: .ruby-version

      - name: Fetch channel feed
        run: script/fetch-videos

      - name: Detect changes
        id: diff
        run: |
          if git diff --quiet -- _data/videos.yml; then
            echo "changed=false" >> "$GITHUB_OUTPUT"
          else
            echo "changed=true" >> "$GITHUB_OUTPUT"
          fi

      - name: Commit and push
        if: steps.diff.outputs.changed == 'true'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add _data/videos.yml
          git commit -m "유튜브 새 영상 반영 ($(date -u +%Y-%m-%d))"
          git push

      # GITHUB_TOKEN으로 만든 푸시는 push 트리거 워크플로를 깨우지 않는다.
      # workflow_dispatch는 예외이므로 배포를 직접 호출한다.
      - name: Trigger deploy
        if: steps.diff.outputs.changed == 'true'
        env:
          GH_TOKEN: ${{ github.token }}
        run: gh workflow run deploy.yml --ref main
```

- [ ] **Step 2: YAML 문법 확인**

Run: `bundle exec ruby -e 'require "yaml"; d = YAML.safe_load(File.read(".github/workflows/fetch-videos.yml"), permitted_classes: [], aliases: true); puts d["jobs"]["fetch"]["steps"].map { |s| s["name"] }'`
Expected: 단계 이름 6개가 순서대로 출력.

(`on:` 키는 YAML 1.1에서 `true`로 읽히지만 GitHub는 정상 처리한다. 위 명령은 구조 확인용이다.)

- [ ] **Step 3: README 갱신**

구조 목록의 `_data/i18n.yml` 줄 다음에:
```
_data/videos.yml         유튜브 영상 목록 (script/fetch-videos가 자동 갱신)
```
`script/test` 줄 다음에:
```
script/fetch-videos      유튜브 채널 피드 수집 스크립트
```
`videos.html` 줄을 `news.html` 줄 다음에:
```
videos.html en/videos.html   예배 영상 (한/영)
```

"## 소식 추가" 절 뒤에 새 절:

````markdown
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
````

- [ ] **Step 4: 전체 검증**

Run: `script/test`
Expected: "모든 검증 통과".

- [ ] **Step 5: 커밋**

```bash
git add .github/workflows/fetch-videos.yml README.md
git commit -m "유튜브 새 영상을 매주 자동 반영하는 예약 워크플로 추가

월·화 아침(시카고) 채널 RSS를 읽어 _data/videos.yml에 새 영상이 있으면
커밋한다. GITHUB_TOKEN 푸시는 push 트리거를 깨우지 않으므로 커밋 뒤
deploy.yml을 workflow_dispatch로 직접 호출한다. 별도 토큰이 필요 없다.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01VzpFXUPKk27MZgudmDLP5T"
```

---

### Task 5: 푸시 후 워크플로 실동작 확인

**Files:** 없음 (운영 확인)

- [ ] **Step 1: 푸시**

Run: `git push origin main`

- [ ] **Step 2: 배포 확인**

Run: `gh run watch --exit-status $(gh run list --workflow=deploy.yml --limit 1 --json databaseId -q '.[0].databaseId')`
Expected: 성공. 이후 `https://grace-korean-church.github.io/videos/` 에서 격자 확인.

- [ ] **Step 3: 수집 워크플로 수동 실행**

Run: `gh workflow run fetch-videos.yml --ref main && sleep 20 && gh run list --workflow=fetch-videos.yml --limit 1`
Expected: 성공. 새 영상이 없으므로 로그에 `no new videos`, 커밋·배포 호출은 건너뜀("Commit and push" 단계 skipped).

새 영상이 올라온 다음 주 월요일 이후, `git log --oneline -3`에 `유튜브 새 영상 반영` 커밋이 보이고 배포 워크플로가 뒤따라 돌았는지 Actions 탭에서 확인한다.
