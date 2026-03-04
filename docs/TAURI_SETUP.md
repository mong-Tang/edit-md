# Tauri Setup Checklist

`edit-md`를 Windows 데스크톱 앱으로 실행하기 위한 최소 체크리스트입니다.

## 1. Rust 설치

Rust가 없다면 아래 공식 페이지에서 설치합니다.

```txt
https://www.rust-lang.org/tools/install
```

설치 후 새 터미널을 열고 확인합니다.

```bash
rustc -V
cargo -V
```

### 기대 결과
- `rustc` 버전이 출력된다
- `cargo` 버전이 출력된다

---

## 2. Tauri CLI 설치

프로젝트 루트에서 실행합니다.

```bash
npm install -D @tauri-apps/cli
```

확인:

```bash
npm ls @tauri-apps/cli --depth=0
```

### 기대 결과
- `@tauri-apps/cli`가 dev dependency로 표시된다

---

## 3. 프런트엔드 의존성 확인

```bash
npm install
```

### 기대 결과
- 의존성 설치 오류가 없다

---

## 4. 웹 빌드 확인

```bash
npm run build
```

### 기대 결과
- Vite 빌드가 성공한다

---

## 5. Tauri 개발 실행

```bash
npx tauri dev
```

### 기대 결과
- 로컬 개발 서버가 올라간다
- Tauri 창이 열린다
- 초기 에디터 UI가 표시된다

---

## 6. 확인할 기능

실행 후 아래를 확인합니다.

- 편집기 입력이 동작하는가
- 우측 프리뷰가 즉시 갱신되는가
- 파일 열기 버튼이 동작하는가
- 저장 / 다른 이름으로 저장 동작이 정상인가
- 테마 변경이 반영되는가

---

## 7. 실패 시 점검 포인트

### Rust 관련
- `rustc`, `cargo` 명령이 인식되는가
- PATH 반영을 위해 새 터미널을 열었는가

### Tauri 관련
- `@tauri-apps/cli`가 설치되었는가
- `src-tauri` 폴더가 존재하는가
- `src-tauri/Cargo.toml`이 손상되지 않았는가

### Windows 관련
- WebView2 런타임 문제 여부
- 보안 프로그램이 빌드/실행을 막고 있지 않은가

---

## 8. 현재 프로젝트 기준 주의사항

- 현재 `src-tauri`는 초기 템플릿 상태입니다.
- Rust가 설치되기 전까지는 실제 Tauri 빌드 검증을 하지 않았습니다.
- 최근 파일 재열기 기능은 Tauri 환경에서 추가 검증이 필요합니다.
