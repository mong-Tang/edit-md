# 무서명(Unsigned) 릴리즈 체크리스트 (v1.0.0)

본 문서는 `mongTang.md`의 정식 배포 전 보안 및 무결성 검증을 위한 필수 점검 항목입니다.

---

## 1) 배포 아티팩트 준비 (설치본 우선)
- [ ] **[MAIN] 설치형**: `mongTang-md_1.0.0_x64-setup.exe` (사용자 권장)
- [ ] **[SUB] 포터블**: `mongTang-md_1.0.0_x64-portable.zip`

## 2) SHA256 검증 및 공개
*설치본의 보안 무결성을 최우선으로 검증*
- [x] **설치형 EXE SHA256**: `4226d47449224d7bb9d96b012ba9668e7e72fbedca21ebeef11a72b85037504c`
- [x] **포터블 ZIP SHA256**: `e9cfc8442cd8b35ff11d9e6d9e21a96b55dcd7dd09eb5b4610821419082db2dd`
- [x] **실행파일(EXE) SHA256**: `c421265e5c2d63ea7e227c3e2d5ae249c7b26c1a557d38b8251dcd39a0a624bc`

## 3) GitHub Release 본문 필수 문구
- [ ] “현재 빌드는 코드 서명(인증서) 전 단계입니다.”
- [ ] “백신 오탐 가능성이 있으며 SHA256 해시를 반드시 확인해 주세요.”
- [ ] “오탐 발생 시 Avast/Defender에 false positive 신고 예정”

## 4) 보안 오탐 대응 (Release 직후 수행)
- [ ] **Avast False Positive** 제출 (https://www.avast.com/false-positive-file-form.php)
- [ ] **Microsoft Defender Sample Submission** 제출 (https://www.microsoft.com/en-us/wdsi/filesubmission)
- [ ] 제출 후 발급된 티켓 번호를 릴리즈 노트 하단에 기록

## 5) 사용자 안내 가이드
- [ ] SmartScreen 경고 시 '추가 정보' -> '실행' 방법 안내
- [ ] 설치형 차단 발생 시 포터블 ZIP 대안 안내
- [ ] 설치 완료 후 `.md` 확장자 기본 앱 연결 안내
