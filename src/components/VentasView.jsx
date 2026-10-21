import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Ban,
  CreditCard,
  Compass,
  Briefcase,
  User,
  UserCheck,
  DollarSign
} from 'lucide-react';

export default function VentasView({ sesion }) {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [paquetes, setPaquetes] = useState([]);
  const [mediosPago, setMediosPago] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Filtros de listado
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipoProducto, setFiltroTipoProducto] = useState('');

  // Estado del formulario de Punto de Venta (XOR: SERVICIO o PAQUETE)
  const [modalidadProducto, setModalidadProducto] = useState('SERVICIO');
  const [clienteId, setClienteId] = useState('');
  const [empleadoId, setEmpleadoId] = useState('');
  const [medioPago, setMedioPago] = useState('EFECTIVO');
  const [servicioId, setServicioId] = useState('');
  const [paqueteId, setPaqueteId] = useState('');

  const cargarTodo = async () => {
    try {
      setLoading(true);
      setError(null);

      let urlVentas = '/api/ventas';
      const params = new URLSearchParams();
      if (filtroEstado) params.append('estado', filtroEstado);
      if (filtroTipoProducto) params.append('tipoProducto', filtroTipoProducto);
      if (params.toString()) urlVentas += `?${params.toString()}`;

      const [resVentas, resClientes, resEmpleados, resServicios, resPaquetes, resMedios] = await Promise.all([
        fetch(urlVentas),
        fetch('/api/clientes?activo=true'),
        fetch('/api/empleados?activo=true'),
        fetch('/api/servicios?activo=true'),
        fetch('/api/paquetes?activo=true'),
        fetch('/api/medios-pago')
      ]);

      if (!resVentas.ok) throw new Error('No se pudieron obtener las ventas');

      const [dataVentas, dataClientes, dataEmpleados, dataServicios, dataPaquetes, dataMedios] = await Promise.all([
        resVentas.json(),
        resClientes.ok ? resClientes.json() : [],
        resEmpleados.ok ? resEmpleados.json() : [],
        resServicios.ok ? resServicios.json() : [],
        resPaquetes.ok ? resPaquetes.json() : [],
        resMedios.ok ? resMedios.json() : []
      ]);

      setVentas(dataVentas);
      setClientes(dataClientes);
      setEmpleados(dataEmpleados);
      setServicios(dataServicios);
      setPaquetes(dataPaquetes);
      setMediosPago(dataMedios);

      if (!clienteId && dataClientes.length > 0) setClienteId(String(dataClientes[0].idCliente));
      if (!empleadoId) {
        if (sesion?.empleadoId) {
          setEmpleadoId(String(sesion.empleadoId));
        } else if (dataEmpleados.length > 0) {
          setEmpleadoId(String(dataEmpleados[0].idEmpleado));
        }
      }
      if (!servicioId && dataServicios.length > 0) setServicioId(String(dataServicios[0].codigoServicio));
      if (!paqueteId && dataPaquetes.length > 0) setPaqueteId(String(dataPaquetes[0].codigoPaquete));
    } catch (err) {
      setError(err.message || 'Error al cargar el Punto de Venta');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTodo();
  }, [filtroEstado, filtroTipoProducto]);

  // Cálculo del Snapshot Financiero en Vivo
  const productoSeleccionadoMonto = () => {
    if (modalidadProducto === 'SERVICIO') {
      const s = servicios.find(item => String(item.codigoServicio) === String(servicioId));
      return s ? parseFloat(s.costoServicio) || 0 : 0;
    } else {
      const p = paquetes.find(item => String(item.codigoPaquete) === String(paqueteId));
      return p ? parseFloat(p.costoPaquete) || 0 : 0;
    }
  };

  const medioSeleccionado = mediosPago.find(m => m.codigo === medioPago) || {
    codigo: 'EFECTIVO',
    descripcion: 'Efectivo',
    porcentajeComision: 0
  };

  const montoTotalPreview = Math.round(productoSeleccionadoMonto() * 100) / 100;
  const tasaComisionPreview = parseFloat(medioSeleccionado.porcentajeComision) || 0;
  const montoComisionPreview = Math.round(montoTotalPreview * (tasaComisionPreview / 100) * 100) / 100;
  const gananciaNetaPreview = Math.round((montoTotalPreview - montoComisionPreview) * 100) / 100;

  const handleEmitirVenta = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const payload = {
      clienteId: clienteId ? Number(clienteId) : null,
      empleadoId: empleadoId ? Number(empleadoId) : null,
      medioPago,
      servicioId: modalidadProducto === 'SERVICIO' && servicioId ? Number(servicioId) : null,
      paqueteId: modalidadProducto === 'PAQUETE' && paqueteId ? Number(paqueteId) : null
    };

    try {
      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al registrar la venta');
      }

      setSuccessMsg(
        `¡Venta #${data.numVenta} emitida exitosamente! Total cobrado: $${parseFloat(data.montoTotal).toLocaleString('es-AR', { minimumFractionDigits: 2 })} | Comisión (${data.porcentajeComision}%): $${parseFloat(data.montoComision).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
      );
      setShowForm(false);
      cargarTodo();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAnular = async (numVenta) => {
    if (!window.confirm(`¿Estás seguro de anular la venta #${numVenta}? Esta acción registrará la fecha de anulación y descontará la operación de las ganancias activas.`)) {
      return;
    }
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/ventas/${numVenta}/anular`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al anular la venta');
      }
      setSuccessMsg(`Venta #${numVenta} anulada correctamente (${data.fechaAnulacion?.replace('T', ' ').substring(0, 19)}).`);
      cargarTodo();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Punto de Venta (POS) & Transacciones</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Emisión de ventas con <strong>exclusión mutua XOR</strong> (Servicio Individual o Paquete), congelamiento de snapshot financiero y cálculo de comisiones.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} />
          {showForm ? 'Cerrar Punto de Venta' : 'Nueva Venta'}
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

      {/* Formulario Punto de Venta */}
      {showForm && (
        <form onSubmit={handleEmitirVenta} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={20} />
            Emitir Nueva Venta (Snapshot Financiero)
          </h3>

          {/* Selector de Modalidad XOR */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Tipo de Producto a Comercializar (Exclusión Mutua XOR — Decisión 8) *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setModalidadProducto('SERVICIO')}
                style={{
                  padding: '0.9rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: modalidadProducto === 'SERVICIO' ? '2px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: modalidadProducto === 'SERVICIO' ? 'rgba(59, 130, 246, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontWeight: 600
                }}
              >
                <Compass size={19} color="var(--accent-primary)" />
                <span>Servicio Turístico Individual</span>
              </button>

              <button
                type="button"
                onClick={() => setModalidadProducto('PAQUETE')}
                style={{
                  padding: '0.9rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: modalidadProducto === 'PAQUETE' ? '2px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: modalidadProducto === 'PAQUETE' ? 'rgba(59, 130, 246, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontWeight: 600
                }}
              >
                <Briefcase size={19} color="var(--accent-success)" />
                <span>Paquete Turístico (10% OFF)</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {/* Cliente */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Cliente Adquirente (Activo) *
              </label>
              <select
                required
                className="input-control"
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
              >
                <option value="">-- Seleccionar Cliente --</option>
                {clientes.map(c => (
                  <option key={c.idCliente} value={c.idCliente}>
                    #{c.idCliente} - {c.nombre} {c.apellido} (DNI {c.dni})
                  </option>
                ))}
              </select>
            </div>

            {/* Empleado Vendedor */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Empleado Vendedor (Activo) *
              </label>
              <select
                required
                className="input-control"
                value={empleadoId}
                onChange={(e) => setEmpleadoId(e.target.value)}
              >
                <option value="">-- Seleccionar Vendedor --</option>
                {empleados.map(e => (
                  <option key={e.idEmpleado} value={e.idEmpleado}>
                    #{e.idEmpleado} - {e.nombre} {e.apellido} ({e.cargo})
                  </option>
                ))}
              </select>
            </div>

            {/* Producto XOR: Servicio o Paquete */}
            {modalidadProducto === 'SERVICIO' ? (
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Servicio Turístico Vigente *
                </label>
                <select
                  required
                  className="input-control"
                  value={servicioId}
                  onChange={(e) => setServicioId(e.target.value)}
                >
                  <option value="">-- Seleccionar Servicio --</option>
                  {servicios.map(s => (
                    <option key={s.codigoServicio} value={s.codigoServicio}>
                      #{s.codigoServicio} - {s.nombre} ({s.destinoServicio}, {s.fechaServicio}) — ${parseFloat(s.costoServicio).toLocaleString('es-AR')}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Paquete Turístico Activo (-10% incluido) *
                </label>
                <select
                  required
                  className="input-control"
                  value={paqueteId}
                  onChange={(e) => setPaqueteId(e.target.value)}
                >
                  <option value="">-- Seleccionar Paquete --</option>
                  {paquetes.map(p => (
                    <option key={p.codigoPaquete} value={p.codigoPaquete}>
                      #{p.codigoPaquete} - {p.nombre} ({p.servicios?.length || 0} serv.) — ${parseFloat(p.costoPaquete).toLocaleString('es-AR')}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Medio de Pago */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Medio de Pago (Comisión Oficial) *
              </label>
              <select
                required
                className="input-control"
                value={medioPago}
                onChange={(e) => setMedioPago(e.target.value)}
              >
                {mediosPago.map(mp => (
                  <option key={mp.codigo} value={mp.codigo}>
                    {mp.descripcion} — Comisión: {mp.porcentajeComision}%
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Visor de Snapshot Financiero en Vivo */}
          <div style={{
            padding: '1.1rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Monto Bruto al Cliente</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                ${montoTotalPreview.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Comisión ({medioSeleccionado.descripcion} - {tasaComisionPreview}%)
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 600, color: '#fbbf24' }}>
                -${montoComisionPreview.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ganancia Neta Agencia</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-success)' }}>
                ${gananciaNetaPreview.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Confirmar y Emitir Venta
            </button>
          </div>
        </form>
      )}

      {/* Filtros del Historial de Ventas */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Estado:</label>
          <select
            className="input-control"
            style={{ width: 'auto', padding: '0.4rem 0.8rem' }}
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todas (Activas y Anuladas)</option>
            <option value="ACTIVA">Solo Activas</option>
            <option value="ANULADA">Solo Anuladas</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Modalidad:</label>
          <select
            className="input-control"
            style={{ width: 'auto', padding: '0.4rem 0.8rem' }}
            value={filtroTipoProducto}
            onChange={(e) => setFiltroTipoProducto(e.target.value)}
          >
            <option value="">Todos los productos</option>
            <option value="SERVICIO">Servicios Individuales</option>
            <option value="PAQUETE">Paquetes Turísticos</option>
          </select>
        </div>

        <button className="btn-secondary" onClick={cargarTodo} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem' }}>
          <RefreshCw size={15} />
          Actualizar
        </button>
      </div>

      {/* Tabla de Ventas */}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando transacciones...</div>
        ) : ventas.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No hay ventas registradas para este criterio. ¡Registra una nueva operación con el botón superior!
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th># Venta</th>
                <th>Fecha</th>
                <th>Cliente / Vendedor</th>
                <th>Producto Contratado</th>
                <th>Medio de Pago</th>
                <th>Monto Bruto</th>
                <th>Comisión</th>
                <th>Ganancia Neta</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => {
                const isActiva = v.estado === 'ACTIVA';
                return (
                  <tr key={v.numVenta} style={{ opacity: isActiva ? 1 : 0.6 }}>
                    <td style={{ fontWeight: 700 }}>#{v.numVenta}</td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {v.fechaVenta ? v.fechaVenta.replace('T', ' ').substring(0, 16) : '-'}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <User size={14} color="var(--accent-primary)" />
                        {v.clienteNombreCompleto} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>({v.clienteDni})</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                        <UserCheck size={13} /> Vendió: {v.empleadoNombreCompleto}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-type" style={{ marginRight: '0.4rem', fontSize: '0.72rem' }}>
                        {v.tipoProducto}
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        {v.tipoProducto === 'SERVICIO' ? v.servicioNombre : v.paqueteNombre}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                        <CreditCard size={14} color="var(--text-secondary)" />
                        {v.medioPago}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Tasa: {parseFloat(v.porcentajeComision).toFixed(2)}%
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      ${parseFloat(v.montoTotal).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ color: '#fbbf24', fontSize: '0.9rem' }}>
                      -${parseFloat(v.montoComision).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-success)' }}>
                      ${parseFloat(v.gananciaNeta).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`badge ${isActiva ? 'badge-active' : 'badge-inactive'}`}>
                        {v.estado}
                      </span>
                      {!isActiva && v.fechaAnulacion && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {v.fechaAnulacion.replace('T', ' ').substring(0, 16)}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {isActiva ? (
                        <button
                          className="btn-danger"
                          onClick={() => handleAnular(v.numVenta)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <Ban size={14} />
                          Anular Venta
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Anulada</span>
                      )}
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
