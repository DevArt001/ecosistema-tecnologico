import { useState, useEffect } from "react"

const BASE = window.location.hostname === "app.armracing.com"
  ? "https://api.armracing.com/api" : "http://192.168.0.8:8000/api"

export default function Agendar() {
  const [paso, setPaso]           = useState(1)
  const [visible, setVisible]     = useState(false)
  const [cargando, setCargando]   = useState(false)
  const [mensaje, setMensaje]     = useState("")
  const [error, setError]         = useState("")
  const [diasDisp, setDiasDisp]   = useState([])
  const [horasDisp, setHorasDisp] = useState([])
  const [form, setForm] = useState({
    nombre:"", documento:"", telefono:"", correo:"",
    placa:"", marca:"", linea:"", modelo: new Date().getFullYear(),
    tipo_servicio:"mantenimiento", descripcion:"",
    fecha:"", hora:""
  })

  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])
  useEffect(() => {
    if (form.fecha) cargarHoras(form.fecha)
  }, [form.fecha])

  const cargarHoras = async (fecha) => {
    try {
      const r = await fetch(`${BASE}/agendamiento/publico/horas-disponibles/?fecha=${fecha}`)
      const data = await r.json()
      setHorasDisp(data.horas || [])
    } catch { setHorasDisp([]) }
  }

  const siguientePaso = () => {
    if (paso === 1 && (!form.nombre || !form.documento || !form.telefono)) {
      setError("Nombre, documento y teléfono son obligatorios"); return
    }
    if (paso === 2 && (!form.placa || !form.marca || !form.linea)) {
      setError("Placa, marca y línea son obligatorios"); return
    }
    if (paso === 3 && (!form.fecha || !form.hora)) {
      setError("Selecciona fecha y hora"); return
    }
    setError("")
    setPaso(p => p + 1)
  }

  const enviarCita = async () => {
    setCargando(true)
    setError("")
    try {
      // Registrar cliente
      const cRes = await fetch(`${BASE}/agendamiento/publico/registrar-cliente/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre, documento: form.documento,
          telefono: form.telefono, correo: form.correo,
        })
      })
      const cliente = await cRes.json()

      // Crear cita
      const citaRes = await fetch(`${BASE}/agendamiento/publico/crear-cita/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: cliente.id,
          placa: form.placa, marca: form.marca, linea: form.linea,
          modelo: form.modelo,
          tipo_servicio: form.tipo_servicio,
          descripcion: form.descripcion,
          fecha: form.fecha, hora: form.hora,
        })
      })
      const cita = await citaRes.json()
      if (citaRes.ok) {
        setMensaje(`✅ Cita confirmada para el ${form.fecha} a las ${form.hora}`)
        setPaso(5)
      } else {
        setError(cita.error || "Error al agendar")
      }
    } catch { setError("Error de conexión") }
    setCargando(false)
  }

  const inputStyle = {
    background: "rgba(255,255,255,.05)",
    border: "1px solid rgba(255,255,255,.12)",
    color: "#EEF0FF", borderRadius: "10px",
    padding: "12px 16px", fontSize: "15px",
    width: "100%", fontFamily: "Inter, sans-serif",
    transition: "all .2s",
    outline: "none",
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
            <div style={{ fontSize: "14px", fontWeight: "800", color: "#EEF0FF" }}>
              ARM Racing
            </div>
            <div style={{ fontSize: "10px", color: "#E8213A", fontWeight: "700",
              textTransform: "uppercase", letterSpacing: ".1em" }}>Performance</div>
          </div>
        </a>
        <a href="/portal" style={{ fontSize: "13px", color: "#6A7A92",
          textDecoration: "none", transition: "color .15s" }}
        onMouseEnter={e => e.currentTarget.style.color = "#E8213A"}
        onMouseLeave={e => e.currentTarget.style.color = "#6A7A92"}>
          Ver mi cita →
        </a>
      </div>

      {/* Contenido */}
      <div style={{ flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", padding: "2rem",
        position: "relative", zIndex: 1 }}>
        <div style={{
          width: "100%", maxWidth: "540px",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all .5s cubic-bezier(.4,0,.2,1)",
        }}>
          {/* Título */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div className="public-subtitle" style={{ marginBottom: "8px" }}>
              Taller ARM Racing Performance
            </div>
            <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#EEF0FF",
              letterSpacing: "-.5px", marginBottom: "8px" }}>
              {paso < 5 ? "Agenda tu cita" : "¡Cita confirmada!"}
            </h1>
            {paso < 5 && (
              <p style={{ color: "#6A7A92", fontSize: "14px" }}>
                Paso {paso} de 4 — {["", "Tus datos", "Tu moto", "Fecha y hora", "Confirmación"][paso]}
              </p>
            )}
          </div>

          {/* Progreso */}
          {paso < 5 && (
            <div style={{ display: "flex", gap: "4px", marginBottom: "2rem" }}>
              {[1,2,3,4].map(s => (
                <div key={s} style={{
                  flex: 1, height: "4px", borderRadius: "2px",
                  background: s <= paso ? "#E8213A" : "rgba(255,255,255,.1)",
                  transition: "background .3s",
                  boxShadow: s <= paso ? "0 0 8px rgba(232,33,58,.4)" : "none",
                }}/>
              ))}
            </div>
          )}

          {error && (
            <div style={{ background: "rgba(232,33,58,.1)",
              border: "1px solid rgba(232,33,58,.3)",
              borderRadius: "10px", padding: "12px 16px",
              color: "#FF8080", fontSize: "13px", marginBottom: "1.25rem" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Card form */}
          <div style={{
            background: "rgba(255,255,255,.03)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: "20px", padding: "2rem",
            backdropFilter: "blur(10px)",
          }}>
            {/* Paso 1 — Datos personales */}
            {paso === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#EEF0FF",
                  marginBottom: "4px" }}>👤 Tus datos</div>
                {[
                  { label: "Nombre completo *", key: "nombre", placeholder: "Felipe Rodríguez" },
                  { label: "Cédula *", key: "documento", placeholder: "1000594748" },
                  { label: "Teléfono / WhatsApp *", key: "telefono", placeholder: "3001234567" },
                  { label: "Correo electrónico", key: "correo", placeholder: "correo@ejemplo.com" },
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
              </div>
            )}

            {/* Paso 2 — Datos moto */}
            {paso === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#EEF0FF",
                  marginBottom: "4px" }}>🏍 Tu moto</div>
                {[
                  { label: "Placa *", key: "placa", placeholder: "NHX14G" },
                  { label: "Marca *", key: "marca", placeholder: "Bajaj, Honda, Yamaha..." },
                  { label: "Línea / Modelo *", key: "linea", placeholder: "Pulsar NS200" },
                  { label: "Año", key: "modelo", placeholder: "2024", type: "number" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700",
                      color: "#E8213A", textTransform: "uppercase", letterSpacing: ".1em",
                      marginBottom: "6px" }}>{f.label}</label>
                    <input type={f.type || "text"} value={form[f.key]}
                      onChange={e => setForm({...form, [f.key]: e.target.value})}
                      placeholder={f.placeholder}
                      style={inputStyle}
                      onFocus={e => { e.target.style.borderColor = "rgba(232,33,58,.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(232,33,58,.1)" }}
                      onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,.12)"; e.target.style.boxShadow = "none" }} />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700",
                    color: "#E8213A", textTransform: "uppercase", letterSpacing: ".1em",
                    marginBottom: "6px" }}>Tipo de servicio</label>
                  <select value={form.tipo_servicio}
                    onChange={e => setForm({...form, tipo_servicio: e.target.value})}
                    style={inputStyle}>
                    <option value="mantenimiento">🔧 Mantenimiento preventivo</option>
                    <option value="diagnostico">🔍 Diagnóstico</option>
                    <option value="reparacion">🛠️ Reparación</option>
                    <option value="frenos">🛡️ Sistema de frenos</option>
                    <option value="electrico">⚡ Sistema eléctrico</option>
                    <option value="otro">📋 Otro</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700",
                    color: "#E8213A", textTransform: "uppercase", letterSpacing: ".1em",
                    marginBottom: "6px" }}>Descripción del problema</label>
                  <textarea value={form.descripcion}
                    onChange={e => setForm({...form, descripcion: e.target.value})}
                    placeholder="Cuéntanos qué le pasa a tu moto..."
                    style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                    onFocus={e => { e.target.style.borderColor = "rgba(232,33,58,.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(232,33,58,.1)" }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,.12)"; e.target.style.boxShadow = "none" }} />
                </div>
              </div>
            )}

            {/* Paso 3 — Fecha y hora */}
            {paso === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#EEF0FF",
                  marginBottom: "4px" }}>📅 Fecha y hora</div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700",
                    color: "#E8213A", textTransform: "uppercase", letterSpacing: ".1em",
                    marginBottom: "6px" }}>Selecciona la fecha *</label>
                  <input type="date" value={form.fecha}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={e => setForm({...form, fecha: e.target.value, hora: ""})}
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = "rgba(232,33,58,.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(232,33,58,.1)" }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,.12)"; e.target.style.boxShadow = "none" }} />
                </div>
                {form.fecha && (
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "700",
                      color: "#E8213A", textTransform: "uppercase", letterSpacing: ".1em",
                      marginBottom: "10px" }}>Selecciona la hora *</label>
                    {horasDisp.length === 0 ? (
                      <div style={{ color: "#6A7A92", fontSize: "14px",
                        textAlign: "center", padding: "1rem" }}>
                        No hay horas disponibles para esta fecha
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                        {horasDisp.map(h => (
                          <button key={h} onClick={() => setForm({...form, hora: h})} style={{
                            padding: "10px", borderRadius: "10px", border: "none",
                            cursor: "pointer", fontSize: "14px", fontWeight: "600",
                            fontFamily: "Inter, sans-serif",
                            background: form.hora === h ? "linear-gradient(135deg, #E8213A, #C41830)" : "rgba(255,255,255,.06)",
                            color: form.hora === h ? "white" : "#9AAAC0",
                            boxShadow: form.hora === h ? "0 4px 16px rgba(232,33,58,.35)" : "none",
                            transition: "all .15s",
                          }}>{h}</button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Paso 4 — Confirmación */}
            {paso === 4 && (
              <div>
                <div style={{ fontSize: "16px", fontWeight: "700", color: "#EEF0FF",
                  marginBottom: "1.25rem" }}>✅ Confirma tu cita</div>
                {[
                  { label: "Nombre", valor: form.nombre },
                  { label: "Teléfono", valor: form.telefono },
                  { label: "Moto", valor: `${form.marca} ${form.linea} (${form.placa})` },
                  { label: "Servicio", valor: form.tipo_servicio },
                  { label: "Fecha", valor: form.fecha },
                  { label: "Hora", valor: form.hora },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between",
                    padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                    <span style={{ fontSize: "13px", color: "#6A7A92",
                      textTransform: "uppercase", letterSpacing: ".08em",
                      fontWeight: "600" }}>{item.label}</span>
                    <span style={{ fontSize: "14px", color: "#EEF0FF",
                      fontWeight: "600" }}>{item.valor}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Paso 5 — Éxito */}
            {paso === 5 && (
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <div style={{ fontSize: "64px", marginBottom: "1rem",
                  animation: "pulse 2s infinite" }}>🎉</div>
                <div style={{ fontSize: "20px", fontWeight: "700",
                  color: "#00D4A0", marginBottom: "10px" }}>¡Cita agendada!</div>
                <div style={{ fontSize: "14px", color: "#6A7A92",
                  lineHeight: 1.7, marginBottom: "1.5rem" }}>
                  Tu cita fue confirmada para el<br/>
                  <strong style={{ color: "#EEF0FF" }}>{form.fecha} a las {form.hora}</strong>
                </div>
                <div style={{ background: "rgba(0,212,160,.08)",
                  border: "1px solid rgba(0,212,160,.2)",
                  borderRadius: "12px", padding: "1rem",
                  fontSize: "13px", color: "#00D4A0" }}>
                  📞 Te contactaremos al {form.telefono} para confirmar
                </div>
              </div>
            )}
          </div>

          {/* Botones */}
          <div style={{ display: "flex", gap: "10px", marginTop: "1.25rem" }}>
            {paso > 1 && paso < 5 && (
              <button onClick={() => { setPaso(p => p-1); setError("") }} style={{
                flex: 1, padding: "13px", borderRadius: "12px",
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.12)",
                color: "#9AAAC0", fontSize: "15px", fontWeight: "600",
                cursor: "pointer", fontFamily: "Inter, sans-serif",
              }}>← Atrás</button>
            )}
            {paso < 4 && (
              <button onClick={siguientePaso} style={{
                flex: 2, padding: "13px", borderRadius: "12px",
                background: "linear-gradient(135deg, #E8213A, #C41830)",
                border: "none", color: "white", fontSize: "15px", fontWeight: "700",
                cursor: "pointer", fontFamily: "Inter, sans-serif",
                boxShadow: "0 6px 24px rgba(232,33,58,.35)",
                transition: "all .2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(232,33,58,.45)" }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(232,33,58,.35)" }}>
                Siguiente →
              </button>
            )}
            {paso === 4 && (
              <button onClick={enviarCita} disabled={cargando} style={{
                flex: 2, padding: "13px", borderRadius: "12px",
                background: "linear-gradient(135deg, #E8213A, #C41830)",
                border: "none", color: "white", fontSize: "15px", fontWeight: "700",
                cursor: cargando ? "not-allowed" : "pointer",
                fontFamily: "Inter, sans-serif",
                opacity: cargando ? .7 : 1,
                boxShadow: "0 6px 24px rgba(232,33,58,.35)",
              }}>
                {cargando ? "Agendando..." : "✅ Confirmar cita"}
              </button>
            )}
            {paso === 5 && (
              <a href="/public" style={{
                flex: 1, padding: "13px", borderRadius: "12px",
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.12)",
                color: "#9AAAC0", fontSize: "15px", fontWeight: "600",
                cursor: "pointer", textDecoration: "none",
                textAlign: "center",
              }}>← Volver al inicio</a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
