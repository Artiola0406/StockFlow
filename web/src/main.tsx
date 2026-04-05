import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './lib/chartSetup'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { SearchProvider } from './context/SearchContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <SearchProvider>
          <App />
        </SearchProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
)
