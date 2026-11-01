import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { OperationsProvider } from './state/OperationsProvider'
import './styles.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element missing')
}

createRoot(root).render(
    <StrictMode>
      <OperationsProvider>
        <App />
      </OperationsProvider>
    </StrictMode>,
)
