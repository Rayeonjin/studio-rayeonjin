# Studio RAYEONJIN

Studio RAYEONJIN 소개 페이지. 빌드 도구 없는 정적 사이트(HTML·CSS·JS)이며 외부 폰트·CDN을 쓰지 않습니다. 방문 통계는 쿠키를 쓰지 않는 Vercel Web Analytics만 사용합니다(Vercel 프로젝트의 Analytics 탭에서 켜야 수집됩니다).

## 로컬 미리보기

```bash
python3 -m http.server 4321 --directory .
```

## 구성

- `index.html` 본문 (스튜디오 소개, 작업, 개발 현황, 연혁, FAQ)
- `404.html` 없는 주소로 들어왔을 때의 안내 페이지. 네 언어 문구가 파일 안에 있고, 제목 글꼴 서브셋에도 포함됩니다.
- `robots.txt`, `sitemap.xml` 검색엔진용. 언어별 주소(`?lang=`)를 hreflang으로 묶습니다.
- `styles.css` 라이트/다크 테마
- `i18n.js` 다국어(한국어·영어·간체 중국어·스페인어). 한국어 원문은 `index.html`에 있고, 다른 언어 문구는 이 파일에 있습니다. 문구를 고칠 때는 `data-i18n` 키를 기준으로 네 언어를 함께 맞춥니다.
- `assets/` 앱 아이콘·스크린샷·스튜디오 마크

새 작업은 `index.html`의 `#works` 섹션에 플랫폼별 제목 아래 카드로 추가합니다.

## 연혁·개발 현황 데이터

- `feed.xml`은 같은 데이터로 만든 RSS 피드입니다.
- `data/stats.json`을 페이지가 읽어 연혁, 요약 수치, 주간 커밋 차트, 저장소 표를 그립니다.
- `.github/workflows/stats.yml`이 3시간마다(그리고 main에 push할 때) `scripts/build-stats.js`를 실행해 Rayeonjin 조직의 공개 저장소 기록을 모읍니다. 내용이 바뀐 경우에만 커밋하고, 그 커밋으로 Vercel이 다시 배포합니다.
- 커밋 작성자 정보는 수집하지 않습니다.
- 로컬에서 직접 갱신하려면: `GITHUB_TOKEN=$(gh auth token) node scripts/build-stats.js`

## 제목 글꼴

- 제목(h1·h2·h4)은 IBM Plex Sans KR / SC Bold(OFL-1.1)를 바탕으로 합니다. 용량을 줄이려고 제목에 쓰인 글자만 남긴 파일을 `assets/fonts/`에 둡니다(각 10KB대). 라이선스의 예약 이름 규정에 따라 줄인 파일의 글꼴 이름은 "Rayeonjin Headings"입니다.
- 제목 문구를 바꾸면 다시 만들어 주세요. 원본은 https://github.com/IBM/plex/tree/master/packages 에서 받습니다.
  `pip install fonttools brotli && python3 scripts/subset-fonts.py IBMPlexSansKR-Bold.otf IBMPlexSansSC-Bold.otf`
- 빠진 글자는 기기의 기본 고딕으로 대체되어 보입니다.
