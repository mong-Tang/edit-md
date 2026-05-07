# Development Log (Internal)

이 문서는 `edit-md`의 정식 배포 전 발생한 기술적 수정 사항 및 내부 작업 내역을 기록합니다. 사용자용 체인지로그(`public/changelog.md`) 작성의 기초 자료로 활용됩니다.

---


## [2026-05-07] - Native Emoji Integration & Clipboard Media Optimization

### Added
- **Tauri Rust-FFI 이모지 소환**: `powershell` 백그라운드 스폰의 1.5초 실시간 딜레이 및 실행 정책 권한 제약을 완벽 제거하고, `user32.dll`의 `keybd_event` 함수에 직접 Rust 전선을 물려 무지연(0-Delay)으로 `Win + .` 가상 신호를 주사하는 초경량 네이티브 FFI 커맨드 구축 완료
- **전천후 3중 클립보드 미디어 감지기**: 웹 붙여넣기(`onPaste`) 시 `DataTransferItem` 내부에 숨겨진 이진 GIF 파일 캡처, HTML 내 `<img src="..."/>` 및 일반 복제 텍스트 속 단일 Tenor/GIF URL 문자열 자동 정규식 색출 장치를 전격 결합하여 자동으로 `![gif](...)` 이미지 코드로 즉시 가공 삽입하는 특급 파서 탑재

### Changed
- **React controlled textarea 단축키 가로채기 정합**: 실시간 상태 업데이트 시 파괴되는 native 실행 취소(`Ctrl+Z`), 다시 실행 (`Ctrl+Y/Ctrl+Shift+Z`), 모두 선택(`Ctrl+A`) 키보드 신호를 전역 키 수신기(`handleKeyDown`) 단계에서 가로채 `useUndoRedo` 커스텀 버퍼 스택으로 유도 정합

### Fixed
- **전역 크로미움 컨텍스트 메뉴 차단 및 미리보기 우클릭 무력 필터**: 마우스 우클릭 시 크로미움 브라우저 기본 검사 창 노출을 강제 소각하고, 읽기 전용인 미리보기 패널(`PreviewPane`) 우클릭을 지능적으로 가로채 에디터용 커스텀 편집 메뉴가 비정상 노출되던 영역 이중 침범 오작동 해결
- **메뉴 붙여넣기 윈도우 스크롤 이탈 소탕**: 마우스 메뉴 클릭으로 클립보드 붙여넣기를 수행할 시 웹뷰가 순간적으로 초점을 잃으며 상하좌우 뷰포트를 격렬하게 뒤흔들던 증상을 `preventScroll: true` 기법과 캡처된 가상 스크롤 좌표 원복 테크닉으로 완벽히 소각
- **TypeScript 린트 경고 6선 완벽 소거**: `Toolbar.tsx` 내부에 레거시 시뮬레이션용으로 방치되어 있던 미사용 상태 훅 3개(`localMaximized`, `prevSize`, `prevPosition`)를 완전히 탈거하여 무결점 컴파일 경고 제로 달성

## [2026-05-03] - Internal Refinements

### Added
- **메뉴 액세스 키(Mnemonic) 시스템**: `&` 기호를 활용한 표준 단축키(`Alt + F, E, V, H`) 구현
- **메뉴 키보드 네비게이션**: 방향키(`ArrowKeys`) 이동 및 `Enter` 실행 기능 추가
- **Mnemonic 렌더러**: 메뉴 이름의 단축키 글자에 자동으로 밑줄(`<u>`)을 긋는 로직 도입
- **포커스 시각화**: 키보드 이동 시 메뉴 항목에 대한 하이라이트 스타일 보강

### Changed
- **다국어 메시지 포맷**: `messages.ts` 내 메뉴 이름을 표준 `&` 접두사 방식으로 전면 개편

### Fixed
- 메뉴 팝업 시 `Escape` 키로 포커스 및 상태가 정상적으로 초기화되지 않던 문제 수정
- **빌드 중단 해결**: 미사용 변수/임포트 및 `StartScreen` Props 불일치로 인한 `tsc` 에러 전면 수정
- **버전 동기화**: `Cargo.toml` 버전 누락으로 인한 빌드 불일치 해결 (`1.0.0` 통일)

## [2026-05-03] - Official 1.0.0 Release Finalization
### Added
- **프로페셔널 시작 화면**: 최근 파일 목록, 빠른 시작(새 파일/열기) 및 마크다운 가이드를 포함한 2단 레이아웃 구현
- **포터블 배포본**: `zip` 형식의 무설치 실행 파일 배포 체계 추가
- **무결성 검증 체계**: `release-sha256.txt` 및 체크리스트를 통한 아티팩트 해시 공개 시스템 구축

### Changed
- **빌드 타겟 최적화**: 윈도우 정식 릴리스용 NSIS 인스톨러(`setup.exe`) 생성 자동화
- **체인지로그 일원화**: `CHANGELOG.md`와 `public/changelog.md`를 1.0.0 정식 사양으로 동기화
