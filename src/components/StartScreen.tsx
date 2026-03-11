import { useI18n } from '../i18n'

type StartScreenProps = {
  canHideGuide?: boolean
  hideGuide: boolean
  onHideGuideChange: (next: boolean) => void
}

export function StartScreen({ canHideGuide = true, hideGuide, onHideGuideChange }: StartScreenProps) {
  const { t } = useI18n()

  if (hideGuide) {
    return <section className="start-screen start-screen--plain" aria-label={t('start.aria')} />
  }

  return (
    <section className="start-screen" aria-label={t('start.aria')}>
      <div className="start-screen__card">
        <div className="start-screen__brand">
          <div className="start-screen__logo">md</div>
          <div>마크다운 편집기</div>
        </div>
        <h1 className="start-screen__title">{t('start.title')}</h1>
        <p className="start-screen__desc">
          <span className="start-screen__label">{t('start.label.body')}</span>
          {t('start.body')}
        </p>
        <p className="start-screen__desc">
          <span className="start-screen__label">{t('start.label.pros')}</span>
          {t('start.pros')}
        </p>
        <p className="start-screen__desc">
          <span className="start-screen__label">{t('start.label.cons')}</span>
          {t('start.cons')}
        </p>
        <div className="start-screen__mdbox" aria-hidden="true">
          <div className="start-screen__mdhead">
            <span>{t('start.exampleTitle')}</span>
            <span>{t('start.exampleFence')}</span>
          </div>
          <pre className="start-screen__mdcode">{t('start.exampleCode')}</pre>
        </div>
        {canHideGuide ? (
          <label className="start-screen__optout">
            <input
              className="start-screen__optout-check"
              type="checkbox"
              checked={hideGuide}
              onChange={(event) => onHideGuideChange(event.target.checked)}
            />
            <span>{t('start.hideGuideLabel')}</span>
          </label>
        ) : null}
        <div className="start-screen__bar" aria-hidden="true"></div>
      </div>
    </section>
  )
}
