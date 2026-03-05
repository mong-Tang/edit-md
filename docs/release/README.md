# 릴리즈 가이드

이 문서는 `edit-md` 릴리즈를 준비/배포할 때 사용하는 최소 절차입니다.

## 1) 버전 정합성 확인

아래 파일의 버전을 동일하게 맞춥니다.

- `src-tauri/Cargo.toml` (`[package].version`)
- `update.json` (`version`)
- `package.json` (`version`, 프론트엔드 배포 버전 관리 시)

## 2) 릴리즈 문서 업데이트

- `CHANGELOG.md`: 변경 이력 추가
- `RELEASE_NOTES.md`: 이번 버전 릴리즈 노트 추가

## 3) 사전 점검

체크리스트 문서:

- `docs/release/checklist.md`

## 4) 빌드

```bash
npm install
npm run build
npx tauri build
```

## 5) 태그/릴리즈 게시

```bash
git add .
git commit -m "chore(release): vX.Y.Z"
git tag vX.Y.Z
git push origin main --tags
```

GitHub Releases에서 `vX.Y.Z` 태그 기준으로 릴리즈를 생성하고, `RELEASE_NOTES.md` 내용을 반영합니다.
