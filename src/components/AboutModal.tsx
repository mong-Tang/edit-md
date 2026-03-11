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
  primaryActionLabel?: string | null
}

export function AboutModal({
  appVersion,
  customLines = null,
  customTitle = null,
  isOpen,
  onClose,
  onOpenExternal,
  onPrimaryAction = null,
  primaryActionLabel = null,
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
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="about-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="about-modal-title" className="about-modal__title">
          {customTitle ?? t('about.title')}
        </h2>
        {hasCustomContent ? (
          customLines.map((line, index) => (
            <p key={`${line}-${index}`} className="about-modal__line">
              {line}
            </p>
          ))
        ) : (
          <>
            <p className="about-modal__line">{t('about.tagline')}</p>
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
          </>
        )}
        <div className="about-modal__actions">
          {primaryActionLabel && onPrimaryAction ? (
            <button type="button" onClick={onPrimaryAction}>
              {primaryActionLabel}
            </button>
          ) : null}
          <button type="button" onClick={onClose}>
            {t('about.close')}
          </button>
        </div>
      </section>
    </div>
  )
}
