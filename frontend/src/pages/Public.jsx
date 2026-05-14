import { useState } from "react"
import { useNavigate } from "react-router-dom"

const SERVICIOS = [
  {
    cat: "Mecánica General — Automóviles",
    items: [
      "Diagnóstico general mecánico",
      "Mantenimiento preventivo y correctivo",
      "Cambio de aceite y filtros",
      "Afinación de motor",
      "Reparación general de motor",
      "Reparación de culata",
      "Cambio de empaques y retenedores",
      "Cambio de kit de distribución",
      "Reparación de transmisión",
      "Servicio de frenos",
    ]
  },
  {
    cat: "Mecánica General — Motocicletas",
    items: [
      "Diagnóstico mecánico general",
      "Mantenimiento preventivo",
      "Cambio de aceite",
      "Afinación de moto",
      "Reparación de motor",
      "Reparación de clutch",
      "Sincronización",
      "Reparación de suspensión",
      "Reparación de frenos",
      "Restauración completa",
    ]
  },
  {
    cat: "Electricidad Automotriz",
    items: [
      "Diagnóstico eléctrico completo",
      "Reparación de cortos eléctricos",
      "Reparación de cableado",
      "Fabricación de ramales eléctricos",
      "Escaneo eléctrico",
    ]
  },
  {
    cat: "Preparación & Accesorios",
    items: [
      "Preparación y modificación de motor",
      "Instalación de accesorios",
      "Instalación de sliders",
      "Instalación de luces LED",
      "Instalación de exploradoras",
      "Venta de repuestos y accesorios",
    ]
  },
]

const TESTIMONIOS = [
  {
    nombre: "Carlos M.",
    moto: "Yamaha YZF-R6",
    texto: "Excelente servicio. Mi moto quedó como nueva. Muy profesionales.",
    calificacion: 5,
  },
  {
    nombre: "Ana G.",
    moto: "Toyota Corolla",
    texto: "Confiable, rápido y con buen precio. Recomendado 100%.",
    calificacion: 5,
  },
  {
    nombre: "Juan P.",
    moto: "Kawasaki Ninja",
    texto: "Personal muy capacitado. Diagnóstico precisó y solución efectiva.",
    calificacion: 5,
  },
]

export default function Public() {
  const navigate = useNavigate()

  const irAAgendar = () => navigate("/agendar")

  return (
    <div style={{ background: "#0D1117", color: "#F9FAFB", minHeight: "100vh" }}>
      {/* ── NAVBAR ── */}
      <nav style={{
        background: "#111827",
        borderBottom: "1px solid #374151",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ fontSize: "28px" }}>🔧</div>
          <span style={{ fontSize: "16px", fontWeight: "700", color: "#EF4444" }}>ARM Racing</span>
        </div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <a href="#inicio" style={{ cursor: "pointer", color: "#D1D5DB", fontSize: "14px" }}>Inicio</a>
          <a href="#servicios" style={{ cursor: "pointer", color: "#D1D5DB", fontSize: "14px" }}>Servicios</a>
          <a href="#tienda" style={{ cursor: "pointer", color: "#D1D5DB", fontSize: "14px" }}>Tienda</a>
          <a href="#contacto" style={{ cursor: "pointer", color: "#D1D5DB", fontSize: "14px" }}>Contacto</a>
          <button onClick={irAAgendar}
            style={{
              background: "#EF4444",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "8px 20px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}>
            📅 Agendar
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="inicio" style={{
        background: "linear-gradient(135deg, #111827 0%, #1F2937 100%)",
        padding: "6rem 2rem",
        textAlign: "center",
        borderBottom: "2px solid #EF4444",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ fontSize: "100px", marginBottom: "1rem" }}>🏍️</div>
          <h1 style={{ fontSize: "48px", fontWeight: "900", color: "#F9FAFB", marginBottom: "1rem" }}>
            ARM Racing Performance
          </h1>
          <p style={{ fontSize: "20px", color: "#EF4444", marginBottom: "2rem", fontStyle: "italic", fontWeight: "700" }}>
            "Potencia, confianza y calidad en cada servicio"
          </p>
          <p style={{ fontSize: "16px", color: "#D1D5DB", lineHeight: "1.8", marginBottom: "2rem" }}>
            Especialistas en soluciones integrales para motocicletas y vehículos.
            Personal técnico capacitado, tecnología especializada, y compromiso con la excelencia.
          </p>
          <button onClick={irAAgendar}
            style={{
              background: "#10B981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "14px 40px",
              fontSize: "18px",
              fontWeight: "700",
              cursor: "pointer",
              marginRight: "12px",
            }}>
            📅 Agendar Cita
          </button>
          <a href="https://wa.me/573232338894?text=Hola%20ARM%20Racing%2C%20quiero%20conocer%20m%C3%A1s%20sobre%20sus%20servicios"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-block",
              background: "#25D366",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "14px 40px",
              fontSize: "18px",
              fontWeight: "700",
              cursor: "pointer",
              textDecoration: "none",
            }}>
            💬 WhatsApp
          </a>
        </div>
      </section>

      {/* ── INFORMACIÓN ── */}
      <section style={{ padding: "3rem 2rem", background: "#111827", borderBottom: "1px solid #374151" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📍</div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Ubicación</h3>
              <p style={{ color: "#9CA3AF", fontSize: "14px" }}>
                Carrera 54b # 50 -09 sur<br />
                Venecia, Bogotá
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>⏰</div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Horarios</h3>
              <p style={{ color: "#9CA3AF", fontSize: "14px" }}>
                Lunes - Sábado<br />
                8:00 AM - 7:30 PM
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📞</div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Contacto</h3>
              <p style={{ color: "#9CA3AF", fontSize: "14px" }}>
                <a href="tel:3232338894" style={{ color: "#10B981", textDecoration: "none" }}>+57 323 233 8894</a><br />
                <a href="mailto:armracingpeformance@gmail.com" style={{ color: "#10B981", textDecoration: "none", fontSize: "12px" }}>armracingpeformance@gmail.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <section id="servicios" style={{ padding: "4rem 2rem", background: "#0D1117" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "36px", fontWeight: "900", textAlign: "center", marginBottom: "3rem", color: "#F9FAFB" }}>
            Nuestros Servicios
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
            {SERVICIOS.map((servicio, i) => (
              <div key={i} style={{
                background: "#111827",
                border: "2px solid #374151",
                borderRadius: "12px",
                padding: "1.5rem",
              }}>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#EF4444", marginBottom: "1rem" }}>
                  {servicio.cat}
                </h3>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {servicio.items.map((item, j) => (
                    <li key={j} style={{
                      color: "#D1D5DB",
                      fontSize: "13px",
                      padding: "6px 0",
                      borderBottom: "1px solid #374151",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}>
                      <span style={{ color: "#10B981" }}>✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIENDA ── */}
      <section id="tienda" style={{ padding: "4rem 2rem", background: "#111827", borderTop: "1px solid #374151" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "36px", fontWeight: "900", marginBottom: "1rem" }}>🛒 Tienda Online</h2>
          <p style={{ color: "#9CA3AF", fontSize: "16px", marginBottom: "2rem" }}>
            Repuestos, accesorios y lubricantes de las mejores marcas
          </p>
          <div style={{
            background: "#1F2937",
            border: "2px dashed #374151",
            borderRadius: "12px",
            padding: "3rem",
            color: "#9CA3AF",
          }}>
            <p style={{ fontSize: "18px" }}>Tienda en construcción</p>
            <p style={{ fontSize: "14px", marginTop: "8px" }}>Productos disponibles próximamente</p>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section style={{ padding: "4rem 2rem", background: "#0D1117" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "36px", fontWeight: "900", textAlign: "center", marginBottom: "3rem" }}>
            Qué dicen nuestros clientes
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
            {TESTIMONIOS.map((test, i) => (
              <div key={i} style={{
                background: "#111827",
                border: "1px solid #374151",
                borderRadius: "12px",
                padding: "1.5rem",
              }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem", fontSize: "18px" }}>
                  {"⭐".repeat(test.calificacion)}
                </div>
                <p style={{ color: "#D1D5DB", fontSize: "14px", fontStyle: "italic", marginBottom: "1rem" }}>
                  "{test.texto}"
                </p>
                <p style={{ color: "#EF4444", fontWeight: "600", fontSize: "14px" }}>
                  {test.nombre} — {test.moto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACTO ── */}
      <section id="contacto" style={{ padding: "4rem 2rem", background: "#111827", borderTop: "1px solid #374151" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "36px", fontWeight: "900", marginBottom: "2rem" }}>Contáctanos</h2>
          <p style={{ color: "#9CA3AF", fontSize: "16px", marginBottom: "2rem" }}>
            ¿Tienes preguntas? Nos encantaría escucharte.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="tel:3232338894"
              style={{
                background: "#3B82F6",
                color: "white",
                padding: "12px 30px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "600",
              }}>
              📞 Llamar
            </a>
            <a href="https://wa.me/573232338894"
              target="_blank" rel="noopener noreferrer"
              style={{
                background: "#25D366",
                color: "white",
                padding: "12px 30px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "600",
              }}>
              💬 WhatsApp
            </a>
            <a href="mailto:armracingpeformance@gmail.com"
              style={{
                background: "#EF4444",
                color: "white",
                padding: "12px 30px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "600",
              }}>
              📧 Email
            </a>
            <button onClick={irAAgendar}
              style={{
                background: "#10B981",
                color: "white",
                border: "none",
                padding: "12px 30px",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
              }}>
              📅 Agendar
            </button>
          </div>
        </div>
      </section>

      {/* ── REDES SOCIALES ── */}
      <section style={{ padding: "2rem", background: "#0D1117", borderTop: "1px solid #374151", textAlign: "center" }}>
        <p style={{ color: "#9CA3AF", fontSize: "14px", marginBottom: "1rem" }}>Síguenos en redes sociales</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
          <a href="https://instagram.com/arm_racing.performance" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: "24px", textDecoration: "none", color: "#E1306C" }}>📸</a>
          <a href="https://wa.me/573232338894" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: "24px", textDecoration: "none", color: "#25D366" }}>💬</a>
        </div>
      </section>

      {/* ── PIE DE PÁGINA ── */}
      <footer style={{
        background: "#111827",
        borderTop: "1px solid #374151",
        padding: "2rem",
        textAlign: "center",
        color: "#6B7280",
        fontSize: "12px",
      }}>
        <p>© 2026 ARM Racing Performance — Powered by TallerOS</p>
      </footer>
    </div>
  )
}
