import React, { useState, useEffect } from 'react';
import {
  Plus,
  RefreshCw,
  Trash2,
  Edit2,
  Briefcase,
  CheckSquare,
  Square,
  Percent,
  Search,
  AlertTriangle,
  Package,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  TableSkeleton,
  EmptyState,
  Modal,
  ConfirmDialog,
  useToast,
} from './ui';

export default function PaquetesView() {
  const toast = useToast();

  const [paquetes, setPaquetes] = useState([]);
  const [serviciosActivos, setServiciosActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const [nombrePaquete, setNombrePaquete] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [filtroServicioModal, setFiltroServicioModal] = useState('');

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    codigo: null,
    nombre: '',
    loading: false,
  });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      let urlPaquetes = '/api/paquetes';
      if (!mostrarTodos) {
        urlPaquetes += '?activo=true';
      }

      const [resPaquetes, resServicios] = await Promise.all([
        fetch(urlPaquetes),
        fetch('/api/servicios?activo=true')
      ]);

      if (!resPaquetes.ok) {
        throw new Error(`Error ${resPaquetes.status}: No se pudieron obtener los paquetes turísticos`);
      }
      if (!resServicios.ok) {
        throw new Error(`Error ${resServicios.status}: No se pudieron obtener los servicios activos`);
      }

      const [dataPaquetes, dataServicios] = await Promise.all([
        resPaquetes.json(),
        resServicios.json()
      ]);

      setPaquetes(dataPaquetes);
      setServiciosActivos(dataServicios);
    } catch (err) {
      toast.error(err.message || 'Error al cargar paquetes turísticos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [mostrarTodos]);

  const abrirNuevo = () => {
    setEditingId(null);
    setNombrePaquete('');
    setSelectedIds([]);
    setFiltroServicioModal('');
    setFormError(null);
    setShowModal(true);
  };

  const abrirEdicion = (paquete) => {
    setEditingId(paquete.codigoPaquete);
    setNombrePaquete(paquete.nombre || '');
    setSelectedIds((paquete.servicios || []).map(s => s.codigoServicio));
    setFiltroServicioModal('');
    setFormError(null);
    setShowModal(true);
  };

  const toggleServicio = (codigoServicio) => {
    setSelectedIds(prev =>
      prev.includes(codigoServicio)
        ? prev.filter(id => id !== codigoServicio)
        : [...prev, codigoServicio]
    );
  };

  // Cálculo dinámico en vivo (suma - 10% OFF con redondeo estándar)
  const serviciosSeleccionados = serviciosActivos.filter(s =>
    selectedIds.includes(s.codigoServicio)
  );
  const subtotal = serviciosSeleccionados.reduce(
    (acc, s) => acc + (parseFloat(s.costoServicio) || 0),
    0
  );
  const descuentoDiez = subtotal * 0.10;
  const costoFinalConDescuento = subtotal - descuentoDiez;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (selectedIds.length < 2) {
      setFormError('Un paquete turístico debe incluir como mínimo 2 servicios turísticos distintos (Decisión 3).');
      return;
    }

    try {
      setFormLoading(true);
      const isEdit = editingId !== null;
      const url = isEdit ? `/api/paquetes/${editingId}` : '/api/paquetes';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        nombre: nombrePaquete.trim(),
        serviciosIds: selectedIds
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al guardar el paquete turístico');
      }

      toast.success(
        isEdit
          ? `Paquete "${data.nombre}" actualizado correctamente.`
          : `¡Paquete "${data.nombre}" creado exitosamente con 10% OFF (#${data.codigoPaquete})!`
      );
      setShowModal(false);
      setEditingId(null);
      setNombrePaquete('');
      setSelectedIds([]);
      cargarDatos();
    } catch (err) {
      setFormError(err.message);
      toast.error(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const solicitarBaja = (codigo, nombre) => {
    setConfirmState({
      isOpen: true,
      codigo,
      nombre,
      loading: false,
    });
  };

  const ejecutarBaja = async () => {
    try {
      setConfirmState(prev => ({ ...prev, loading: true }));
      const res = await fetch(`/api/paquetes/${confirmState.codigo}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al dar de baja el paquete');
      toast.success(`Paquete "${confirmState.nombre}" (#${confirmState.codigo}) dado de baja lógica.`);
      setConfirmState({ isOpen: false, codigo: null, nombre: '', loading: false });
      cargarDatos();
    } catch (err) {
      toast.error(err.message);
      setConfirmState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleReactivar = async (codigo, nombre) => {
    try {
      const res = await fetch(`/api/paquetes/${codigo}/reactivar`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al reactivar el paquete');
      }
      toast.success(`Paquete "${nombre}" (#${codigo}) reactivado exitosamente.`);
      cargarDatos();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const paquetesFiltrados = paquetes.filter(p => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (
      p.nombre?.toLowerCase().includes(q) ||
      p.codigoPaquete?.toString().includes(q) ||
      p.servicios?.some(s => s.nombre?.toLowerCase().includes(q) || s.destinoServicio?.toLowerCase().includes(q))
    );
  });

  const serviciosDisponiblesFiltrados = serviciosActivos.filter(s => {
    if (!filtroServicioModal.trim()) return true;
    const q = filtroServicioModal.toLowerCase();
    return (
      s.nombre?.toLowerCase().includes(q) ||
      s.destinoServicio?.toLowerCase().includes(q) ||
      s.tipoServicio?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 text-left">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-dark-borderSubtle">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-100 tracking-tight">
              Paquetes Turísticos
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              10% OFF Automático
            </span>
          </div>
          <p className="text-xs sm:text-sm text-dark-muted mt-1">
            Combinaciones comerciales de 2 o más servicios con descuento automático garantizado por el sistema.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={abrirNuevo}
          leftIcon={<Plus size={16} />}
        >
          Nuevo Paquete
        </Button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <Card>
        <div className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted pointer-events-none" />
            <input
              type="text"
              className="input-control pl-9 text-xs"
              placeholder="Buscar por nombre de paquete o servicio incluido..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4">
            <label className="flex items-center gap-2 text-xs text-dark-muted hover:text-gray-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={mostrarTodos}
                onChange={(e) => setMostrarTodos(e.target.checked)}
                className="rounded border-dark-border bg-dark-surface text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
              />
              <span>Ver dados de baja</span>
            </label>

            <Button
              variant="outline"
              size="sm"
              onClick={cargarDatos}
              leftIcon={<RefreshCw size={13} className={loading ? 'animate-spin' : ''} />}
            >
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Contenedor de Listado */}
      <Card>
        {loading ? (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre del Paquete</th>
                  <th>Servicios Incluidos</th>
                  <th>Suma Base</th>
                  <th>Costo (-10%)</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <TableSkeleton rows={4} cols={7} />
              </tbody>
            </table>
          </div>
        ) : paquetesFiltrados.length === 0 ? (
          <EmptyState
            icon={Package}
            title={busqueda ? 'No se encontraron paquetes para la búsqueda' : 'No hay paquetes turísticos registrados'}
            description={busqueda ? 'Prueba con otro término de búsqueda.' : 'Combina 2 o más servicios activos para crear tu primer paquete turístico.'}
            action={
              <Button variant="primary" size="sm" onClick={abrirNuevo} leftIcon={<Plus size={14} />}>
                Crear Primer Paquete
              </Button>
            }
          />
        ) : (
          <>
            {/* Tabla Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-16">Código</th>
                    <th>Nombre del Paquete</th>
                    <th>Servicios Incluidos</th>
                    <th>Suma Base</th>
                    <th>Costo Paquete (-10%)</th>
                    <th>Estado</th>
                    <th className="text-right w-36">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-borderSubtle">
                  {paquetesFiltrados.map((p) => {
                    const isActivo = p.activo !== false;
                    const servicios = p.servicios || [];
                    const sumaOriginal = servicios.reduce(
                      (acc, s) => acc + (parseFloat(s.costoServicio) || 0),
                      0
                    );
                    return (
                      <tr
                        key={p.codigoPaquete}
                        className={`transition-colors hover:bg-dark-elevated/40 ${!isActivo ? 'opacity-60 bg-red-950/5' : ''}`}
                      >
                        <td className="font-semibold text-brand-400">
                          #{p.codigoPaquete}
                        </td>
                        <td>
                          <div className="font-semibold text-gray-100 flex items-center gap-2">
                            <Briefcase size={14} className="text-brand-400 shrink-0" />
                            <span>{p.nombre}</span>
                          </div>
                          <div className="text-xs text-dark-muted mt-0.5">
                            {servicios.length} servicios asociados
                          </div>
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-1.5 max-w-sm">
                            {servicios.map(s => (
                              <span
                                key={s.codigoServicio}
                                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-dark-bg border border-dark-borderSubtle text-gray-300"
                                title={`${s.destinoServicio} (${s.fechaServicio}) - $${parseFloat(s.costoServicio).toLocaleString('es-AR')}`}
                              >
                                #{s.codigoServicio} {s.nombre}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className="text-xs text-dark-muted line-through">
                            ${sumaOriginal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td>
                          <div>
                            <span className="font-bold text-emerald-400 text-sm">
                              ${parseFloat(p.costoPaquete).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="block text-[10px] text-emerald-400/80 font-semibold">10% OFF Aplicado</span>
                          </div>
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
                                  onClick={() => abrirEdicion(p)}
                                  leftIcon={<Edit2 size={12} />}
                                >
                                  Editar
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => solicitarBaja(p.codigoPaquete, p.nombre)}
                                  title="Dar de baja lógica"
                                >
                                  <Trash2 size={13} />
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleReactivar(p.codigoPaquete, p.nombre)}
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

            {/* Vista en Tarjetas para Móviles */}
            <div className="md:hidden divide-y divide-dark-borderSubtle">
              {paquetesFiltrados.map((p) => {
                const isActivo = p.activo !== false;
                const servicios = p.servicios || [];
                const sumaOriginal = servicios.reduce(
                  (acc, s) => acc + (parseFloat(s.costoServicio) || 0),
                  0
                );
                return (
                  <div key={p.codigoPaquete} className={`p-4 space-y-3 ${!isActivo ? 'opacity-70 bg-red-950/10' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-brand-400">#{p.codigoPaquete}</span>
                          <Badge variant={isActivo ? 'success' : 'danger'} size="sm" dot>
                            {isActivo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-100 mt-1">{p.nombre}</h4>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        10% OFF
                      </span>
                    </div>

                    {/* Chips de servicios */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-dark-muted uppercase font-bold">Servicios ({servicios.length}):</span>
                      <div className="flex flex-wrap gap-1">
                        {servicios.map(s => (
                          <span key={s.codigoServicio} className="text-[10px] px-1.5 py-0.5 rounded bg-dark-bg border border-dark-borderSubtle text-gray-300">
                            {s.nombre}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-dark-borderSubtle/50">
                      <div>
                        <span className="text-[10px] text-dark-muted line-through block">
                          Base: ${sumaOriginal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-sm font-bold text-emerald-400">
                          ${parseFloat(p.costoPaquete).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isActivo ? (
                          <>
                            <Button variant="secondary" size="sm" onClick={() => abrirEdicion(p)}>
                              <Edit2 size={12} className="mr-1" /> Editar
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => solicitarBaja(p.codigoPaquete, p.nombre)}>
                              <Trash2 size={13} />
                            </Button>
                          </>
                        ) : (
                          <Button variant="success" size="sm" onClick={() => handleReactivar(p.codigoPaquete, p.nombre)}>
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

      {/* Modal Formulario Paquete Turístico */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? `Editar Paquete Turístico #${editingId}` : 'Armar Nuevo Paquete Turístico'}
        description="Seleccione como mínimo 2 servicios turísticos. El descuento del 10% se calcula y aplica automáticamente."
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
              <AlertTriangle size={16} className="text-red-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Nombre del Paquete *</label>
            <input
              type="text"
              required
              className="input-control"
              placeholder="Ej. Escapada a Bariloche Completa (Hotel + Excursión + Vuelo)"
              value={nombrePaquete}
              onChange={(e) => setNombrePaquete(e.target.value)}
            />
          </div>

          {/* Selector de servicios con filtro */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-300">
                Servicios a Incluir (Mínimo 2) *
              </label>
              <Badge variant={selectedIds.length >= 2 ? 'success' : 'warning'} size="sm">
                {selectedIds.length} seleccionados
              </Badge>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted pointer-events-none" />
              <input
                type="text"
                className="input-control pl-8 text-xs py-1.5"
                placeholder="Filtrar servicios por nombre, destino o tipo..."
                value={filtroServicioModal}
                onChange={(e) => setFiltroServicioModal(e.target.value)}
              />
            </div>

            {serviciosActivos.length === 0 ? (
              <div className="p-4 rounded-lg bg-dark-bg border border-dark-borderSubtle text-xs text-dark-muted text-center">
                No hay servicios turísticos activos para combinar. Registre servicios primero.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 border border-dark-borderSubtle rounded-lg bg-dark-bg/40">
                {serviciosDisponiblesFiltrados.map(s => {
                  const isSelected = selectedIds.includes(s.codigoServicio);
                  return (
                    <div
                      key={s.codigoServicio}
                      onClick={() => toggleServicio(s.codigoServicio)}
                      className={`
                        p-2.5 rounded-lg border cursor-pointer select-none transition-all flex items-start gap-2.5
                        ${isSelected
                          ? 'bg-brand-600/20 border-brand-500 text-gray-100 shadow-sm ring-1 ring-brand-500/50'
                          : 'bg-dark-surface/60 border-dark-borderSubtle text-gray-400 hover:border-gray-600 hover:text-gray-200'
                        }
                      `}
                    >
                      <div className="mt-0.5 text-brand-400 shrink-0">
                        {isSelected ? <CheckSquare size={16} /> : <Square size={16} className="text-dark-muted" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold truncate">{s.nombre}</span>
                          <Badge variant="info" size="sm">{s.tipoServicio}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-dark-muted mt-1">
                          <span>{s.destinoServicio}</span>
                          <span className="font-bold text-emerald-400">
                            ${parseFloat(s.costoServicio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Previsualizador de Descuento del 10% */}
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Percent size={18} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-gray-100">Descuento del 10% OFF Normativo</h5>
                <p className="text-[11px] text-dark-muted mt-0.5">
                  Subtotal: ${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })} · Ahorro: -${descuentoDiez.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] text-dark-muted uppercase font-bold tracking-wider block">Costo Final</span>
              <span className="text-lg font-extrabold text-emerald-400">
                ${costoFinalConDescuento.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-dark-borderSubtle">
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              disabled={formLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={formLoading}
              disabled={selectedIds.length < 2}
            >
              {editingId ? 'Guardar Cambios' : 'Crear Paquete con 10% OFF'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Diálogo de Confirmación para Baja */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={ejecutarBaja}
        title="Dar de baja al paquete turístico"
        message={`¿Estás seguro de dar de baja lógica al paquete "${confirmState.nombre}" (#${confirmState.codigo})? No podrá seleccionarse en futuras ventas.`}
        confirmText="Confirmar Baja"
        cancelText="Cancelar"
        variant="danger"
        loading={confirmState.loading}
      />
    </div>
  );
}
