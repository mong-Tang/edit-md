# GitHub Issues Draft

`edit-md`에서 바로 이슈로 옮길 수 있도록 정리한 초안입니다.

## 1. Tauri 실행 환경 검증

### 제목
`build: verify Tauri runtime on Windows`

### 내용
- Rust / Cargo 설치
- Tauri CLI 실행 가능 여부 확인
- `src-tauri` 기준 앱 실행 확인
- 플러그인 초기화 오류 여부 확인

### 완료 기준
- Windows 환경에서 Tauri 앱이 실행된다
- 콘솔 오류 없이 초기 창이 열린다

---

## 2. 네이티브 파일 열기/저장 연결

### 제목
`feat: connect native file open and save with Tauri`

### 내용
- `TauriFileService`의 `openMarkdownFile` 실제 검증
- `saveFile` / `saveFileAs` 경로 기반 저장 동작 검증
- 현재 파일 경로 유지 동작 확인

### 완료 기준
- `.md` 파일을 네이티브 다이얼로그로 열 수 있다
- 같은 파일에 다시 저장할 수 있다
- 다른 이름으로 저장이 정상 동작한다

---

## 3. 최근 파일 재열기 완성

### 제목
`feat: reopen recent files using stored file path`

### 내용
- 최근 파일에 `path` 기반 재열기 연결
- 브라우저/tauri 환경별 동작 분리
- 실패 시 사용자 메시지 개선

### 완료 기준
- Tauri 환경에서 최근 파일 클릭 시 문서가 다시 열린다
- 존재하지 않는 파일은 오류 메시지를 표시한다

---

## 4. 앱 메뉴 및 단축키 추가

### 제목
`feat: add desktop menu and shortcuts`

### 내용
- `파일`, `보기`, `내보내기` 메뉴 설계
- `Ctrl+O`, `Ctrl+S`, `Ctrl+Shift+S` 연결
- 테마/내보내기 메뉴 연결

### 완료 기준
- 주요 파일 작업이 메뉴와 단축키로 동작한다

---

## 5. 프리뷰 품질 개선

### 제목
`feat: improve markdown preview quality`

### 내용
- 상대 경로 이미지 처리 개선
- 링크 클릭 정책 정리
- 표/코드/인용문 스타일 보강
- 긴 문서 렌더링 성능 확인

### 완료 기준
- 일반적인 README 수준 문서가 깨지지 않고 렌더링된다

---

## 6. 코드 하이라이트 번들 최적화

### 제목
`perf: reduce syntax highlighting bundle size`

### 내용
- `react-syntax-highlighter` 번들 크기 확인
- dynamic import 또는 대체 라이브러리 검토
- Vite chunk 분리 적용 여부 검토

### 완료 기준
- 빌드 경고가 줄어들거나 제거된다
- 초기 로딩 번들 크기가 개선된다

---

## 7. 내보내기 품질 개선

### 제목
`feat: improve html and pdf export quality`

### 내용
- HTML 내보내기 결과에 preview 스타일 반영 검토
- PDF 인쇄 레이아웃 최적화
- 페이지 나눔/여백/폰트 점검

### 완료 기준
- HTML/PDF 결과물이 읽기 좋은 형태로 생성된다

---

## 8. 릴리스 준비

### 제목
`chore: prepare first desktop release`

### 내용
- 앱 아이콘 추가
- 번들 정보 정리
- 설치 파일 생성 검토
- README / 릴리스 노트 정리

### 완료 기준
- Windows 사용자에게 배포 가능한 최소 릴리스 형태가 준비된다
