import React from 'react';
import {
  Compass,
  Briefcase,
  Users,
  UserCheck,
  ShoppingBag,
  BarChart3,
  X,
  LogOut,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '../ui';

export const NAV_SECTIONS = [
  {
    title: 'Catálogo',
    items: [
      { id: 'servicios', label: 'Servicios Turísticos', icon: Compass, description: 'Catálogo de servicios individuales' },
      { id: 'paquetes', label: 'Paquetes Turísticos', icon: Briefcase, badge: '10% OFF', description: 'Combinaciones con descuento' },
    ],
  },
  {
    title: 'Padrón',
    items: [
      { id: 'clientes', label: 'Clientes', icon: Users, description: 'Padrón y altas/bajas' },
      { id: 'empleados', label: 'Empleados', icon: UserCheck, description: 'Nómina y sueldos' },
    ],
  },
  {
    title: 'Operaciones',
    items: [
      { id: 'ventas', label: 'Punto de Venta', icon: ShoppingBag, description: 'Emisión y anulación de ventas' },
      { id: 'reportes', label: 'Reportes & Ganancias', icon: BarChart3, description: 'Arqueo diario y balance mensual' },
    ],
  },
];

export default function Sidebar({
  activeTab,
  onSelectTab,
  sesion,
  onLogout,
  mobileOpen,
  onCloseMobile,
}) {
  const esAdmin = sesion?.rol === 'ADMIN';

  return (
    <>
      {/* Backdrop para Mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Contenedor del Sidebar */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-64 bg-dark-surface border-r border-dark-borderSubtle
          flex flex-col transition-transform duration-200 ease-in-out
          md:translate-x-0
          ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-dark-borderSubtle">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm shadow-brand-500/30">
              <Compass size={20} className="animate-spin-slow" />
            </div>
            <div className="text-left">
              <h1 className="text-sm font-bold text-gray-100 tracking-tight leading-tight">
                HackaCode Turismo
              </h1>
              <p className="text-[11px] text-dark-muted font-medium">Agencia & Hospitalidad</p>
            </div>
          </div>

          {/* Botón cerrar en Mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Cerrar menú"
            className="md:hidden text-dark-muted hover:text-white p-1 rounded-lg hover:bg-dark-elevated transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Lista de Navegación */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-left" aria-label="Navegación principal">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              <h2 className="px-3 text-[11px] font-bold uppercase tracking-wider text-dark-subtle select-none">
                {section.title}
              </h2>
              <div className="space-y-0.5 pt-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectTab(item.id);
                        onCloseMobile?.();
                      }}
                      className={`
                        w-full group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium
                        transition-all duration-150 select-none
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
                        ${isActive
                          ? 'bg-brand-600/15 text-brand-300 font-semibold shadow-sm border border-brand-500/20'
                          : 'text-gray-400 hover:text-gray-100 hover:bg-dark-elevated/70'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          size={17}
                          className={`shrink-0 transition-colors ${
                            isActive ? 'text-brand-400' : 'text-dark-muted group-hover:text-gray-300'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.badge}
                        </span>
                      ) : isActive ? (
                        <ChevronRight size={14} className="text-brand-400 shrink-0 opacity-75" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Card en Pie del Sidebar */}
        <div className="p-3 border-t border-dark-borderSubtle bg-dark-surface/50 text-left">
          <div className="flex items-center justify-between p-2 rounded-lg bg-dark-elevated/60 border border-dark-borderSubtle">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-brand-950 border border-brand-500/30 text-brand-300 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                {sesion?.nombreCompleto ? sesion.nombreCompleto.charAt(0) : 'U'}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-semibold text-gray-200 truncate">
                  {sesion?.nombreCompleto || 'Usuario'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant={esAdmin ? 'warning' : 'info'} size="sm">
                    {sesion?.rol || 'USUARIO'}
                  </Badge>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="text-dark-muted hover:text-red-400 p-1.5 rounded-lg hover:bg-red-950/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
