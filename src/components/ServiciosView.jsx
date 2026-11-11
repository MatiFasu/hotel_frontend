import React, { useState, useEffect } from 'react';
import {
  Plus,
  RefreshCw,
  Trash2,
  Edit2,
  Calendar,
  MapPin,
  Search,
  Filter,
  Tag,
  DollarSign,
  AlertTriangle,
  Compass,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  TableSkeleton,
  EmptyState,
} from './ui';

const TIPOS_SERVICIO = [
  { value: 'HOTEL', label: 'Hotel por noche/s' },
  { value: 'ALQUILER_AUTO', label: 'Alquiler de auto' },
  { value: 'PASAJE_COLECTIVO', label: 'Pasaje de colectivo' },
  { value: 'PASAJE_AVION', label: 'Pasaje de avión' },
  { value: 'PASAJE_TREN', label: 'Pasaje de tren' },
  { value: 'EXCURSION', label: 'Excursión' },
  { value: 'ENTRADA_EVENTO', label: 'Entrada a Evento' }
];

const INITIAL_FORM = {
  nombre: '',
  descripcionBreve: '',
  destinoServicio: '',
  fechaServicio: '',
  costoServicio: '',
  tipoServicio: 'HOTEL'
};

export default function ServiciosView() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const [formData, setFormData] = useState(INITIAL_FORM);

  const cargarServicios = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = '/api/servicios';
      const params = new URLSearchParams();
      if (!mostrarTodos) {
        params.append('activo', 'true');
      }
      if (filtroTipo) {
        params.append('tipoServicio', filtroTipo);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      setServicios(data);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los servicios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarServicios();
  }, [mostrarTodos, filtroTipo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const abrirNuevo = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setShowForm(!showForm);
    setError(null);
    setSuccessMsg(null);
  };

  const abrirEdicion = (servicio) => {
    setEditingId(servicio.codigoServicio);
    setFormData({
      nombre: servicio.nombre || '',
      descripcionBreve: servicio.descripcionBreve || '',
      destinoServicio: servicio.destinoServicio || '',
      fechaServicio: servicio.fechaServicio || '',
      costoServicio: servicio.costoServicio || '',
      tipoServicio: servicio.tipoServicio || 'HOTEL'
    });
    setShowForm(true);
    setError(null);
    setSuccessMsg(null);
  };

  const handleGuardarServicio = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      const isEdit = editingId !== null;
      const url = isEdit ? `/api/servicios/${editingId}` : '/api/servicios';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          costoServicio: parseFloat(formData.costoServicio)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al guardar el servicio turístico');
      }

      setSuccessMsg(
        isEdit
          ? `Servicio "${data.nombre}" actualizado correctamente.`
          : `¡Servicio "${data.nombre}" creado exitosamente con código #${data.codigoServicio}!`
      );
      setShowForm(false);
      setEditingId(null);
      setFormData(INITIAL_FORM);
      cargarServicios();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBaja = async (codigo, nombre) => {
    if (!window.confirm(`¿Estás seguro de dar de baja lógica el servicio "${nombre}" (#${codigo})?`)) return;
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/servicios/${codigo}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || 'Error al dar de baja el servicio');
      }
      setSuccessMsg(`Servicio "${nombre}" (#${codigo}) dado de baja lógica.`);
      cargarServicios();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReactivar = async (codigo, nombre) => {
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/servicios/${codigo}/reactivar`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al reactivar el servicio');
      }
      setSuccessMsg(`Servicio "${nombre}" (#${codigo}) reactivado exitosamente.`);
      cargarServicios();
    } catch (err) {
      setError(err.message);
    }
  };

  // Filtrado local por término de búsqueda (nombre, destino, código)
  const serviciosFiltrados = servicios.filter(s => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (
      s.nombre?.toLowerCase().includes(q) ||
      s.destinoServicio?.toLowerCase().includes(q) ||
      s.codigoServicio?.toString().includes(q) ||
      s.descripcionBreve?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 text-left">
      {/* Encabezado de Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-dark-borderSubtle">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-100 tracking-tight">
            Servicios Turísticos
          </h2>
          <p className="text-xs sm:text-sm text-dark-muted mt-1">
            Catálogo oficial de servicios individuales vigentes para venta directa o composición de paquetes.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={abrirNuevo}
          leftIcon={<Plus size={16} />}
        >
          {showForm ? 'Cerrar Formulario' : 'Nuevo Servicio'}
        </Button>
      </div>

      {/* Alertas */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-start gap-3 animate-slide-up">
          <AlertTriangle size={18} className="shrink-0 text-red-400 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Atención requerida</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center justify-between gap-3 animate-slide-up">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-400/80 hover:text-emerald-200 text-xs font-semibold"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Formulario de Alta / Edición (Colapsable) */}
      {showForm && (
        <Card className="animate-slide-up border-brand-500/30 shadow-lg">
          <CardHeader>
            <CardTitle>
              {editingId ? `Editar Servicio Turístico #${editingId}` : 'Registrar Nuevo Servicio Turístico'}
            </CardTitle>
            <CardDescription>
              Complete los datos del itinerario. El costo debe ser mayor a cero y la fecha debe ser vigente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGuardarServicio} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Nombre del Servicio *</label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    className="input-control"
                    placeholder="Ej. Noche Hotel Costa Galana"
                    value={formData.nombre}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Tipo de Servicio *</label>
                  <select
                    name="tipoServicio"
                    required
                    className="input-control"
                    value={formData.tipoServicio}
                    onChange={handleInputChange}
                  >
                    {TIPOS_SERVICIO.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Destino *</label>
                  <input
                    type="text"
                    name="destinoServicio"
                    required
                    className="input-control"
                    placeholder="Ej. Mar del Plata"
                    value={formData.destinoServicio}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Fecha del Servicio *</label>
                  <input
                    type="date"
                    name="fechaServicio"
                    required
                    min={editingId ? undefined : new Date().toISOString().split('T')[0]}
                    className="input-control"
                    value={formData.fechaServicio}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Costo ($ ARS) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    name="costoServicio"
                    required
                    className="input-control"
                    placeholder="Ej. 45000.00"
                    value={formData.costoServicio}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Descripción Breve</label>
                  <input
                    type="text"
                    name="descripcionBreve"
                    className="input-control"
                    placeholder="Ej. Habitación vista al mar con desayuno"
                    value={formData.descripcionBreve}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-dark-borderSubtle">
                <Button
                  variant="secondary"
                  onClick={() => { setShowForm(false); setEditingId(null); }}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  {editingId ? 'Guardar Cambios' : 'Registrar Servicio'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Barra de Filtros y Búsqueda */}
      <Card>
        <div className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            {/* Buscador */}
            <div className="relative flex-1 min-w-[220px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por nombre, destino o código..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input-control pl-9 text-xs"
              />
            </div>

            {/* Selector de Tipo */}
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-dark-muted shrink-0 hidden sm:block" />
              <select
                className="input-control text-xs w-full sm:w-auto"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="">Todos los tipos (7)</option>
                {TIPOS_SERVICIO.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-dark-borderSubtle">
            {/* Toggle de inactivos */}
            <label className="flex items-center gap-2 text-xs text-dark-muted hover:text-gray-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={mostrarTodos}
                onChange={(e) => setMostrarTodos(e.target.checked)}
                className="rounded border-dark-border bg-dark-surface text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
              />
              <span>Ver dados de baja</span>
            </label>

            {/* Botón Refrescar */}
            <Button
              variant="outline"
              size="sm"
              onClick={cargarServicios}
              leftIcon={<RefreshCw size={13} className={loading ? 'animate-spin' : ''} />}
            >
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Contenedor de Listado (Tabla Desktop + Tarjetas Mobile) */}
      <Card>
        {loading ? (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Servicio</th>
                  <th>Tipo</th>
                  <th>Destino</th>
                  <th>Fecha</th>
                  <th>Costo</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <TableSkeleton rows={5} cols={8} />
              </tbody>
            </table>
          </div>
        ) : serviciosFiltrados.length === 0 ? (
          <EmptyState
            icon={Compass}
            title={busqueda || filtroTipo ? 'No se encontraron servicios con los filtros aplicados' : 'No hay servicios turísticos registrados'}
            description={busqueda || filtroTipo ? 'Prueba ajustando los términos de búsqueda o el tipo de servicio.' : 'Comienza registrando el primer servicio del catálogo.'}
            action={
              <Button variant="primary" size="sm" onClick={abrirNuevo} leftIcon={<Plus size={14} />}>
                Crear Nuevo Servicio
              </Button>
            }
          />
        ) : (
          <>
            {/* Vista de Tabla Desktop / Tablet */}
            <div className="hidden md:block overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-20">Código</th>
                    <th>Servicio</th>
                    <th>Tipo</th>
                    <th>Destino</th>
                    <th>Fecha</th>
                    <th>Costo Oficial</th>
                    <th>Estado</th>
                    <th className="text-right w-36">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-borderSubtle">
                  {serviciosFiltrados.map((s) => {
                    const isActivo = s.activo !== false;
                    return (
                      <tr
                        key={s.codigoServicio}
                        className={`transition-colors hover:bg-dark-elevated/40 ${!isActivo ? 'opacity-60 bg-red-950/5' : ''}`}
                      >
                        <td className="font-semibold text-brand-400">
                          #{s.codigoServicio}
                        </td>
                        <td>
                          <div className="font-semibold text-gray-100">{s.nombre}</div>
                          {s.descripcionBreve && (
                            <div className="text-xs text-dark-muted truncate max-w-xs">{s.descripcionBreve}</div>
                          )}
                        </td>
                        <td>
                          <Badge variant="info" size="sm">
                            {s.tipoServicio}
                          </Badge>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 text-xs text-gray-300">
                            <MapPin size={13} className="text-dark-muted" />
                            <span>{s.destinoServicio}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 text-xs text-gray-300">
                            <Calendar size={13} className="text-dark-muted" />
                            <span>{s.fechaServicio}</span>
                          </div>
                        </td>
                        <td>
                          <span className="font-bold text-emerald-400 text-sm">
                            ${parseFloat(s.costoServicio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td>
                          <Badge variant={isActivo ? 'success' : 'danger'} size="sm" dot>
                            {isActivo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            {isActivo ? (
                              <>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => abrirEdicion(s)}
                                  leftIcon={<Edit2 size={12} />}
                                >
                                  Editar
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleBaja(s.codigoServicio, s.nombre)}
                                  title="Dar de baja lógica"
                                >
                                  <Trash2 size={13} />
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleReactivar(s.codigoServicio, s.nombre)}
                                leftIcon={<RefreshCw size={12} />}
                              >
                                Reactivar
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Vista en Tarjetas para Móviles (< 768px) */}
            <div className="md:hidden divide-y divide-dark-borderSubtle">
              {serviciosFiltrados.map((s) => {
                const isActivo = s.activo !== false;
                return (
                  <div key={s.codigoServicio} className={`p-4 space-y-3 ${!isActivo ? 'opacity-70 bg-red-950/10' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-brand-400">#{s.codigoServicio}</span>
                          <Badge variant={isActivo ? 'success' : 'danger'} size="sm" dot>
                            {isActivo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-100 mt-1">{s.nombre}</h4>
                        {s.descripcionBreve && (
                          <p className="text-xs text-dark-muted mt-0.5">{s.descripcionBreve}</p>
                        )}
                      </div>
                      <Badge variant="info" size="sm">
                        {s.tipoServicio}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 py-1 border-y border-dark-borderSubtle/50">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-dark-muted" />
                        <span className="truncate">{s.destinoServicio}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-dark-muted" />
                        <span>{s.fechaServicio}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-dark-muted block uppercase">Costo</span>
                        <span className="text-sm font-bold text-emerald-400">
                          ${parseFloat(s.costoServicio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isActivo ? (
                          <>
                            <Button variant="secondary" size="sm" onClick={() => abrirEdicion(s)}>
                              <Edit2 size={12} className="mr-1" /> Editar
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleBaja(s.codigoServicio, s.nombre)}>
                              <Trash2 size={13} />
                            </Button>
                          </>
                        ) : (
                          <Button variant="success" size="sm" onClick={() => handleReactivar(s.codigoServicio, s.nombre)}>
                            <RefreshCw size={12} className="mr-1" /> Reactivar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
