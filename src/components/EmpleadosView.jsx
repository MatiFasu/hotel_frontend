import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, AlertTriangle, RefreshCw, Trash2, Edit2, Search, Shield, Eye, EyeOff, Lock, Briefcase } from 'lucide-react';

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
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [rolSimulado, setRolSimulado] = useState(sesion?.rol || 'ADMIN');
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
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los empleados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEmpleados();
  }, [mostrarTodos, busqueda]);

  // Al cambiar el rol simulado a VENDEDOR, limpiar los sueldos revelados en pantalla
  useEffect(() => {
    if (rolSimulado !== 'ADMIN') {
      setSueldosRevelados({});
    }
  }, [rolSimulado]);

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
      // Consultar detalle como ADMIN para precargar el sueldo actual
      const res = await fetch(`/api/empleados/${emp.idEmpleado}`, {
        headers: { 'X-User-Role': 'ADMIN' }
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
    setError(null);
    if (sueldosRevelados[idEmpleado] !== undefined) {
      setSueldosRevelados(prev => {
        const next = { ...prev };
        delete next[idEmpleado];
        return next;
      });
      return;
    }

    try {
      const res = await fetch(`/api/empleados/${idEmpleado}`, {
        headers: { 'X-User-Role': rolSimulado }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'No se pudo consultar el detalle');
      }
      if (data.sueldo === undefined || data.sueldo === null) {
        setError(`Acceso restringido (Decisión 17): Con rol "${rolSimulado}" el campo salarial permanece oculto en la API.`);
      } else {
        setSueldosRevelados(prev => ({ ...prev, [idEmpleado]: data.sueldo }));
      }
    } catch (err) {
      setError(err.message);
    }
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
      setSueldosRevelados({});
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Gestión de Empleados</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Administración de personal, credenciales, roles y protección de remuneración salarial (Decisión 17).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Selector de Rol para demostrar Decisión 17 */}
          <div className="glass-panel" style={{ padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
            <Shield size={16} color={rolSimulado === 'ADMIN' ? 'var(--accent-success)' : 'var(--accent-warning)'} />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Vista de Rol:</span>
            <select
              className="input-control"
              style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.82rem', fontWeight: 600 }}
              value={rolSimulado}
              onChange={(e) => setRolSimulado(e.target.value)}
            >
              <option value="ADMIN">ADMIN (Ve Sueldos)</option>
              <option value="VENDEDOR">VENDEDOR (Sueldo Oculto)</option>
            </select>
          </div>

          <button className="btn-primary" onClick={abrirNuevo} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} />
            {showForm ? 'Cerrar Formulario' : 'Nuevo Empleado'}
          </button>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-danger)', color: '#f87171', padding: '1rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent-success)', color: '#34d399', padding: '1rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Formulario Alta / Edición */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
            {editingId ? `Editar Empleado #${editingId}` : 'Registrar Nuevo Empleado (o Reactivar por DNI)'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nombre *</label>
              <input type="text" name="nombre" required className="input-control" placeholder="Ej. Lucía" value={formData.nombre} onChange={handleInputChange} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Apellido *</label>
              <input type="text" name="apellido" required className="input-control" placeholder="Ej. Fernández" value={formData.apellido} onChange={handleInputChange} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>DNI *</label>
              <input type="text" name="dni" required className="input-control" placeholder="Ej. 29888777" value={formData.dni} onChange={handleInputChange} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fecha de Nacimiento *</label>
              <input type="date" name="fechaNac" required className="input-control" value={formData.fechaNac} onChange={handleInputChange} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nacionalidad *</label>
              <input type="text" name="nacionalidad" required className="input-control" placeholder="Ej. Argentina" value={formData.nacionalidad} onChange={handleInputChange} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Dirección *</label>
              <input type="text" name="direccion" required className="input-control" placeholder="Ej. Av. Santa Fe 1500" value={formData.direccion} onChange={handleInputChange} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Celular *</label>
              <input type="text" name="celular" required className="input-control" placeholder="Ej. +54 9 11 5566-7788" value={formData.celular} onChange={handleInputChange} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email *</label>
              <input type="email" name="email" required className="input-control" placeholder="Ej. lucia@agencia.com" value={formData.email} onChange={handleInputChange} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Cargo *</label>
              <input type="text" name="cargo" required className="input-control" placeholder="Ej. Ejecutiva de Ventas" value={formData.cargo} onChange={handleInputChange} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sueldo Mensual ($ ARS) *</label>
              <input type="number" step="0.01" min="0.01" name="sueldo" required className="input-control" placeholder="Ej. 850000.00" value={formData.sueldo} onChange={handleInputChange} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Usuario (Username) *</label>
              <input type="text" name="username" required className="input-control" placeholder="Ej. lfernandez" value={formData.username} onChange={handleInputChange} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Contraseña {editingId ? '(Opcional al editar)' : '*'}
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
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rol del Sistema *</label>
              <select name="rol" required className="input-control" value={formData.rol} onChange={handleInputChange}>
                <option value="VENDEDOR">VENDEDOR</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setEditingId(null); }}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {editingId ? 'Guardar Cambios' : 'Registrar Empleado'}
            </button>
          </div>
        </form>
      )}

      {/* Filtros y Búsqueda */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 260px', maxWidth: '400px' }}>
          <Search size={16} color="var(--text-secondary)" />
          <input
            type="text"
            className="input-control"
            style={{ padding: '0.45rem 0.8rem' }}
            placeholder="Buscar por DNI, nombre, apellido o cargo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
          <input
            type="checkbox"
            checked={mostrarTodos}
            onChange={(e) => setMostrarTodos(e.target.checked)}
          />
          Mostrar también inactivos (dados de baja)
        </label>

        <button className="btn-secondary" onClick={cargarEmpleados} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem' }}>
          <RefreshCw size={15} />
          Actualizar
        </button>
      </div>

      {/* Tabla de Empleados */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando nómina de empleados...</div>
        ) : empleados.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No hay empleados registrados en este filtro. ¡Registra el primero con el botón superior!
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Empleado</th>
                <th>DNI</th>
                <th>Cargo</th>
                <th>Usuario / Rol</th>
                <th>Remuneración (Sueldo)</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((emp) => {
                const isActivo = emp.activo !== false;
                const nombreCompleto = `${emp.nombre} ${emp.apellido}`;
                const sueldoRevelado = sueldosRevelados[emp.idEmpleado];
                return (
                  <tr key={emp.idEmpleado} style={{ opacity: isActivo ? 1 : 0.6 }}>
                    <td style={{ fontWeight: 600 }}>#{emp.idEmpleado}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{nombreCompleto}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{emp.email} · {emp.celular}</div>
                    </td>
                    <td>
                      <span className="badge badge-type">{emp.dni}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Briefcase size={14} color="var(--text-secondary)" />
                        {emp.cargo}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>@{emp.username}</div>
                      <span
                        className="badge"
                        style={{
                          marginTop: '0.2rem',
                          background: emp.rol === 'ADMIN' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                          color: emp.rol === 'ADMIN' ? '#fbbf24' : '#a5b4fc',
                          border: emp.rol === 'ADMIN' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(99, 102, 241, 0.3)'
                        }}
                      >
                        {emp.rol}
                      </span>
                    </td>
                    <td>
                      {sueldoRevelado !== undefined ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--accent-success)' }}>
                            ${parseFloat(sueldoRevelado).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </span>
                          <button
                            className="btn-secondary"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            onClick={() => handleConsultarSueldo(emp.idEmpleado)}
                            title="Ocultar sueldo"
                          >
                            <EyeOff size={12} /> Ocultar
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Lock size={12} /> Oculto en listado
                          </span>
                          <button
                            className="btn-secondary"
                            style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            onClick={() => handleConsultarSueldo(emp.idEmpleado)}
                            title="Consultar detalle individual GET /api/empleados/{id}"
                          >
                            <Eye size={12} /> Ver Sueldo
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${isActivo ? 'badge-active' : 'badge-inactive'}`}>
                        {isActivo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        {isActivo ? (
                          <>
                            <button
                              className="btn-secondary"
                              style={{ padding: '0.4rem 0.7rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              onClick={() => abrirEdicion(emp)}
                            >
                              <Edit2 size={13} />
                              Editar
                            </button>
                            <button
                              className="btn-danger"
                              onClick={() => handleBaja(emp.idEmpleado, nombreCompleto)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                              <Trash2 size={14} />
                              Dar de Baja
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn-success"
                            onClick={() => handleReactivar(emp.idEmpleado, nombreCompleto)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <RefreshCw size={14} />
                            Reactivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
