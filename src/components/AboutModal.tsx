import { useEffect } from 'react'
import { useI18n } from '../i18n'

type AboutModalProps = {
  appVersion: string
  isOpen: boolean
  onClose: () => void
  onOpenExternal: (url: string) => void
}

export function AboutModal({ appVersion, isOpen, onClose, onOpenExternal }: AboutModalProps) {
  const { t } = useI18n()
  const websiteUrl = 'https://mongtang-ai.vercel.app'

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
          {t('about.title')}
        </h2>
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
        <div className="about-modal__actions">
          <button type="button" onClick={onClose}>
            {t('about.close')}
          </button>
        </div>
      </section>
    </div>
  )
}
