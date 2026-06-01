import { useState, useEffect } from "react"
import API from "../services/api"

const MESES = ["","Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
const CATEGORIAS = {
  nomina: "Nómina", arriendo: "Arriendo", servicios: "Servicios públicos",
  repuestos: "Repuestos", herramientas: "Herramientas", marketing: "Marketing", otros: "Otros"
}

function StatCard({ titulo, valor, sub, color, icono, prefix = "$" }) {
  return (
    <div className="card" style={{ padding: "1.25rem", flex: 1, minWidth: "160px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "11px", color: "var(--text3)", fontWeight: "600",
            textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "8px" }}>
            {titulo}
          </div>
          <div style={{ fontSize: "28px", fontWeight: "700", color, lineHeight: 1 }}>
            {prefix}{Number(valor).toLocaleString("es-CO")}
          </div>
          {sub && <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "6px" }}>{sub}</div>}
        </div>
        <div style={{ width: "36px", height: "36px", borderRadius: "8px",
          background: color + "22", display: "flex",
          alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
          {icono}
        </div>
      </div>
    </div>
  )
}

function BarChart({ data, colorPos, colorNeg, label }) {
  if (!data?.length) return (
    <div style={{ padding: "2rem", textAlign: "center", color: "var(--text3)", fontSize: "13px" }}>
      Sin datos para mostrar
    </div>
  )
  const max = Math.max(...data.map(d => d.total), 1)
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "6px",
      height: "120px", padding: "0 0.5rem" }}>
      {data.map((d, i) => {
        const height = Math.max((d.total / max) * 100, 2)
        const mes = d.mes ? parseInt(d.mes.split("-")[1]) : i + 1
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", gap: "4px" }}>
            <div style={{ fontSize: "9px", color: "var(--text3)" }}>
              ${(d.total/1000).toFixed(0)}k
            </div>
            <div style={{ width: "100%", height: `${height}%`,
              background: d.total > 0 ? colorPos : colorNeg,
              borderRadius: "3px 3px 0 0", minHeight: "4px",
              transition: "height 0.3s" }} />
            <div style={{ fontSize: "9px", color: "var(--text3)" }}>
              {MESES[mes]}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const exportar = (tipo) => {
  const token = localStorage.getItem("access")
  const base = window.location.hostname === "app.armracing.com"
    ? "https://api.armracing.com/api"
    : "http://192.168.0.8:8000/api"
  window.open(`${base}/reportes/exportar/?tipo=${tipo}&token=${token}`, "_blank")
}

export default function Reportes() {
  const anioActual = new Date().getFullYear()
  const [anio, setAnio]       = useState(anioActual)
  const [mes, setMes]         = useState("")
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => { cargar() }, [anio, mes])

  const cargar = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { anio }
      if (mes) params.mes = mes
      const res = await API.get("/reportes/financiero/", { params })
      setData(res.data)
    } catch (err) {
      setError(err.mensaje || "Error al cargar reportes")
    } finally {
      setLoading(false)
    }
  }

  const r = data?.resumen

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700",
            color: "var(--text)", marginBottom: "4px" }}>Reportes</h1>
          <p style={{ color: "var(--text3)", fontSize: "13px" }}>
            Ingresos, gastos y rentabilidad del taller
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <select value={mes} onChange={e => setMes(e.target.value)}
            style={{ width: "130px" }}>
            <option value="">Todo el año</option>
            {MESES.slice(1).map((m, i) => (
              <option key={i+1} value={i+1}>{m}</option>
            ))}
          </select>
          <select value={anio} onChange={e => setAnio(e.target.value)}
            style={{ width: "100px" }}>
            {[anioActual, anioActual-1, anioActual-2].map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={cargar}>
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#3B0A0A", border: "1px solid #EF4444",
          borderRadius: "8px", padding: "12px 16px", marginBottom: "1rem",
          color: "#FCA5A5", fontSize: "13px",
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {error}
          <button onClick={cargar} style={{ background: "none", border: "none",
            color: "#FCA5A5", cursor: "pointer", fontSize: "12px",
            textDecoration: "underline" }}>Reintentar</button>
        </div>
      )}

      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>
          Cargando reportes...
        </div>
      ) : data && (
        <>
          {/* Stats principales */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            <StatCard titulo="Ingresos"     valor={r.ingresos}
              color="#10B981" icono="💰" sub={`${r.facturas_count} facturas pagadas`} />
            <StatCard titulo="Gastos generales" valor={r.gastos}
              color="#EF4444" icono="📤" sub={`${r.gastos_count} gastos registrados`} />
            <StatCard titulo="Costo repuestos" valor={r.costo_repuestos || 0}
              color="#F59E0B" icono="🔩" sub="Costo interno repuestos" />
            <StatCard titulo="Ganancia neta" valor={r.ganancia_neta}
              color={r.ganancia_neta >= 0 ? "#10B981" : "#EF4444"}
              icono="📈" sub={`Margen: ${r.margen}%`} />
            <StatCard titulo="Cot. pendientes"
              valor={data.cotizaciones_pendientes.total}
              color="#8B5CF6" icono="📋"
              sub={`${data.cotizaciones_pendientes.cantidad} por aprobar`} />
          </div>

          {/* Gráficas */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: "1rem", marginBottom: "1.5rem" }}>
            <div className="card" style={{ padding: "1.25rem" }}>
              <div style={{ fontWeight: "600", color: "var(--text)",
                marginBottom: "4px", fontSize: "14px" }}>
                📈 Ingresos por mes
              </div>
              <div style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "1rem" }}>
                Facturas pagadas {anio}
              </div>
              <BarChart data={data.ingresos_por_mes} colorPos="#10B981" />
            </div>
            <div className="card" style={{ padding: "1.25rem" }}>
              <div style={{ fontWeight: "600", color: "var(--text)",
                marginBottom: "4px", fontSize: "14px" }}>
                📤 Gastos por mes
              </div>
              <div style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "1rem" }}>
                Gastos registrados {anio}
              </div>
              <BarChart data={data.gastos_por_mes} colorPos="#EF4444" />
            </div>
          </div>

          {/* Gastos por categoría */}
          <div className="card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
            <div style={{ fontWeight: "600", color: "var(--text)",
              marginBottom: "1rem", fontSize: "14px" }}>
              📊 Gastos por categoría
            </div>
            {!data.gastos_por_categoria?.length ? (
              <div style={{ padding: "1.5rem", textAlign: "center",
                color: "var(--text3)", fontSize: "13px" }}>
                No hay gastos registrados
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {data.gastos_por_categoria.map((g, i) => {
                  const pct = r.gastos > 0
                    ? Math.round((g.total / r.gastos) * 100) : 0
                  const colores = ["#EF4444","#F59E0B","#8B5CF6",
                    "#3B82F6","#10B981","#EC4899","#6B7280"]
                  return (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between",
                        marginBottom: "4px" }}>
                        <span style={{ fontSize: "13px", color: "var(--text)" }}>
                          {CATEGORIAS[g.categoria] || g.categoria}
                        </span>
                        <span style={{ fontSize: "13px", color: "var(--text3)" }}>
                          ${Number(g.total).toLocaleString()} ({pct}%)
                        </span>
                      </div>
                      <div style={{ height: "6px", background: "var(--border2)",
                        borderRadius: "3px" }}>
                        <div style={{ height: "100%", width: `${pct}%`,
                          background: colores[i % colores.length],
                          borderRadius: "3px", transition: "width 0.5s" }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Resumen texto */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <div style={{ fontWeight: "600", color: "var(--text)",
              marginBottom: "1rem", fontSize: "14px" }}>
              📋 Resumen {mes ? `${MESES[mes]} ${anio}` : anio}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1rem" }}>
              {[
                { label: "Total ingresos",     valor: r.ingresos,            color: "#10B981" },
                { label: "Gastos generales",   valor: r.gastos,              color: "#EF4444" },
                { label: "Costo repuestos",    valor: r.costo_repuestos || 0, color: "#F59E0B" },
                { label: "Ganancia neta",      valor: r.ganancia_neta,
                  color: r.ganancia_neta >= 0 ? "#10B981" : "#EF4444" },
              ].map(({ label, valor, color }) => (
                <div key={label} style={{ background: "var(--bg1)",
                  borderRadius: "8px", padding: "1rem",
                  border: `1px solid ${color}33` }}>
                  <div style={{ fontSize: "12px", color: "var(--text3)",
                    marginBottom: "6px" }}>{label}</div>
                  <div style={{ fontSize: "22px", fontWeight: "700", color }}>
                    ${Number(valor).toLocaleString("es-CO")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
