import { useState, useEffect } from "react"
import API from "../services/api"
import { PageHeader, KPICard } from "../components/UI"

const MESES = ["","Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]

export default function FlujoCaja() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [anio, setAnio]       = useState(new Date().getFullYear())
  const [tab, setTab]         = useState("flujo")

  useEffect(() => { cargar() }, [anio])

  const cargar = async () => {
    setLoading(true)
    try {
      const r = await API.get("/reportes/flujo-caja/", { params: { anio } })
      setData(r.data)
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  if (loading) return <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>Cargando...</div>
  if (!data) return <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>Error al cargar</div>

  const r = data.resumen
  const maxVal = Math.max(...data.flujo_mensual.map(m => Math.max(m.ingresos, m.gastos)), 1)

  return (
    <div>
      <PageHeader titulo="Contabilidad Avanzada"
        sub="Flujo de caja, proyecciones y cuentas">
        <select value={anio} onChange={e => setAnio(e.target.value)}
          style={{ width: "100px" }}>
          {[2026,2025,2024].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button className="btn btn-secondary" onClick={cargar}>↻ Actualizar</button>
      </PageHeader>

      {/* KPIs */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {[
          { titulo: "Ingresos cobrados", valor: r.ingresos_pagados, color: "#10B981", icon: "💰", prefix: "$" },
          { titulo: "Gastos reales", valor: r.gastos_reales, color: "#EF4444", icon: "📤", prefix: "$" },
          { titulo: "Flujo neto", valor: r.flujo_neto, color: r.flujo_neto >= 0 ? "#10B981" : "#EF4444", icon: "📊", prefix: "$" },
          { titulo: "Por cobrar", valor: r.cxc_total, color: "#F59E0B", icon: "⏳", prefix: "$" },
          { titulo: "Proyección mes", valor: r.proyeccion_mes, color: "#8B5CF6", icon: "🔮", prefix: "$" },
        ].map(k => (
          <div key={k.titulo} style={{
            flex: 1, minWidth: "140px", background: "var(--bg2)",
            border: `1px solid ${k.color}33`, borderRadius: "var(--radius-lg)",
            padding: "1.25rem", position: "relative", overflow: "hidden"
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: k.color }}/>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "10px", color: "var(--text3)", fontWeight: "600",
                  textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "8px" }}>{k.titulo}</div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: k.color }}>
                  {k.prefix}${Math.abs(Number(k.valor)).toLocaleString("es-CO")}
                  {k.valor < 0 && <span style={{ fontSize: "12px" }}> (negativo)</span>}
                </div>
              </div>
              <div style={{ fontSize: "24px" }}>{k.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
        {[
          { key: "flujo", label: "📊 Flujo mensual" },
          { key: "cxc", label: `💳 Cuentas por cobrar (${data.cuentas_por_cobrar.length})` },
          { key: "balance", label: "⚖️ Balance general" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            background: "none", border: "none", padding: "10px 16px",
            fontSize: "13px", fontWeight: tab === t.key ? "600" : "400",
            color: tab === t.key ? "#10B981" : "var(--text3)",
            borderBottom: tab === t.key ? "2px solid #10B981" : "2px solid transparent",
            cursor: "pointer", marginBottom: "-1px"
          }}>{t.label}</button>
        ))}
      </div>

      {/* Tab Flujo mensual */}
      {tab === "flujo" && (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
          <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "14px", marginBottom: "1.5rem" }}>
            Ingresos vs Gastos {anio}
          </div>

          {/* Gráfica de barras */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "180px", marginBottom: "1rem" }}>
            {data.flujo_mensual.map((m, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", gap: "2px", height: "100%" }}>
                <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column",
                  justifyContent: "flex-end", gap: "2px" }}>
                  <div style={{
                    width: "100%", background: "#10B981",
                    height: `${(m.ingresos / maxVal) * 100}%`,
                    minHeight: m.ingresos > 0 ? "4px" : "0",
                    borderRadius: "3px 3px 0 0",
                    title: `$${m.ingresos.toLocaleString()}`
                  }}/>
                  <div style={{
                    width: "100%", background: "#EF4444",
                    height: `${(m.gastos / maxVal) * 100}%`,
                    minHeight: m.gastos > 0 ? "4px" : "0",
                    borderRadius: "3px 3px 0 0"
                  }}/>
                </div>
                <div style={{ fontSize: "9px", color: "var(--text3)", marginTop: "4px" }}>
                  {MESES[m.mes]}
                </div>
              </div>
            ))}
          </div>

          {/* Leyenda */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "12px", height: "12px", background: "#10B981", borderRadius: "2px" }}/>
              <span style={{ fontSize: "12px", color: "var(--text3)" }}>Ingresos</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "12px", height: "12px", background: "#EF4444", borderRadius: "2px" }}/>
              <span style={{ fontSize: "12px", color: "var(--text3)" }}>Gastos</span>
            </div>
          </div>

          {/* Tabla mensual */}
          <table>
            <thead>
              <tr><th>Mes</th><th>Ingresos</th><th>Gastos</th><th>Flujo neto</th></tr>
            </thead>
            <tbody>
              {data.flujo_mensual.map((m, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: "600", color: "var(--text)" }}>{MESES[m.mes]}</td>
                  <td style={{ color: "#10B981", fontWeight: "600" }}>${Number(m.ingresos).toLocaleString("es-CO")}</td>
                  <td style={{ color: "#EF4444" }}>${Number(m.gastos).toLocaleString("es-CO")}</td>
                  <td style={{ fontWeight: "700", color: m.neto >= 0 ? "#10B981" : "#EF4444" }}>
                    {m.neto < 0 ? "-" : ""}${Math.abs(m.neto).toLocaleString("es-CO")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab CxC */}
      {tab === "cxc" && (
        <div className="card">
          {data.cuentas_por_cobrar.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>
              ✅ Sin cuentas por cobrar — todas las facturas están pagadas
            </div>
          ) : (
            <table>
              <thead>
                <tr><th>Factura</th><th>Cliente</th><th>Total</th><th>Fecha emisión</th><th>Días pendiente</th></tr>
              </thead>
              <tbody>
                {data.cuentas_por_cobrar.map(f => (
                  <tr key={f.id}>
                    <td style={{ fontFamily: "monospace", color: "#10B981", fontWeight: "600" }}>{f.numero}</td>
                    <td style={{ fontWeight: "600", color: "var(--text)" }}>{f.cliente}</td>
                    <td style={{ color: "#F59E0B", fontWeight: "600" }}>${Number(f.total).toLocaleString("es-CO")}</td>
                    <td style={{ fontSize: "12px", color: "var(--text3)" }}>{f.fecha}</td>
                    <td>
                      <span style={{
                        padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600",
                        background: f.dias > 30 ? "#3B0A0A" : f.dias > 15 ? "#451A03" : "#1E3A5F",
                        color: f.dias > 30 ? "#EF4444" : f.dias > 15 ? "#F59E0B" : "#3B82F6"
                      }}>{f.dias} días</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab Balance */}
      {tab === "balance" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* Activos */}
          <div style={{ background: "var(--bg2)", border: "1px solid #10B98133",
            borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
            <div style={{ fontWeight: "700", color: "#10B981", fontSize: "16px",
              marginBottom: "1rem", borderBottom: "2px solid #10B981", paddingBottom: "8px" }}>
              ENTRADAS
            </div>
            {[
              { label: "Ingresos cobrados", valor: r.ingresos_pagados, color: "#10B981" },
              { label: "Ingresos pendientes", valor: r.ingresos_pendientes, color: "#F59E0B" },
              { label: "Total ingresos", valor: r.ingresos_pagados + r.ingresos_pendientes, color: "#10B981", bold: true },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between",
                padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "13px", color: "var(--text2)", fontWeight: item.bold ? "700" : "400" }}>
                  {item.label}
                </span>
                <span style={{ fontSize: "13px", fontWeight: item.bold ? "700" : "600", color: item.color }}>
                  ${Number(item.valor).toLocaleString("es-CO")}
                </span>
              </div>
            ))}
          </div>

          {/* Pasivos */}
          <div style={{ background: "var(--bg2)", border: "1px solid #EF444433",
            borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
            <div style={{ fontWeight: "700", color: "#EF4444", fontSize: "16px",
              marginBottom: "1rem", borderBottom: "2px solid #EF4444", paddingBottom: "8px" }}>
              SALIDAS
            </div>
            {[
              { label: "Gastos registrados", valor: r.gastos_reales, color: "#EF4444" },
              { label: "Cuentas por pagar", valor: r.cxp_total, color: "#F59E0B" },
              { label: "Total salidas", valor: r.gastos_reales, color: "#EF4444", bold: true },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between",
                padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "13px", color: "var(--text2)", fontWeight: item.bold ? "700" : "400" }}>
                  {item.label}
                </span>
                <span style={{ fontSize: "13px", fontWeight: item.bold ? "700" : "600", color: item.color }}>
                  ${Number(item.valor).toLocaleString("es-CO")}
                </span>
              </div>
            ))}
          </div>

          {/* Resultado */}
          <div style={{ gridColumn: "1 / -1", background: "var(--bg2)",
            border: `2px solid ${r.flujo_neto >= 0 ? "#10B981" : "#EF4444"}`,
            borderRadius: "var(--radius-lg)", padding: "1.5rem", textAlign: "center" }}>
            <div style={{ fontSize: "13px", color: "var(--text3)", marginBottom: "8px" }}>
              RESULTADO NETO {anio}
            </div>
            <div style={{ fontSize: "36px", fontWeight: "800",
              color: r.flujo_neto >= 0 ? "#10B981" : "#EF4444" }}>
              {r.flujo_neto < 0 ? "-" : "+"}${Math.abs(r.flujo_neto).toLocaleString("es-CO")}
            </div>
            <div style={{ fontSize: "13px", color: "var(--text3)", marginTop: "8px" }}>
              {r.flujo_neto >= 0 ? "✅ El negocio está generando ganancia" : "⚠️ Los gastos superan los ingresos"}
            </div>
            <div style={{ marginTop: "12px", fontSize: "13px", color: "#8B5CF6" }}>
              🔮 Proyección próximo mes: ${Number(r.proyeccion_mes).toLocaleString("es-CO")}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
