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
  primaryLabel?: string | null
  onHistoryAction?: (() => void) | null
  historyLabel?: string | null
}

export function AboutModal({
  appVersion,
  customLines = null,
  customTitle = null,
  isOpen,
  onClose,
  onOpenExternal,
  onPrimaryAction = null,
  primaryLabel = null,
  onHistoryAction = null,
  historyLabel = null,
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
              {t('about.description')}
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
              <p className="about-modal__changelog-title">{t('about.features.title')}</p>
              <li className="about-modal__list-item">{t('about.features.1')}</li>
              <li className="about-modal__list-item">{t('about.features.2')}</li>
              <li className="about-modal__list-item">{t('about.features.3')}</li>
              <li className="about-modal__list-item">{t('about.features.4')}</li>
            </div>
          </>
        )}
        <div className="about-modal__actions">
          {onHistoryAction && historyLabel && (
            <button 
              type="button" 
              className="about-modal__button--secondary"
              style={{ marginRight: 'auto' }}
              onClick={() => {
                onHistoryAction() 
              }}
            >
              {historyLabel}
            </button>
          )}
          {onPrimaryAction && primaryLabel && (
            <button 
              type="button" 
              className="about-modal__button--primary"
              onClick={() => {
                onPrimaryAction?.() 
              }}
            >
              {primaryLabel}
            </button>
          )}
          <button type="button" onClick={onClose} className="about-modal__button--secondary">
            {t('about.close')}
          </button>
        </div>
      </section>
    </div>
  )
}
