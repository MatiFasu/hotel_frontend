import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { setupAuthInterceptor } from './services/api.js'

// Instalar interceptor global para adjuntar Authorization: Bearer <token> en llamadas /api/
setupAuthInterceptor()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
