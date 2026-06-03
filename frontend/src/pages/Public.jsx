import { useState, useEffect } from "react"
import ThemeToggle from "../components/ThemeToggle"

const SERVICIOS = [
  { icon: "🔧", titulo: "Mantenimiento preventivo", desc: "Revisión completa, cambio de aceite, filtros y ajustes generales para mantener tu moto en óptimas condiciones." },
  { icon: "⚡", titulo: "Diagnóstico electrónico", desc: "Identificamos fallas eléctricas y electrónicas con equipos de última tecnología." },
  { icon: "🔩", titulo: "Reparación de motor", desc: "Reconstrucción y reparación de motores con piezas originales y de alta calidad." },
  { icon: "🛡️", titulo: "Sistema de frenos", desc: "Revisión, cambio y ajuste de frenos para garantizar tu seguridad en la vía." },
  { icon: "💧", titulo: "Sistema de refrigeración", desc: "Mantenimiento y reparación del sistema de refrigeración de tu moto." },
  { icon: "🏎️", titulo: "Performance & Tuning", desc: "Optimización de rendimiento para sacar el máximo potencial de tu moto." },
]

const CONTACTO = [
  { icon: "📍", titulo: "Dirección", valor: "Carrera 54b #50-09 sur, Venecia, Bogotá" },
  { icon: "📞", titulo: "Teléfono", valor: "323 233 8894" },
  { icon: "📸", titulo: "Instagram", valor: "@arm_racing.performance" },
  { icon: "🕐", titulo: "Horario", valor: "Lun — Sáb: 8:00 AM – 7:30 PM" },
]

export default function Public() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  return (
    <div className="bg-texture" style={{ minHeight: "100vh", position: "relative" }}>
      <div className="public-overlay"/>
      <ThemeToggle />

      {/* HERO */}
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "4rem 2rem", textAlign: "center",
        position: "relative", zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{
          width: "110px", height: "110px", borderRadius: "24px",
          background: "#050505",
          border: "2px solid rgba(232,33,58,.4)",
          boxShadow: "0 0 40px rgba(232,33,58,.25), 0 0 80px rgba(232,33,58,.08)",
          padding: "12px", marginBottom: "2rem",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(.8)",
          transition: "all .6s cubic-bezier(.4,0,.2,1)",
        }}>
          <img src="/logo_arm.png" alt="ARM Racing"
            style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>

        {/* Subtítulo */}
        <div className="public-subtitle" style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition: "all .5s cubic-bezier(.4,0,.2,1)",
          transitionDelay: ".15s",
          marginBottom: "1rem",
        }}>
          Bogotá · Colombia
        </div>

        {/* Título */}
        <h1 className="public-title" style={{
          fontSize: "clamp(2.5rem, 7vw, 5rem)",
          lineHeight: 1.05,
          marginBottom: "1rem",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "all .5s cubic-bezier(.4,0,.2,1)",
          transitionDelay: ".25s",
        }}>
          ARM Racing<br/>
          <span style={{
            background: "linear-gradient(135deg, #E8213A 0%, #FF6B6B 50%, #1E5FD4 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>Performance</span>
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: "18px", color: "#8A9AB8", maxWidth: "500px",
          lineHeight: 1.7, marginBottom: "3rem",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition: "all .5s cubic-bezier(.4,0,.2,1)",
          transitionDelay: ".35s",
        }}>
          Especialistas en motocicletas. Diagnóstico, mantenimiento
          y rendimiento al siguiente nivel.
        </p>

        {/* CTAs */}
        <div style={{
          display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition: "all .5s cubic-bezier(.4,0,.2,1)",
          transitionDelay: ".45s",
        }}>
          <a href="/agendar" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "14px 32px", borderRadius: "12px", textDecoration: "none",
            background: "linear-gradient(135deg, #E8213A, #C41830)",
            color: "white", fontWeight: "700", fontSize: "15px",
            boxShadow: "0 8px 32px rgba(232,33,58,.35)",
            transition: "all .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 14px 40px rgba(232,33,58,.45)" }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(232,33,58,.35)" }}>
            📅 Agendar cita
          </a>
          <a href="/registro" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "14px 32px", borderRadius: "12px", textDecoration: "none",
            background: "rgba(255,255,255,.05)",
            border: "1.5px solid rgba(255,255,255,.15)",
            color: "#D0D8F0", fontWeight: "600", fontSize: "15px",
            transition: "all .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.3)" }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.15)" }}>
            ✍️ Registrarme
          </a>
        </div>

        {/* Scroll hint */}
        <div style={{ position: "absolute", bottom: "2rem",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
          color: "#3A4A62", fontSize: "12px",
          animation: "pulse 2s infinite",
        }}>
          <span>Scroll</span>
          <span style={{ fontSize: "18px" }}>↓</span>
        </div>
      </div>

      {/* SERVICIOS */}
      <div style={{ padding: "5rem 2rem", maxWidth: "1100px", margin: "0 auto",
        position: "relative", zIndex: 1 }}>
        <div className="accent-line" style={{ marginBottom: "3rem" }}/>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="public-subtitle" style={{ marginBottom: "12px" }}>
            Lo que hacemos
          </div>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: "800",
            color: "#EEF0FF", letterSpacing: "-.5px" }}>
            Nuestros servicios
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem" }}>
          {SERVICIOS.map((s, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "16px", padding: "1.75rem",
              transition: "all .2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(232,33,58,.06)"
              e.currentTarget.style.borderColor = "rgba(232,33,58,.2)"
              e.currentTarget.style.transform = "translateY(-4px)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,.03)"
              e.currentTarget.style.borderColor = "rgba(255,255,255,.08)"
              e.currentTarget.style.transform = "translateY(0)"
            }}>
              <div style={{ fontSize: "36px", marginBottom: "14px" }}>{s.icon}</div>
              <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#EEF0FF",
                marginBottom: "8px" }}>{s.titulo}</h3>
              <p style={{ fontSize: "14px", color: "#6A7A92", lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CONTACTO */}
      <div style={{ padding: "5rem 2rem", maxWidth: "900px", margin: "0 auto",
        position: "relative", zIndex: 1 }}>
        <div className="accent-line" style={{ marginBottom: "3rem" }}/>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="public-subtitle" style={{ marginBottom: "12px" }}>Encuéntranos</div>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: "800",
            color: "#EEF0FF", letterSpacing: "-.5px" }}>Contacto</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1.25rem" }}>
          {CONTACTO.map((c, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.07)",
              borderRadius: "14px", padding: "1.5rem",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>{c.icon}</div>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#E8213A",
                textTransform: "uppercase", letterSpacing: ".1em",
                marginBottom: "6px" }}>{c.titulo}</div>
              <div style={{ fontSize: "14px", color: "#9AAAC0",
                lineHeight: 1.5 }}>{c.valor}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,.06)",
        padding: "2rem", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: "12px" }}>
          <img src="/logo_arm.png" alt="ARM Racing"
            style={{ height: "30px", opacity: .6, objectFit: "contain" }} />
        </div>
        <div style={{ fontSize: "12px", color: "#3A4A62" }}>
          © {new Date().getFullYear()} ARM Racing Performance · Bogotá, Colombia
        </div>
      </div>
    </div>
  )
}
