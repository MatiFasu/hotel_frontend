import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  RefreshCw,
  Ban,
  CreditCard,
  Compass,
  Briefcase,
  User,
  UserCheck,
  Search,
  AlertTriangle,
  Receipt,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  ArrowRight,
  ShieldAlert,
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

export default function VentasView({ sesion }) {
  const toast = useToast();

  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [paquetes, setPaquetes] = useState([]);
  const [mediosPago, setMediosPago] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Modal de Detalle / Comprobante
  const [ventaDetalle, setVentaDetalle] = useState(null);

  // Filtros de listado
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipoProducto, setFiltroTipoProducto] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Estado del formulario de Punto de Venta (XOR: SERVICIO o PAQUETE)
  const [modalidadProducto, setModalidadProducto] = useState('SERVICIO');
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [empleadoId, setEmpleadoId] = useState('');
  const [medioPago, setMedioPago] = useState('EFECTIVO');
  const [servicioId, setServicioId] = useState('');
  const [paqueteId, setPaqueteId] = useState('');

  // Estado del diálogo de confirmación para anulación
  const [confirmAnulacion, setConfirmAnulacion] = useState({
    isOpen: false,
    numVenta: null,
    loading: false,
  });

  const cargarTodo = async () => {
    try {
      setLoading(true);

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
      toast.error(err.message || 'Error al cargar el Punto de Venta');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTodo();
  }, [filtroEstado, filtroTipoProducto]);

  // Selección de Producto actual
  const productoSeleccionado = modalidadProducto === 'SERVICIO'
    ? servicios.find(s => String(s.codigoServicio) === String(servicioId))
    : paquetes.find(p => String(p.codigoPaquete) === String(paqueteId));

  const montoTotalPreview = productoSeleccionado
    ? (modalidadProducto === 'SERVICIO' ? parseFloat(productoSeleccionado.costoServicio) : parseFloat(productoSeleccionado.costoPaquete))
    : 0;

  const medioSeleccionado = mediosPago.find(m => m.codigo === medioPago) || { porcentajeComision: 0, descripcion: 'Efectivo' };
  const tasaComisionPreview = medioSeleccionado.porcentajeComision || 0;
  const montoComisionPreview = (montoTotalPreview * tasaComisionPreview) / 100;
  const gananciaNetaPreview = montoTotalPreview - montoComisionPreview;

  const abrirNuevaVenta = () => {
    setFormError(null);
    setBusquedaProducto('');
    setShowModal(true);
  };

  const handleEmitirVenta = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!clienteId || !empleadoId) {
      setFormError('Debes seleccionar un cliente y un empleado vendedor válido.');
      return;
    }

    if (modalidadProducto === 'SERVICIO' && !servicioId) {
      setFormError('Debes seleccionar un servicio turístico.');
      return;
    }

    if (modalidadProducto === 'PAQUETE' && !paqueteId) {
      setFormError('Debes seleccionar un paquete turístico.');
      return;
    }

    const payload = {
      clienteId: parseInt(clienteId),
      empleadoId: parseInt(empleadoId),
      medioPago: medioPago,
      servicioId: modalidadProducto === 'SERVICIO' ? parseInt(servicioId) : null,
      paqueteId: modalidadProducto === 'PAQUETE' ? parseInt(paqueteId) : null
    };

    try {
      setFormLoading(true);
      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al procesar la venta');
      }

      toast.success(
        `¡Venta #${data.numVenta} emitida exitosamente por $${parseFloat(data.montoTotal).toLocaleString('es-AR')}!`
      );
      setShowModal(false);
      cargarTodo();
    } catch (err) {
      setFormError(err.message);
      toast.error(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const solicitarAnulacion = (numVenta) => {
    setConfirmAnulacion({
      isOpen: true,
      numVenta,
      loading: false,
    });
  };

  const ejecutarAnulacion = async () => {
    try {
      setConfirmAnulacion(prev => ({ ...prev, loading: true }));
      const res = await fetch(`/api/ventas/${confirmAnulacion.numVenta}/anular`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error al anular la venta');
      }
      toast.success(`Venta #${confirmAnulacion.numVenta} anulada correctamente.`);
      setConfirmAnulacion({ isOpen: false, numVenta: null, loading: false });

      // Si el modal de detalle estaba abierto para esta venta, actualizarlo
      if (ventaDetalle && ventaDetalle.numVenta === confirmAnulacion.numVenta) {
        setVentaDetalle(prev => ({ ...prev, estado: 'ANULADA', fechaAnulacion: new Date().toISOString() }));
      }

      cargarTodo();
    } catch (err) {
      toast.error(err.message);
      setConfirmAnulacion(prev => ({ ...prev, loading: false }));
    }
  };

  const abrirDetalle = async (v) => {
    try {
      const res = await fetch(`/api/ventas/${v.numVenta}`);
      if (res.ok) {
        const data = await res.json();
        setVentaDetalle(data);
      } else {
        setVentaDetalle(v);
      }
    } catch (_) {
      setVentaDetalle(v);
    }
  };

  const ventasFiltradas = ventas.filter(v => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    const itemNombre = v.tipoProducto === 'SERVICIO' ? v.servicioNombre : v.paqueteNombre;
    return (
      v.numVenta?.toString().includes(q) ||
      v.clienteNombreCompleto?.toLowerCase().includes(q) ||
      v.clienteDni?.includes(q) ||
      v.empleadoNombreCompleto?.toLowerCase().includes(q) ||
      itemNombre?.toLowerCase().includes(q) ||
      v.medioPago?.toLowerCase().includes(q)
    );
  });

  // Filtrado interno para el selector de productos en el modal de nueva venta
  const serviciosOpcionesFiltradas = servicios.filter(s => {
    if (!busquedaProducto.trim()) return true;
    const q = busquedaProducto.toLowerCase();
    return s.nombre?.toLowerCase().includes(q) || s.destinoServicio?.toLowerCase().includes(q) || s.tipoServicio?.toLowerCase().includes(q);
  });

  const paquetesOpcionesFiltradas = paquetes.filter(p => {
    if (!busquedaProducto.trim()) return true;
    const q = busquedaProducto.toLowerCase();
    return p.nombre?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 text-left">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-dark-borderSubtle">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-100 tracking-tight flex items-center gap-2">
            <span>Punto de Venta</span>
            <Badge variant="brand" size="sm">Comercial</Badge>
          </h2>
          <p className="text-xs sm:text-sm text-dark-muted mt-1">
            Registro transaccional de operaciones turísticas, liquidación de comisiones bancarias y emisión de comprobantes.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={abrirNuevaVenta}
          leftIcon={<Plus size={16} />}
        >
          Nueva Venta
        </Button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <Card>
        <div className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[220px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted pointer-events-none" />
              <input
                type="text"
                className="input-control pl-9 text-xs"
                placeholder="Buscar por comprobante, cliente, DNI, vendedor o producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                className="input-control text-xs w-full sm:w-auto"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="">Todos los Estados</option>
                <option value="ACTIVA">Solo Activas</option>
                <option value="ANULADA">Solo Anuladas</option>
              </select>

              <select
                className="input-control text-xs w-full sm:w-auto"
                value={filtroTipoProducto}
                onChange={(e) => setFiltroTipoProducto(e.target.value)}
              >
                <option value="">Todas las Modalidades</option>
                <option value="SERVICIO">Servicios Individuales</option>
                <option value="PAQUETE">Paquetes Turísticos</option>
              </select>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={cargarTodo}
            leftIcon={<RefreshCw size={13} className={loading ? 'animate-spin' : ''} />}
          >
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
        </div>
      </Card>

      {/* Contenedor de Listado */}
      <Card>
        {loading ? (
          <div className="overflow-x-auto">
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
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <TableSkeleton rows={5} cols={10} />
              </tbody>
            </table>
          </div>
        ) : ventasFiltradas.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title={busqueda || filtroEstado || filtroTipoProducto ? 'No se encontraron operaciones' : 'No hay ventas emitidas'}
            description={busqueda || filtroEstado || filtroTipoProducto ? 'Ajusta los filtros o la búsqueda ingresada.' : 'Emite la primera operación comercial con el botón superior.'}
            action={
              <Button variant="primary" size="sm" onClick={abrirNuevaVenta} leftIcon={<Plus size={14} />}>
                Nueva Venta
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
                    <th className="w-16"># Venta</th>
                    <th>Fecha</th>
                    <th>Cliente / Vendedor</th>
                    <th>Producto Contratado</th>
                    <th>Medio de Pago</th>
                    <th>Monto Bruto</th>
                    <th>Comisión</th>
                    <th>Ganancia Neta</th>
                    <th>Estado</th>
                    <th className="text-right w-36">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-borderSubtle">
                  {ventasFiltradas.map((v) => {
                    const isActiva = v.estado === 'ACTIVA';
                    return (
                      <tr
                        key={v.numVenta}
                        className={`transition-colors hover:bg-dark-elevated/40 ${!isActiva ? 'opacity-60 bg-red-950/5' : ''}`}
                      >
                        <td className="font-bold text-brand-400">
                          #{v.numVenta}
                        </td>
                        <td className="text-xs text-gray-300">
                          {v.fechaVenta ? v.fechaVenta.replace('T', ' ').substring(0, 16) : '-'}
                        </td>
                        <td>
                          <div className="font-semibold text-gray-100 flex items-center gap-1.5">
                            <User size={13} className="text-brand-400 shrink-0" />
                            <span>{v.clienteNombreCompleto}</span>
                            <span className="text-xs text-dark-muted">({v.clienteDni})</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-dark-muted mt-0.5">
                            <UserCheck size={12} className="shrink-0" />
                            <span>Vendió: {v.empleadoNombreCompleto}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <Badge variant={v.tipoProducto === 'PAQUETE' ? 'warning' : 'info'} size="sm">
                              {v.tipoProducto}
                            </Badge>
                            <span className="font-semibold text-gray-200 text-xs truncate max-w-xs">
                              {v.tipoProducto === 'SERVICIO' ? v.servicioNombre : v.paqueteNombre}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1 text-xs text-gray-300">
                            <CreditCard size={12} className="text-dark-muted" />
                            <span>{v.medioPago}</span>
                          </div>
                          <span className="text-[10px] text-dark-muted block">
                            Tasa: {parseFloat(v.porcentajeComision).toFixed(2)}%
                          </span>
                        </td>
                        <td className="font-semibold text-gray-200 text-sm">
                          ${parseFloat(v.montoTotal).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="text-amber-400 text-xs font-semibold">
                          -${parseFloat(v.montoComision).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="font-bold text-emerald-400 text-sm">
                          ${parseFloat(v.gananciaNeta).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <Badge variant={isActiva ? 'success' : 'danger'} size="sm" dot>
                            {v.estado}
                          </Badge>
                          {!isActiva && v.fechaAnulacion && (
                            <span className="text-[10px] text-dark-muted block mt-0.5">
                              {v.fechaAnulacion.replace('T', ' ').substring(0, 16)}
                            </span>
                          )}
                        </td>
                        <td className="text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => abrirDetalle(v)}
                              title="Ver Comprobante"
                              leftIcon={<Eye size={12} />}
                            >
                              Detalle
                            </Button>
                            {isActiva && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => solicitarAnulacion(v.numVenta)}
                                title="Anular venta"
                              >
                                <Ban size={12} />
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
              {ventasFiltradas.map((v) => {
                const isActiva = v.estado === 'ACTIVA';
                return (
                  <div key={v.numVenta} className={`p-4 space-y-3 ${!isActiva ? 'opacity-70 bg-red-950/10' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-brand-400">Venta #{v.numVenta}</span>
                          <Badge variant={isActiva ? 'success' : 'danger'} size="sm" dot>
                            {v.estado}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-100 mt-1">
                          {v.tipoProducto === 'SERVICIO' ? v.servicioNombre : v.paqueteNombre}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-dark-muted mt-0.5">
                          <User size={12} />
                          <span>{v.clienteNombreCompleto} (DNI {v.clienteDni})</span>
                        </div>
                      </div>

                      <Badge variant={v.tipoProducto === 'PAQUETE' ? 'warning' : 'info'} size="sm">
                        {v.tipoProducto}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 py-1.5 border-y border-dark-borderSubtle/50">
                      <div>
                        <span className="text-[10px] text-dark-muted block">Medio de Pago</span>
                        <span className="font-medium">{v.medioPago} ({parseFloat(v.porcentajeComision).toFixed(1)}%)</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-dark-muted block">Fecha</span>
                        <span>{v.fechaVenta ? v.fechaVenta.replace('T', ' ').substring(0, 16) : '-'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <div className="text-[10px] text-dark-muted">
                          Bruto: ${parseFloat(v.montoTotal).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm font-bold text-emerald-400">
                          Neto: ${parseFloat(v.gananciaNeta).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button variant="secondary" size="sm" onClick={() => abrirDetalle(v)}>
                          <Eye size={12} className="mr-1" /> Ver
                        </Button>
                        {isActiva && (
                          <Button variant="danger" size="sm" onClick={() => solicitarAnulacion(v.numVenta)}>
                            <Ban size={12} />
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

      {/* Modal Emisión de Venta (Checkout / POS Flow) */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Emisión de Operación Comercial (Punto de Venta)"
        description="Complete los pasos para emitir el comprobante con snapshot financiero inmutable."
        size="lg"
      >
        <form onSubmit={handleEmitirVenta} className="space-y-5">
          {formError && (
            <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
              <AlertTriangle size={16} className="text-red-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Bloque 1: Modalidad XOR */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-200">
                1. Selección de Producto (Exclusión Mutua XOR) *
              </label>
              <span className="text-[11px] text-dark-muted">Elija una modalidad</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div
                onClick={() => setModalidadProducto('SERVICIO')}
                className={`
                  p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center gap-3
                  ${modalidadProducto === 'SERVICIO'
                    ? 'bg-brand-600/20 border-brand-500 text-white shadow-sm ring-1 ring-brand-500/50'
                    : 'bg-dark-bg/60 border-dark-borderSubtle text-gray-400 hover:border-gray-600 hover:text-gray-200'
                  }
                `}
              >
                <div className={`p-2.5 rounded-lg ${modalidadProducto === 'SERVICIO' ? 'bg-brand-600 text-white' : 'bg-dark-elevated text-dark-muted'}`}>
                  <Compass size={18} />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-100">Servicio Individual</h5>
                  <p className="text-[11px] text-dark-muted">Tarifa regular de catálogo</p>
                </div>
              </div>

              <div
                onClick={() => setModalidadProducto('PAQUETE')}
                className={`
                  p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between gap-3
                  ${modalidadProducto === 'PAQUETE'
                    ? 'bg-brand-600/20 border-brand-500 text-white shadow-sm ring-1 ring-brand-500/50'
                    : 'bg-dark-bg/60 border-dark-borderSubtle text-gray-400 hover:border-gray-600 hover:text-gray-200'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${modalidadProducto === 'PAQUETE' ? 'bg-brand-600 text-white' : 'bg-dark-elevated text-dark-muted'}`}>
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-100">Paquete Turístico</h5>
                    <p className="text-[11px] text-dark-muted">Servicios combinados</p>
                  </div>
                </div>
                <Badge variant="success" size="sm">10% OFF</Badge>
              </div>
            </div>
          </div>

          {/* Selector de Producto */}
          <div className="space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted pointer-events-none" />
              <input
                type="text"
                className="input-control pl-8 text-xs py-1.5"
                placeholder={modalidadProducto === 'SERVICIO' ? "Buscar servicio por nombre, tipo o destino..." : "Buscar paquete por nombre..."}
                value={busquedaProducto}
                onChange={(e) => setBusquedaProducto(e.target.value)}
              />
            </div>

            {modalidadProducto === 'SERVICIO' ? (
              <select
                required
                className="input-control"
                value={servicioId}
                onChange={(e) => setServicioId(e.target.value)}
              >
                {serviciosOpcionesFiltradas.length === 0 ? (
                  <option disabled value="">No se encontraron servicios</option>
                ) : (
                  serviciosOpcionesFiltradas.map(s => (
                    <option key={s.codigoServicio} value={s.codigoServicio}>
                      #{s.codigoServicio} - {s.nombre} ({s.tipoServicio} · {s.destinoServicio}) — ${parseFloat(s.costoServicio).toLocaleString('es-AR')}
                    </option>
                  ))
                )}
              </select>
            ) : (
              <select
                required
                className="input-control"
                value={paqueteId}
                onChange={(e) => setPaqueteId(e.target.value)}
              >
                {paquetesOpcionesFiltradas.length === 0 ? (
                  <option disabled value="">No se encontraron paquetes</option>
                ) : (
                  paquetesOpcionesFiltradas.map(p => (
                    <option key={p.codigoPaquete} value={p.codigoPaquete}>
                      #{p.codigoPaquete} - {p.nombre} ({p.servicios?.length || 0} servicios incluidos) — ${parseFloat(p.costoPaquete).toLocaleString('es-AR')}
                    </option>
                  ))
                )}
              </select>
            )}
          </div>

          {/* Bloque 2: Cliente y Vendedor */}
          <div>
            <label className="text-xs font-semibold text-gray-200 block mb-1.5">
              2. Partes Intervinientes *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-dark-muted mb-1">Cliente Titular</label>
                <select
                  required
                  className="input-control"
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                >
                  {clientes.map(c => (
                    <option key={c.idCliente} value={c.idCliente}>
                      {c.nombre} {c.apellido} (DNI {c.dni})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-dark-muted mb-1">Vendedor Asignado</label>
                <select
                  required
                  className="input-control"
                  value={empleadoId}
                  onChange={(e) => setEmpleadoId(e.target.value)}
                >
                  {empleados.map(e => (
                    <option key={e.idEmpleado} value={e.idEmpleado}>
                      {e.nombre} {e.apellido} ({e.cargo})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bloque 3: Medio de Pago */}
          <div>
            <label className="text-xs font-semibold text-gray-200 block mb-1.5">
              3. Forma de Pago y Liquidación *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {mediosPago.map(mp => {
                const isSelected = medioPago === mp.codigo;
                return (
                  <div
                    key={mp.codigo}
                    onClick={() => setMedioPago(mp.codigo)}
                    className={`
                      p-2.5 rounded-lg border cursor-pointer select-none transition-all text-center
                      ${isSelected
                        ? 'bg-brand-600/20 border-brand-500 text-gray-100 ring-1 ring-brand-500/50 font-semibold'
                        : 'bg-dark-bg/60 border-dark-borderSubtle text-gray-400 hover:border-gray-600'
                      }
                    `}
                  >
                    <div className="text-xs truncate">{mp.descripcion}</div>
                    <div className="text-[10px] text-amber-400 mt-0.5">
                      {mp.porcentajeComision > 0 ? `Comisión: ${mp.porcentajeComision}%` : 'Sin Comisión'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recibo / Liquidación Financiera en Vivo */}
          <div className="p-4 rounded-xl bg-dark-bg/80 border border-brand-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-dark-borderSubtle">
              <span className="text-gray-300 font-semibold flex items-center gap-1.5">
                <Receipt size={14} className="text-brand-400" /> Resumen de Liquidación
              </span>
              <span className="text-dark-muted text-[11px]">Snapshot Inmutable</span>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-300">
              <span>Monto Facturado al Cliente (Bruto):</span>
              <span className="font-semibold text-gray-100">
                ${montoTotalPreview.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-amber-400">
              <span>Comisión Bancaria ({medioSeleccionado.descripcion} {tasaComisionPreview}%):</span>
              <span>
                -${montoComisionPreview.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm pt-2 border-t border-dark-borderSubtle font-bold">
              <span className="text-gray-100">Ganancia Neta para la Agencia:</span>
              <span className="text-emerald-400 text-base">
                ${gananciaNetaPreview.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
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
              leftIcon={<Receipt size={16} />}
            >
              Emitir Venta
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Comprobante / Detalle de Venta */}
      {ventaDetalle && (
        <Modal
          isOpen={true}
          onClose={() => setVentaDetalle(null)}
          title={`Comprobante de Venta #${ventaDetalle.numVenta}`}
          description={`Emitido el ${ventaDetalle.fechaVenta ? ventaDetalle.fechaVenta.replace('T', ' ').substring(0, 16) : '-'}`}
          size="lg"
        >
          <div className="space-y-5 text-left">
            {/* Banner de Estado */}
            <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
              ventaDetalle.estado === 'ACTIVA'
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-red-950/20 border-red-500/30 text-red-300'
            }`}>
              <div className="flex items-center gap-3">
                {ventaDetalle.estado === 'ACTIVA' ? (
                  <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
                ) : (
                  <XCircle size={24} className="text-red-400 shrink-0" />
                )}
                <div>
                  <h4 className="text-sm font-bold text-gray-100">
                    Operación {ventaDetalle.estado === 'ACTIVA' ? 'Confirmada y Vigente' : 'Anulada'}
                  </h4>
                  <p className="text-xs text-dark-muted mt-0.5">
                    {ventaDetalle.estado === 'ACTIVA'
                      ? 'La venta impacta positivamente en el balance y métricas del período.'
                      : `Anulada el ${ventaDetalle.fechaAnulacion ? ventaDetalle.fechaAnulacion.replace('T', ' ').substring(0, 16) : '-'}. Balances financieros revertidos.`
                    }
                  </p>
                </div>
              </div>
              <Badge variant={ventaDetalle.estado === 'ACTIVA' ? 'success' : 'danger'} size="md">
                {ventaDetalle.estado}
              </Badge>
            </div>

            {/* Datos de Intervinientes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-dark-bg/60 border border-dark-borderSubtle">
              <div>
                <span className="text-[10px] text-dark-muted uppercase font-bold tracking-wider block mb-1">
                  Cliente Titular
                </span>
                <div className="font-semibold text-gray-100 text-sm">{ventaDetalle.clienteNombreCompleto}</div>
                <div className="text-xs text-dark-muted mt-0.5">DNI: {ventaDetalle.clienteDni}</div>
              </div>

              <div>
                <span className="text-[10px] text-dark-muted uppercase font-bold tracking-wider block mb-1">
                  Vendedor de la Agencia
                </span>
                <div className="font-semibold text-gray-100 text-sm">{ventaDetalle.empleadoNombreCompleto}</div>
                <div className="text-xs text-dark-muted mt-0.5">Registrado por nómina comercial</div>
              </div>
            </div>

            {/* Producto Contratado */}
            <div className="p-4 rounded-xl bg-dark-bg/60 border border-dark-borderSubtle space-y-2">
              <span className="text-[10px] text-dark-muted uppercase font-bold tracking-wider block">
                Producto o Servicio Contratado
              </span>
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-gray-100 text-sm flex items-center gap-2">
                  <Badge variant={ventaDetalle.tipoProducto === 'PAQUETE' ? 'warning' : 'info'} size="sm">
                    {ventaDetalle.tipoProducto}
                  </Badge>
                  <span>{ventaDetalle.tipoProducto === 'SERVICIO' ? ventaDetalle.servicioNombre : ventaDetalle.paqueteNombre}</span>
                </div>
                <span className="text-sm font-bold text-gray-100">
                  ${parseFloat(ventaDetalle.montoTotal).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Si es paquete y tiene servicios asociados en el detalle */}
              {ventaDetalle.paqueteServicios && ventaDetalle.paqueteServicios.length > 0 && (
                <div className="mt-3 pt-3 border-t border-dark-borderSubtle space-y-1.5">
                  <span className="text-[11px] text-dark-muted font-semibold block">Servicios incluidos en el paquete:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {ventaDetalle.paqueteServicios.map((s, idx) => (
                      <div key={idx} className="p-2 rounded bg-dark-surface border border-dark-borderSubtle text-xs text-gray-300 flex items-center justify-between">
                        <span>{s.nombre}</span>
                        <span className="text-emerald-400 font-medium">${parseFloat(s.costoServicio).toLocaleString('es-AR')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Desglose Contable */}
            <div className="p-4 rounded-xl bg-dark-bg/80 border border-brand-500/30 space-y-2">
              <span className="text-[10px] text-dark-muted uppercase font-bold tracking-wider block pb-1 border-b border-dark-borderSubtle">
                Liquidación Contable
              </span>
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span>Forma de Pago:</span>
                <span className="font-semibold text-gray-200">{ventaDetalle.medioPago}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span>Monto Bruto Facturado:</span>
                <span className="font-semibold text-gray-100">
                  ${parseFloat(ventaDetalle.montoTotal).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-amber-400">
                <span>Comisión Deducida ({parseFloat(ventaDetalle.porcentajeComision).toFixed(2)}%):</span>
                <span>
                  -${parseFloat(ventaDetalle.montoComision).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-dark-borderSubtle font-bold">
                <span className="text-gray-100">Ganancia Neta Percibida:</span>
                <span className="text-emerald-400 text-base">
                  ${parseFloat(ventaDetalle.gananciaNeta).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Acciones del Comprobante */}
            <div className="flex items-center justify-between pt-3 border-t border-dark-borderSubtle">
              {ventaDetalle.estado === 'ACTIVA' ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => solicitarAnulacion(ventaDetalle.numVenta)}
                  leftIcon={<Ban size={14} />}
                >
                  Anular Esta Venta
                </Button>
              ) : (
                <div className="text-xs text-red-400 flex items-center gap-1.5">
                  <ShieldAlert size={14} />
                  <span>Operación no editable (ANULADA)</span>
                </div>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setVentaDetalle(null)}
              >
                Cerrar Comprobante
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Diálogo de Confirmación para Anulación */}
      <ConfirmDialog
        isOpen={confirmAnulacion.isOpen}
        onClose={() => setConfirmAnulacion(prev => ({ ...prev, isOpen: false }))}
        onConfirm={ejecutarAnulacion}
        title="Anular Operación de Venta"
        message={`¿Estás seguro de anular la venta #${confirmAnulacion.numVenta}? Esta acción revertirá el balance financiero y la venta quedará registrada como ANULADA irreversiblemente.`}
        confirmText="Confirmar Anulación"
        cancelText="Volver"
        variant="danger"
        loading={confirmAnulacion.loading}
      />
    </div>
  );
}
