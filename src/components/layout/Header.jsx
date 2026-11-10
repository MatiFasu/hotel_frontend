import React from 'react';
import { Menu, Database, ShieldCheck, LogOut, ChevronRight } from 'lucide-react';
import { Badge, Button } from '../ui';
import { NAV_SECTIONS } from './Sidebar';

export default function Header({
  activeTab,
  onOpenMobile,
  sesion,
  onLogout,
}) {
  // Encontrar sección y título activo para el breadcrumb
  let activeSectionTitle = 'Módulo';
  let activeItemLabel = 'Sección';

  for (const sec of NAV_SECTIONS) {
    const found = sec.items.find((i) => i.id === activeTab);
    if (found) {
      activeSectionTitle = sec.title;
      activeItemLabel = found.label;
      break;
    }
  }

  const esAdmin = sesion?.rol === 'ADMIN';

  return (
    <header className="sticky top-0 z-30 h-16 bg-dark-surface/90 backdrop-blur-md border-b border-dark-borderSubtle px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Lado Izquierdo: Botón Mobile + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Abrir menú de navegación"
          className="md:hidden text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-dark-elevated transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb accesible */}
        <nav aria-label="Ruta de navegación" className="flex items-center gap-1.5 text-xs text-dark-muted min-w-0">
          <span className="hidden sm:inline-block font-medium hover:text-gray-300 select-none">
            {activeSectionTitle}
          </span>
          <ChevronRight size={14} className="hidden sm:inline-block text-dark-subtle shrink-0" />
          <span className="font-semibold text-gray-100 truncate">
            {activeItemLabel}
          </span>
        </nav>
      </div>

      {/* Lado Derecho: Estado del Sistema + Sesión */}
      <div className="flex items-center gap-3">
        {/* Chip de Conexión a Base de Datos */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/30 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <Database size={12} className="opacity-80" />
          <span>Supabase DB</span>
        </div>

        {/* Separador */}
        <div className="hidden sm:block w-px h-5 bg-dark-borderSubtle" />

        {/* Badge de Rol */}
        <div className="flex items-center gap-2">
          <Badge variant={esAdmin ? 'warning' : 'info'} size="sm">
            <span className="hidden sm:inline mr-1">Rol:</span>
            {sesion?.rol || 'USUARIO'}
          </Badge>

          {/* Botón Salir */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-gray-400 hover:text-red-400 hover:bg-red-950/20 text-xs px-2 sm:px-3"
            leftIcon={<LogOut size={14} />}
          >
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
