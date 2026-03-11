# edit-md

`edit-md`는 Markdown 문서를 빠르게 작성하고 미리볼 수 있는 편집기입니다.
하나의 코드베이스로 웹과 Windows 데스크톱 앱을 함께 운영합니다.

## 사용 주소

- 웹: `https://mong-tang.github.io/edit-md/`
- 앱 릴리스: `https://github.com/mong-Tang/edit-md/releases`

## 현재 운영 형태

### 웹
- GitHub Pages로 배포
- 브라우저에서 바로 접속 가능
- 도움말 메뉴의 `업데이트 확인` 숨김
- `Ctrl/Cmd + P` 인쇄 단축키 차단

### 앱 (Windows)
- Tauri 기반 데스크톱 앱
- GitHub Release에서 설치 파일 제공
- 도움말 메뉴의 `업데이트 확인` 유지
- `Ctrl/Cmd + P` 인쇄 단축키 차단

## 주요 기능

- Markdown 편집
- 실시간 미리보기
- 파일 열기 / 저장 / 다른 이름으로 저장
- 최근 파일
- HTML 내보내기
- 다크 / 라이트 / 시스템 테마
- 다국어 문자열 구조 적용

## 개발 환경 실행

```bash
npm install
npm run dev
```

개발 서버 기본 주소:

```text
http://localhost:5173
```

## 웹 빌드

```bash
npm run build
```

## 앱 빌드

```bash
cmd.exe /c ".\\node_modules\\.bin\\tauri.cmd build"
```

대표 결과물:

```text
src-tauri\target\release\bundle\nsis\mongTang-md_0.1.2_x64-setup.exe
```

## 프로젝트 구조

```text
edit-md/
  src/                 # 공통 프론트엔드
  src-tauri/           # Windows 앱 전용(Tauri)
  public/              # 정적 파일
  docs/                # 운영/배포 문서
```

## 운영 메모

- 웹과 앱은 레포를 분리하지 않고 함께 운영한다.
- 웹 배포는 GitHub Pages를 사용한다.
- 앱 배포는 GitHub Release + 설치 파일 업로드 방식으로 진행한다.
- 버전은 웹/앱 공통으로 동일하게 관리한다.

## 관련 문서

- 변경 이력: [`CHANGELOG.md`](./CHANGELOG.md)
- 릴리스 가이드: [`docs/release/README.md`](./docs/release/README.md)
- 릴리스 체크리스트: [`docs/release/checklist.md`](./docs/release/checklist.md)
- Tauri 설정 참고: [`docs/TAURI_SETUP.md`](./docs/TAURI_SETUP.md)
