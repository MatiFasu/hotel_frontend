import React, { useState, useEffect } from 'react';
import {
  Plus,
  RefreshCw,
  Trash2,
  Edit2,
  Search,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Briefcase,
  Mail,
  Phone,
  AlertTriangle,
  UserCheck,
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

const INITIAL_FORM = {
  nombre: '',
  apellido: '',
  dni: '',
  fechaNac: '',
  nacionalidad: 'Argentina',
  direccion: '',
  celular: '',
  email: '',
  cargo: '',
  sueldo: '',
  username: '',
  password: '',
  rol: 'VENDEDOR'
};

export default function EmpleadosView({ sesion }) {
  const rolUsuario = sesion?.rol || 'VENDEDOR';
  const esAdmin = rolUsuario === 'ADMIN';

  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [sueldosRevelados, setSueldosRevelados] = useState({});
  const [formData, setFormData] = useState(INITIAL_FORM);

  const cargarEmpleados = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = '/api/empleados';
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
        throw new Error(`Error ${res.status}: No se pudieron cargar los empleados`);
      }
      const data = await res.json();
      setEmpleados(data);

      // Si el usuario autenticado es ADMIN, precargar automáticamente las remuneraciones
      if (esAdmin) {
        const sueldosMap = {};
        await Promise.all(
          data.map(async (emp) => {
            try {
              const detRes = await fetch(`/api/empleados/${emp.idEmpleado}`, {
                headers: {
                  'X-User-Role': 'ADMIN',
                  ...(sesion?.token ? { Authorization: `Bearer ${sesion.token}` } : {})
                }
              });
              if (detRes.ok) {
                const det = await detRes.json();
                if (det.sueldo !== undefined && det.sueldo !== null) {
                  sueldosMap[emp.idEmpleado] = det.sueldo;
                }
              }
            } catch (_) {}
          })
        );
        setSueldosRevelados(sueldosMap);
      } else {
        setSueldosRevelados({});
      }
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los empleados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEmpleados();
  }, [mostrarTodos, busqueda, sesion?.rol]);

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

  const abrirEdicion = async (emp) => {
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/empleados/${emp.idEmpleado}`, {
        headers: {
          'X-User-Role': 'ADMIN',
          ...(sesion?.token ? { Authorization: `Bearer ${sesion.token}` } : {})
        }
      });
      const detalle = res.ok ? await res.json() : emp;
      setEditingId(emp.idEmpleado);
      setFormData({
        nombre: detalle.nombre || '',
        apellido: detalle.apellido || '',
        dni: detalle.dni || '',
        fechaNac: detalle.fechaNac || '',
        nacionalidad: detalle.nacionalidad || '',
        direccion: detalle.direccion || '',
        celular: detalle.celular || '',
        email: detalle.email || '',
        cargo: detalle.cargo || '',
        sueldo: detalle.sueldo !== undefined && detalle.sueldo !== null ? detalle.sueldo : '',
        username: detalle.username || '',
        password: '',
        rol: detalle.rol || 'VENDEDOR'
      });
      setShowForm(true);
    } catch (err) {
      setError('No se pudo cargar el detalle del empleado para editar');
    }
  };

  const handleConsultarSueldo = async (idEmpleado) => {
    if (!esAdmin) {
      setError('Acceso denegado: El rol VENDEDOR no tiene permisos para visualizar remuneraciones salariales (Decisión 17).');
      return;
    }
    setError(null);
    try {
      const res = await fetch(`/api/empleados/${idEmpleado}`, {
        headers: {
          'X-User-Role': 'ADMIN',
          ...(sesion?.token ? { Authorization: `Bearer ${sesion.token}` } : {})
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'No se pudo consultar el detalle');
      }
      if (data.sueldo !== undefined && data.sueldo !== null) {
        setSueldosRevelados(prev => ({ ...prev, [idEmpleado]: data.sueldo }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOcultarSueldo = (idEmpleado) => {
    setSueldosRevelados(prev => {
      const next = { ...prev };
      delete next[idEmpleado];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      const isEdit = editingId !== null;
      const url = isEdit ? `/api/empleados/${editingId}` : '/api/empleados';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        sueldo: parseFloat(formData.sueldo)
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al guardar el empleado');
      }

      if (isEdit) {
        setSuccessMsg(`Empleado "${data.nombre} ${data.apellido}" actualizado correctamente.`);
      } else if (res.status === 200 || data.reactivado) {
        setSuccessMsg(`¡DNI encontrado inactivo! El empleado "${data.nombre} ${data.apellido}" fue reactivado y actualizado (HTTP 200).`);
      } else {
        setSuccessMsg(`¡Empleado "${data.nombre} ${data.apellido}" registrado exitosamente (HTTP 201)!`);
      }

      setShowForm(false);
      setEditingId(null);
      setFormData(INITIAL_FORM);
      cargarEmpleados();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBaja = async (id, nombreCompleto) => {
    if (!window.confirm(`¿Estás seguro de dar de baja lógica al empleado "${nombreCompleto}"?`)) return;
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/empleados/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al dar de baja al empleado');
      setSuccessMsg(`Empleado "${nombreCompleto}" dado de baja lógica.`);
      cargarEmpleados();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReactivar = async (id, nombreCompleto) => {
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/empleados/${id}/reactivar`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al reactivar el empleado');
      setSuccessMsg(`Empleado "${nombreCompleto}" reactivado exitosamente.`);
      cargarEmpleados();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-dark-borderSubtle">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-100 tracking-tight">
              Gestión de Personal
            </h2>
            <Badge variant={esAdmin ? 'warning' : 'info'} size="sm">
              {rolUsuario}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-dark-muted mt-1">
            Nómina de empleados con control de credenciales, roles y protección salarial (Decisión 17).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {esAdmin && (
            <Button
              variant="primary"
              onClick={abrirNuevo}
              leftIcon={<Plus size={16} />}
            >
              {showForm ? 'Cerrar Formulario' : 'Nuevo Empleado'}
            </Button>
          )}
        </div>
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

      {/* Formulario Alta / Edición (Solo para ADMIN) */}
      {showForm && esAdmin && (
        <Card className="animate-slide-up border-brand-500/30 shadow-lg">
          <CardHeader>
            <CardTitle>
              {editingId ? `Editar Empleado #${editingId}` : 'Registrar Nuevo Empleado (o Reactivar por DNI)'}
            </CardTitle>
            <CardDescription>
              El sueldo debe ser mayor a cero. Los DNI dados de baja se reactivan automáticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Nombre *</label>
                  <input type="text" name="nombre" required className="input-control" placeholder="Ej. Lucía" value={formData.nombre} onChange={handleInputChange} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Apellido *</label>
                  <input type="text" name="apellido" required className="input-control" placeholder="Ej. Fernández" value={formData.apellido} onChange={handleInputChange} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">DNI *</label>
                  <input type="text" name="dni" required className="input-control" placeholder="Ej. 29888777" value={formData.dni} onChange={handleInputChange} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Fecha de Nacimiento *</label>
                  <input type="date" name="fechaNac" required className="input-control" value={formData.fechaNac} onChange={handleInputChange} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Nacionalidad *</label>
                  <input type="text" name="nacionalidad" required className="input-control" placeholder="Ej. Argentina" value={formData.nacionalidad} onChange={handleInputChange} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Dirección *</label>
                  <input type="text" name="direccion" required className="input-control" placeholder="Ej. Av. Santa Fe 1500" value={formData.direccion} onChange={handleInputChange} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Celular *</label>
                  <input type="text" name="celular" required className="input-control" placeholder="Ej. +54 9 11 5566-7788" value={formData.celular} onChange={handleInputChange} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email *</label>
                  <input type="email" name="email" required className="input-control" placeholder="Ej. lucia@agencia.com" value={formData.email} onChange={handleInputChange} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Cargo *</label>
                  <input type="text" name="cargo" required className="input-control" placeholder="Ej. Ejecutiva de Ventas" value={formData.cargo} onChange={handleInputChange} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Sueldo Mensual ($ ARS) *</label>
                  <input type="number" step="0.01" min="0.01" name="sueldo" required className="input-control" placeholder="Ej. 850000.00" value={formData.sueldo} onChange={handleInputChange} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Usuario (Username) *</label>
                  <input type="text" name="username" required className="input-control" placeholder="Ej. lfernandez" value={formData.username} onChange={handleInputChange} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Contraseña {editingId ? '(Opcional)' : '*'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    required={!editingId}
                    className="input-control"
                    placeholder={editingId ? 'Dejar en blanco para mantener' : 'Contraseña de acceso'}
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Rol en el Sistema *</label>
                  <select name="rol" required className="input-control" value={formData.rol} onChange={handleInputChange}>
                    <option value="VENDEDOR">VENDEDOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-dark-borderSubtle">
                <Button variant="secondary" onClick={() => { setShowForm(false); setEditingId(null); }}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  {editingId ? 'Guardar Cambios' : 'Registrar Empleado'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filtros y Búsqueda */}
      <Card>
        <div className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted pointer-events-none" />
            <input
              type="text"
              className="input-control pl-9 text-xs"
              placeholder="Buscar por DNI, nombre, apellido o cargo..."
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
              onClick={cargarEmpleados}
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
                  <th>Empleado</th>
                  <th>DNI</th>
                  <th>Cargo</th>
                  <th>Usuario / Rol</th>
                  <th>Remuneración</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <TableSkeleton rows={5} cols={8} />
              </tbody>
            </table>
          </div>
        ) : empleados.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title={busqueda ? 'No se encontraron empleados' : 'No hay empleados registrados'}
            description={busqueda ? 'Prueba con otro término de búsqueda o DNI.' : 'Comienza registrando al personal de la agencia.'}
            action={
              esAdmin ? (
                <Button variant="primary" size="sm" onClick={abrirNuevo} leftIcon={<Plus size={14} />}>
                  Registrar Empleado
                </Button>
              ) : null
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
                    <th>Empleado</th>
                    <th>DNI</th>
                    <th>Cargo</th>
                    <th>Usuario / Rol</th>
                    <th>Remuneración (Sueldo)</th>
                    <th>Estado</th>
                    <th className="text-right w-36">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-borderSubtle">
                  {empleados.map((emp) => {
                    const isActivo = emp.activo !== false;
                    const nombreCompleto = `${emp.nombre} ${emp.apellido}`;
                    const sueldoRevelado = sueldosRevelados[emp.idEmpleado];
                    return (
                      <tr
                        key={emp.idEmpleado}
                        className={`transition-colors hover:bg-dark-elevated/40 ${!isActivo ? 'opacity-60 bg-red-950/5' : ''}`}
                      >
                        <td className="font-semibold text-brand-400">
                          #{emp.idEmpleado}
                        </td>
                        <td>
                          <div className="font-semibold text-gray-100">{nombreCompleto}</div>
                          <div className="text-xs text-dark-muted mt-0.5">{emp.email} · {emp.celular}</div>
                        </td>
                        <td>
                          <Badge variant="neutral" size="sm">
                            {emp.dni}
                          </Badge>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 text-xs text-gray-300">
                            <Briefcase size={13} className="text-dark-muted" />
                            <span>{emp.cargo}</span>
                          </div>
                        </td>
                        <td>
                          <div className="text-xs font-semibold text-gray-200">@{emp.username}</div>
                          <div className="mt-0.5">
                            <Badge variant={emp.rol === 'ADMIN' ? 'warning' : 'info'} size="sm">
                              {emp.rol}
                            </Badge>
                          </div>
                        </td>
                        <td>
                          {esAdmin ? (
                            sueldoRevelado !== undefined ? (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-emerald-400 text-sm">
                                  ${parseFloat(sueldoRevelado).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOcultarSueldo(emp.idEmpleado)}
                                  title="Ocultar sueldo"
                                  className="text-xs p-1"
                                >
                                  <EyeOff size={13} />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-dark-muted tracking-wider">••••••••</span>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleConsultarSueldo(emp.idEmpleado)}
                                  leftIcon={<Eye size={12} />}
                                >
                                  Ver Sueldo
                                </Button>
                              </div>
                            )
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-dark-muted">
                              <Lock size={12} className="text-red-400" />
                              <span>Confidencial (Solo Admin)</span>
                            </div>
                          )}
                        </td>
                        <td>
                          <Badge variant={isActivo ? 'success' : 'danger'} size="sm" dot>
                            {isActivo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="text-right">
                          {esAdmin ? (
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {isActivo ? (
                                <>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => abrirEdicion(emp)}
                                    leftIcon={<Edit2 size={12} />}
                                  >
                                    Editar
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleBaja(emp.idEmpleado, nombreCompleto)}
                                    title="Dar de baja lógica"
                                  >
                                    <Trash2 size={13} />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleReactivar(emp.idEmpleado, nombreCompleto)}
                                  leftIcon={<RefreshCw size={12} />}
                                >
                                  Reactivar
                                </Button>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-dark-muted">Solo Lectura</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Vista en Tarjetas para Móviles */}
            <div className="md:hidden divide-y divide-dark-borderSubtle">
              {empleados.map((emp) => {
                const isActivo = emp.activo !== false;
                const nombreCompleto = `${emp.nombre} ${emp.apellido}`;
                const sueldoRevelado = sueldosRevelados[emp.idEmpleado];
                return (
                  <div key={emp.idEmpleado} className={`p-4 space-y-3 ${!isActivo ? 'opacity-70 bg-red-950/10' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-brand-400">#{emp.idEmpleado}</span>
                          <Badge variant={isActivo ? 'success' : 'danger'} size="sm" dot>
                            {isActivo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-100 mt-1">{nombreCompleto}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-dark-muted mt-0.5">
                          <Briefcase size={12} />
                          <span>{emp.cargo} · @{emp.username}</span>
                        </div>
                      </div>
                      <Badge variant={emp.rol === 'ADMIN' ? 'warning' : 'info'} size="sm">
                        {emp.rol}
                      </Badge>
                    </div>

                    {/* Fila Remuneración en Mobile */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-dark-bg/60 border border-dark-borderSubtle">
                      <span className="text-xs text-dark-muted">Remuneración:</span>
                      {esAdmin ? (
                        sueldoRevelado !== undefined ? (
                          <span className="text-sm font-bold text-emerald-400">
                            ${parseFloat(sueldoRevelado).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <Button variant="secondary" size="sm" onClick={() => handleConsultarSueldo(emp.idEmpleado)}>
                            <Eye size={12} className="mr-1" /> Ver Sueldo
                          </Button>
                        )
                      ) : (
                        <span className="text-xs text-dark-muted flex items-center gap-1">
                          <Lock size={11} className="text-red-400" /> Confidencial
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-dark-muted">DNI {emp.dni}</span>

                      {esAdmin && (
                        <div className="flex items-center gap-2">
                          {isActivo ? (
                            <>
                              <Button variant="secondary" size="sm" onClick={() => abrirEdicion(emp)}>
                                <Edit2 size={12} className="mr-1" /> Editar
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => handleBaja(emp.idEmpleado, nombreCompleto)}>
                                <Trash2 size={13} />
                              </Button>
                            </>
                          ) : (
                            <Button variant="success" size="sm" onClick={() => handleReactivar(emp.idEmpleado, nombreCompleto)}>
                              <RefreshCw size={12} className="mr-1" /> Reactivar
                            </Button>
                          )}
                        </div>
                      )}
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
