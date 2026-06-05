import { useState, useEffect } from "react"
import ThemeToggle from "../components/ThemeToggle"

const BASE = window.location.hostname === "app.armracing.com"
  ? "https://api.armracing.com/api" : "http://192.168.0.8:8000/api"

const ESTADO_CONFIG = {
  recibido:    { color: "var(--text3)", icon: "📋", label: "Recibido",    desc: "Tu moto fue recibida en el taller" },
  diagnostico: { color: "#F5A623", icon: "🔍", label: "Diagnóstico", desc: "Estamos revisando tu moto" },
  aprobado:    { color: "#1E5FD4", icon: "✅", label: "Aprobado",    desc: "El presupuesto fue aprobado" },
  en_proceso:  { color: "#00D4A0", icon: "⚙️", label: "En proceso",  desc: "Estamos trabajando en tu moto" },
  esperando_repuestos: { color: "#8B5CF6", icon: "⏳", label: "Esperando repuestos", desc: "Pedimos los repuestos necesarios" },
  en_pruebas:  { color: "#F5A623", icon: "🧪", label: "En pruebas",  desc: "Probando que todo funcione bien" },
  finalizado:  { color: "#00D4A0", icon: "🏁", label: "Finalizado",  desc: "Tu moto está lista para recoger" },
  entregado:   { color: "var(--text3)", icon: "✔️", label: "Entregado",   desc: "Moto entregada al cliente" },
}

const PASOS_ORDEN = ["recibido","diagnostico","aprobado","en_proceso","esperando_repuestos","en_pruebas","finalizado","entregado"]

export default function Portal() {
  const [visible, setVisible]   = useState(false)
  const [buscar, setBuscar]     = useState("")
  const [cargando, setCargando] = useState(false)
  const [ordenes, setOrdenes]   = useState([])
  const [cliente, setCliente]   = useState(null)
  const [error, setError]       = useState("")
  const [buscado, setBuscado]   = useState(false)

  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  const consultar = async () => {
    if (!buscar.trim()) { setError("Ingresa tu placa o cédula"); return }
    setCargando(true); setError(""); setBuscado(false)
    try {
      const r = await fetch(`${BASE}/agendamiento/publico/consultar/?q=${encodeURIComponent(buscar)}`)
      const data = await r.json()
      if (r.ok) {
        setOrdenes(data.ordenes || [])
        setCliente(data.cliente || null)
        setBuscado(true)
        if ((data.ordenes || []).length === 0) setError("No encontramos órdenes con ese dato")
      } else {
        setError(data.error || "No encontramos resultados")
        setOrdenes([])
      }
    } catch { setError("Error de conexión") }
    setCargando(false)
  }

  return (
    <div className="bg-texture" style={{ minHeight: "100vh",
      display: "flex", flexDirection: "column", position: "relative" }}>
      <div className="public-overlay"/>
      <ThemeToggle />

      {/* Header */}
      <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid rgba(255,255,255,.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative", zIndex: 1 }}>
        <a href="/public" style={{ display: "flex", alignItems: "center",
          gap: "10px", textDecoration: "none" }}>
          <img src="/logo_arm.png" alt="ARM Racing"
            style={{ height: "36px", objectFit: "contain" }} />
          <div>
            <div style={{ fontSize: "14px", fontWeight: "800", color: "#EEF0FF" }}>ARM Racing</div>
            <div style={{ fontSize: "10px", color: "#E8213A", fontWeight: "700",
              textTransform: "uppercase", letterSpacing: ".1em" }}>Performance</div>
          </div>
        </a>
        <a href="/agendar" style={{ fontSize: "13px", color: "var(--text3)",
          textDecoration: "none", transition: "color .15s" }}
          onMouseEnter={e => e.currentTarget.style.color = "#E8213A"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text3)"}>
          Nueva cita →
        </a>
      </div>

      <div style={{ flex: 1, padding: "2rem", maxWidth: "700px",
        margin: "0 auto", width: "100%",
        position: "relative", zIndex: 1 }}>

        {/* Título */}
        <div style={{
          textAlign: "center", marginBottom: "2.5rem",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "all .5s cubic-bezier(.4,0,.2,1)",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔗</div>
          <div className="public-subtitle" style={{ marginBottom: "8px" }}>
            Portal del cliente
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#EEF0FF",
            letterSpacing: "-.5px", marginBottom: "8px" }}>
            Estado de tu moto
          </h1>
          <p style={{ color: "var(--text3)", fontSize: "14px" }}>
            Consulta el estado de tu moto con tu placa o cédula
          </p>
        </div>

        {/* Buscador */}
        <div style={{
          background: "var(--bg3)",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: "20px", padding: "1.75rem",
          marginBottom: "1.5rem",
          backdropFilter: "blur(10px)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "all .5s cubic-bezier(.4,0,.2,1)",
          transitionDelay: ".1s",
        }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              value={buscar}
              onChange={e => setBuscar(e.target.value)}
              onKeyDown={e => e.key === "Enter" && consultar()}
              placeholder="Ej: NHX14G o tu número de cédula"
              style={{
                flex: 1, background: "var(--bg3)",
                border: "1px solid rgba(255,255,255,.12)",
                color: "#EEF0FF", borderRadius: "10px",
                padding: "13px 16px", fontSize: "15px",
                fontFamily: "Inter, sans-serif", outline: "none",
                transition: "all .2s",
              }}
              onFocus={e => { e.target.style.borderColor = "rgba(232,33,58,.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(232,33,58,.1)" }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,.12)"; e.target.style.boxShadow = "none" }}
            />
            <button onClick={consultar} disabled={cargando} style={{
              padding: "13px 24px", borderRadius: "10px",
              background: "linear-gradient(135deg, #E8213A, #C41830)",
              border: "none", color: "white", fontSize: "15px", fontWeight: "700",
              cursor: cargando ? "not-allowed" : "pointer",
              fontFamily: "Inter, sans-serif", opacity: cargando ? .7 : 1,
              boxShadow: "0 4px 16px rgba(232,33,58,.3)",
              transition: "all .2s", whiteSpace: "nowrap",
            }}>
              {cargando ? "..." : "🔍 Consultar"}
            </button>
          </div>

          {error && (
            <div style={{ marginTop: "12px", background: "rgba(232,33,58,.1)",
              border: "1px solid rgba(232,33,58,.25)",
              borderRadius: "8px", padding: "10px 14px",
              color: "#FF8080", fontSize: "13px" }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Resultados */}
        {buscado && ordenes.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {cliente && (
              <div style={{
                background: "var(--bg3)",
                border: "1px solid rgba(255,255,255,.07)",
                borderRadius: "14px", padding: "1.25rem",
                display: "flex", alignItems: "center", gap: "14px",
              }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "50%",
                  background: "rgba(232,33,58,.15)", border: "2px solid rgba(232,33,58,.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px", fontWeight: "800", color: "#E8213A",
                }}>
                  {cliente.nombre?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "#EEF0FF" }}>
                    {cliente.nombre}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text3)" }}>
                    {cliente.telefono} · {ordenes.length} orden{ordenes.length > 1 ? "es" : ""}
                  </div>
                </div>
              </div>
            )}

            {ordenes.map((orden, idx) => {
              const est = ESTADO_CONFIG[orden.estado] || ESTADO_CONFIG.recibido
              const pasoActual = PASOS_ORDEN.indexOf(orden.estado)

              return (
                <div key={orden.id} style={{
                  background: "var(--bg3)",
                  border: `1px solid ${est.color}25`,
                  borderRadius: "20px", overflow: "hidden",
                  animation: "fadeIn .4s ease both",
                  animationDelay: `${idx * .1}s`,
                }}>
                  {/* Header orden */}
                  <div style={{
                    padding: "1.25rem 1.5rem",
                    background: `linear-gradient(90deg, ${est.color}10 0%, transparent 60%)`,
                    borderBottom: `1px solid ${est.color}15`,
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", flexWrap: "wrap", gap: "8px",
                  }}>
                    <div>
                      <div style={{ fontFamily: "JetBrains Mono, monospace",
                        fontSize: "14px", color: est.color, fontWeight: "700" }}>
                        {orden.codigo}
                      </div>
                      <div style={{ fontSize: "16px", fontWeight: "700",
                        color: "#EEF0FF", marginTop: "2px" }}>
                        {orden.vehiculo_marca} {orden.vehiculo_linea}
                        <span style={{ fontFamily: "monospace", fontSize: "13px",
                          color: "var(--text3)", marginLeft: "8px" }}>{orden.vehiculo_placa}</span>
                      </div>
                    </div>
                    <span style={{
                      background: est.color + "18", color: est.color,
                      padding: "6px 14px", borderRadius: "20px",
                      fontSize: "13px", fontWeight: "700",
                      display: "flex", alignItems: "center", gap: "6px",
                      border: `1px solid ${est.color}30`,
                    }}>
                      {est.icon} {est.label}
                    </span>
                  </div>

                  {/* Descripción estado */}
                  <div style={{ padding: "1rem 1.5rem",
                    borderBottom: `1px solid ${est.color}10` }}>
                    <div style={{ fontSize: "14px", color: "#8A9AB8" }}>
                      {est.desc}
                    </div>
                    {orden.descripcion && (
                      <div style={{ fontSize: "13px", color: "var(--text3)",
                        marginTop: "6px", fontStyle: "italic" }}>
                        "{orden.descripcion}"
                      </div>
                    )}
                  </div>

                  {/* Timeline de progreso */}
                  <div style={{ padding: "1.25rem 1.5rem" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#4A5A72",
                      textTransform: "uppercase", letterSpacing: ".1em",
                      marginBottom: "14px" }}>Progreso</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
                      {PASOS_ORDEN.slice(0, 7).map((paso, i) => {
                        const p = ESTADO_CONFIG[paso]
                        const activo = i <= pasoActual
                        const esActual = i === pasoActual
                        return (
                          <div key={paso} style={{ display: "flex", alignItems: "center",
                            flex: i < 6 ? 1 : 0 }}>
                            <div style={{
                              width: esActual ? "32px" : "24px",
                              height: esActual ? "32px" : "24px",
                              borderRadius: "50%", flexShrink: 0,
                              background: activo ? est.color + (esActual ? "" : "80") : "rgba(255,255,255,.06)",
                              border: `2px solid ${activo ? est.color : "rgba(255,255,255,.08)"}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: esActual ? "14px" : "10px",
                              transition: "all .3s",
                              boxShadow: esActual ? `0 0 12px ${est.color}60` : "none",
                            }}>
                              {activo ? (esActual ? p.icon : "✓") : ""}
                            </div>
                            {i < 6 && (
                              <div style={{
                                flex: 1, height: "3px",
                                background: i < pasoActual ? est.color : "rgba(255,255,255,.06)",
                                transition: "background .5s",
                              }}/>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Costo */}
                  {orden.costo_final > 0 && (
                    <div style={{ padding: "10px 1.5rem",
                      borderTop: `1px solid ${est.color}10`,
                      display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "13px", color: "var(--text3)" }}>Costo estimado</span>
                      <span style={{ fontSize: "15px", fontWeight: "700",
                        color: "#00D4A0", fontFamily: "monospace" }}>
                        ${Number(orden.costo_final).toLocaleString("es-CO")}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "3rem",
          padding: "1.5rem 0", borderTop: "1px solid rgba(255,255,255,.05)" }}>
          <div style={{ fontSize: "13px", color: "var(--text3)" }}>
            ¿Necesitas ayuda? Llámanos al{" "}
            <a href="tel:3232338894" style={{ color: "#E8213A",
              textDecoration: "none", fontWeight: "600" }}>
              323 233 8894
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
