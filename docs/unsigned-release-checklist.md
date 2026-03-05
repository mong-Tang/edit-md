# 무서명(Unsigned) 릴리즈 체크리스트

## 1) 배포 아티팩트 준비
- 설치형: `mongTang-md_0.1.1_x64-setup.exe`
- 포터블: `mongTang-md_0.1.1_x64-portable.zip`

## 2) SHA256 공개
- 설치형 SHA256: `8dc7a5a3bb34a3572011069ecc0631c6276e13817a8fb93443ff7999cd6a6847`
- 포터블 ZIP SHA256: `f57e483997dd50735d07e8ced1acef5388e60ea67761dcc3bfa80cc85b5ca4c7`
- 포터블 EXE SHA256: `051a66026ff799099ea67de7d635db8dd92b89332b6db8f4437ee4a1d2fea279`

## 3) GitHub Release 본문 필수 문구
- “현재 빌드는 코드 서명(인증서) 전 단계입니다.”
- “백신 오탐 가능성이 있으며 SHA256 해시를 반드시 확인해 주세요.”
- “오탐 발생 시 Avast/Defender에 false positive 신고 예정”

## 4) 오탐 대응
- Avast False Positive 제출
- Microsoft Defender Sample Submission 제출
- 제출 후 티켓 번호를 릴리즈 노트에 기록

## 5) 사용자 가이드(최소)
- 설치형 차단 시 포터블 ZIP 사용 안내
- SmartScreen 경고 발생 시 게시자 미확인(무서명) 안내
- 앱 설치 후 `.md` 기본 앱 재지정 안내
