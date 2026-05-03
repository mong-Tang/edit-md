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

- **프리미엄 커스텀 타이틀바**: 앱 테마와 일치하는 통합 윈도우 컨트롤 및 드래그 지원
- **표준 액세스 키(Mnemonic) 시스템**: `Alt + Key` 및 방향키를 활용한 네이티브급 메뉴 조작
- **Zero-Padding 레이아웃**: 화면 활용도를 극대화한 현대적인 슬림 워크스테이션 디자인
- **지능형 AI 에이전트 연동**: 상태바 및 메뉴를 통한 `mongTang AI` 즉시 접근
- **실시간 미리보기 및 편집**: 마크다운 문법 지원 및 고해상도 프리뷰 연동
- **고도화된 다국어 지원**: `i18n` 구조를 활용한 한국어/영어 완벽 지원 및 지역화
- **강력한 파일 시스템 연동**: Tauri 기반의 로컬 파일 읽기/쓰기 및 최근 파일 관리

## 개발 환경 실행

본 프로젝트는 **Tauri v2** 기반의 데스크톱 애플리케이션입니다. 네이티브 기능(타이틀바, 파일 시스템 등)을 온전히 사용하려면 데스크톱 모드로 실행해야 합니다.

### 1. 데스크톱 앱 실행 (권장)
```bash
npm install
npm run tauri dev
```

### 2. 웹 브라우저 실행 (UI 테스트용)
*일부 네이티브 기능(윈도우 제어 등)이 작동하지 않을 수 있습니다.*
```bash
npm run dev
```

## 개발 워크플로우 및 기록 규칙

- **수정 사항 기록**: 코드를 수정하거나 기능을 개선한 경우, 반드시 **`docs/DEV_LOG.md`**에 변경 내역(Added, Changed, Fixed)을 기록합니다.
- **배포 준비**: 정식 업데이트 시 `docs/DEV_LOG.md`의 내용을 정리하여 `public/changelog.md`로 이동하고 버전을 갱신합니다.

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
