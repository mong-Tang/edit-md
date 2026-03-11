# Changelog

이 문서는 `edit-md`의 주요 변경 이력을 기록합니다.
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 참고하고, 버전 체계는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

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
