import React, { useState } from 'react';
import LoginView from './components/LoginView';
import ServiciosView from './components/ServiciosView';
import PaquetesView from './components/PaquetesView';
import ClientesView from './components/ClientesView';
import EmpleadosView from './components/EmpleadosView';
import VentasView from './components/VentasView';
import ReportesView from './components/ReportesView';
import {
  Compass,
  Briefcase,
  Users,
  UserCheck,
  ShoppingBag,
  BarChart3,
  LogOut,
  ShieldCheck
} from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('servicios');
  const [sesion, setSesion] = useState(() => {
    try {
      const guardada = sessionStorage.getItem('hackacode_sesion');
      return guardada ? JSON.parse(guardada) : null;
    } catch (_) {
      return null;
    }
  });

  const handleLoginSuccess = (datosSesion) => {
    setSesion(datosSesion);
    try {
      sessionStorage.setItem('hackacode_sesion', JSON.stringify(datosSesion));
    } catch (_) {}
  };

  const handleLogout = () => {
    setSesion(null);
    setActiveTab('servicios');
    try {
      sessionStorage.removeItem('hackacode_sesion');
    } catch (_) {}
  };

  // Bloqueo de acceso: si el usuario no inició sesión con credenciales válidas, solo ve la pantalla de Login
  if (!sesion) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const navItems = [
    { id: 'servicios', label: 'Servicios Turísticos', icon: Compass, enabled: true },
    { id: 'paquetes', label: 'Paquetes', icon: Briefcase, enabled: true },
    { id: 'clientes', label: 'Clientes', icon: Users, enabled: true },
    { id: 'empleados', label: 'Empleados', icon: UserCheck, enabled: true },
    { id: 'ventas', label: 'Punto de Venta', icon: ShoppingBag, enabled: true },
    { id: 'reportes', label: 'Reportes & Ganancias', icon: BarChart3, enabled: true },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Barra de Navegación Superior */}
      <header className="glass-panel" style={{ margin: '1rem', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 'var(--radius-md)', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Compass size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              HackaCode Turismo
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Agencia de Turismo & Hotel — HackaCode 2da Edición</p>
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <nav style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => item.enabled && setActiveTab(item.id)}
                disabled={!item.enabled}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: item.enabled ? 'pointer' : 'not-allowed',
                  opacity: item.enabled ? 1 : 0.4,
                  background: isActive ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.04)',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  transition: 'var(--transition-fast)'
                }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}

          {/* Usuario Autenticado y Botón de Cerrar Sesión */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginLeft: '0.5rem', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.14)', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
            <ShieldCheck size={16} color="var(--accent-success)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
              {sesion.nombreCompleto}
              <span className="badge badge-type" style={{ fontSize: '0.68rem', marginLeft: '6px' }}>{sesion.rol}</span>
            </span>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              style={{
                background: 'rgba(239, 68, 68, 0.18)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '6px',
                color: '#f87171',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.25rem 0.55rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                marginLeft: '0.25rem'
              }}
            >
              <LogOut size={13} />
              Salir
            </button>
          </div>
        </nav>
      </header>

      {/* Contenido Principal */}
      <main style={{ flex: 1, padding: '0 1rem 2rem 1rem', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        {activeTab === 'servicios' && <ServiciosView />}
        {activeTab === 'paquetes' && <PaquetesView />}
        {activeTab === 'clientes' && <ClientesView />}
        {activeTab === 'empleados' && <EmpleadosView sesion={sesion} />}
        {activeTab === 'ventas' && <VentasView sesion={sesion} />}
        {activeTab === 'reportes' && <ReportesView />}
      </main>
    </div>
  );
}

export default App;
