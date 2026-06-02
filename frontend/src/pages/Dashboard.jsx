import { useState, useEffect } from "react"
import { clientesAPI, ordenesAPI, productosAPI, facturasAPI } from "../services/api"

const ESTADOS = {
  recibido:    { color: "#6A7A92", label: "Recibido",    icon: "📋" },
  diagnostico: { color: "#FFB020", label: "Diagnóstico", icon: "🔍" },
  aprobado:    { color: "#4D9EFF", label: "Aprobado",    icon: "✅" },
  en_proceso:  { color: "#00E5A0", label: "En proceso",  icon: "⚙️" },
  esperando_repuestos: { color: "#A855F7", label: "Esp. repuestos", icon: "⏳" },
  en_pruebas:  { color: "#FFB020", label: "En pruebas",  icon: "🧪" },
  finalizado:  { color: "#4D9EFF", label: "Finalizado",  icon: "🏁" },
  entregado:   { color: "#3A4A62", label: "Entregado",   icon: "✔️" },
}

function KPICard({ titulo, valor, sub, color, icon, delay = 0 }) {
  return (
    <div className="stat-card fade-in" style={{
      flex: 1, minWidth: "150px",
      animationDelay: `${delay}s`,
      cursor: "default",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = color + "44"
      e.currentTarget.style.transform = "translateY(-3px)"
      e.currentTarget.style.boxShadow = `0 8px 32px ${color}18`
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = "var(--border)"
      e.currentTarget.style.transform = "translateY(0)"
      e.currentTarget.style.boxShadow = "none"
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0,
        height: "3px", background: `linear-gradient(90deg, ${color}, ${color}88)`,
        borderRadius: "3px 3px 0 0" }}/>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text3)",
            textTransform: "uppercase", letterSpacing: ".1em", marginBottom: "10px" }}>
            {titulo}
          </div>
          <div style={{ fontSize: "36px", fontWeight: "800", color,
            lineHeight: 1, letterSpacing: "-1px" }}>
            {valor}
          </div>
          {sub && <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "6px" }}>{sub}</div>}
        </div>
        <div style={{
          width: "40px", height: "40px", borderRadius: "10px",
          background: color + "15",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "18px",
        }}>{icon}</div>
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr>
      {[120, 140, 80, 90, 80].map((w, i) => (
        <td key={i}><div className="skeleton" style={{ height: "16px", width: w, borderRadius: "4px" }}/></td>
      ))}
    </tr>
  )
}

export default function Dashboard() {
  const [stats, setStats]     = useState({ clientes: 0, ordenes: 0, productos: 0, facturas: 0 })
  const [ordenes, setOrdenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const username = localStorage.getItem("username") || "Admin"
  const rol      = localStorage.getItem("rol") || "admin"

  const hora    = new Date().getHours()
  const saludo  = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches"
  const emojis  = hora < 12 ? "🌅" : hora < 18 ? "☀️" : "🌙"

  useEffect(() => { cargar() }, [])

  const cargar = () => {
    setLoading(true)
    setError(null)
    Promise.all([
      clientesAPI.listar(), ordenesAPI.listar(),
      productosAPI.listar(), facturasAPI.listar(),
    ]).then(([c, o, p, f]) => {
      const ords = o.data.results || o.data
      setStats({
        clientes:  (c.data.results || c.data).length,
        ordenes:   ords.length,
        productos: (p.data.results || p.data).length,
        facturas:  (f.data.results || f.data).length,
      })
      setOrdenes(ords.slice(0, 8))
    }).catch(err => setError(err.mensaje || "Error al cargar"))
    .finally(() => setLoading(false))
  }

  const ordenesActivas = ordenes.filter(o =>
    ["recibido","diagnostico","aprobado","en_proceso","esperando_repuestos","en_pruebas"].includes(o.estado)
  ).length

  const stockCritico = 0 // placeholder

  return (
    <div>
      {/* Header saludo */}
      <div className="fade-in" style={{
        background: "linear-gradient(135deg, #0F1E2E 0%, #0A1520 100%)",
        border: "1.5px solid #1A3040",
        borderRadius: "var(--radius-xl)",
        padding: "1.5rem 2rem",
        marginBottom: "1.5rem",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decoración fondo */}
        <div style={{
          position: "absolute", right: "-20px", top: "-20px",
          width: "180px", height: "180px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,229,160,.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}/>
        <div style={{
          position: "absolute", right: "60px", bottom: "-30px",
          width: "120px", height: "120px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(77,158,255,.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}/>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <img src="/logo_arm.png" alt="ARM Racing"
            style={{ width: "52px", height: "52px", borderRadius: "12px",
              border: "2px solid rgba(0,229,160,.3)",
              boxShadow: "0 0 16px rgba(0,229,160,.15)" }} />
          <div>
            <div style={{ fontSize: "11px", color: "var(--text3)", fontWeight: "600",
              textTransform: "uppercase", letterSpacing: ".1em", marginBottom: "4px" }}>
              ARM Racing Performance {emojis}
            </div>
            <div style={{ fontSize: "22px", fontWeight: "700", color: "var(--text)",
              letterSpacing: "-.3px" }}>
              {saludo}, <span style={{ color: "#00E5A0" }}>{username}</span>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "3px" }}>
              {new Date().toLocaleDateString("es-CO", {
                weekday: "long", year: "numeric", month: "long", day: "numeric"
              })}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
          <div style={{
            fontSize: "11px", fontWeight: "700", textTransform: "uppercase",
            letterSpacing: ".1em", color: "#00E5A0",
            background: "rgba(0,229,160,.1)", border: "1px solid rgba(0,229,160,.25)",
            padding: "4px 14px", borderRadius: "20px"
          }}>{rol}</div>
          {ordenesActivas > 0 && (
            <div style={{
              fontSize: "12px", color: "#FFB020",
              background: "rgba(255,176,32,.08)", border: "1px solid rgba(255,176,32,.2)",
              padding: "3px 12px", borderRadius: "20px"
            }}>
              ⚙️ {ordenesActivas} orden{ordenesActivas > 1 ? "es" : ""} activa{ordenesActivas > 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="toast toast-error fade-in" style={{ position: "relative",
          top: "auto", right: "auto", marginBottom: "1.5rem" }}>
          ⚠️ {error}
          <button onClick={cargar} style={{ background: "none", border: "none",
            color: "var(--red)", cursor: "pointer", marginLeft: "8px",
            textDecoration: "underline", fontSize: "12px" }}>Reintentar</button>
        </div>
      )}

      {/* KPIs */}
      <div className="stagger" style={{ display: "flex", gap: "1rem",
        flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <KPICard titulo="Clientes"  valor={stats.clientes}
          color="#4D9EFF" icon="👤" sub="Registrados" delay={0} />
        <KPICard titulo="Órdenes"   valor={stats.ordenes}
          color="#A855F7" icon="🔧" sub="Total órdenes" delay={.05} />
        <KPICard titulo="Productos" valor={stats.productos}
          color="#FFB020" icon="📦" sub="En inventario" delay={.10} />
        <KPICard titulo="Facturas"  valor={stats.facturas}
          color="#00E5A0" icon="💰" sub="Emitidas" delay={.15} />
      </div>

      {/* Grid principal */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px",
        gap: "1.5rem", marginBottom: "1.5rem" }}>

        {/* Órdenes recientes */}
        <div className="card fade-in" style={{ animationDelay: ".2s" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)",
            display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "14px" }}>
                Órdenes recientes
              </div>
              <div style={{ fontSize: "11px", color: "var(--text3)", marginTop: "2px" }}>
                Últimas 8 órdenes de trabajo
              </div>
            </div>
            <a href="/ordenes" style={{ fontSize: "12px", color: "#00E5A0",
              fontWeight: "500", display: "flex", alignItems: "center", gap: "4px" }}>
              Ver todas <span>→</span>
            </a>
          </div>
          <table>
            <thead>
              <tr>
                <th>Código</th><th>Cliente</th><th>Placa</th>
                <th>Estado</th><th>Costo</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(4).fill(0).map((_, i) => <SkeletonRow key={i} />)
              ) : ordenes.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: "3rem",
                  color: "var(--text3)" }}>Sin órdenes todavía</td></tr>
              ) : ordenes.map(o => {
                const s = ESTADOS[o.estado] || ESTADOS.recibido
                return (
                  <tr key={o.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px",
                      color: "#00E5A0", fontWeight: "500" }}>{o.codigo}</td>
                    <td style={{ color: "var(--text)", fontWeight: "500" }}>
                      {o.cliente_nombre || "—"}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px",
                      color: "var(--text3)" }}>{o.vehiculo_placa || "—"}</td>
                    <td>
                      <span style={{
                        background: s.color + "18", color: s.color,
                        padding: "3px 10px", borderRadius: "20px",
                        fontSize: "11px", fontWeight: "600",
                        display: "inline-flex", alignItems: "center", gap: "4px"
                      }}>
                        {s.icon} {s.label}
                      </span>
                    </td>
                    <td style={{ color: "#00E5A0", fontWeight: "600",
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
          <div className="card fade-in" style={{ padding: "1.25rem", animationDelay: ".25s" }}>
            <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "13px",
              marginBottom: "1rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>⚙️</span> Estado de órdenes
            </div>
            {Object.entries(ESTADOS).map(([key, s]) => {
              const count = ordenes.filter(o => o.estado === key).length
              if (count === 0) return null
              return (
                <div key={key} style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "center", padding: "6px 0",
                  borderBottom: "1px solid var(--border2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <span style={{ fontSize: "12px" }}>{s.icon}</span>
                    <span style={{ fontSize: "12px", color: "var(--text3)" }}>{s.label}</span>
                  </div>
                  <span style={{
                    fontSize: "12px", fontWeight: "700", color: s.color,
                    background: s.color + "15", padding: "2px 8px", borderRadius: "12px"
                  }}>{count}</span>
                </div>
              )
            })}
          </div>

          {/* Links públicos */}
          <div className="card fade-in" style={{ padding: "1.25rem", animationDelay: ".3s" }}>
            <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "13px",
              marginBottom: "1rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>🌐</span> Links públicos
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                { label: "Agendar cita",   url: "/agendar", color: "#00E5A0", icon: "📅", desc: "Clientes agendan" },
                { label: "Página pública", url: "/public",  color: "#4D9EFF", icon: "🌐", desc: "Info del taller" },
                { label: "Portal cliente", url: "/portal",  color: "#A855F7", icon: "🔗", desc: "Estado de la moto" },
              ].map(link => (
                <a key={link.url} href={link.url} target="_blank" rel="noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "9px 12px", borderRadius: "10px", textDecoration: "none",
                    background: link.color + "08",
                    border: `1px solid ${link.color}22`,
                    transition: "all .15s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = link.color + "15"
                    e.currentTarget.style.borderColor = link.color + "44"
                    e.currentTarget.style.transform = "translateX(3px)"
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = link.color + "08"
                    e.currentTarget.style.borderColor = link.color + "22"
                    e.currentTarget.style.transform = "translateX(0)"
                  }}>
                  <span style={{ fontSize: "16px" }}>{link.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: link.color }}>
                      {link.label}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text3)" }}>{link.desc}</div>
                  </div>
                  <span style={{ color: link.color, fontSize: "12px", opacity: .6 }}>↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
