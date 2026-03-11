# 릴리스 가이드

이 문서는 `edit-md`를 다시 배포할 때 필요한 최소 절차를 정리한 문서입니다.
현재 기준으로 웹(GitHub Pages)과 앱(GitHub Release)을 함께 운영합니다.

## 현재 운영 기준

- 버전: `0.1.2`
- 웹 주소: `https://mong-tang.github.io/edit-md/`
- 앱 릴리스: `https://github.com/mong-Tang/edit-md/releases`
- 대표 설치 파일: `mongTang-md_0.1.2_x64-setup.exe`

## 버전 올릴 때 같이 수정할 파일

다음 파일의 버전을 동일하게 맞춥니다.

- `package.json`
- `package-lock.json`
- `update.json`
- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`
- `src-tauri/tauri.conf.json`

## 릴리스 전 확인할 내용

- `CHANGELOG.md`에 변경 사항 반영
- `README.md`의 웹 주소 / 배포 방식이 최신인지 확인
- 웹 전용 / 앱 전용 메뉴 차이 반영 여부 확인
- `Ctrl/Cmd + P` 같은 플랫폼 공통 단축키 동작 확인

## 빌드 절차

### 1. 웹 빌드

```bash
npm install
npm run build
```

### 2. 앱 빌드

```bash
cmd.exe /c ".\\node_modules\\.bin\\tauri.cmd build"
```

대표 결과물:

```text
src-tauri\target\release\bundle\nsis\mongTang-md_<version>_x64-setup.exe
```

## Git 커밋 / 태그

```bash
git add .
git commit -m "chore: release vX.Y.Z"
git tag vX.Y.Z
git push origin main
git push origin vX.Y.Z
```

## GitHub Release 발행 절차

1. GitHub 저장소의 `Releases`로 이동
2. `Draft a new release` 선택
3. 태그 `vX.Y.Z` 선택
4. 릴리스 제목을 `vX.Y.Z`로 입력
5. 릴리스 노트 작성
6. 설치 파일 업로드
7. 정식 배포면 `pre-release`는 체크하지 않음
8. 필요 시 `Set as the latest release` 체크
9. `Publish release` 실행

## GitHub Pages 배포 절차

이 저장소는 `main` 브랜치 푸시 시 자동 배포됩니다.

### 설정 파일

- `vite.config.ts`
- `.github/workflows/deploy-pages.yml`

### 확인 순서

1. `git push origin main`
2. GitHub `Actions` 탭에서 `Deploy Pages` 성공 확인
3. GitHub `Settings > Pages`에서 Source가 `GitHub Actions`인지 확인
4. 웹 주소 접속 확인

```text
https://mong-tang.github.io/edit-md/
```

## 이번 배포에서 정리된 운영 원칙

- 웹과 앱은 같은 레포에서 운영한다.
- 웹에서는 도움말의 `업데이트 확인`을 숨긴다.
- 앱에서는 도움말의 `업데이트 확인`을 유지한다.
- 웹과 앱 모두 `Ctrl/Cmd + P` 인쇄 단축키를 차단한다.
- 웹은 GitHub Pages, 앱은 GitHub Release로 배포한다.

## 다음에 보면 좋은 파일

- `CHANGELOG.md`
- `README.md`
- `docs/release/checklist.md`
- `docs/TAURI_SETUP.md`
