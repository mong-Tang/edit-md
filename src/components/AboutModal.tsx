import { useEffect } from 'react'
import { useI18n } from '../i18n'

type AboutModalProps = {
  appVersion: string
  customLines?: string[] | null
  customTitle?: string | null
  isOpen: boolean
  onClose: () => void
  onOpenExternal: (url: string) => void
  onPrimaryAction?: (() => void) | null

}

export function AboutModal({
  appVersion,
  customLines = null,
  customTitle = null,
  isOpen,
  onClose,
  onOpenExternal,
  onPrimaryAction = null,

}: AboutModalProps) {
  const { t } = useI18n()
  const websiteUrl = 'https://mongtang-ai.vercel.app'
  const hasCustomContent = !!customLines && customLines.length > 0

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="about-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="about-modal-title" className="about-modal__title">
          <div className="about-modal__logo">md</div>
          {customTitle ?? 'mongTang.md'}
        </h2>
        {hasCustomContent ? (
          <div className="about-modal__content">
            {customLines.map((line, index) => {
              if (line.startsWith('- ')) {
                return (
                  <li key={`${line}-${index}`} className="about-modal__list-item">
                    {line.replace('- ', '')}
                  </li>
                )
              }
              return (
                <p key={`${line}-${index}`} className="about-modal__line">
                  {line}
                </p>
              )
            })}
          </div>
        ) : (
          <>
            <p className="about-modal__description">
              사용자의 사유를 가장 순수하게 담아내는 지능형 마크다운 워크스테이션입니다. 
              복잡한 설정을 배제하고 오직 글쓰기와 시각화에만 집중할 수 있는 최적의 환경을 제공합니다.
            </p>
            <p className="about-modal__line">{t('about.version', { version: appVersion })}</p>
            <p className="about-modal__line">
              <a
                className="about-modal__link"
                href={websiteUrl}
                onClick={(event) => {
                  event.preventDefault()
                  onOpenExternal(websiteUrl)
                }}
              >
                {websiteUrl}
              </a>
            </p>
            <div className="about-modal__changelog">
              <p className="about-modal__changelog-title">최근 주요 개선 사항</p>
              <li className="about-modal__list-item">초슬림 워크스테이션 레이아웃 최적화</li>
              <li className="about-modal__list-item">화면 전체를 활용하는 Zero-Padding 시스템</li>
              <li className="about-modal__list-item">전문가용 정밀 커서 및 스크롤 조작 환경</li>
              <li className="about-modal__list-item">다크 모드 가독성 및 UI 감도 미세 조정</li>
            </div>
          </>
        )}
        <div className="about-modal__actions">
          <button 
            type="button" 
            className="about-modal__button--secondary"
            onClick={() => {
              onPrimaryAction?.() // 여기서 changelog를 새 탭으로 여는 함수 호출
            }}
          >
            변경 사항을 에디터로 열기
          </button>
          <button type="button" onClick={onClose}>
            {t('about.close')}
          </button>
        </div>
      </section>
    </div>
  )
}
