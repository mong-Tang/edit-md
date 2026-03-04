type DocumentTabItem = {
  fileName: string
  id: string
  isDirty: boolean
}

type DocumentTabsProps = {
  activeTabId: string
  onClose: (tabId: string) => void
  onSelect: (tabId: string) => void
  tabs: DocumentTabItem[]
}

export function DocumentTabs({ activeTabId, onClose, onSelect, tabs }: DocumentTabsProps) {
  return (
    <nav className="document-tabs" aria-label="열린 문서">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`document-tab${tab.id === activeTabId ? ' document-tab--active' : ''}`}
          onClick={() => onSelect(tab.id)}
        >
          <span className="document-tab__name" title={tab.fileName}>
            {tab.fileName}
          </span>
          {tab.isDirty ? <span className="document-tab__dirty" aria-hidden="true">●</span> : null}
          <span
            role="button"
            tabIndex={0}
            className="document-tab__close"
            aria-label={`${tab.fileName} 닫기`}
            onClick={(event) => {
              event.stopPropagation()
              onClose(tab.id)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                event.stopPropagation()
                onClose(tab.id)
              }
            }}
          >
            ×
          </span>
        </button>
      ))}
    </nav>
  )
}
