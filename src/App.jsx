import React from 'react'

function App() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <header className="glass-panel" style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '3rem auto' }}>
        <h1 style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2.5rem', marginBottom: '1rem' }}>
          HackaCode Agencia de Turismo & Hotel
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Sistema de gestión integral de Servicios, Paquetes Turísticos, Clientes, Empleados y Ventas.
        </p>
        <button className="btn-primary">
          Inicializar Dashboard
        </button>
      </header>
    </div>
  )
}

export default App
