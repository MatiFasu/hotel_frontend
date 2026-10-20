import React, { useState, useEffect } from 'react';
import {
  Plus,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Edit2,
  Briefcase,
  CheckSquare,
  Square,
  Percent,
  Calendar,
  MapPin
} from 'lucide-react';

export default function PaquetesView() {
  const [paquetes, setPaquetes] = useState([]);
  const [serviciosActivos, setServiciosActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  const [nombrePaquete, setNombrePaquete] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

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
      setError(err.message || 'Error al cargar paquetes turísticos');
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
    setShowForm(!showForm);
    setError(null);
    setSuccessMsg(null);
  };

  const abrirEdicion = (paquete) => {
    setEditingId(paquete.codigoPaquete);
    setNombrePaquete(paquete.nombre || '');
    setSelectedIds((paquete.servicios || []).map(s => s.codigoServicio));
    setShowForm(true);
    setError(null);
    setSuccessMsg(null);
  };

  const toggleServicio = (codigoServicio) => {
    setSelectedIds(prev =>
      prev.includes(codigoServicio)
        ? prev.filter(id => id !== codigoServicio)
        : [...prev, codigoServicio]
    );
  };

  // Cálculo dinámico en vivo (suma - 10% OFF)
  const serviciosSeleccionados = serviciosActivos.filter(s =>
    selectedIds.includes(s.codigoServicio)
  );
  const subtotal = serviciosSeleccionados.reduce(
    (acc, s) => acc + (parseFloat(s.costoServicio) || 0),
    0
  );
  const descuentoDiez = Math.round(subtotal * 0.10 * 100) / 100;
  const costoFinalConDescuento = Math.round(subtotal * 0.90 * 100) / 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (selectedIds.length < 2) {
      setError('Un paquete turístico debe contener al menos 2 servicios distintos y activos (Decisión 3).');
      return;
    }

    try {
      const isEdit = editingId !== null;
      const url = isEdit ? `/api/paquetes/${editingId}` : '/api/paquetes';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombrePaquete,
          servicioIds: selectedIds
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al guardar el paquete turístico');
      }

      setSuccessMsg(
        isEdit
          ? `¡Paquete "${data.nombre}" actualizado con éxito!`
          : `¡Paquete "${data.nombre}" creado con 10% de descuento ($${parseFloat(data.costoPaquete).toLocaleString('es-AR', { minimumFractionDigits: 2 })})!`
      );
      setShowForm(false);
      setEditingId(null);
      setNombrePaquete('');
      setSelectedIds([]);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBaja = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de dar de baja lógica el paquete "${nombre}"?`)) return;
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/paquetes/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        let msg = 'Error al dar de baja el paquete';
        try {
          const data = await res.json();
          if (data && data.message) msg = data.message;
        } catch (_) {}
        throw new Error(msg);
      }
      setSuccessMsg(`Paquete "${nombre}" dado de baja lógica.`);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReactivar = async (id, nombre) => {
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/paquetes/${id}/reactivar`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al reactivar el paquete');
      }
      setSuccessMsg(`Paquete "${nombre}" reactivado exitosamente.`);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Composición de Paquetes Turísticos</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Combina 2 o más servicios activos con un <strong>10% de descuento automático</strong> calculado en tiempo real.
          </p>
        </div>
        <button className="btn-primary" onClick={abrirNuevo} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} />
          {showForm ? 'Cerrar Formulario' : 'Nuevo Paquete'}
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

      {/* Formulario de Creación / Edición */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={20} />
            {editingId ? `Editar Paquete #${editingId}` : 'Armar Nuevo Paquete Turístico'}
          </h3>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Nombre Comercial del Paquete *
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={100}
              className="input-control"
              placeholder="Ej. Escapada Cataratas Clásica (Hotel + Vuelo + Excursión)"
              value={nombrePaquete}
              onChange={(e) => setNombrePaquete(e.target.value)}
            />
          </div>

          {/* Selector Interactivo de Servicios Activos */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Selecciona al menos <strong>2 servicios activos</strong> ({selectedIds.length} seleccionados):
              </label>
              <span className={`badge ${selectedIds.length >= 2 ? 'badge-active' : 'badge-inactive'}`}>
                {selectedIds.length >= 2 ? 'Mínimo cumplido (≥ 2 servicios)' : 'Faltan servicios (mínimo 2)'}
              </span>
            </div>

            {serviciosActivos.length < 2 ? (
              <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)', color: '#fbbf24', fontSize: '0.9rem' }}>
                Necesitas al menos 2 servicios turísticos activos en el catálogo para poder armar un paquete. Ve a la pestaña <strong>Servicios Turísticos</strong> para crearlos.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '0.75rem', maxHeight: '320px', overflowY: 'auto', padding: '0.25rem' }}>
                {serviciosActivos.map(s => {
                  const isSelected = selectedIds.includes(s.codigoServicio);
                  return (
                    <div
                      key={s.codigoServicio}
                      onClick={() => toggleServicio(s.codigoServicio)}
                      style={{
                        padding: '0.9rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        border: isSelected ? '1px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                        background: isSelected ? 'rgba(59, 130, 246, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600, fontSize: '0.92rem' }}>
                          {isSelected ? (
                            <CheckSquare size={17} color="var(--accent-primary)" />
                          ) : (
                            <Square size={17} color="var(--text-muted)" />
                          )}
                          <span>{s.nombre}</span>
                        </div>
                        <span className="badge badge-type" style={{ fontSize: '0.7rem' }}>{s.tipoServicio}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={12} /> {s.destinoServicio}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={12} /> {s.fechaServicio}
                        </span>
                      </div>

                      <div style={{ fontWeight: 700, color: 'var(--accent-success)', fontSize: '0.95rem', textAlign: 'right' }}>
                        ${parseFloat(s.costoServicio).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Previsualizador de Descuento del 10% */}
          <div style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Percent size={20} color="var(--accent-success)" />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Previsualización de Costo Dinámico (Regla del 10% OFF)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Suma individual: ${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })} — Ahorro 10%: -${descuentoDiez.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Costo Final Paquete</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-success)' }}>
                ${costoFinalConDescuento.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => { setShowForm(false); setEditingId(null); }}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={selectedIds.length < 2}>
              {editingId ? 'Guardar Cambios' : 'Crear Paquete con 10% OFF'}
            </button>
          </div>
        </form>
      )}

      {/* Barra de Filtros */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
          <input
            type="checkbox"
            checked={mostrarTodos}
            onChange={(e) => setMostrarTodos(e.target.checked)}
          />
          Mostrar también paquetes inactivos (dados de baja)
        </label>

        <button className="btn-secondary" onClick={cargarDatos} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem' }}>
          <RefreshCw size={15} />
          Actualizar
        </button>
      </div>

      {/* Tabla de Paquetes Turísticos */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando paquetes turísticos...</div>
        ) : paquetes.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No hay paquetes turísticos registrados para este filtro. ¡Crea el primero combinando 2 o más servicios!
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre del Paquete</th>
                <th>Servicios Incluidos</th>
                <th>Suma Base</th>
                <th>Costo Paquete (-10%)</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paquetes.map((p) => {
                const isActivo = p.activo !== false;
                const servicios = p.servicios || [];
                const sumaOriginal = servicios.reduce(
                  (acc, s) => acc + (parseFloat(s.costoServicio) || 0),
                  0
                );
                return (
                  <tr key={p.codigoPaquete} style={{ opacity: isActivo ? 1 : 0.6 }}>
                    <td style={{ fontWeight: 600 }}>#{p.codigoPaquete}</td>
                    <td>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Briefcase size={15} color="var(--accent-primary)" />
                        {p.nombre}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {servicios.length} servicios combinados
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {servicios.map(s => (
                          <span
                            key={s.codigoServicio}
                            className="badge badge-type"
                            style={{ fontSize: '0.75rem' }}
                            title={`${s.destinoServicio} (${s.fechaServicio}) - $${parseFloat(s.costoServicio).toLocaleString('es-AR')}`}
                          >
                            #{s.codigoServicio} {s.nombre}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '0.9rem' }}>
                      ${sumaOriginal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--accent-success)', fontSize: '1rem' }}>
                        ${parseFloat(p.costoPaquete).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-success)' }}>10% OFF aplicado</span>
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
                              onClick={() => abrirEdicion(p)}
                            >
                              <Edit2 size={13} />
                              Editar
                            </button>
                            <button
                              className="btn-danger"
                              onClick={() => handleBaja(p.codigoPaquete, p.nombre)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                              <Trash2 size={14} />
                              Dar de Baja
                            </button>
                          </>
                        ) : (
                          <button
                            className="btn-success"
                            onClick={() => handleReactivar(p.codigoPaquete, p.nombre)}
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
