import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ContentProvider } from '@/content/ContentContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import './index.css'
import App from './App'

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('Root element #root not found')
}

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <ContentProvider>
        <App />
      </ContentProvider>
    </ErrorBoundary>
  </StrictMode>,
)
