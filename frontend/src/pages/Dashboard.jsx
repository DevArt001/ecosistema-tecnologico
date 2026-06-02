import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { clientesAPI, ordenesAPI, productosAPI, facturasAPI } from "../services/api"
import { KPICard, TableSkeleton } from "../components/UI"
import API from "../services/api"

const ESTADOS = {
  recibido:    { color: "#6A7A92", label: "Recibido",    icon: "📋" },
  diagnostico: { color: "#F5A623", label: "Diagnóstico", icon: "🔍" },
  aprobado:    { color: "#1E5FD4", label: "Aprobado",    icon: "✅" },
  en_proceso:  { color: "#00D4A0", label: "En proceso",  icon: "⚙️" },
  esperando_repuestos: { color: "#8B5CF6", label: "Repuestos", icon: "⏳" },
  en_pruebas:  { color: "#F5A623", label: "En pruebas",  icon: "🧪" },
  finalizado:  { color: "#1E5FD4", label: "Finalizado",  icon: "🏁" },
  entregado:   { color: "#3A4A62", label: "Entregado",   icon: "✔️" },
}

function QuickLink({ icon, label, url, color, desc }) {
  return (
    <a href={url} target="_blank" rel="noreferrer"
      style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "12px 14px", borderRadius: "12px", textDecoration: "none",
        background: color + "08", border: `1px solid ${color}20`,
        transition: "all .2s cubic-bezier(.4,0,.2,1)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = color + "15"
        e.currentTarget.style.borderColor = color + "40"
        e.currentTarget.style.transform = "translateX(4px)"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = color + "08"
        e.currentTarget.style.borderColor = color + "20"
        e.currentTarget.style.transform = "translateX(0)"
      }}>
      <div style={{
        width: "36px", height: "36px", borderRadius: "10px",
        background: color + "18", display: "flex",
        alignItems: "center", justifyContent: "center",
        fontSize: "18px", flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color }}>{label}</div>
        <div style={{ fontSize: "11px", color: "var(--text3)", marginTop: "1px" }}>{desc}</div>
      </div>
      <span style={{ color, fontSize: "14px", opacity: .5 }}>↗</span>
    </a>
  )
}

export default function Dashboard() {
  const [stats, setStats]     = useState({ clientes: 0, ordenes: 0, productos: 0, facturas: 0 })
  const [ordenes, setOrdenes] = useState([])
  const [reporte, setReporte] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const navigate = useNavigate()
  const username = localStorage.getItem("username") || "Admin"
  const rol      = localStorage.getItem("rol") || "admin"

  const hora    = new Date().getHours()
  const saludo  = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches"
  const emoji   = hora < 12 ? "🌅" : hora < 18 ? "☀️" : "🌙"

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true)
    setError(null)
    try {
      const [c, o, p, f, rep] = await Promise.all([
        clientesAPI.listar(), ordenesAPI.listar(),
        productosAPI.listar(), facturasAPI.listar(),
        API.get("/reportes/financiero/", { params: { anio: new Date().getFullYear() } })
          .catch(() => null),
      ])
      const ords = o.data.results || o.data
      setStats({
        clientes:  (c.data.results || c.data).length,
        ordenes:   ords.length,
        productos: (p.data.results || p.data).length,
        facturas:  (f.data.results || f.data).length,
      })
      setOrdenes(ords.slice(0, 8))
      if (rep) setReporte(rep.data.resumen)
    } catch(err) { setError("Error al cargar datos") }
    setLoading(false)
  }

  const ordenesActivas = ordenes.filter(o =>
    ["recibido","diagnostico","aprobado","en_proceso","esperando_repuestos","en_pruebas"].includes(o.estado)
  ).length

  const stockCritico = 0

  return (
    <div>
      {/* Hero Banner */}
      <div className="fade-in" style={{
        background: "linear-gradient(135deg, #0C1520 0%, #080E1A 60%, #0A0810 100%)",
        border: "1.5px solid #1A2436",
        borderRadius: "var(--radius-xl)",
        padding: "1.75rem 2rem",
        marginBottom: "1.5rem",
        position: "relative", overflow: "hidden",
      }}>
        {/* Efectos de fondo */}
        <div style={{ position: "absolute", right: "-40px", top: "-40px",
          width: "240px", height: "240px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,33,58,.07) 0%, transparent 65%)",
          pointerEvents: "none" }}/>
        <div style={{ position: "absolute", right: "100px", bottom: "-60px",
          width: "180px", height: "180px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(30,95,212,.05) 0%, transparent 65%)",
          pointerEvents: "none" }}/>
        <div style={{ position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%,-50%)",
          width: "400px", height: "2px",
          background: "linear-gradient(90deg, transparent, rgba(232,33,58,.06), transparent)",
          pointerEvents: "none" }}/>

        <div style={{ display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: "1rem", flexWrap: "wrap",
          position: "relative" }}>

          {/* Logo + saludo */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "58px", height: "58px", borderRadius: "14px",
              background: "#0A0A0A",
              border: "2px solid rgba(232,33,58,.35)",
              boxShadow: "0 0 20px rgba(232,33,58,.18), 0 0 40px rgba(232,33,58,.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "6px", flexShrink: 0,
            }}>
              <img src="/logo_arm.png" alt="ARM Racing"
                style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <div>
              <div style={{
                fontSize: "11px", fontWeight: "700", letterSpacing: ".14em",
                textTransform: "uppercase", marginBottom: "4px",
                background: "linear-gradient(90deg, #E8213A, #1E5FD4)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>ARM Racing Performance</div>
              <div style={{ fontSize: "22px", fontWeight: "700",
                color: "var(--text)", letterSpacing: "-.4px" }}>
                {saludo}, <span style={{
                  background: "linear-gradient(135deg, #E8213A, #FF6B6B)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>{username}</span> {emoji}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "3px" }}>
                {new Date().toLocaleDateString("es-CO", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric"
                })}
              </div>
            </div>
          </div>

          {/* Stats rápidos */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {[
              { label: "Rol", valor: rol.toUpperCase(), color: "#E8213A" },
              { label: "Órdenes activas", valor: ordenesActivas, color: "#00D4A0" },
              reporte && { label: "Ingresos mes", valor: `$${Math.round((reporte.ingresos||0)/1000)}K`, color: "#F5A623" },
            ].filter(Boolean).map((s, i) => (
              <div key={i} style={{
                textAlign: "center",
                background: s.color + "08",
                border: `1px solid ${s.color}20`,
                borderRadius: "12px", padding: "10px 16px",
              }}>
                <div style={{ fontSize: "18px", fontWeight: "800", color: s.color,
                  letterSpacing: "-.5px" }}>{s.valor}</div>
                <div style={{ fontSize: "10px", color: "var(--text3)",
                  textTransform: "uppercase", letterSpacing: ".08em",
                  marginTop: "2px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="fade-in" style={{
          background: "rgba(232,33,58,.08)", border: "1px solid rgba(232,33,58,.25)",
          borderRadius: "10px", padding: "10px 16px", marginBottom: "1.5rem",
          fontSize: "13px", color: "var(--red)",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          ⚠️ {error}
          <button onClick={cargar} style={{ background: "none", border: "none",
            color: "var(--red)", cursor: "pointer", fontSize: "12px",
            textDecoration: "underline" }}>Reintentar</button>
        </div>
      )}

      {/* KPIs */}
      <div className="stagger" style={{ display: "flex", gap: "1rem",
        flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <KPICard titulo="Clientes" valor={stats.clientes}
          color="#1E5FD4" icon="👤" sub="Registrados"
          delay={0} onClick={() => navigate("/clientes")} />
        <KPICard titulo="Órdenes" valor={stats.ordenes}
          color="#8B5CF6" icon="🔧" sub="Total órdenes"
          delay={.05} onClick={() => navigate("/ordenes")} />
        <KPICard titulo="Productos" valor={stats.productos}
          color="#F5A623" icon="📦" sub="En inventario"
          delay={.10} onClick={() => navigate("/inventario")} />
        <KPICard titulo="Facturas" valor={stats.facturas}
          color="#00D4A0" icon="💰" sub="Emitidas"
          delay={.15} onClick={() => navigate("/facturas")} />
        {reporte && (
          <KPICard titulo="Ganancia" valor={`$${Math.round((reporte.ganancia_neta||0)/1000)}K`}
            color={reporte.ganancia_neta >= 0 ? "#00D4A0" : "#E8213A"}
            icon="📈" sub={`Margen ${reporte.margen}%`}
            delay={.20} onClick={() => navigate("/reportes")} />
        )}
      </div>

      {/* Grid principal */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 290px",
        gap: "1.5rem", marginBottom: "1.5rem" }}>

        {/* Órdenes recientes */}
        <div className="card fade-in" style={{ animationDelay: ".2s" }}>
          <div style={{ padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--border)",
            display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "14px" }}>
                ⚙️ Órdenes recientes
              </div>
              <div style={{ fontSize: "11px", color: "var(--text3)", marginTop: "2px" }}>
                Últimas 8 órdenes de trabajo
              </div>
            </div>
            <button onClick={() => navigate("/ordenes")}
              style={{ background: "none", border: "none", cursor: "pointer",
                fontSize: "12px", color: "#E8213A", fontWeight: "500",
                fontFamily: "var(--font)" }}>
              Ver todas →
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Código</th><th>Cliente</th><th>Placa</th>
                <th>Estado</th><th>Costo</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <TableSkeleton rows={5} cols={5} /> :
               ordenes.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: "3rem",
                  color: "var(--text3)" }}>
                  Sin órdenes todavía
                </td></tr>
              ) : ordenes.map(o => {
                const s = ESTADOS[o.estado] || ESTADOS.recibido
                return (
                  <tr key={o.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px",
                      color: "#E8213A", fontWeight: "600" }}>{o.codigo}</td>
                    <td style={{ color: "var(--text)", fontWeight: "500",
                      fontSize: "13px" }}>{o.cliente_nombre || "—"}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px",
                      color: "var(--text3)" }}>{o.vehiculo_placa || "—"}</td>
                    <td>
                      <span style={{
                        background: s.color + "15", color: s.color,
                        padding: "3px 9px", borderRadius: "20px",
                        fontSize: "10px", fontWeight: "600",
                        display: "inline-flex", alignItems: "center", gap: "3px"
                      }}>
                        {s.icon} {s.label}
                      </span>
                    </td>
                    <td style={{ color: "#00D4A0", fontWeight: "700",
                      fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                      ${Number(o.costo_final || 0).toLocaleString("es-CO")}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Panel derecho */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Estado órdenes */}
          <div className="card fade-in" style={{ padding: "1.25rem",
            animationDelay: ".25s" }}>
            <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "13px",
              marginBottom: "12px" }}>Estado de órdenes</div>
            {Object.entries(ESTADOS).map(([key, s]) => {
              const count = ordenes.filter(o => o.estado === key).length
              if (count === 0) return null
              const total = ordenes.length || 1
              const pct = Math.round((count / total) * 100)
              return (
                <div key={key} style={{ marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginBottom: "3px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "11px" }}>{s.icon}</span>
                      <span style={{ fontSize: "11px", color: "var(--text3)" }}>{s.label}</span>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: "700",
                      color: s.color }}>{count}</span>
                  </div>
                  <div style={{ height: "4px", background: "var(--bg3)",
                    borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${pct}%`,
                      background: s.color, borderRadius: "2px",
                      transition: "width .6s cubic-bezier(.4,0,.2,1)",
                      boxShadow: `0 0 4px ${s.color}60`,
                    }}/>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Links públicos */}
          <div className="card fade-in" style={{ padding: "1.25rem",
            animationDelay: ".3s" }}>
            <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "13px",
              marginBottom: "12px" }}>🌐 Links públicos</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <QuickLink icon="📅" label="Agendar cita" url="/agendar"
                color="#00D4A0" desc="Reserva online" />
              <QuickLink icon="🌐" label="Página pública" url="/public"
                color="#1E5FD4" desc="Info del taller" />
              <QuickLink icon="🔗" label="Portal cliente" url="/portal"
                color="#8B5CF6" desc="Estado de la moto" />
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="card fade-in" style={{ padding: "1.25rem",
            animationDelay: ".35s" }}>
            <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "13px",
              marginBottom: "12px" }}>⚡ Accesos rápidos</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              {[
                { label: "Nueva orden", url: "/ordenes", color: "#E8213A", icon: "🔧" },
                { label: "Clientes", url: "/clientes", color: "#1E5FD4", icon: "👤" },
                { label: "Inventario", url: "/inventario", color: "#F5A623", icon: "📦" },
                { label: "Reportes", url: "/reportes", color: "#8B5CF6", icon: "📊" },
              ].map(item => (
                <button key={item.label}
                  onClick={() => navigate(item.url)}
                  style={{
                    background: item.color + "08",
                    border: `1px solid ${item.color}20`,
                    borderRadius: "10px", padding: "10px 8px",
                    cursor: "pointer", transition: "all .15s",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", gap: "4px",
                    fontFamily: "var(--font)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = item.color + "15"
                    e.currentTarget.style.borderColor = item.color + "35"
                    e.currentTarget.style.transform = "translateY(-2px)"
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = item.color + "08"
                    e.currentTarget.style.borderColor = item.color + "20"
                    e.currentTarget.style.transform = "translateY(0)"
                  }}>
                  <span style={{ fontSize: "18px" }}>{item.icon}</span>
                  <span style={{ fontSize: "10px", fontWeight: "600",
                    color: item.color }}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
