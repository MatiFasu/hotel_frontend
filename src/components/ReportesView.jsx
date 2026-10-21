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
  AlertTriangle
} from 'lucide-react';

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
  const hoyISO = new Date().toISOString().split('T')[0];
  const hoyDate = new Date();

  const [modo, setModo] = useState('MENSUAL'); // 'DIARIO' o 'MENSUAL'
  const [fechaDiaria, setFechaDiaria] = useState(hoyISO);
  const [anioMensual, setAnioMensual] = useState(hoyDate.getFullYear());
  const [mesMensual, setMesMensual] = useState(hoyDate.getMonth() + 1);
  const [soloDiasConVentas, setSoloDiasConVentas] = useState(false);

  const [reporteDiario, setReporteDiario] = useState(null);
  const [reporteMensual, setReporteMensual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const cargarReportes = async () => {
    try {
      setLoading(true);
      setError(null);

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
      setError(err.message || 'No se pudieron cargar los reportes financieros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReportes();
  }, [fechaDiaria, anioMensual, mesMensual]);

  const handleSeedDemo = async () => {
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/reportes/seed-demo', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al cargar datos de demostración');
      setSuccessMsg(data.message);
      cargarReportes();
    } catch (err) {
      setError(err.message);
    }
  };

  const reporteActual = modo === 'DIARIO' ? reporteDiario : reporteMensual;
  const serieDiaria = reporteMensual?.serieDiaria || [];
  const serieFiltrada = soloDiasConVentas
    ? serieDiaria.filter(d => d.cantidadVentas > 0)
    : serieDiaria;

  const maxNetoDia = Math.max(
    ...serieDiaria.map(d => parseFloat(d.montoNeto) || 0),
    1
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Reportes Financieros & Ganancias Netas (Bonus Point)</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Consolidación en tiempo real de ventas <strong>ACTIVAS</strong>, deducción de comisiones por medio de pago y serie diaria continua.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn-secondary"
            onClick={handleSeedDemo}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            title="Puebla clientes, empleados, servicios, paquetes y ventas de prueba si la base está vacía"
          >
            <Database size={16} color="var(--accent-primary)" />
            Cargar Datos Demo
          </button>

          <button
            className="btn-primary"
            onClick={cargarReportes}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <RefreshCw size={16} />
            Recalcular
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

      {/* Barra de Selector de Modo y Período */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setModo('MENSUAL')}
            className={modo === 'MENSUAL' ? 'btn-primary' : 'btn-secondary'}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <BarChart3 size={16} />
            Balance Mensual (Serie Continua)
          </button>
          <button
            type="button"
            onClick={() => setModo('DIARIO')}
            className={modo === 'DIARIO' ? 'btn-primary' : 'btn-secondary'}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Calendar size={16} />
            Arqueo Diario
          </button>
        </div>

        {modo === 'DIARIO' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Fecha de Consulta:</label>
            <input
              type="date"
              className="input-control"
              style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
              value={fechaDiaria}
              onChange={(e) => setFechaDiaria(e.target.value)}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Mes:</label>
              <select
                className="input-control"
                style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
                value={mesMensual}
                onChange={(e) => setMesMensual(Number(e.target.value))}
              >
                {MESES.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Año:</label>
              <input
                type="number"
                min="2020"
                max="2035"
                className="input-control"
                style={{ width: '95px', padding: '0.4rem 0.75rem' }}
                value={anioMensual}
                onChange={(e) => setAnioMensual(Number(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>

      {loading || !reporteActual ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Calculando indicadores financieros...
        </div>
      ) : (
        <>
          {/* Tarjetas KPI */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
            <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-primary)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Ventas Activas ({modo === 'DIARIO' ? fechaDiaria : `${MESES.find(m => m.value === mesMensual)?.label} ${anioMensual}`})
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem' }}>
                {reporteActual.totalVentasActivas}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Excluye ventas anuladas (Decisión 9)
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid #60a5fa' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Facturación Bruta Total
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 700, marginTop: '0.35rem', color: '#fff' }}>
                ${parseFloat(reporteActual.montoTotalBruto || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Importe cobrado a clientes
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid #fbbf24' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Comisiones Retenidas
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 700, marginTop: '0.35rem', color: '#fbbf24' }}>
                -${parseFloat(reporteActual.comisionesTotales || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Según medio de pago (0% a 9%)
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-success)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Ganancia Neta Agencia
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--accent-success)' }}>
                ${parseFloat(reporteActual.gananciaTotalNeta || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Monto Bruto − Comisiones
              </div>
            </div>
          </div>

          {/* Tabla de Desglose por Medio de Pago */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} color="var(--accent-primary)" />
              Desglose Financiero por Medio de Pago
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Medio de Pago</th>
                    <th>Tasa Comisión</th>
                    <th>Operaciones Activas</th>
                    <th>Monto Bruto</th>
                    <th>Comisión Retenida</th>
                    <th>Ganancia Neta</th>
                  </tr>
                </thead>
                <tbody>
                  {(reporteActual.desglosePorMedioPago || []).map(item => (
                    <tr key={item.medioPago} style={{ opacity: item.cantidadVentas > 0 ? 1 : 0.55 }}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.descripcion}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.medioPago}</div>
                      </td>
                      <td>
                        <span className="badge badge-type">{parseFloat(item.porcentajeComision).toFixed(2)}%</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.cantidadVentas}</td>
                      <td>${parseFloat(item.montoBruto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                      <td style={{ color: '#fbbf24' }}>
                        -${parseFloat(item.comisionRetenida).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--accent-success)' }}>
                        ${parseFloat(item.gananciaNeta).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Serie Diaria Continua (Solo en modo MENSUAL) */}
          {modo === 'MENSUAL' && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={18} color="var(--accent-success)" />
                    Serie Diaria Continua del Mes ({serieDiaria.length} días calendario — Decisión 23)
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Incluye todos los días del mes calendario (días sin ventas en $0,00 para graficado continuo).
                  </p>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.88rem' }}>
                  <input
                    type="checkbox"
                    checked={soloDiasConVentas}
                    onChange={(e) => setSoloDiasConVentas(e.target.checked)}
                  />
                  Mostrar en tabla solo días con ventas (&gt; 0)
                </label>
              </div>

              <div style={{ overflowX: 'auto', maxHeight: '420px', overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Ventas</th>
                      <th>Bruto Diario</th>
                      <th>Comisión</th>
                      <th>Ganancia Neta</th>
                      <th style={{ minWidth: '160px' }}>Proporción Mensual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serieFiltrada.map(dia => {
                      const neto = parseFloat(dia.montoNeto) || 0;
                      const pct = Math.min(100, Math.round((neto / maxNetoDia) * 100));
                      return (
                        <tr key={dia.fecha} style={{ opacity: dia.cantidadVentas > 0 ? 1 : 0.45 }}>
                          <td style={{ fontWeight: 600 }}>{dia.fecha}</td>
                          <td>
                            <span className={`badge ${dia.cantidadVentas > 0 ? 'badge-active' : 'badge-inactive'}`}>
                              {dia.cantidadVentas} op.
                            </span>
                          </td>
                          <td>${parseFloat(dia.montoBruto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                          <td style={{ color: '#fbbf24' }}>
                            -${parseFloat(dia.comisionRetenida).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--accent-success)' }}>
                            ${neto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </td>
                          <td>
                            <div style={{ width: '100%', background: 'rgba(255,255,255,0.06)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${pct}%`,
                                  height: '100%',
                                  background: 'var(--accent-gradient)',
                                  transition: 'width 0.3s ease'
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
