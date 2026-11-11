import React, { useState, useEffect } from 'react';
import {
  Plus,
  RefreshCw,
  Trash2,
  Edit2,
  Search,
  Mail,
  Phone,
  MapPin,
  User,
  AlertTriangle,
  Calendar,
  Globe,
  Users,
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
  Modal,
  ConfirmDialog,
  useToast,
} from './ui';

const INITIAL_FORM = {
  nombre: '',
  apellido: '',
  dni: '',
  fechaNacimiento: '',
  nacionalidad: 'Argentina',
  direccion: '',
  celular: '',
  email: ''
};

export default function ClientesView() {
  const toast = useToast();

  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [formData, setFormData] = useState(INITIAL_FORM);

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    id: null,
    nombre: '',
    loading: false,
  });

  const cargarClientes = async () => {
    try {
      setLoading(true);
      let url = '/api/clientes';
      const params = new URLSearchParams();
      if (!mostrarTodos) {
        params.append('activo', 'true');
      }
      if (busqueda.trim()) {
        params.append('q', busqueda.trim());
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Error ${res.status}: No se pudieron obtener los clientes`);
      }
      const data = await res.json();
      setClientes(data);
    } catch (err) {
      toast.error(err.message || 'No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, [mostrarTodos, busqueda]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const abrirNuevo = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setFormError(null);
    setShowModal(true);
  };

  const abrirEdicion = (cliente) => {
    setEditingId(cliente.idCliente);
    setFormData({
      nombre: cliente.nombre || '',
      apellido: cliente.apellido || '',
      dni: cliente.dni || '',
      fechaNacimiento: cliente.fechaNacimiento || '',
      nacionalidad: cliente.nacionalidad || '',
      direccion: cliente.direccion || '',
      celular: cliente.celular || '',
      email: cliente.email || ''
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    try {
      setFormLoading(true);
      const isEdit = editingId !== null;
      const url = isEdit ? `/api/clientes/${editingId}` : '/api/clientes';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al guardar el cliente');
      }

      if (isEdit) {
        toast.success(`Cliente "${data.nombre} ${data.apellido}" actualizado correctamente.`);
      } else if (res.status === 200 || data.reactivado) {
        toast.success(`¡DNI encontrado inactivo! El cliente "${data.nombre} ${data.apellido}" fue reactivado y actualizado (HTTP 200).`);
      } else {
        toast.success(`¡Cliente "${data.nombre} ${data.apellido}" registrado exitosamente (HTTP 201)!`);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData(INITIAL_FORM);
      cargarClientes();
    } catch (err) {
      setFormError(err.message);
      toast.error(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const solicitarBaja = (id, nombreCompleto) => {
    setConfirmState({
      isOpen: true,
      id,
      nombre: nombreCompleto,
      loading: false,
    });
  };

  const ejecutarBaja = async () => {
    try {
      setConfirmState(prev => ({ ...prev, loading: true }));
      const res = await fetch(`/api/clientes/${confirmState.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al dar de baja al cliente');
      toast.success(`Cliente "${confirmState.nombre}" dado de baja lógica.`);
      setConfirmState({ isOpen: false, id: null, nombre: '', loading: false });
      cargarClientes();
    } catch (err) {
      toast.error(err.message);
      setConfirmState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleReactivar = async (id, nombreCompleto) => {
    try {
      const res = await fetch(`/api/clientes/${id}/reactivar`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al reactivar el cliente');
      toast.success(`Cliente "${nombreCompleto}" reactivado exitosamente.`);
      cargarClientes();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-dark-borderSubtle">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-100 tracking-tight">
            Padrón de Clientes
          </h2>
          <p className="text-xs sm:text-sm text-dark-muted mt-1">
            Administración filiatoria con unicidad de DNI y reactivación automática de registros históricos.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={abrirNuevo}
          leftIcon={<Plus size={16} />}
        >
          Nuevo Cliente
        </Button>
      </div>

      {/* Modal Accesible de Alta / Edición */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? `Editar Cliente #${editingId}` : 'Registrar Nuevo Cliente'}
        description="Los clientes dados de baja que se registren nuevamente con el mismo DNI se reactivarán automáticamente conservando su historial."
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Nombre *</label>
              <input
                type="text"
                name="nombre"
                required
                className="input-control"
                placeholder="Ej. Martín"
                value={formData.nombre}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Apellido *</label>
              <input
                type="text"
                name="apellido"
                required
                className="input-control"
                placeholder="Ej. Rossi"
                value={formData.apellido}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">DNI *</label>
              <input
                type="text"
                name="dni"
                required
                className="input-control"
                placeholder="Ej. 34111222"
                value={formData.dni}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Fecha de Nacimiento *</label>
              <input
                type="date"
                name="fechaNacimiento"
                required
                className="input-control"
                value={formData.fechaNacimiento}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Nacionalidad *</label>
              <input
                type="text"
                name="nacionalidad"
                required
                className="input-control"
                placeholder="Ej. Argentina"
                value={formData.nacionalidad}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Celular *</label>
              <input
                type="text"
                name="celular"
                required
                className="input-control"
                placeholder="Ej. +54 9 221 4455-6677"
                value={formData.celular}
                onChange={handleInputChange}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email *</label>
              <input
                type="email"
                name="email"
                required
                className="input-control"
                placeholder="Ej. martin.rossi@email.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Dirección *</label>
              <input
                type="text"
                name="direccion"
                required
                className="input-control"
                placeholder="Ej. Calle 50 Nº 620"
                value={formData.direccion}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-borderSubtle mt-2">
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
            >
              {editingId ? 'Guardar Cambios' : 'Registrar Cliente'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Diálogo de Confirmación Accesible */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={ejecutarBaja}
        title="¿Dar de baja lógica al cliente?"
        message={`¿Estás seguro de dar de baja lógica al cliente "${confirmState.nombre}"? Sus ventas históricas permanecerán intactas y su registro podrá ser reactivado.`}
        confirmText="Dar de Baja"
        variant="danger"
        loading={confirmState.loading}
      />

      {/* Barra de Filtros y Búsqueda */}
      <Card>
        <div className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted pointer-events-none" />
            <input
              type="text"
              className="input-control pl-9 text-xs"
              placeholder="Buscar por DNI, nombre o apellido..."
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
              onClick={cargarClientes}
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
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>DNI</th>
                  <th>Nacionalidad / Nac.</th>
                  <th>Contacto</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <TableSkeleton rows={5} cols={7} />
              </tbody>
            </table>
          </div>
        ) : clientes.length === 0 ? (
          <EmptyState
            icon={Users}
            title={busqueda ? 'No se encontraron clientes para la búsqueda' : 'No hay clientes registrados'}
            description={busqueda ? 'Prueba con otro término de búsqueda o DNI.' : 'Comienza registrando tu primer cliente en el padrón.'}
            action={
              <Button variant="primary" size="sm" onClick={abrirNuevo} leftIcon={<Plus size={14} />}>
                Registrar Cliente
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
                    <th className="w-16">ID</th>
                    <th>Cliente</th>
                    <th>DNI</th>
                    <th>Nacionalidad / Nac.</th>
                    <th>Contacto</th>
                    <th>Estado</th>
                    <th className="text-right w-36">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-borderSubtle">
                  {clientes.map((c) => {
                    const isActivo = c.activo !== false;
                    const nombreCompleto = `${c.nombre} ${c.apellido}`;
                    return (
                      <tr
                        key={c.idCliente}
                        className={`transition-colors hover:bg-dark-elevated/40 ${!isActivo ? 'opacity-60 bg-red-950/5' : ''}`}
                      >
                        <td className="font-semibold text-brand-400">
                          #{c.idCliente}
                        </td>
                        <td>
                          <div className="flex items-center gap-2 font-semibold text-gray-100">
                            <User size={14} className="text-brand-400 shrink-0" />
                            <span>{nombreCompleto}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-dark-muted mt-0.5">
                            <MapPin size={12} className="shrink-0" />
                            <span className="truncate max-w-xs">{c.direccion}</span>
                          </div>
                        </td>
                        <td>
                          <Badge variant="neutral" size="sm">
                            {c.dni}
                          </Badge>
                        </td>
                        <td>
                          <div className="text-xs text-gray-200">{c.nacionalidad}</div>
                          <div className="flex items-center gap-1 text-[11px] text-dark-muted mt-0.5">
                            <Calendar size={11} />
                            <span>{c.fechaNacimiento}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 text-xs text-gray-300">
                            <Mail size={12} className="text-dark-muted shrink-0" />
                            <span className="truncate max-w-[180px]">{c.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-dark-muted mt-0.5">
                            <Phone size={12} className="shrink-0" />
                            <span>{c.celular}</span>
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
                                  onClick={() => abrirEdicion(c)}
                                  leftIcon={<Edit2 size={12} />}
                                >
                                  Editar
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => solicitarBaja(c.idCliente, nombreCompleto)}
                                  title="Dar de baja lógica"
                                >
                                  <Trash2 size={13} />
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleReactivar(c.idCliente, nombreCompleto)}
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
              {clientes.map((c) => {
                const isActivo = c.activo !== false;
                const nombreCompleto = `${c.nombre} ${c.apellido}`;
                return (
                  <div key={c.idCliente} className={`p-4 space-y-3 ${!isActivo ? 'opacity-70 bg-red-950/10' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-brand-400">#{c.idCliente}</span>
                          <Badge variant={isActivo ? 'success' : 'danger'} size="sm" dot>
                            {isActivo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-100 mt-1">{nombreCompleto}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-dark-muted mt-0.5">
                          <MapPin size={12} />
                          <span>{c.direccion}</span>
                        </div>
                      </div>
                      <Badge variant="neutral" size="sm">
                        DNI {c.dni}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 py-1.5 border-y border-dark-borderSubtle/50">
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail size={12} className="text-dark-muted shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone size={12} className="text-dark-muted shrink-0" />
                        <span>{c.celular}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-dark-muted">
                        Nac: {c.fechaNacimiento} ({c.nacionalidad})
                      </span>

                      <div className="flex items-center gap-2">
                        {isActivo ? (
                          <>
                            <Button variant="secondary" size="sm" onClick={() => abrirEdicion(c)}>
                              <Edit2 size={12} className="mr-1" /> Editar
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => solicitarBaja(c.idCliente, nombreCompleto)}>
                              <Trash2 size={13} />
                            </Button>
                          </>
                        ) : (
                          <Button variant="success" size="sm" onClick={() => handleReactivar(c.idCliente, nombreCompleto)}>
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
