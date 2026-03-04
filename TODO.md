# TODO - edit-md 작업 메모 (2026-03-05)

## 오늘 완료한 것
- 상단 메뉴를 텍스트형 메뉴바로 정리
- 문서 탭 UI 추가 및 탭 닫기(`x`) 지원
- 최근 파일에서 재오픈 불가 항목 제거
- 최근 파일 메뉴의 `TAURI` 태그 제거
- 앱 외곽/상하 패딩 및 카드 간격 조정
- 미리보기 기본 링크에 `splashscreen.html` 추가
- 미리보기 링크 클릭 처리 코드 추가 시도
- Tauri opener 권한(`opener:allow-open-path`) 추가

## 현재 미해결 이슈

### 1) 링크가 열리지 않음
#### 증상
- `mongTang AI` 클릭 시 아무 반응 없음
- `splashscreen.html` 링크 클릭 시도 아무 반응 없음
- 앱 내부/브라우저/기본 앱 어느 쪽으로도 열리지 않음

#### 확인 대상
- `@tauri-apps/plugin-opener` 실제 런타임 호출 여부
- Tauri capability 권한 적용 여부
- `npx tauri dev` 기준 capability 반영 상태
- `PreviewPane` 링크 클릭 이벤트 실제 호출 여부
- `window.open(...)` fallback이 WebView에서 막히는지
- `openUrl`, `openPath` 예외가 삼켜지는지
- 콘솔/터미널 로그 확인 필요

#### 후보 파일
- `src/App.tsx`
- `src/components/PreviewPane.tsx`
- `src-tauri/capabilities/default.json`
- `src-tauri/src/lib.rs`

### 2) 상태바/레이아웃 재확인
- 상태바 높이 고정 실화면 재확인
- 외곽 여백:
  - 좌우 2px
  - 상하 4px
- 카드 간 간격:
  - 8px

## 다음 작업 우선순위
1. 링크 오픈 문제부터 해결
2. 최근 파일/툴팁/링크 정책 정리
3. 시작 화면/기본 문서 정책 재정리

## 메모
- 오늘은 상태가 좋지 않아 판단 피로가 있었음
- 다음 작업은 링크 문제를 단일 이슈로 집중해서 볼 것
