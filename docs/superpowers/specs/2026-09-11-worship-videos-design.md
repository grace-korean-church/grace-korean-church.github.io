# 예배 영상 페이지 설계

- **작성일**: 2026-09-11
- **저장소**: `grace-korean-church/grace-korean-church.github.io`
- **선행 문서**: `2026-07-29-grace-korean-church-site-design.md`

## 1. 목표

교회 유튜브 채널에 영상이 올라오면 사람이 손대지 않아도 사이트의 "예배 영상"
페이지에 자동으로 추가되게 한다.

채널: https://www.youtube.com/@gracekoreanchurchassemblyo5929
채널 ID: `UCnheEKAjecPzdQpjWYPw37A`

## 2. 현황과 제약

- 사이트는 Jekyll 정적 사이트다. main에 푸시하면 `deploy.yml`이 빌드·배포한다.
- 유튜브는 채널별 공개 RSS 피드를 제공한다.
  `https://www.youtube.com/feeds/videos.xml?channel_id=<ID>`
  인증이 필요 없고 **최근 15편**만 담긴다. 항목마다 영상 ID, 제목, 게시 일시가 있다.
- 브라우저에서 이 피드를 직접 읽는 것은 CORS 때문에 막혀 있다. 그래서 빌드
  시점(서버 쪽)에 읽어야 한다.
- 업로드 패턴은 매주 주일예배 한 편이다. 일요일 밤(시카고 기준) 올라오며,
  게시 일시는 UTC로 월요일 새벽(04:30~05:30)이다.
- 영상 제목이 일정하지 않다. `09062026 Sunday Worship Service`,
  `080926 Worship` 두 형식이 섞여 있다.

## 3. 결정

### 3.1 방식: 예약 워크플로가 피드를 받아 데이터 파일에 누적

세 가지를 비교했다.

| 방식 | 판단 |
|---|---|
| **예약 워크플로 → `_data/videos.yml` 누적 → 재배포** | **채택.** 브라우저가 유튜브를 호출하지 않아 가볍고, 15편 제한을 넘어 계속 쌓이며, 한/영 페이지와 사이트 디자인에 그대로 맞는다. |
| 유튜브 재생목록 iframe 한 개 | 실시간이지만 플레이어 하나에 목록이 붙는 형태라 사이트와 따로 놀고, 페이지 진입 시 유튜브 스크립트가 로드된다. |
| 브라우저에서 피드 읽기 | CORS 때문에 중계 서버가 필요하다. 정적 사이트 구성에 맞지 않는다. |

"실시간"이 아니라 예약 시각 기준이지만, 주 1회 업로드에는 충분하다.

### 3.2 데이터: `_data/videos.yml`

```yaml
# 유튜브 채널 영상 목록. script/fetch-videos가 자동으로 채운다.
# 최신순. 한 번 들어온 항목은 스크립트가 지우지 않는다.
# 채널에서 내린 영상은 여기서 손으로 지운다.
- id: YC4qBdk-ZiA
  title: "09062026 Sunday Worship Service"
  published: "2026-09-07T04:50:36+00:00"
```

- 썸네일 URL은 ID로 만들 수 있으므로(`https://i.ytimg.com/vi/<id>/hqdefault.jpg`)
  저장하지 않는다.
- `published`는 피드 값을 그대로(UTC, ISO 8601) 둔다. 표시용 변환은 템플릿이 한다.
- 정렬은 `published` 내림차순. 스크립트가 저장할 때 정렬한다.

### 3.3 수집 스크립트: `script/fetch-videos`

- Ruby. 표준 라이브러리(`net/http`, `rexml`, `yaml`)만 쓴다. Jekyll 때문에
  Ruby가 이미 있으므로 새 의존성이 없다.
- 동작: 피드를 받아 파싱 → 기존 `_data/videos.yml`을 읽음 → ID가 없는 항목만
  추가 → `published` 내림차순 정렬 → 파일 저장.
- 변경이 없으면 파일을 다시 쓰지 않는다(불필요한 diff 방지).
- 인자:
  - `--feed <path|url>`: 피드 출처. 기본값은 채널 피드 URL. 테스트는 로컬
    XML 파일을 넘긴다.
  - `--out <path>`: 출력 파일. 기본값 `_data/videos.yml`.
- 종료 코드: 성공 0. 피드를 못 받거나 파싱에 실패하면 0이 아닌 값으로 끝내고
  기존 파일은 건드리지 않는다.
- 표준 출력에 추가된 편수를 한 줄로 찍는다(워크플로 로그용).

### 3.4 워크플로: `.github/workflows/fetch-videos.yml`

- 트리거
  - `schedule`: `0 13 * * 1,2` — 월·화 08:00 CDT(07:00 CST). 일요일 밤
    업로드를 월요일에 잡고, GitHub 예약 지연이나 늦은 업로드를 화요일에 한 번 더
    잡는다.
  - `workflow_dispatch`: 수동 실행.
- 권한: `contents: write`(커밋·푸시), `actions: write`(배포 워크플로 호출).
- 단계
  1. checkout
  2. setup-ruby(`.ruby-version`, bundler-cache 불필요 — 표준 라이브러리만 씀)
  3. `script/fetch-videos`
  4. `git diff --quiet _data/videos.yml`로 변경 여부 확인
  5. 변경이 있으면 `github-actions[bot]` 이름으로 커밋·푸시
  6. **커밋 직후 `gh workflow run deploy.yml --ref main`으로 배포를 호출한다.**
     `GITHUB_TOKEN`으로 만든 푸시는 GitHub 규칙상 `push` 트리거 워크플로를
     깨우지 않는다. `workflow_dispatch`는 예외이고 `deploy.yml`에 이미 그
     트리거가 있으므로 별도 토큰(PAT) 없이 된다.
- 동시성: `group: fetch-videos`, 진행 중이면 새 실행은 건너뛰지 않고 대기.
- 알아둘 점: 저장소에 60일간 커밋이 없으면 GitHub가 예약 워크플로를 자동
  정지한다. 봇 커밋도 활동으로 잡히므로 매주 영상이 올라오는 한 유지되고,
  멈추면 Actions 탭에서 다시 켤 수 있다. README에 적어 둔다.

### 3.5 페이지

| URL | 파일 | 제목 |
|---|---|---|
| `/videos/` | `videos.html` | 예배 영상 |
| `/en/videos/` | `en/videos.html` | Worship Videos |

- 레이아웃 `default`, 소식 목록(`news.html`)과 같은 구조.
- 두 파일은 `alt_url`로 서로를 가리킨다(언어 토글, hreflang).
- 카드 격자(`.card-grid`) 재사용. 카드 하나에:
  - 썸네일(`hqdefault.jpg`, 480×360, `loading="lazy"`, 16:9로 잘라 표시)
  - 날짜 제목(아래 3.6)
  - 유튜브 원제목(작게, 보조)
- 데이터가 비어 있으면 소식 페이지처럼 안내 문구만 보인다.
- 페이지 아래에 유튜브 채널 링크(`site.social.youtube`)를 둔다.
- 헤더 메뉴에 한/영 모두 항목 추가. `_data/i18n.yml`에 `nav.videos`
  ("예배 영상" / "Videos") 추가. 순서: 예배 안내 다음.
  영어 메뉴는 현재 Home·About뿐이므로 About 다음에 Videos.
- 페이지 본문 문구(부제, 빈 목록 안내, 채널 링크 문구)는 기존 규칙대로
  각 페이지 파일에 둔다.

### 3.6 날짜 제목 규칙

- 게시 일시(UTC)를 `America/Chicago`로 바꾸면 예배 당일(일요일)이 된다.
  Liquid에는 시간대 변환이 없으므로 **UTC에서 5시간을 뺀 값**으로 날짜를 잡는다.
  업로드가 UTC 04:30~05:30(시카고 23:30~00:30)이라 5시간이든 6시간이든 같은
  날짜가 나온다. 정확한 DST 처리는 이 용도에 과하다.
- 제목에 `worship`(대소문자 무시)이 들어가면 날짜 제목을 쓴다.
  - 한국어: `2026년 9월 6일 주일 예배`
  - 영어: `Sunday Worship · September 6, 2026`
- 그 외 영상은 유튜브 원제목을 제목으로 쓰고 날짜는 보조 줄에 둔다.
- 이 판정은 템플릿(Liquid)에서 한다. 데이터 파일은 원본 그대로 둔다.

### 3.7 재생

- 썸네일은 `<a href="https://www.youtube.com/watch?v=<id>">`로 감싼다.
  자바스크립트가 없으면 유튜브로 이동한다.
- `assets/js/videos.js`(새 파일, 의존성 없음)가 클릭을 가로채 그 자리에
  `https://www.youtube-nocookie.com/embed/<id>?autoplay=1` iframe을 넣는다.
- 재생 전에는 유튜브 스크립트를 전혀 불러오지 않는다. 썸네일 이미지 요청만
  `i.ytimg.com`으로 나간다.
- 스크립트는 영상 페이지에서만 로드한다. 페이지 front matter에
  `video_player: true`를 두고, `default.html`이 `mobile-menu.js` 옆에서
  `{% if page.video_player %}`로 조건부 출력한다.

### 3.8 스타일

`assets/css/style.css`에 소량 추가:
- `.video-thumb`: 16:9 박스, `object-fit: cover`, 재생 아이콘 오버레이
- `.video-thumb iframe`: 같은 박스를 채움
- 다크 모드는 기존 변수로 처리되므로 별도 규칙 없음

### 3.9 검증: `script/test`

- **수집 스크립트**: 고정 샘플 피드(`script/fixtures/videos-feed.xml`, 항목
  3개)와 기존 항목 1개가 든 임시 YAML로 스크립트를 돌려
  - 새 항목 2개가 추가되고
  - 기존 항목이 그대로 남고
  - 최신순으로 정렬됐는지 확인한다.
  - 같은 입력으로 한 번 더 돌리면 파일이 바뀌지 않는지 확인한다.
- **빌드 결과**
  - `videos/index.html`, `en/videos/index.html` 생성됨
  - 두 페이지에 `_data/videos.yml` 첫 항목의 영상 ID가 들어 있음
  - 한국어 페이지에 `주일 예배`, 영어 페이지에 `Sunday Worship` 문자열
  - 한국어 홈 네비게이션에 `>예배 영상<`
  - 재생 전 HTML에 `youtube.com/embed`가 없음(지연 로드 확인)
- 기존 검사(내부 링크, 이미지 참조 등)는 새 페이지에도 자동 적용된다.

### 3.10 첫 실행

- 구현 시점에 `script/fetch-videos`를 로컬에서 한 번 돌려 현재 피드의 15편을
  `_data/videos.yml`에 넣고 함께 커밋한다. 페이지가 처음부터 비어 보이지 않는다.
- 피드에 없는 더 오래된 영상은 자동으로 못 가져온다. 필요하면 같은 형식으로
  손으로 추가한다.

## 4. 하지 않는 것

- 홈 화면의 최신 영상 섹션 — 필요해지면 `site.data.videos.first`로 쉽게 추가된다.
- `VideoObject` 구조화 데이터 — 검색 노출이 필요해지면 추가.
- 설교 제목·본문·성경 구절 입력 — 수기 관리가 필요하므로 범위 밖.
- 유튜브 Data API — 키 관리가 필요하고 RSS로 충분하다.
- 채널에서 삭제된 영상의 자동 제거 — 손으로 지운다.

## 5. 파일 목록

| 파일 | 변경 |
|---|---|
| `_data/videos.yml` | 신규. 영상 목록 |
| `script/fetch-videos` | 신규. 피드 수집 스크립트 |
| `script/fixtures/videos-feed.xml` | 신규. 테스트용 샘플 피드 |
| `.github/workflows/fetch-videos.yml` | 신규. 예약 수집·커밋·배포 호출 |
| `videos.html`, `en/videos.html` | 신규. 페이지 |
| `assets/js/videos.js` | 신규. 클릭 시 임베드 |
| `assets/css/style.css` | 썸네일·플레이어 스타일 추가 |
| `_data/i18n.yml` | `nav.videos` 추가 |
| `_includes/header.html` | 메뉴 항목 추가 |
| `_layouts/default.html` | 영상 페이지에서만 `videos.js` 로드 |
| `script/test` | 검증 항목 추가 |
| `README.md` | 구조 목록, 영상 자동 수집 설명, 예약 정지 주의 |
