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

- 설립 연도
- 전체 예배 시간표
- 전화번호, 이메일
- 교회 표어 / 연간 주제
- 담임목사 약력
- 교회 소개글 본문
- 오시는 길 상세 안내 (주요 도로, 주차 위치, 건물 입구)
- 부서별 예배(어린이부·학생부 등) 운영 여부
- 로고 · 파비콘 · 담임목사 사진 (현재 상태는 `assets/images/README.md` 참고)
- 정확한 교회 좌표
- Google Analytics 측정 ID (`_config.yml` 의 `google_analytics`)

교단은 하나님의성회(Assembly of God)로 확인되어 `about.md` 에 반영했습니다.
