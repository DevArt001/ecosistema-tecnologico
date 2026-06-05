import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { clientesAPI, ordenesAPI, productosAPI, facturasAPI } from "../services/api"
import { TableSkeleton } from "../components/UI"
import API from "../services/api"

const ESTADOS = {
  recibido:    { color: "var(--text3)", label: "Recibido",    icon: "📋" },
  diagnostico: { color: "#F5A623", label: "Diagnóstico", icon: "🔍" },
  aprobado:    { color: "#1E5FD4", label: "Aprobado",    icon: "✅" },
  en_proceso:  { color: "#00D4A0", label: "En proceso",  icon: "⚙️" },
  esperando_repuestos: { color: "#8B5CF6", label: "Repuestos", icon: "⏳" },
  en_pruebas:  { color: "#F5A623", label: "En pruebas",  icon: "🧪" },
  finalizado:  { color: "#1E5FD4", label: "Finalizado",  icon: "🏁" },
  entregado:   { color: "var(--text3)", label: "Entregado",   icon: "✔️" },
}

// Componente de número animado
function AnimatedNumber({ value, prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const target = typeof value === "number" ? value : 0
    if (target === 0) return
    let start = 0
    const duration = 800
    const startTime = performance.now()
    const update = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + (target - start) * eased))
      if (progress < 1) requestAnimationFrame(update)
    }
    requestAnimationFrame(update)
  }, [value])

  return <span>{prefix}{typeof value === "string" ? value : display.toLocaleString("es-CO")}{suffix}</span>
}

function KPIHero({ titulo, valor, sub, color, icon, delay = 0, onClick }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay * 1000)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div onClick={onClick} style={{
      flex: 1, minWidth: "160px",
      background: "var(--bg2)",
      border: `1.5px solid ${visible ? color + "30" : "var(--border)"}`,
      borderRadius: "16px",
      padding: "1.5rem",
      position: "relative", overflow: "hidden",
      cursor: onClick ? "pointer" : "default",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: "all .5s cubic-bezier(.4,0,.2,1)",
      transitionDelay: `${delay}s`,
    }}
    onMouseEnter={e => {
      if (!onClick) return
      e.currentTarget.style.borderColor = color + "55"
      e.currentTarget.style.transform = "translateY(-4px)"
      e.currentTarget.style.boxShadow = `0 12px 40px ${color}18`
    }}
    onMouseLeave={e => {
      if (!onClick) return
      e.currentTarget.style.borderColor = color + "30"
      e.currentTarget.style.transform = "translateY(0)"
      e.currentTarget.style.boxShadow = "none"
    }}>
      {/* Barra superior */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "3px",
        background: `linear-gradient(90deg, ${color}, ${color}44)`,
        transform: visible ? "scaleX(1)" : "scaleX(0)",
        transformOrigin: "left",
        transition: "transform .6s cubic-bezier(.4,0,.2,1)",
        transitionDelay: `${delay + .1}s`,
      }}/>
      {/* Brillo de fondo */}
      <div style={{
        position: "absolute", top: "-20px", right: "-20px",
        width: "80px", height: "80px", borderRadius: "50%",
        background: `radial-gradient(circle, ${color}12 0%, transparent 70%)`,
        pointerEvents: "none",
      }}/>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{
            fontSize: "11px", fontWeight: "700", color: "var(--text3)",
            textTransform: "uppercase", letterSpacing: ".12em", marginBottom: "12px"
          }}>{titulo}</div>
          <div style={{
            fontSize: "40px", fontWeight: "900", color,
            lineHeight: 1, letterSpacing: "-2px",
          }}>
            {visible ? <AnimatedNumber value={valor} /> : "0"}
          </div>
          {sub && <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "8px" }}>{sub}</div>}
        </div>
        <div style={{
          width: "44px", height: "44px", borderRadius: "12px",
          background: color + "15", border: `1px solid ${color}25`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "20px",
        }}>{icon}</div>
      </div>
      {onClick && (
        <div style={{
          marginTop: "12px", fontSize: "11px", color, fontWeight: "600",
          display: "flex", alignItems: "center", gap: "4px", opacity: .7
        }}>Ver todos →</div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats]     = useState({ clientes: 0, ordenes: 0, productos: 0, facturas: 0 })
  const [ordenes, setOrdenes] = useState([])
  const [reporte, setReporte] = useState(null)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()
  const username = localStorage.getItem("username") || "Admin"
  const rol      = localStorage.getItem("rol") || "admin"

  const hora   = new Date().getHours()
  const saludo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches"
  const emoji  = hora < 12 ? "🌅" : hora < 18 ? "☀️" : "🌙"

  useEffect(() => {
    cargar()
    setTimeout(() => setVisible(true), 50)
  }, [])

  const cargar = async () => {
    setLoading(true)
    try {
      const [c, o, p, f, rep] = await Promise.all([
        clientesAPI.listar(), ordenesAPI.listar(),
        productosAPI.listar(), facturasAPI.listar(),
        API.get("/reportes/financiero/", { params: { anio: new Date().getFullYear() } }).catch(() => null),
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
    } catch(err) { console.error(err) }
    setLoading(false)
  }

  const ordenesActivas = ordenes.filter(o =>
    ["recibido","diagnostico","aprobado","en_proceso","esperando_repuestos","en_pruebas"].includes(o.estado)
  ).length

  return (
    <div>
      {/* Hero Banner */}
      <div style={{
        background: "var(--bg2)",
        border: "1.5px solid #1E2A3A",
        borderRadius: "20px",
        padding: "2rem 2.5rem",
        marginBottom: "2rem",
        position: "relative", overflow: "hidden",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-12px)",
        transition: "all .5s cubic-bezier(.4,0,.2,1)",
      }}>
        {/* Efectos decorativos */}
        <div style={{ position: "absolute", right: "-60px", top: "-60px",
          width: "300px", height: "300px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,33,58,.08) 0%, transparent 60%)",
          pointerEvents: "none" }}/>
        <div style={{ position: "absolute", left: "30%", bottom: "-80px",
          width: "250px", height: "250px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(30,95,212,.06) 0%, transparent 60%)",
          pointerEvents: "none" }}/>
        {/* Línea de acento */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg, transparent, rgba(232,33,58,.4), rgba(30,95,212,.4), transparent)",
        }}/>

        <div style={{ display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: "1.5rem", flexWrap: "wrap",
          position: "relative" }}>

          {/* Logo + saludo */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{
              width: "68px", height: "68px", borderRadius: "16px",
              background: "var(--bg3)",
              border: "2px solid rgba(232,33,58,.4)",
              boxShadow: "0 0 24px rgba(232,33,58,.2), 0 0 50px rgba(232,33,58,.07)",
              padding: "8px", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <img src="/logo_arm.png" alt="ARM"
                style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
            <div>
              <div style={{
                fontSize: "12px", fontWeight: "700", letterSpacing: ".16em",
                textTransform: "uppercase", marginBottom: "6px",
                background: "linear-gradient(90deg, var(--red) 0%, #FF6B6B 50%, var(--blue) 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>ARM Racing Performance · TallerOS</div>
              <div style={{ fontSize: "28px", fontWeight: "800",
                color: "#EEF0FF", letterSpacing: "-.6px", lineHeight: 1.2 }}>
                {saludo}, {" "}
                <span style={{
                  background: "linear-gradient(135deg, var(--red) 0%, #FF8080 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>{username}</span> {emoji}
              </div>
              <div style={{ fontSize: "14px", color: "#5A6A82", marginTop: "4px" }}>
                {new Date().toLocaleDateString("es-CO", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric"
                })}
              </div>
            </div>
          </div>

          {/* Badges info */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div style={{
              background: "rgba(232,33,58,.1)", border: "1px solid rgba(232,33,58,.25)",
              borderRadius: "12px", padding: "12px 20px", textAlign: "center",
            }}>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#E8213A",
                letterSpacing: "-.5px" }}>{rol.toUpperCase()}</div>
              <div style={{ fontSize: "10px", color: "#5A6A82", marginTop: "2px",
                textTransform: "uppercase", letterSpacing: ".1em" }}>Rol</div>
            </div>
            <div style={{
              background: "rgba(0,212,160,.08)", border: "1px solid rgba(0,212,160,.2)",
              borderRadius: "12px", padding: "12px 20px", textAlign: "center",
            }}>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#00D4A0",
                letterSpacing: "-.5px" }}>{ordenesActivas}</div>
              <div style={{ fontSize: "10px", color: "#5A6A82", marginTop: "2px",
                textTransform: "uppercase", letterSpacing: ".1em" }}>Activas</div>
            </div>
            {reporte && (
              <div style={{
                background: "rgba(245,166,35,.08)", border: "1px solid rgba(245,166,35,.2)",
                borderRadius: "12px", padding: "12px 20px", textAlign: "center",
              }}>
                <div style={{ fontSize: "20px", fontWeight: "800", color: "#F5A623",
                  letterSpacing: "-.5px" }}>
                  ${Math.round((reporte.ingresos||0)/1000)}K
                </div>
                <div style={{ fontSize: "10px", color: "#5A6A82", marginTop: "2px",
                  textTransform: "uppercase", letterSpacing: ".1em" }}>Ingresos</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        <KPIHero titulo="Clientes" valor={stats.clientes}
          color="#1E5FD4" icon="👤" sub="Registrados"
          delay={0.1} onClick={() => navigate("/clientes")} />
        <KPIHero titulo="Órdenes" valor={stats.ordenes}
          color="#8B5CF6" icon="🔧" sub="Total órdenes"
          delay={0.18} onClick={() => navigate("/ordenes")} />
        <KPIHero titulo="Productos" valor={stats.productos}
          color="#F5A623" icon="📦" sub="En inventario"
          delay={0.26} onClick={() => navigate("/inventario")} />
        <KPIHero titulo="Facturas" valor={stats.facturas}
          color="#00D4A0" icon="💰" sub="Emitidas"
          delay={0.34} onClick={() => navigate("/facturas")} />
        {reporte && (
          <KPIHero titulo="Ganancia" valor={`$${Math.round((reporte.ganancia_neta||0)/1000)}K`}
            color={reporte.ganancia_neta >= 0 ? "#00D4A0" : "#E8213A"}
            icon="📈" sub={`Margen ${reporte.margen}%`}
            delay={0.42} onClick={() => navigate("/reportes")} />
        )}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px",
        gap: "1.5rem", marginBottom: "1.5rem" }}>

        {/* Órdenes recientes */}
        <div style={{
          background: "var(--bg2)", border: "1.5px solid var(--border)",
          borderRadius: "16px", overflow: "hidden",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "all .5s cubic-bezier(.4,0,.2,1)",
          transitionDelay: ".3s",
        }}>
          <div style={{ padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "linear-gradient(90deg, rgba(232,33,58,.03) 0%, transparent 60%)" }}>
            <div>
              <div style={{ fontWeight: "700", color: "var(--text)", fontSize: "16px" }}>
                ⚙️ Órdenes recientes
              </div>
              <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "2px" }}>
                Últimas 8 órdenes de trabajo
              </div>
            </div>
            <button onClick={() => navigate("/ordenes")} style={{
              background: "rgba(232,33,58,.08)", border: "1px solid rgba(232,33,58,.2)",
              borderRadius: "8px", padding: "6px 14px", cursor: "pointer",
              fontSize: "12px", color: "#E8213A", fontWeight: "600",
              fontFamily: "var(--font)", transition: "all .15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(232,33,58,.15)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(232,33,58,.08)" }}>
              Ver todas →
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th style={{ fontSize: "11px" }}>Código</th>
                <th style={{ fontSize: "11px" }}>Cliente</th>
                <th style={{ fontSize: "11px" }}>Placa</th>
                <th style={{ fontSize: "11px" }}>Estado</th>
                <th style={{ fontSize: "11px" }}>Costo</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <TableSkeleton rows={5} cols={5} /> :
               ordenes.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: "center", padding: "3rem",
                  color: "var(--text3)", fontSize: "14px" }}>
                  Sin órdenes todavía
                </td></tr>
              ) : ordenes.map(o => {
                const s = ESTADOS[o.estado] || ESTADOS.recibido
                return (
                  <tr key={o.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px",
                      color: "#E8213A", fontWeight: "600" }}>{o.codigo}</td>
                    <td style={{ color: "var(--text)", fontWeight: "600",
                      fontSize: "14px" }}>{o.cliente_nombre || "—"}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px",
                      color: "var(--text3)" }}>{o.vehiculo_placa || "—"}</td>
                    <td>
                      <span style={{
                        background: s.color + "15", color: s.color,
                        padding: "4px 10px", borderRadius: "20px",
                        fontSize: "11px", fontWeight: "600",
                        display: "inline-flex", alignItems: "center", gap: "4px"
                      }}>
                        {s.icon} {s.label}
                      </span>
                    </td>
                    <td style={{ color: "#00D4A0", fontWeight: "700",
                      fontFamily: "var(--font-mono)", fontSize: "13px" }}>
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
          <div style={{
            background: "var(--bg2)", border: "1.5px solid var(--border)",
            borderRadius: "16px", padding: "1.25rem",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(16px)",
            transition: "all .5s cubic-bezier(.4,0,.2,1)",
            transitionDelay: ".35s",
          }}>
            <div style={{ fontWeight: "700", color: "var(--text)", fontSize: "15px",
              marginBottom: "14px" }}>Estado de órdenes</div>
            {ordenes.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text3)",
                fontSize: "13px", padding: "1rem" }}>Sin órdenes</div>
            ) : Object.entries(ESTADOS).map(([key, s]) => {
              const count = ordenes.filter(o => o.estado === key).length
              if (count === 0) return null
              const pct = Math.round((count / ordenes.length) * 100)
              return (
                <div key={key} style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "12px" }}>{s.icon}</span>
                      <span style={{ fontSize: "13px", color: "var(--text2)",
                        fontWeight: "500" }}>{s.label}</span>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: "700",
                      color: s.color }}>{count}</span>
                  </div>
                  <div style={{ height: "5px", background: "var(--bg3)",
                    borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${pct}%`,
                      background: `linear-gradient(90deg, ${s.color}, ${s.color}88)`,
                      borderRadius: "3px",
                      transition: "width .8s cubic-bezier(.4,0,.2,1)",
                      boxShadow: `0 0 6px ${s.color}50`,
                    }}/>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Accesos rápidos */}
          <div style={{
            background: "var(--bg2)", border: "1.5px solid var(--border)",
            borderRadius: "16px", padding: "1.25rem",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(16px)",
            transition: "all .5s cubic-bezier(.4,0,.2,1)",
            transitionDelay: ".42s",
          }}>
            <div style={{ fontWeight: "700", color: "var(--text)", fontSize: "15px",
              marginBottom: "12px" }}>⚡ Accesos rápidos</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                { label: "Nueva orden", path: "/ordenes", color: "#E8213A", icon: "🔧" },
                { label: "Clientes",    path: "/clientes", color: "#1E5FD4", icon: "👤" },
                { label: "Inventario",  path: "/inventario", color: "#F5A623", icon: "📦" },
                { label: "Reportes",    path: "/reportes", color: "#8B5CF6", icon: "📊" },
                { label: "Agendar",     path: "/agendamiento", color: "#00D4A0", icon: "📅" },
                { label: "Fidelización",path: "/fidelizacion", color: "#E8213A", icon: "⭐" },
              ].map(item => (
                <button key={item.label} onClick={() => navigate(item.path)} style={{
                  background: item.color + "08",
                  border: `1px solid ${item.color}18`,
                  borderRadius: "10px", padding: "10px 8px",
                  cursor: "pointer", transition: "all .18s",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: "5px",
                  fontFamily: "var(--font)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = item.color + "15"
                  e.currentTarget.style.borderColor = item.color + "35"
                  e.currentTarget.style.transform = "translateY(-3px)"
                  e.currentTarget.style.boxShadow = `0 6px 20px ${item.color}18`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = item.color + "08"
                  e.currentTarget.style.borderColor = item.color + "18"
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "none"
                }}>
                  <span style={{ fontSize: "20px" }}>{item.icon}</span>
                  <span style={{ fontSize: "11px", fontWeight: "600",
                    color: item.color }}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Links públicos */}
          <div style={{
            background: "var(--bg2)", border: "1.5px solid var(--border)",
            borderRadius: "16px", padding: "1.25rem",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(16px)",
            transition: "all .5s cubic-bezier(.4,0,.2,1)",
            transitionDelay: ".48s",
          }}>
            <div style={{ fontWeight: "700", color: "var(--text)", fontSize: "15px",
              marginBottom: "12px" }}>🌐 Links públicos</div>
            {[
              { icon: "📅", label: "Agendar cita",   url: "/agendar",  color: "#00D4A0", desc: "Reserva online" },
              { icon: "🌐", label: "Página pública",  url: "/public",   color: "#1E5FD4", desc: "Info del taller" },
              { icon: "🔗", label: "Portal cliente",  url: "/portal",   color: "#8B5CF6", desc: "Estado moto" },
            ].map(link => (
              <a key={link.url} href={link.url} target="_blank" rel="noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "10px 12px", borderRadius: "10px", textDecoration: "none",
                  background: link.color + "08", border: `1px solid ${link.color}18`,
                  transition: "all .15s", marginBottom: "6px",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = link.color + "15"
                  e.currentTarget.style.borderColor = link.color + "35"
                  e.currentTarget.style.transform = "translateX(4px)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = link.color + "08"
                  e.currentTarget.style.borderColor = link.color + "18"
                  e.currentTarget.style.transform = "translateX(0)"
                }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "8px",
                  background: link.color + "15", display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                  {link.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: link.color }}>
                    {link.label}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text3)" }}>{link.desc}</div>
                </div>
                <span style={{ color: link.color, opacity: .5 }}>↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
