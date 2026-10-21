import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, AlertTriangle, RefreshCw, Trash2, Edit2, Calendar, MapPin } from 'lucide-react';

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
          ? `¡Servicio "${data.nombre}" actualizado exitosamente!`
          : `¡Servicio "${data.nombre}" creado exitosamente!`
      );
      setShowForm(false);
      setEditingId(null);
      setFormData(INITIAL_FORM);
      cargarServicios();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBaja = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de dar de baja el servicio "${nombre}"?`)) return;
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/servicios/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        let msg = 'Error al dar de baja el servicio';
        try {
          const data = await res.json();
          if (data && data.message) msg = data.message;
        } catch (_) {}
        throw new Error(msg);
      }
      setSuccessMsg(`Servicio "${nombre}" dado de baja`);
      cargarServicios();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReactivar = async (id, nombre) => {
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/servicios/${id}/reactivar`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al reactivar');
      setSuccessMsg(`Servicio "${nombre}" reactivado con éxito`);
      cargarServicios();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Encabezado y Acciones */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Catálogo de Servicios Turísticos</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Gestión y oferta de servicios individuales para venta directa o composición de paquetes.
          </p>
        </div>
        <button className="btn-primary" onClick={abrirNuevo} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} />
          {showForm ? 'Cerrar Formulario' : 'Nuevo Servicio'}
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

      {/* Formulario de Alta / Edición */}
      {showForm && (
        <form onSubmit={handleGuardarServicio} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
            {editingId ? `Editar Servicio Turístico #${editingId}` : 'Registrar Nuevo Servicio'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nombre del Servicio *</label>
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
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tipo de Servicio *</label>
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
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Destino *</label>
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
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fecha del Servicio *</label>
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
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Costo ($ ARS) *</label>
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
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Descripción Breve</label>
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => { setShowForm(false); setEditingId(null); }}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {editingId ? 'Guardar Cambios' : 'Guardar Servicio'}
            </button>
          </div>
        </form>
      )}

      {/* Filtros */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Filtrar Tipo:</label>
          <select
            className="input-control"
            style={{ width: 'auto', padding: '0.4rem 0.8rem' }}
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {TIPOS_SERVICIO.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
          <input
            type="checkbox"
            checked={mostrarTodos}
            onChange={(e) => setMostrarTodos(e.target.checked)}
          />
          Mostrar también inactivos (dados de baja)
        </label>

        <button className="btn-secondary" onClick={cargarServicios} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem' }}>
          <RefreshCw size={15} />
          Actualizar
        </button>
      </div>

      {/* Tabla de Servicios */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando catálogo...</div>
        ) : servicios.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No hay servicios registrados en este filtro. ¡Crea el primero con el botón superior!
          </div>
        ) : (
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
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((s) => (
                <tr key={s.codigoServicio} style={{ opacity: s.activo ? 1 : 0.6 }}>
                  <td style={{ fontWeight: 600 }}>#{s.codigoServicio}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.nombre}</div>
                    {s.descripcionBreve && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.descripcionBreve}</div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-type">{s.tipoServicio}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={14} color="var(--text-secondary)" />
                      {s.destinoServicio}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={14} color="var(--text-secondary)" />
                      {s.fechaServicio}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--accent-success)' }}>
                    ${parseFloat(s.costoServicio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <span className={`badge ${s.activo ? 'badge-active' : 'badge-inactive'}`}>
                      {s.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      {s.activo ? (
                        <>
                          <button
                            className="btn-secondary"
                            style={{ padding: '0.4rem 0.7rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                            onClick={() => abrirEdicion(s)}
                          >
                            <Edit2 size={13} />
                            Editar
                          </button>
                          <button
                            className="btn-danger"
                            title="Dar de baja lógica"
                            onClick={() => handleBaja(s.codigoServicio, s.nombre)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <Trash2 size={14} />
                            Dar de Baja
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn-success"
                          title="Reactivar servicio"
                          onClick={() => handleReactivar(s.codigoServicio, s.nombre)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <RefreshCw size={14} />
                          Reactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
