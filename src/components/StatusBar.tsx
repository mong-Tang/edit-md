import { useI18n } from '../i18n'

type StatusBarProps = {
  fileName: string
  message?: string
  statusText: string
}

export function StatusBar({ fileName, message, statusText }: StatusBarProps) {
  const { t } = useI18n()
  const safeMessage = message ?? t('status.ready')

  return (
    <footer className="statusbar">
      <span className="statusbar__item statusbar__item--left" title={`${t('status.file')}: ${fileName}`}>
        {t('status.file')}: {fileName}
      </span>
      <span className="statusbar__item statusbar__item--center" title={`${t('statusbar.status')}: ${statusText}`}>
        {t('statusbar.status')}: {statusText}
      </span>
      <span className="statusbar__item statusbar__item--right" title={`${t('statusbar.message')}: ${safeMessage}`}>
        {safeMessage}
      </span>
    </footer>
  )
}

