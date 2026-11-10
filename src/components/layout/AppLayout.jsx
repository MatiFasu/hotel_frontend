import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout({
  activeTab,
  onSelectTab,
  sesion,
  onLogout,
  children,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col">
      {/* Sidebar fijo / cajón responsive */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        sesion={sesion}
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Contenedor Principal (desplazado en Desktop a la derecha del Sidebar) */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        {/* Header Superior Sticky */}
        <Header
          activeTab={activeTab}
          onOpenMobile={() => setMobileOpen(true)}
          sesion={sesion}
          onLogout={onLogout}
        />

        {/* Área de Contenido Principal */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
