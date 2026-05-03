/**
 * 파일명이 너무 길 경우 중간을 생략하여 표시합니다.
 * 예: "very_long_file_name_with_extension.md" -> "very_lon...sion.md"
 */
export function truncateFileName(name: string, maxLength = 20): string {
  if (name.length <= maxLength) return name

  // 확장자 분리 (마지막 점 기준)
  const lastDotIndex = name.lastIndexOf('.')
  
  // 확장자가 없거나 점으로 시작하는 경우 (숨김 파일 등) 일반적인 중간 생략
  if (lastDotIndex <= 0) {
    const charsToShow = maxLength - 3
    const frontChars = Math.ceil(charsToShow / 2)
    const backChars = Math.floor(charsToShow / 2)
    return name.substring(0, frontChars) + '...' + name.substring(name.length - backChars)
  }

  const extension = name.substring(lastDotIndex)
  const fileNameWithoutExt = name.substring(0, lastDotIndex)
  
  // 확장자를 포함한 생략 계산
  // 최소 1글자의 파일명 본체는 남김
  const targetNameLength = Math.max(1, maxLength - extension.length - 3)
  const frontChars = Math.ceil(targetNameLength / 2)
  const backChars = Math.floor(targetNameLength / 2)

  return (
    fileNameWithoutExt.substring(0, frontChars) +
    '...' +
    fileNameWithoutExt.substring(fileNameWithoutExt.length - backChars) +
    extension
  )
}
