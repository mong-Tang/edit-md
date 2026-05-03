# Changelog

이 문서는 `edit-md`의 주요 변경 이력을 기록합니다.
형식은 [Keep a Changelog](https://keepachangelog.com/ko/)를 참고하고, 버전 체계는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [1.0.0] - 2026-05-03

### Added
- **프리미엄 커스텀 타이틀바**: Tauri 네이티브 장식을 대체하는 세련된 UI 및 윈도우 제어 기능
- **표준 액세스 키(Mnemonic) 시스템**: `Alt + Key` 기반 메뉴 접근 및 방향키 네비게이션 구현
- **에디터 연동형 체인지로그 시스템**: 업데이트 내역을 별도 창이 아닌 에디터 탭에서 직접 확인 가능
- **mongTang AI 에이전트 연동**: 상태바 및 메뉴 시스템을 통한 지능형 어시스턴트 즉시 접근성 확보
- **실시간 공지 연동**: `public/changelog.md`를 통한 동적 업데이트 정보 fetch 로직 도입

### Changed
- **상단 헤더 통합 구조**: 타이틀바와 툴바를 단일 쉘로 통합하여 레이아웃 안정성 및 심미성 강화
- **UI 현대화 (Zero-Padding)**: 전역 레이아웃의 여백을 제거하여 화면 활용도를 극대화한 디자인 적용
- **타이포그래피 및 가독성 최적화**: 전문가용 폰트 두께 및 고대비 다크 모드 감도 보정
- **About 모달 리뉴얼**: 버전 정보와 브랜드 아이덴티티(mongTang.md)를 강조한 디자인 개편

### Fixed
- 메뉴 팝업 시 `Escape` 키 및 마우스 이탈에 따른 포커스 초기화 안정화
- 모달 컴포넌트 내 레이아웃 뭉개짐 및 CSS 렌더링 에러 해결
- 비정상적인 스크롤 바 노출 및 레이아웃 시프트 현상 수정

## [0.1.2] - 2026-03-11

### Added
- GitHub Pages 기반 웹 배포 추가
- 공개 웹 주소 추가: `https://mong-tang.github.io/edit-md/`
- GitHub Actions 기반 Pages 배포 workflow 추가

### Changed
- 웹과 앱을 단일 코드베이스로 함께 운영할 수 있도록 배포 경로 정리
- 웹 도움말 메뉴에서는 `업데이트 확인` 항목을 숨기고, 앱에서는 유지하도록 조정

### Fixed
- 웹과 앱 모두에서 `Ctrl/Cmd + P` 인쇄 단축키 차단
- 웹 배포 시 정적 자산 경로가 깨지지 않도록 Vite `base` 설정 보완

### Release
- GitHub Release `v0.1.2` 발행
- Windows 설치 파일 업로드 완료
  - `mongTang-md_0.1.2_x64-setup.exe`

## [0.1.0] - 2026-03-05

### Added
- Windows 데스크톱용 Markdown 편집기 초기 릴리스
- Markdown 편집 / 실시간 미리보기
- 파일 열기 / 저장 / 다른 이름으로 저장
- HTML 내보내기
- 최근 파일 목록
- 테마 선택 (`Light`, `Dark`, `System`)
- 코드 하이라이트

### Known Issues
- 브라우저 환경에서는 보안 제한으로 인해 파일 시스템 관련 기능에 제약이 있을 수 있음
- 데스크톱 앱 자동 업데이트 흐름은 추가 검증이 더 필요함
