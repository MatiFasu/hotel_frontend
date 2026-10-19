import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, AlertTriangle, RefreshCw, Trash2, Edit2, Search, Mail, Phone, MapPin, User } from 'lucide-react';

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
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [formData, setFormData] = useState(INITIAL_FORM);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      setError(null);
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
      setError(err.message || 'No se pudieron cargar los clientes');
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
    setShowForm(!showForm);
    setError(null);
    setSuccessMsg(null);
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
    setShowForm(true);
    setError(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
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
        setSuccessMsg(`Cliente "${data.nombre} ${data.apellido}" actualizado correctamente.`);
      } else if (res.status === 200 || data.reactivado) {
        setSuccessMsg(`¡DNI encontrado inactivo! El cliente "${data.nombre} ${data.apellido}" fue reactivado y actualizado (HTTP 200).`);
      } else {
        setSuccessMsg(`¡Cliente "${data.nombre} ${data.apellido}" registrado exitosamente (HTTP 201)!`);
      }

      setShowForm(false);
      setEditingId(null);
      setFormData(INITIAL_FORM);
      cargarClientes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBaja = async (id, nombreCompleto) => {
    if (!window.confirm(`¿Estás seguro de dar de baja lógica al cliente "${nombreCompleto}"?`)) return;
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al dar de baja al cliente');
      setSuccessMsg(`Cliente "${nombreCompleto}" dado de baja lógica.`);
      cargarClientes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReactivar = async (id, nombreCompleto) => {
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/clientes/${id}/reactivar`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al reactivar el cliente');
      setSuccessMsg(`Cliente "${nombreCompleto}" reactivado exitosamente.`);
      cargarClientes();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Gestión de Clientes</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Padrón filiatorio de clientes con validación de DNI único y reactivación automática de inactivos.
          </p>
        </div>
        <button className="btn-primary" onClick={abrirNuevo} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} />
          {showForm ? 'Cerrar Formulario' : 'Nuevo Cliente'}
        </button>
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
            {editingId ? `Editar Cliente #${editingId}` : 'Registrar Nuevo Cliente (o Reactivar por DNI)'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nombre *</label>
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
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Apellido *</label>
              <input
                type="text"
                name="apellido"
                required
                className="input-control"
                placeholder="Ej. Pérez"
                value={formData.apellido}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>DNI *</label>
              <input
                type="text"
                name="dni"
                required
                className="input-control"
                placeholder="Ej. 35123456"
                value={formData.dni}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fecha de Nacimiento *</label>
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
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nacionalidad *</label>
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
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Dirección *</label>
              <input
                type="text"
                name="direccion"
                required
                className="input-control"
                placeholder="Ej. Av. Corrientes 1234, CABA"
                value={formData.direccion}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Celular *</label>
              <input
                type="text"
                name="celular"
                required
                className="input-control"
                placeholder="Ej. +54 9 11 2345-6789"
                value={formData.celular}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email *</label>
              <input
                type="email"
                name="email"
                required
                className="input-control"
                placeholder="Ej. martin.perez@email.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => { setShowForm(false); setEditingId(null); }}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {editingId ? 'Guardar Cambios' : 'Registrar Cliente'}
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
            placeholder="Buscar por DNI, nombre o apellido..."
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

        <button className="btn-secondary" onClick={cargarClientes} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem' }}>
          <RefreshCw size={15} />
          Actualizar
        </button>
      </div>

      {/* Tabla de Clientes */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando clientes...</div>
        ) : clientes.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No hay clientes registrados para este criterio. ¡Registra el primero con el botón superior!
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>DNI</th>
                <th>Nacionalidad / Nac.</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => {
                const isActivo = c.activo !== false;
                const nombreCompleto = `${c.nombre} ${c.apellido}`;
                return (
                  <tr key={c.idCliente} style={{ opacity: isActivo ? 1 : 0.6 }}>
                    <td style={{ fontWeight: 600 }}>#{c.idCliente}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                        <User size={15} color="var(--accent-primary)" />
                        {nombreCompleto}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                        <MapPin size={12} /> {c.direccion}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-type">{c.dni}</span>
                    </td>
                    <td>
                      <div>{c.nacionalidad}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.fechaNacimiento}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Mail size={13} color="var(--text-secondary)" /> {c.email}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                        <Phone size={13} /> {c.celular}
                      </div>
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
                              onClick={() => abrirEdicion(c)}
                            >
                              <Edit2 size={13} />
                              Editar
                            </button>
                            <button
                              className="btn-danger"
                              onClick={() => handleBaja(c.idCliente, nombreCompleto)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                              <Trash2 size={14} />
                              Dar de Baja
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn-success"
                            onClick={() => handleReactivar(c.idCliente, nombreCompleto)}
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
