import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthGate } from './auth/AuthGate'
import { AuthProvider } from './auth/AuthProvider'
import './styles.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element missing')
}

createRoot(root).render(
  <StrictMode>
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  </StrictMode>,
)
