# 릴리즈 체크리스트

## 버전/문서
- [ ] `src-tauri/Cargo.toml` 버전 업데이트
- [ ] `update.json` 버전 업데이트
- [ ] `package.json` 버전 업데이트(필요 시)
- [ ] `CHANGELOG.md` 업데이트
- [ ] `RELEASE_NOTES.md` 업데이트

## 품질 점검
- [ ] `npm run build` 성공
- [ ] 주요 기능 수동 테스트(열기/저장/미리보기/HTML/PDF)
- [ ] 최근 파일 목록 동작 확인
- [ ] 테마 전환 동작 확인

## 배포 준비
- [ ] `npx tauri build` 성공
- [ ] 설치 파일/아티팩트 생성 확인
- [ ] 해시/무결성 정보 기록(필요 시)
- [ ] 알려진 이슈 정리

## 게시
- [ ] 릴리즈 커밋 생성
- [ ] Git 태그 `vX.Y.Z` 생성
- [ ] 원격 푸시(`--tags`) 완료
- [ ] GitHub Releases 게시 완료
