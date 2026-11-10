import React, { useState } from 'react';
import { ToastProvider } from './components/ui';
import { AppLayout, NotFoundView } from './components/layout';
import LoginView from './components/LoginView';
import ServiciosView from './components/ServiciosView';
import PaquetesView from './components/PaquetesView';
import ClientesView from './components/ClientesView';
import EmpleadosView from './components/EmpleadosView';
import VentasView from './components/VentasView';
import ReportesView from './components/ReportesView';

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
    return (
      <ToastProvider>
        <LoginView onLoginSuccess={handleLoginSuccess} />
      </ToastProvider>
    );
  }

  const renderModule = () => {
    switch (activeTab) {
      case 'servicios':
        return <ServiciosView />;
      case 'paquetes':
        return <PaquetesView />;
      case 'clientes':
        return <ClientesView />;
      case 'empleados':
        return <EmpleadosView sesion={sesion} />;
      case 'ventas':
        return <VentasView sesion={sesion} />;
      case 'reportes':
        return <ReportesView />;
      default:
        return <NotFoundView onGoHome={() => setActiveTab('servicios')} />;
    }
  };

  return (
    <ToastProvider>
      <AppLayout
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        sesion={sesion}
        onLogout={handleLogout}
      >
        {renderModule()}
      </AppLayout>
    </ToastProvider>
  );
}

export default App;
