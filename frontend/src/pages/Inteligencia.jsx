import { useState, useEffect } from "react"
import API from "../services/api"

const MESES = ["","Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]

function KPICard({ titulo, valor, sub, color, icon, tendencia }) {
  return (
    <div style={{
      background: "var(--bg2)", border: `1px solid ${color}33`,
      borderRadius: "var(--radius-lg)", padding: "1.25rem",
      flex: 1, minWidth: "160px", position: "relative", overflow: "hidden"
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: color }}/>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "11px", color: "var(--text3)", fontWeight: "600",
            textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "8px" }}>
            {titulo}
          </div>
          <div style={{ fontSize: "28px", fontWeight: "700", color, lineHeight: 1 }}>
            {valor}
          </div>
          {sub && <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "6px" }}>{sub}</div>}
        </div>
        <div style={{ fontSize: "28px" }}>{icon}</div>
      </div>
      {tendencia !== undefined && (
        <div style={{ marginTop: "10px", fontSize: "12px",
          color: tendencia >= 0 ? "#10B981" : "#EF4444" }}>
          {tendencia >= 0 ? "↑" : "↓"} {Math.abs(tendencia)}% vs mes anterior
        </div>
      )}
    </div>
  )
}

function BarChart({ data, colorKey, labelKey, valueKey, color, prefix="" }) {
  if (!data?.length) return <div style={{ padding: "2rem", textAlign: "center", color: "var(--text3)" }}>Sin datos</div>
  const max = Math.max(...data.map(d => d[valueKey] || 0), 1)
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ fontSize: "12px", color: "var(--text2)", minWidth: "120px",
            textAlign: "right", overflow: "hidden", textOverflow: "ellipsis",
            whiteSpace: "nowrap" }}>
            {d[labelKey]}
          </div>
          <div style={{ flex: 1, height: "24px", background: "var(--bg1)",
            borderRadius: "4px", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${(d[valueKey] / max) * 100}%`,
              background: d[colorKey] || color,
              borderRadius: "4px", transition: "width 0.5s",
              display: "flex", alignItems: "center", paddingLeft: "6px"
            }}>
              <span style={{ fontSize: "11px", color: "white", fontWeight: "600", whiteSpace: "nowrap" }}>
                {prefix}{Number(d[valueKey]).toLocaleString("es-CO")}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Inteligencia() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [anio, setAnio]       = useState(new Date().getFullYear())
  const [alertas, setAlertas] = useState([])

  useEffect(() => { cargar() }, [anio])

  const cargar = async () => {
    setLoading(true)
    try {
      const [rep, clientes, ordenes, productos, facturas, gastos] = await Promise.all([
        API.get("/reportes/financiero/", { params: { anio } }),
        API.get("/clientes/"),
        API.get("/ordenes/"),
        API.get("/inventario/productos/"),
        API.get("/facturas/"),
        API.get("/gastos/"),
      ])

      const ords = ordenes.data.results || ordenes.data
      const prods = productos.data.results || productos.data
      const facts = facturas.data.results || facturas.data
      const clis = clientes.data.results || clientes.data
      const gsts = gastos.data.results || gastos.data

      // Alertas inteligentes
      const nuevasAlertas = []
      
      // Ordenes sin actualizar hace más de 5 días
      const hoy = new Date()
      const ordenesAtrasadas = ords.filter(o => {
        if (["entregado", "finalizado"].includes(o.estado)) return false
        const dias = (hoy - new Date(o.fecha_ingreso)) / (1000*60*60*24)
        return dias > 5
      })
      if (ordenesAtrasadas.length > 0)
        nuevasAlertas.push({ tipo: "warning", msg: `${ordenesAtrasadas.length} orden(es) con más de 5 días sin actualizar`, icon: "⏰" })

      // Stock crítico
      const stockCritico = prods.filter(p => p.estado_stock === "critico")
      if (stockCritico.length > 0)
        nuevasAlertas.push({ tipo: "danger", msg: `${stockCritico.length} producto(s) en stock crítico`, icon: "📦" })

      // Stock bajo
      const stockBajo = prods.filter(p => p.estado_stock === "bajo")
      if (stockBajo.length > 0)
        nuevasAlertas.push({ tipo: "warning", msg: `${stockBajo.length} producto(s) con stock bajo`, icon: "⚠️" })

      // Facturas pendientes
      const factsPendientes = facts.filter(f => f.estado === "pendiente")
      if (factsPendientes.length > 0)
        nuevasAlertas.push({ tipo: "info", msg: `${factsPendientes.length} factura(s) pendientes de cobro`, icon: "💰" })

      setAlertas(nuevasAlertas)

      // Top clientes por órdenes
      const clienteCount = {}
      ords.forEach(o => {
        if (o.cliente_nombre) {
          clienteCount[o.cliente_nombre] = (clienteCount[o.cliente_nombre] || 0) + 1
        }
      })
      const topClientes = Object.entries(clienteCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([nombre, total]) => ({ nombre, total }))

      // Servicios más frecuentes por estado
      const estadoCount = {}
      ords.forEach(o => {
        estadoCount[o.estado] = (estadoCount[o.estado] || 0) + 1
      })

      // Ingresos por mes
      const ingresosMes = rep.data.ingresos_por_mes || []

      // Gastos por categoria
      const gastosCat = rep.data.gastos_por_categoria || []

      // Marcas más frecuentes
      const [vehiculos] = await Promise.all([API.get("/vehiculos/")])
      const vehs = vehiculos.data.results || vehiculos.data
      const marcaCount = {}
      vehs.forEach(v => {
        if (v.marca) marcaCount[v.marca] = (marcaCount[v.marca] || 0) + 1
      })
      const topMarcas = Object.entries(marcaCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([marca, total]) => ({ marca, total }))

      setData({
        resumen: rep.data.resumen,
        ingresosMes,
        gastosCat,
        topClientes,
        topMarcas,
        estadoOrdenes: estadoCount,
        totalOrdenes: ords.length,
        totalClientes: clis.length,
        ordenesActivas: ords.filter(o => !["entregado"].includes(o.estado)).length,
        stockCritico: stockCritico.length,
        factsPendientes: factsPendientes.length,
        totalGastos: gsts.reduce((s, g) => s + parseFloat(g.monto || 0), 0),
      })
    } catch(e) {
      console.error(e)
    }
    setLoading(false)
  }

  if (loading) return (
    <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>
      Cargando inteligencia de negocio...
    </div>
  )

  if (!data) return (
    <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>
      Error al cargar datos
    </div>
  )

  const r = data.resumen

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700",
            color: "var(--text)", marginBottom: "4px" }}>
            Inteligencia de negocio
          </h1>
          <p style={{ color: "var(--text3)", fontSize: "13px" }}>
            Análisis completo del taller ARM Racing Performance
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <select value={anio} onChange={e => setAnio(e.target.value)}
            style={{ width: "100px" }}>
            {[2026,2025,2024].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={cargar}>↻ Actualizar</button>
        </div>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div style={{ marginBottom: "1.5rem", display: "flex",
          flexDirection: "column", gap: "8px" }}>
          {alertas.map((a, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 16px", borderRadius: "8px", fontSize: "13px",
              background: a.tipo === "danger" ? "#3B0A0A" : a.tipo === "warning" ? "#451A03" : "#1E3A5F",
              border: `1px solid ${a.tipo === "danger" ? "#EF4444" : a.tipo === "warning" ? "#F59E0B" : "#3B82F6"}`,
              color: a.tipo === "danger" ? "#FCA5A5" : a.tipo === "warning" ? "#FCD34D" : "#93C5FD",
            }}>
              <span style={{ fontSize: "16px" }}>{a.icon}</span>
              {a.msg}
            </div>
          ))}
        </div>
      )}

      {/* KPIs principales */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <KPICard titulo="Ingresos del año" valor={`$${Number(r.ingresos).toLocaleString("es-CO")}`}
          color="#10B981" icon="💰" sub={`${r.facturas_count} facturas pagadas`} />
        <KPICard titulo="Gastos del año" valor={`$${Number(r.gastos).toLocaleString("es-CO")}`}
          color="#EF4444" icon="📤" sub={`${r.gastos_count} gastos`} />
        <KPICard titulo="Ganancia neta" valor={`$${Number(r.ganancia_neta).toLocaleString("es-CO")}`}
          color={r.ganancia_neta >= 0 ? "#10B981" : "#EF4444"} icon="📈"
          sub={`Margen ${r.margen}%`} />
        <KPICard titulo="Órdenes activas" valor={data.ordenesActivas}
          color="#F59E0B" icon="🔧" sub={`de ${data.totalOrdenes} totales`} />
        <KPICard titulo="Clientes" valor={data.totalClientes}
          color="#8B5CF6" icon="👥" sub="Registrados" />
      </div>

      {/* Segunda fila */}
      {(data.stockCritico > 0 || data.factsPendientes > 0) && (
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          {data.stockCritico > 0 && (
            <KPICard titulo="Stock crítico" valor={data.stockCritico}
              color="#EF4444" icon="🚨" sub="Productos sin stock" />
          )}
          {data.factsPendientes > 0 && (
            <KPICard titulo="Por cobrar" valor={data.factsPendientes}
              color="#F59E0B" icon="💳" sub="Facturas pendientes" />
          )}
        </div>
      )}

      {/* Gráficas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "1.5rem", marginBottom: "1.5rem" }}>

        {/* Ingresos por mes */}
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "1.25rem" }}>
          <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "14px",
            marginBottom: "4px" }}>📈 Ingresos por mes</div>
          <div style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "1rem" }}>
            Facturas pagadas {anio}
          </div>
          {data.ingresosMes.length > 0 ? (
            <div style={{ display: "flex", alignItems: "flex-end",
              gap: "4px", height: "120px" }}>
              {data.ingresosMes.map((m, i) => {
                const max = Math.max(...data.ingresosMes.map(x => x.total), 1)
                const h = Math.max((m.total / max) * 100, 2)
                const mes = m.mes ? parseInt(m.mes.split("-")[1]) : i+1
                return (
                  <div key={i} style={{ flex: 1, display: "flex",
                    flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <div style={{ fontSize: "9px", color: "var(--text3)" }}>
                      ${(m.total/1000).toFixed(0)}k
                    </div>
                    <div style={{ width: "100%", height: `${h}%`,
                      background: "#10B981", borderRadius: "3px 3px 0 0",
                      minHeight: "4px" }}/>
                    <div style={{ fontSize: "9px", color: "var(--text3)" }}>
                      {MESES[mes]}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ padding: "2rem", textAlign: "center",
              color: "var(--text3)", fontSize: "13px" }}>
              Sin datos de ingresos
            </div>
          )}
        </div>

        {/* Top clientes */}
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "1.25rem" }}>
          <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "14px",
            marginBottom: "4px" }}>👥 Top 5 clientes</div>
          <div style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "1rem" }}>
            Por número de órdenes
          </div>
          <BarChart data={data.topClientes} labelKey="nombre"
            valueKey="total" color="#8B5CF6" />
        </div>

        {/* Top marcas */}
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "1.25rem" }}>
          <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "14px",
            marginBottom: "4px" }}>🏍 Marcas más frecuentes</div>
          <div style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "1rem" }}>
            Motos que más entran al taller
          </div>
          <BarChart data={data.topMarcas} labelKey="marca"
            valueKey="total" color="#3B82F6" />
        </div>

        {/* Gastos por categoría */}
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "1.25rem" }}>
          <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "14px",
            marginBottom: "4px" }}>📤 Gastos por categoría</div>
          <div style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "1rem" }}>
            Distribución de gastos {anio}
          </div>
          {data.gastosCat.length > 0 ? (
            <BarChart
              data={data.gastosCat.map(g => ({
                ...g,
                label: g.categoria,
                total: g.total
              }))}
              labelKey="label" valueKey="total" color="#EF4444" prefix="$"
            />
          ) : (
            <div style={{ padding: "2rem", textAlign: "center",
              color: "var(--text3)", fontSize: "13px" }}>
              Sin gastos registrados
            </div>
          )}
        </div>
      </div>

      {/* Estado de órdenes */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: "1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "14px",
          marginBottom: "1rem" }}>🔧 Estado actual de órdenes</div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {[
            { label: "Recibido",    key: "recibido",    color: "#9CA3AF" },
            { label: "Diagnóstico", key: "diagnostico", color: "#F59E0B" },
            { label: "En proceso",  key: "en_proceso",  color: "#10B981" },
            { label: "Finalizado",  key: "finalizado",  color: "#3B82F6" },
            { label: "Entregado",   key: "entregado",   color: "#6B7280" },
          ].map(s => (
            <div key={s.key} style={{
              flex: 1, minWidth: "100px",
              background: s.color + "18",
              border: `1px solid ${s.color}44`,
              borderRadius: "10px", padding: "1rem", textAlign: "center"
            }}>
              <div style={{ fontSize: "28px", fontWeight: "700", color: s.color }}>
                {data.estadoOrdenes[s.key] || 0}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "4px" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
