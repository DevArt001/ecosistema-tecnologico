import { useState, useEffect } from "react"
import API from "../services/api"
import { PageHeader, Toast, KPICard } from "../components/UI"

const MESES = ["","Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
const CATEGORIAS = {
  nomina:"Nómina", arriendo:"Arriendo", servicios:"Servicios",
  repuestos:"Repuestos", herramientas:"Herramientas", marketing:"Marketing", otros:"Otros"
}

const exportar = (tipo) => {
  const token = localStorage.getItem("access")
  const base = window.location.hostname === "app.armracing.com"
    ? "https://api.armracing.com/api" : "http://192.168.0.8:8000/api"
  window.open(`${base}/reportes/exportar/?tipo=${tipo}&token=${token}`, "_blank")
}

export default function Reportes() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [anio, setAnio]       = useState(new Date().getFullYear())
  const [mes, setMes]         = useState("")

  useEffect(() => { cargar() }, [anio, mes])

  const cargar = async () => {
    setLoading(true)
    try {
      const params = { anio }
      if (mes) params.mes = mes
      const r = await API.get("/reportes/financiero/", { params })
      setData(r.data)
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  if (loading) return (
    <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>
      <div style={{ fontSize: "32px", marginBottom: "12px", animation: "pulse 1.5s infinite" }}>📊</div>
      Cargando reportes...
    </div>
  )

  if (!data) return (
    <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>
      Error al cargar datos
    </div>
  )

  const r = data.resumen
  const maxIngreso = Math.max(...(data.ingresos_por_mes || []).map(m => m.total), 1)
  const maxGasto   = Math.max(...(data.gastos_por_mes || []).map(m => m.total), 1)
  const maxCombinado = Math.max(maxIngreso, maxGasto, 1)

  return (
    <div>
      <PageHeader titulo="Reportes financieros"
        sub="Análisis completo de ingresos, gastos y rentabilidad">
        <select value={mes} onChange={e => setMes(e.target.value)}
          style={{ width: "130px" }}>
          <option value="">Todo el año</option>
          {Array.from({length:12},(_,i)=>i+1).map(m => (
            <option key={m} value={m}>{MESES[m]}</option>
          ))}
        </select>
        <select value={anio} onChange={e => setAnio(e.target.value)}
          style={{ width: "90px" }}>
          {[2026,2025,2024].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button className="btn btn-secondary" onClick={cargar}>↻</button>
        <div style={{ position: "relative" }}>
          <select onChange={e => { if(e.target.value) { exportar(e.target.value); e.target.value="" } }}
            defaultValue=""
            style={{ background: "rgba(0,212,160,.08)", border: "1px solid rgba(0,212,160,.3)",
              color: "#00D4A0", borderRadius: "8px", padding: "8px 12px",
              fontSize: "13px", cursor: "pointer" }}>
            <option value="" disabled>📥 Exportar</option>
            <option value="completo">📊 Todo</option>
            <option value="clientes">👤 Clientes</option>
            <option value="ordenes">🔧 Órdenes</option>
            <option value="inventario">📦 Inventario</option>
            <option value="facturas">💰 Facturas</option>
            <option value="gastos">📤 Gastos</option>
          </select>
        </div>
      </PageHeader>

      {/* KPIs */}
      <div className="stagger" style={{ display: "flex", gap: "1rem",
        flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <KPICard titulo="Ingresos" valor={`$${Math.round(r.ingresos/1000)}K`}
          sub={`${r.facturas_count} facturas pagadas`}
          color="#00D4A0" icon="💰" delay={0} />
        <KPICard titulo="Gastos" valor={`$${Math.round(r.gastos/1000)}K`}
          sub={`${r.gastos_count} gastos`}
          color="#E8213A" icon="📤" delay={.04} />
        <KPICard titulo="Ganancia neta" valor={`$${Math.round(r.ganancia_neta/1000)}K`}
          sub={`Margen ${r.margen}%`}
          color={r.ganancia_neta >= 0 ? "#00D4A0" : "#E8213A"} icon="📈" delay={.08} />
        <KPICard titulo="Costo repuestos" valor={`$${Math.round(r.costo_repuestos/1000)}K`}
          color="#F5A623" icon="🔩" delay={.12} />
      </div>

      {/* Cotizaciones pendientes */}
      {data.cotizaciones_pendientes?.cantidad > 0 && (
        <div className="fade-in" style={{
          background: "rgba(30,95,212,.06)", border: "1px solid rgba(30,95,212,.2)",
          borderRadius: "var(--radius-lg)", padding: "12px 16px",
          marginBottom: "1.5rem", display: "flex", alignItems: "center",
          justifyContent: "space-between", fontSize: "13px"
        }}>
          <span style={{ color: "#1E5FD4" }}>
            📄 <strong>{data.cotizaciones_pendientes.cantidad}</strong> cotizaciones
            pendientes por <strong>
              ${Number(data.cotizaciones_pendientes.total).toLocaleString("es-CO")}
            </strong>
          </span>
        </div>
      )}

      {/* Gráficas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "1.5rem", marginBottom: "1.5rem" }}>

        {/* Ingresos por mes */}
        <div className="card fade-in" style={{ padding: "1.25rem" }}>
          <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "14px",
            marginBottom: "4px" }}>💰 Ingresos por mes</div>
          <div style={{ fontSize: "11px", color: "var(--text3)", marginBottom: "1.25rem" }}>
            Facturas pagadas {anio}
          </div>
          {data.ingresos_por_mes?.length > 0 ? (
            <>
              <div style={{ display: "flex", alignItems: "flex-end",
                gap: "3px", height: "100px", marginBottom: "8px" }}>
                {data.ingresos_por_mes.map((m, i) => {
                  const h = Math.max((m.total / maxCombinado) * 100, 2)
                  const mes = m.mes ? parseInt(m.mes.split("-")[1]) : i+1
                  return (
                    <div key={i} style={{ flex: 1, display: "flex",
                      flexDirection: "column", alignItems: "center", gap: "3px" }}>
                      <div style={{
                        width: "100%", height: `${h}%`,
                        background: `linear-gradient(180deg, #00D4A0 0%, #00B888 100%)`,
                        borderRadius: "3px 3px 0 0", minHeight: m.total > 0 ? "4px" : "0",
                        transition: "height .5s cubic-bezier(.4,0,.2,1)",
                        boxShadow: m.total > 0 ? "0 0 8px rgba(0,212,160,.3)" : "none",
                      }}/>
                      <div style={{ fontSize: "8px", color: "var(--text3)" }}>
                        {MESES[mes]}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div style={{ padding: "2rem", textAlign: "center",
              color: "var(--text3)", fontSize: "13px" }}>
              Sin datos de ingresos
            </div>
          )}
        </div>

        {/* Gastos por mes */}
        <div className="card fade-in" style={{ padding: "1.25rem", animationDelay: ".05s" }}>
          <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "14px",
            marginBottom: "4px" }}>📤 Gastos por mes</div>
          <div style={{ fontSize: "11px", color: "var(--text3)", marginBottom: "1.25rem" }}>
            Distribución mensual {anio}
          </div>
          {data.gastos_por_mes?.length > 0 ? (
            <div style={{ display: "flex", alignItems: "flex-end",
              gap: "3px", height: "100px", marginBottom: "8px" }}>
              {data.gastos_por_mes.map((m, i) => {
                const h = Math.max((m.total / maxCombinado) * 100, 2)
                const mes = m.mes ? parseInt(m.mes.split("-")[1]) : i+1
                return (
                  <div key={i} style={{ flex: 1, display: "flex",
                    flexDirection: "column", alignItems: "center", gap: "3px" }}>
                    <div style={{
                      width: "100%", height: `${h}%`,
                      background: `linear-gradient(180deg, #E8213A 0%, #C41830 100%)`,
                      borderRadius: "3px 3px 0 0", minHeight: m.total > 0 ? "4px" : "0",
                      transition: "height .5s cubic-bezier(.4,0,.2,1)",
                      boxShadow: m.total > 0 ? "0 0 8px rgba(232,33,58,.3)" : "none",
                    }}/>
                    <div style={{ fontSize: "8px", color: "var(--text3)" }}>
                      {MESES[mes]}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ padding: "2rem", textAlign: "center",
              color: "var(--text3)", fontSize: "13px" }}>
              Sin gastos registrados
            </div>
          )}
        </div>

        {/* Gastos por categoría */}
        <div className="card fade-in" style={{ padding: "1.25rem", animationDelay: ".1s" }}>
          <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "14px",
            marginBottom: "1.25rem" }}>🏷️ Gastos por categoría</div>
          {data.gastos_por_categoria?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {data.gastos_por_categoria.map((g, i) => {
                const maxCat = data.gastos_por_categoria[0]?.total || 1
                const pct = Math.round((g.total / maxCat) * 100)
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ fontSize: "12px", color: "var(--text2)",
                      minWidth: "100px", textAlign: "right" }}>
                      {CATEGORIAS[g.categoria] || g.categoria}
                    </div>
                    <div style={{ flex: 1, height: "22px", background: "var(--bg3)",
                      borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${pct}%`,
                        background: "linear-gradient(90deg, #E8213A, #C41830)",
                        borderRadius: "4px", minWidth: "4px",
                        display: "flex", alignItems: "center",
                        paddingLeft: "8px", transition: "width .6s cubic-bezier(.4,0,.2,1)",
                        boxShadow: "2px 0 8px rgba(232,33,58,.3)",
                      }}>
                        <span style={{ fontSize: "10px", color: "white",
                          fontWeight: "600", whiteSpace: "nowrap" }}>
                          ${Math.round(g.total/1000)}K
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text3)",
                      minWidth: "30px", textAlign: "right" }}>
                      {g.cantidad}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ padding: "2rem", textAlign: "center",
              color: "var(--text3)", fontSize: "13px" }}>Sin gastos</div>
          )}
        </div>

        {/* Margen */}
        <div className="card fade-in" style={{ padding: "1.25rem",
          animationDelay: ".15s", display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "center" }}>
          <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "14px",
            marginBottom: "1.5rem", alignSelf: "flex-start" }}>
            📈 Rentabilidad {anio}
          </div>

          {/* Medidor circular */}
          <div style={{ position: "relative", width: "140px", height: "140px",
            marginBottom: "1rem" }}>
            <svg viewBox="0 0 140 140" style={{ width: "100%", height: "100%",
              transform: "rotate(-90deg)" }}>
              <circle cx="70" cy="70" r="56" fill="none"
                stroke="var(--bg3)" strokeWidth="12" />
              <circle cx="70" cy="70" r="56" fill="none"
                stroke={r.margen >= 0 ? "#00D4A0" : "#E8213A"}
                strokeWidth="12"
                strokeDasharray={`${Math.min(Math.abs(r.margen), 100) * 3.52} 352`}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 6px ${r.margen >= 0 ? "rgba(0,212,160,.5)" : "rgba(232,33,58,.5)"})`}}
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex",
              flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: "800",
                color: r.margen >= 0 ? "#00D4A0" : "#E8213A",
                letterSpacing: "-1px" }}>{r.margen}%</div>
              <div style={{ fontSize: "10px", color: "var(--text3)",
                fontWeight: "600", textTransform: "uppercase",
                letterSpacing: ".08em" }}>Margen</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1.5rem", fontSize: "12px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#00D4A0", fontWeight: "700" }}>
                ${Math.round(r.ingresos/1000)}K
              </div>
              <div style={{ color: "var(--text3)" }}>Ingresos</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#E8213A", fontWeight: "700" }}>
                ${Math.round(r.gastos/1000)}K
              </div>
              <div style={{ color: "var(--text3)" }}>Gastos</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: r.ganancia_neta >= 0 ? "#00D4A0" : "#E8213A",
                fontWeight: "700" }}>
                ${Math.round(Math.abs(r.ganancia_neta)/1000)}K
              </div>
              <div style={{ color: "var(--text3)" }}>Neto</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
