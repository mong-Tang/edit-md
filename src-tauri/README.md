# src-tauri

이 폴더는 `edit-md`의 Tauri 런타임 구성을 위한 초기 템플릿입니다.

## 현재 상태
- Rust/Cargo 미설치 환경에서 미리 만든 구조
- 프런트엔드의 `TauriFileService`와 연결될 예정
- 실제 실행/번들 검증은 아직 하지 않음

## 포함 파일
- `Cargo.toml`: Tauri 앱 의존성 템플릿
- `build.rs`: Tauri build hook
- `src/lib.rs`: 플러그인 초기화 및 앱 실행
- `src/main.rs`: 실행 진입점
- `tauri.conf.json`: 기본 앱 창/빌드 설정
- `capabilities/default.json`: 기본 권한 템플릿

## 다음 작업
1. Rust 설치
2. `cargo` / Tauri CLI 설치 확인
3. `src-tauri/gen/schemas` 생성 또는 Tauri init으로 재생성
4. 아이콘 추가
5. Windows 번들 설정 조정

## 주의
- 현재 `capabilities/default.json`의 schema 경로는 실제 init 후 재생성될 수 있습니다.
- 권한 범위는 최소 권한 원칙에 맞춰 다시 좁혀야 합니다.
