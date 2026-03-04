import { useMemo, useState } from 'react'
import type { FileService } from '../services/fileService'
import type { FileDescriptor, OpenedFile } from '../types/file'

const SAMPLE_NAME = 'untitled.md'
const INITIAL_MARKDOWN = `# edit-md

편향 없는 무료 Markdown 편집기를 목표로 하는 초기 프로토타입입니다.

## 현재 지원

- 실시간 프리뷰
- 파일 열기/저장
- 이미지와 링크 렌더링
- 테마 선택: Light / Dark / System
- HTML / PDF 내보내기

### 링크 예시
[OpenAI](https://openai.com)

### 이미지 예시
![sample image](https://picsum.photos/640/240)

---

## 표 예시

| 기능 | 상태 | 비고 |
| --- | --- | --- |
| 편집 | 완료 | 실시간 입력 |
| 프리뷰 | 완료 | GFM 지원 |
| Tauri 연동 | 진행 중 | 구조 준비 완료 |

## 코드 예시

\`\`\`ts
type ThemeMode = 'light' | 'dark' | 'system'

function resolveTheme(mode: ThemeMode) {
  return mode === 'system' ? 'os setting' : mode
}
\`\`\`

## 인용문 예시

> 목표는 빠르고 가벼운 Markdown 편집 경험입니다.

## 체크리스트 예시

- [x] 편집
- [x] 프리뷰
- [ ] 네이티브 메뉴
`

function confirmDiscardIfDirty(isDirty: boolean) {
  if (!isDirty) return true
  return window.confirm('저장되지 않은 변경 사항이 있습니다. 계속 진행할까요?')
}

export function useDocumentState(fileService: FileService) {
  const [markdown, setMarkdown] = useState(INITIAL_MARKDOWN)
  const [currentFile, setCurrentFile] = useState<FileDescriptor | null>(null)
  const [fileName, setFileName] = useState(SAMPLE_NAME)
  const [isDirty, setIsDirty] = useState(false)

  const statusText = useMemo(() => (isDirty ? '수정됨' : '저장됨'), [isDirty])

  const applyOpenedFile = (file: OpenedFile) => {
    setMarkdown(file.content)
    setCurrentFile(file.descriptor)
    setFileName(file.descriptor.name)
    setIsDirty(false)
  }

  const updateMarkdown = (value: string) => {
    setMarkdown(value)
    setIsDirty(true)
  }

  const createNewDocument = () => {
    if (!confirmDiscardIfDirty(isDirty)) return

    setMarkdown(INITIAL_MARKDOWN)
    setCurrentFile(null)
    setFileName(SAMPLE_NAME)
    setIsDirty(false)
  }

  const openPicker = async () => {
    if (!confirmDiscardIfDirty(isDirty)) return

    const file = await fileService.openMarkdownFile()
    if (!file) return

    applyOpenedFile(file)
    return file
  }

  const renameFile = (nextFileName: string) => {
    setFileName(nextFileName)
  }

  const updateCurrentFile = (nextFile: FileDescriptor | null) => {
    setCurrentFile(nextFile)
    if (nextFile) {
      setFileName(nextFile.name)
    }
  }

  const markSaved = () => {
    setIsDirty(false)
  }

  return {
    applyOpenedFile,
    currentFile,
    createNewDocument,
    fileName,
    isDirty,
    markdown,
    markSaved,
    openPicker,
    renameFile,
    statusText,
    updateCurrentFile,
    updateMarkdown,
  }
}
