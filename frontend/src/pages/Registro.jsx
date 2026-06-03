import { useState, useEffect } from "react"

const BASE = window.location.hostname === "app.armracing.com"
  ? "https://api.armracing.com/api" : "http://192.168.0.8:8000/api"

const inputStyle = {
  background: "rgba(255,255,255,.05)",
  border: "1px solid rgba(255,255,255,.12)",
  color: "#EEF0FF", borderRadius: "10px",
  padding: "12px 16px", fontSize: "15px",
  width: "100%", fontFamily: "Inter, sans-serif",
  transition: "all .2s", outline: "none",
}

export default function Registro() {
  const [visible, setVisible]   = useState(false)
  const [cargando, setCargando] = useState(false)
  const [exito, setExito]       = useState(false)
  const [error, setError]       = useState("")
  const [form, setForm] = useState({
    nombre:"", documento:"", telefono:"",
    whatsapp:"", correo:"", ciudad:"Bogotá"
  })

  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  const handleSubmit = async () => {
    if (!form.nombre || !form.documento || !form.telefono) {
      setError("Nombre, cédula y teléfono son obligatorios"); return
    }
    setCargando(true); setError("")
    try {
      const r = await fetch(`${BASE}/agendamiento/publico/registrar-cliente/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const data = await r.json()
      if (r.ok) setExito(true)
      else setError(data.documento?.[0] || data.error || "Error al registrar")
    } catch { setError("Error de conexión") }
    setCargando(false)
  }

  return (
    <div className="bg-texture" style={{ minHeight: "100vh",
      display: "flex", flexDirection: "column", position: "relative" }}>
      <div className="public-overlay"/>

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
        <a href="/agendar" style={{ fontSize: "13px", color: "#6A7A92",
          textDecoration: "none", transition: "color .15s" }}
          onMouseEnter={e => e.currentTarget.style.color = "#E8213A"}
          onMouseLeave={e => e.currentTarget.style.color = "#6A7A92"}>
          Agendar cita →
        </a>
      </div>

      {/* Contenido */}
      <div style={{ flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", padding: "2rem",
        position: "relative", zIndex: 1 }}>
        <div style={{
          width: "100%", maxWidth: "480px",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all .5s cubic-bezier(.4,0,.2,1)",
        }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>✍️</div>
            <div className="public-subtitle" style={{ marginBottom: "8px" }}>
              ARM Racing Performance
            </div>
            <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#EEF0FF",
              letterSpacing: "-.5px", marginBottom: "8px" }}>
              {exito ? "¡Registro exitoso!" : "Regístrate"}
            </h1>
            {!exito && <p style={{ color: "#6A7A92", fontSize: "14px" }}>
              Crea tu perfil en ARM Racing Performance
            </p>}
          </div>

          {exito ? (
            <div style={{ background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "20px", padding: "2.5rem",
              textAlign: "center" }}>
              <div style={{ fontSize: "56px", marginBottom: "1rem" }}>🎉</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#00D4A0",
                marginBottom: "10px" }}>¡Bienvenido a ARM Racing!</div>
              <div style={{ fontSize: "14px", color: "#6A7A92", lineHeight: 1.7,
                marginBottom: "1.5rem" }}>
                Tu perfil fue creado exitosamente.<br/>
                Ya puedes agendar tu primera cita.
              </div>
              <a href="/agendar" style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "13px 28px", borderRadius: "12px", textDecoration: "none",
                background: "linear-gradient(135deg, #E8213A, #C41830)",
                color: "white", fontWeight: "700", fontSize: "15px",
                boxShadow: "0 6px 24px rgba(232,33,58,.35)",
              }}>📅 Agendar mi primera cita</a>
            </div>
          ) : (
            <div style={{ background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "20px", padding: "2rem",
              backdropFilter: "blur(10px)" }}>
              {error && (
                <div style={{ background: "rgba(232,33,58,.1)",
                  border: "1px solid rgba(232,33,58,.3)",
                  borderRadius: "10px", padding: "12px 16px",
                  color: "#FF8080", fontSize: "13px", marginBottom: "1.25rem" }}>
                  ⚠️ {error}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  { label: "Nombre completo *", key: "nombre", placeholder: "Felipe Rodríguez" },
                  { label: "Cédula / NIT *", key: "documento", placeholder: "1000594748" },
                  { label: "Teléfono *", key: "telefono", placeholder: "3001234567" },
                  { label: "WhatsApp", key: "whatsapp", placeholder: "3001234567" },
                  { label: "Correo electrónico", key: "correo", placeholder: "correo@ejemplo.com" },
                  { label: "Ciudad", key: "ciudad", placeholder: "Bogotá" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700",
                      color: "#E8213A", textTransform: "uppercase", letterSpacing: ".1em",
                      marginBottom: "6px" }}>{f.label}</label>
                    <input value={form[f.key]}
                      onChange={e => setForm({...form, [f.key]: e.target.value})}
                      placeholder={f.placeholder}
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = "rgba(232,33,58,.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(232,33,58,.1)" }}
                      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,.12)"; e.target.style.boxShadow = "none" }} />
                  </div>
                ))}
                <button onClick={handleSubmit} disabled={cargando} style={{
                  marginTop: "8px", padding: "13px", borderRadius: "12px",
                  background: "linear-gradient(135deg, #E8213A, #C41830)",
                  border: "none", color: "white", fontSize: "15px", fontWeight: "700",
                  cursor: cargando ? "not-allowed" : "pointer",
                  fontFamily: "Inter, sans-serif", opacity: cargando ? .7 : 1,
                  boxShadow: "0 6px 24px rgba(232,33,58,.35)",
                  transition: "all .2s",
                }}
                onMouseEnter={e => { if (!cargando) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(232,33,58,.45)" } }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(232,33,58,.35)" }}>
                  {cargando ? "Registrando..." : "Crear mi perfil →"}
                </button>
                <p style={{ textAlign: "center", fontSize: "13px", color: "#4A5A72" }}>
                  ¿Ya tienes cuenta?{" "}
                  <a href="/agendar" style={{ color: "#E8213A",
                    textDecoration: "none", fontWeight: "600" }}>
                    Agenda tu cita →
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
