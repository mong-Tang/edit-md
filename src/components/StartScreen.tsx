import { useI18n } from '../i18n'
import type { RecentFileEntry } from '../types/recentFile'
import { FilePlus, FolderOpen, History, FileText } from 'lucide-react'

type StartScreenProps = {
  onNewFile: () => void
  onOpen: () => void
  recentFiles: RecentFileEntry[]
  onRecentFileSelect: (file: RecentFileEntry) => void
}

export function StartScreen({
  onNewFile,
  onOpen,
  recentFiles,
  onRecentFileSelect,
}: StartScreenProps) {
  const { t } = useI18n()

  return (
    <section className="start-screen" aria-label={t('start.aria')}>
      <div className="start-screen__grid">
        {/* 왼쪽: 브랜드 및 가이드 */}
        <div className="start-screen__card">
          <h1 className="start-screen__title">
            <div className="start-screen__logo">md</div>
            {t('start.title')}
          </h1>
          <p className="start-screen__desc">
            <span className="start-screen__label">{t('start.label.body')}</span>
            {t('start.body')}
          </p>
          <div className="start-screen__mdbox" aria-hidden="true">
            <div className="start-screen__mdhead">
              <span>{t('start.exampleTitle')}</span>
              <span>{t('start.exampleFence')}</span>
            </div>
            <pre className="start-screen__mdcode">{t('start.exampleCode')}</pre>
          </div>
        </div>

        {/* 오른쪽: 액션 및 최근 파일 */}
        <div className="start-screen__actions">
          <div className="start-screen__section">
            <h2 className="start-screen__section-title">{t('start.label.pros')}</h2>
            <div className="start-screen__buttons">
              <button className="start-screen__action-btn" onClick={onNewFile}>
                <FilePlus size={20} />
                <span>{t('menu.file.new')}</span>
              </button>
              <button className="start-screen__action-btn" onClick={onOpen}>
                <FolderOpen size={20} />
                <span>{t('menu.file.open')}</span>
              </button>
            </div>
          </div>

          <div className="start-screen__section">
            <h2 className="start-screen__section-title">
              <History size={16} style={{ marginRight: '8px' }} />
              {t('menu.file.recent')}
            </h2>
            <div className="start-screen__recent-list">
              {recentFiles.length > 0 ? (
                recentFiles.map((file) => (
                  <button
                    key={file.path || file.name}
                    className="start-screen__recent-item"
                    onClick={() => onRecentFileSelect(file)}
                  >
                    <FileText size={14} />
                    <span className="start-screen__recent-name">{file.name}</span>
                    <span className="start-screen__recent-path">{file.path}</span>
                  </button>
                ))
              ) : (
                <p className="start-screen__empty-recent">{t('status.recent.noFiles')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
