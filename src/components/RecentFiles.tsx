import type { RecentFileEntry } from '../types/recentFile'

type RecentFilesProps = {
  onSelect: (file: RecentFileEntry) => void
  recentFiles: RecentFileEntry[]
}

function formatRecentDate(value: string) {
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      month: '2-digit',
    }).format(new Date(value))
  } catch {
    return value
  }
}

export function RecentFiles({ onSelect, recentFiles }: RecentFilesProps) {
  return (
    <section className="recent-files">
      <strong className="recent-files__title">최근 파일</strong>

      {recentFiles.length === 0 ? (
        <span className="recent-files__empty">아직 기록이 없습니다.</span>
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
              <span className="recent-file-chip__time">{formatRecentDate(file.updatedAt)}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
