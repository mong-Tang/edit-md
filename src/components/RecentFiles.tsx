import { useI18n } from '../i18n'
import type { RecentFileEntry } from '../types/recentFile'

type RecentFilesProps = {
  onSelect: (file: RecentFileEntry) => void
  recentFiles: RecentFileEntry[]
}

export function RecentFiles({ onSelect, recentFiles }: RecentFilesProps) {
  const { t } = useI18n()

  return (
    <section className="recent-files">
      <strong className="recent-files__title">{t('menu.file.recent')}</strong>

      {recentFiles.length === 0 ? (
        <span className="recent-files__empty">{t('menu.file.recent.empty')}</span>
      ) : (
        <div className="recent-files__list">
          {recentFiles.map((file) => (
            <button
              key={`${file.name}-${file.updatedAt}`}
              type="button"
              className="recent-file-chip"
              title={file.path ?? file.name}
              onClick={() => onSelect(file)}
            >
              <span className="recent-file-chip__name">{file.name}</span>
              <span className="recent-file-chip__backend">{file.backend}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

