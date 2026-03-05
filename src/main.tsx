import ReactDOM from 'react-dom/client'
import { App } from './App'
import { I18nProvider } from './i18n'
import './styles.css'

const appElement = document.getElementById('app')
const splashElement = document.getElementById('boot-splash')
let appShown = false

if (!appElement) {
  throw new Error('#app element is not found.')
}

ReactDOM.createRoot(appElement).render(
  <I18nProvider>
    <App />
  </I18nProvider>,
)

const showApp = () => {
  if (appShown) return
  appShown = true

  appElement.style.visibility = 'visible'

  if (!splashElement) return
  splashElement.classList.add('boot-splash--hide')
  window.setTimeout(() => splashElement.remove(), 220)
}

window.requestAnimationFrame(showApp)
