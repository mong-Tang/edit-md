import { useI18n } from '../i18n'

type StatusBarProps = {
  fileName: string
  message?: string
  statusText: string
  onOpenMongTangAi: () => void
}

export function StatusBar({ fileName, message, statusText, onOpenMongTangAi }: StatusBarProps) {
  const { t } = useI18n()
  const safeMessage = message ?? t('status.ready')

  return (
    <footer className="statusbar">
      <div className="statusbar__item statusbar__item--left">
        <button type="button" className="badge-mongtang" onClick={onOpenMongTangAi}>
          mongTang AI
        </button>
        <span className="statusbar__file" title={`${t('status.file')}: ${fileName}`}>
          {t('status.file')}: {fileName}
        </span>
      </div>
      <div className="statusbar__item statusbar__item--center" title={`${t('statusbar.status')}: ${statusText}`}>
        {t('statusbar.status')}: {statusText}
      </div>
      <div className="statusbar__item statusbar__item--right" title={`${t('statusbar.message')}: ${safeMessage}`}>
        {safeMessage}
      </div>
    </footer>
  )
}

