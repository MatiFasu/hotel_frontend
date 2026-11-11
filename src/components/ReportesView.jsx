import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  CreditCard,
  DollarSign,
  RefreshCw,
  Database,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  Percent,
  Receipt,
  Layers,
  Sparkles,
  PieChart,
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
  useToast,
} from './ui';

const MESES = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' }
];

export default function ReportesView() {
  const toast = useToast();
  const hoyISO = new Date().toISOString().split('T')[0];
  const hoyDate = new Date();

  const [modo, setModo] = useState('MENSUAL'); // 'DIARIO' o 'MENSUAL'
  const [fechaDiaria, setFechaDiaria] = useState(hoyISO);
  const [anioMensual, setAnioMensual] = useState(hoyDate.getFullYear());
  const [mesMensual, setMesMensual] = useState(hoyDate.getMonth() + 1);
  const [soloDiasConVentas, setSoloDiasConVentas] = useState(false);
  const [diaHover, setDiaHover] = useState(null);

  const [reporteDiario, setReporteDiario] = useState(null);
  const [reporteMensual, setReporteMensual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seedLoading, setSeedLoading] = useState(false);

  const cargarReportes = async () => {
    try {
      setLoading(true);

      const [resDiario, resMensual] = await Promise.all([
        fetch(`/api/reportes/ganancias-diarias?fecha=${fechaDiaria}`),
        fetch(`/api/reportes/ganancias-mensuales?anio=${anioMensual}&mes=${mesMensual}`)
      ]);

      if (!resDiario.ok) throw new Error('Error al obtener el reporte diario');
      if (!resMensual.ok) throw new Error('Error al obtener el reporte mensual');

      const [dataDiario, dataMensual] = await Promise.all([
        resDiario.json(),
        resMensual.json()
      ]);

      setReporteDiario(dataDiario);
      setReporteMensual(dataMensual);
    } catch (err) {
      toast.error(err.message || 'No se pudieron cargar los reportes financieros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReportes();
  }, [fechaDiaria, anioMensual, mesMensual]);

  const handleSeedDemo = async () => {
    try {
      setSeedLoading(true);
      const res = await fetch('/api/reportes/seed-demo', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al cargar datos de demostración');
      toast.success(data.message);
      cargarReportes();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSeedLoading(false);
    }
  };

  const reporteActual = modo === 'DIARIO' ? reporteDiario : reporteMensual;
  const serieDiaria = reporteMensual?.serieDiaria || [];
  const serieFiltrada = soloDiasConVentas
    ? serieDiaria.filter(d => d.cantidadVentas > 0)
    : serieDiaria;

  const maxNetoDia = Math.max(
    ...serieDiaria.map(d => parseFloat(d.montoNeto) || 0),
    100
  );

  const montoBrutoTotal = parseFloat(reporteActual?.montoTotalBruto || 0);
  const montoNetoTotal = parseFloat(reporteActual?.gananciaTotalNeta || 0);
  const margenRentabilidad = montoBrutoTotal > 0
    ? ((montoNetoTotal / montoBrutoTotal) * 100).toFixed(1)
    : '0.0';

  const desgloseMedios = reporteActual?.desglosePorMedioPago || [];

  return (
    <div className="space-y-6 text-left">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-dark-borderSubtle">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-100 tracking-tight">
              Dashboard & Métricas Financieras
            </h2>
            <Badge variant="brand" size="sm">Contable</Badge>
          </div>
          <p className="text-xs sm:text-sm text-dark-muted mt-1">
            Consolidación de operaciones <strong>ACTIVAS</strong>, deducción de comisiones y serie continua.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSeedDemo}
            loading={seedLoading}
            leftIcon={<Database size={14} className="text-brand-400" />}
            title="Carga datos de demostración si la base se encuentra sin operaciones"
          >
            Datos Demo
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={cargarReportes}
            leftIcon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
          >
            Recalcular
          </Button>
        </div>
      </div>

      {/* Barra de Filtro y Selección de Período */}
      <Card>
        <div className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="inline-flex rounded-lg bg-dark-bg p-1 border border-dark-borderSubtle">
            <button
              type="button"
              onClick={() => setModo('MENSUAL')}
              className={`
                px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2
                ${modo === 'MENSUAL'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-dark-muted hover:text-gray-200'
                }
              `}
            >
              <BarChart3 size={14} />
              Balance Mensual (Serie Continua)
            </button>
            <button
              type="button"
              onClick={() => setModo('DIARIO')}
              className={`
                px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2
                ${modo === 'DIARIO'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-dark-muted hover:text-gray-200'
                }
              `}
            >
              <Calendar size={14} />
              Arqueo Diario
            </button>
          </div>

          {modo === 'DIARIO' ? (
            <div className="flex items-center gap-2">
              <label className="text-xs text-dark-muted whitespace-nowrap">Fecha de Consulta:</label>
              <input
                type="date"
                className="input-control text-xs py-1.5 w-auto"
                value={fechaDiaria}
                onChange={(e) => setFechaDiaria(e.target.value)}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-dark-muted">Mes:</label>
                <select
                  className="input-control text-xs py-1.5 w-auto"
                  value={mesMensual}
                  onChange={(e) => setMesMensual(Number(e.target.value))}
                >
                  {MESES.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="text-xs text-dark-muted">Año:</label>
                <input
                  type="number"
                  min="2020"
                  max="2035"
                  className="input-control text-xs py-1.5 w-20 text-center"
                  value={anioMensual}
                  onChange={(e) => setAnioMensual(Number(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {loading || !reporteActual ? (
        <Card>
          <div className="p-12 text-center text-dark-muted text-sm flex flex-col items-center justify-center gap-3">
            <RefreshCw size={24} className="animate-spin text-brand-400" />
            <span>Calculando indicadores contables y consolidados...</span>
          </div>
        </Card>
      ) : (
        <>
          {/* Tarjetas KPI de Nivel Ejecutivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Ventas Activas */}
            <Card className="border-l-4 border-l-brand-500">
              <div className="p-4 space-y-1">
                <div className="flex items-center justify-between text-dark-muted text-xs font-semibold uppercase tracking-wider">
                  <span>Operaciones Activas</span>
                  <Receipt size={16} className="text-brand-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-gray-100">
                  {reporteActual.totalVentasActivas}
                </div>
                <p className="text-[11px] text-dark-muted">
                  {modo === 'DIARIO' ? fechaDiaria : `${MESES.find(m => m.value === mesMensual)?.label} ${anioMensual}`} · Excluye anuladas
                </p>
              </div>
            </Card>

            {/* KPI 2: Facturación Bruta */}
            <Card className="border-l-4 border-l-blue-500">
              <div className="p-4 space-y-1">
                <div className="flex items-center justify-between text-dark-muted text-xs font-semibold uppercase tracking-wider">
                  <span>Facturación Bruta</span>
                  <DollarSign size={16} className="text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-100 truncate">
                  ${montoBrutoTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-dark-muted">
                  Importe bruto facturado al cliente
                </p>
              </div>
            </Card>

            {/* KPI 3: Comisiones Retenidas */}
            <Card className="border-l-4 border-l-amber-500">
              <div className="p-4 space-y-1">
                <div className="flex items-center justify-between text-dark-muted text-xs font-semibold uppercase tracking-wider">
                  <span>Comisiones Retenidas</span>
                  <Percent size={16} className="text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-amber-400 truncate">
                  -${parseFloat(reporteActual.comisionesTotales || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-dark-muted">
                  Deducido por pasarelas (0% a 9%)
                </p>
              </div>
            </Card>

            {/* KPI 4: Ganancia Neta */}
            <Card className="border-l-4 border-l-emerald-500 bg-emerald-950/10">
              <div className="p-4 space-y-1">
                <div className="flex items-center justify-between text-dark-muted text-xs font-semibold uppercase tracking-wider">
                  <span>Ganancia Neta</span>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {margenRentabilidad}% neto
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 truncate">
                  ${montoNetoTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-dark-muted">
                  Monto Bruto − Comisiones bancarias
                </p>
              </div>
            </Card>
          </div>

          {/* Gráfico de Barras Responsivo SVG (Serie Diaria Continua) */}
          {modo === 'MENSUAL' && serieDiaria.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp size={18} className="text-emerald-400" />
                      <span>Evolución Diaria de Ganancias ({serieDiaria.length} días calendario)</span>
                    </CardTitle>
                    <CardDescription>
                      Serie continua sin interrupciones: los días sin ventas se grafican en $0,00 para visualización de tendencia.
                    </CardDescription>
                  </div>

                  {diaHover && (
                    <div className="p-2 rounded-lg bg-dark-bg border border-brand-500/40 text-right animate-fade-in">
                      <span className="text-[10px] text-dark-muted block">Día {diaHover.fecha}:</span>
                      <span className="text-xs font-bold text-emerald-400">
                        ${parseFloat(diaHover.montoNeto).toLocaleString('es-AR')} ({diaHover.cantidadVentas} op.)
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Visualizador de Barras en SVG Nativo */}
                <div className="pt-4 pb-2">
                  <div className="h-44 w-full flex items-end gap-1 sm:gap-1.5 px-2">
                    {serieDiaria.map((dia, index) => {
                      const neto = parseFloat(dia.montoNeto) || 0;
                      const alturaPorcentaje = Math.max(3, Math.round((neto / maxNetoDia) * 100));
                      const tieneVentas = dia.cantidadVentas > 0;
                      const diaNumero = dia.fecha.split('-')[2];

                      return (
                        <div
                          key={dia.fecha}
                          onMouseEnter={() => setDiaHover(dia)}
                          onMouseLeave={() => setDiaHover(null)}
                          className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                        >
                          {/* Tooltip on hover */}
                          <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-dark-surface border border-dark-border px-2 py-1 rounded shadow-lg text-[10px] whitespace-nowrap z-20 text-gray-200">
                            {diaNumero}: ${neto.toLocaleString('es-AR')} ({dia.cantidadVentas} op.)
                          </div>

                          {/* Barra */}
                          <div
                            style={{ height: `${alturaPorcentaje}%` }}
                            className={`
                              w-full rounded-t transition-all duration-300
                              ${tieneVentas
                                ? 'bg-gradient-to-t from-brand-600 to-emerald-400 group-hover:brightness-125 shadow-sm'
                                : 'bg-dark-borderSubtle/60 group-hover:bg-dark-borderSubtle'
                              }
                            `}
                          />

                          {/* Etiqueta del día (cada 3 días en mobile, todos en desktop) */}
                          <span className={`text-[9px] text-dark-muted mt-1.5 ${index % 2 === 0 ? 'block' : 'hidden md:block'}`}>
                            {diaNumero}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Desglose por Medio de Pago (Distribución) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <PieChart size={16} className="text-brand-400" />
                  <span>Distribución por Medio</span>
                </CardTitle>
                <CardDescription>
                  Participación porcentual sobre la facturación bruta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {desgloseMedios.map(item => {
                  const bruto = parseFloat(item.montoBruto) || 0;
                  const pct = montoBrutoTotal > 0 ? Math.round((bruto / montoBrutoTotal) * 100) : 0;
                  return (
                    <div key={item.medioPago} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-200">{item.descripcion}</span>
                        <span className="text-dark-muted">{pct}% ({item.cantidadVentas} op.)</span>
                      </div>
                      <div className="w-full bg-dark-bg h-2 rounded-full overflow-hidden border border-dark-borderSubtle">
                        <div
                          className="bg-brand-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard size={16} className="text-brand-400" />
                  <span>Liquidación por Medio de Pago</span>
                </CardTitle>
                <CardDescription>
                  Tasas de deducción bancaria y neto resultante por canal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Medio</th>
                        <th>Tasa</th>
                        <th>Operaciones</th>
                        <th>Bruto Facturado</th>
                        <th>Comisión</th>
                        <th>Ganancia Neta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-borderSubtle">
                      {desgloseMedios.map(item => (
                        <tr key={item.medioPago} className={item.cantidadVentas > 0 ? '' : 'opacity-50'}>
                          <td>
                            <div className="font-semibold text-gray-200 text-xs">{item.descripcion}</div>
                            <span className="text-[10px] text-dark-muted">{item.medioPago}</span>
                          </td>
                          <td>
                            <Badge variant="neutral" size="sm">
                              {parseFloat(item.porcentajeComision).toFixed(1)}%
                            </Badge>
                          </td>
                          <td className="font-semibold text-xs text-gray-300">
                            {item.cantidadVentas}
                          </td>
                          <td className="text-xs text-gray-200 font-medium">
                            ${parseFloat(item.montoBruto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="text-xs text-amber-400 font-medium">
                            -${parseFloat(item.comisionRetenida).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="text-xs text-emerald-400 font-bold">
                            ${parseFloat(item.gananciaNeta).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de Detalle Diario (Solo Modo Mensual) */}
          {modo === 'MENSUAL' && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Layers size={16} className="text-brand-400" />
                      <span>Detalle de la Serie Diaria del Mes</span>
                    </CardTitle>
                    <CardDescription>
                      Desglose contable día por día del mes consultado
                    </CardDescription>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-dark-muted hover:text-gray-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={soloDiasConVentas}
                      onChange={(e) => setSoloDiasConVentas(e.target.checked)}
                      className="rounded border-dark-border bg-dark-surface text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
                    />
                    <span>Solo días con ventas (&gt; 0)</span>
                  </label>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Ventas</th>
                        <th>Bruto Diario</th>
                        <th>Comisión</th>
                        <th>Ganancia Neta</th>
                        <th className="min-w-[140px]">Participación Mensual</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-borderSubtle">
                      {serieFiltrada.map(dia => {
                        const neto = parseFloat(dia.montoNeto) || 0;
                        const pct = Math.min(100, Math.round((neto / maxNetoDia) * 100));
                        return (
                          <tr key={dia.fecha} className={dia.cantidadVentas > 0 ? '' : 'opacity-40'}>
                            <td className="font-semibold text-gray-200 text-xs">{dia.fecha}</td>
                            <td>
                              <Badge variant={dia.cantidadVentas > 0 ? 'success' : 'neutral'} size="sm">
                                {dia.cantidadVentas} op.
                              </Badge>
                            </td>
                            <td className="text-xs text-gray-300">
                              ${parseFloat(dia.montoBruto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="text-xs text-amber-400">
                              -${parseFloat(dia.comisionRetenida).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="text-xs font-bold text-emerald-400">
                              ${neto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </td>
                            <td>
                              <div className="w-full bg-dark-bg h-2 rounded-full overflow-hidden border border-dark-borderSubtle">
                                <div
                                  className="h-full bg-gradient-to-r from-brand-600 to-emerald-400 rounded-full transition-all duration-300"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
