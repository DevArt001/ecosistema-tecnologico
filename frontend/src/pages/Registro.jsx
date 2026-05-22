import { useState } from "react"

const API_URL = window.location.hostname === "localhost" || window.location.hostname.startsWith("192.")
  ? "http://192.168.0.8:8000/api"
  : "https://api.armracing.com/api"

export default function Registro() {
  const [paso, setPaso]         = useState(1)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [clienteId, setClienteId] = useState(null)
  const [listo, setListo]       = useState(false)

  const [cliente, setCliente] = useState({
    nombre: "", documento: "", telefono: "", correo: ""
  })
  const [vehiculo, setVehiculo] = useState({
    placa: "", marca: "", linea: "", modelo: "", tipo: "moto"
  })

  const registrarCliente = async () => {
    if (!cliente.nombre || !cliente.documento || !cliente.telefono) {
      setError("Nombre, documento y teléfono son obligatorios")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_URL}/agendamiento/cliente-publico/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cliente)
      })
      const data = await res.json()
      if (res.ok) {
        setClienteId(data.id)
        setPaso(2)
      } else {
        setError(data.documento?.[0] || "Error al registrar cliente")
      }
    } catch {
      setError("Error de conexión")
    }
    setLoading(false)
  }

  const registrarVehiculo = async () => {
    if (!vehiculo.placa || !vehiculo.marca || !vehiculo.modelo) {
      setError("Placa, marca y modelo son obligatorios")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_URL}/agendamiento/vehiculo-publico/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...vehiculo, cliente_id: clienteId })
      })
      if (res.ok) {
        setListo(true)
      } else {
        setError("Error al registrar vehículo")
      }
    } catch {
      setError("Error de conexión")
    }
    setLoading(false)
  }

  if (listo) return (
    <div style={{
      minHeight: "100vh", background: "#0A0E1A",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem"
    }}>
      <div style={{
        background: "#111827", border: "1px solid #065F46",
        borderRadius: "16px", padding: "2rem",
        maxWidth: "420px", width: "100%", textAlign: "center"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "1rem" }}>✅</div>
        <h2 style={{ color: "#10B981", fontSize: "22px", marginBottom: "8px" }}>
          Registro exitoso
        </h2>
        <p style={{ color: "#9CA3AF", fontSize: "14px", marginBottom: "1.5rem" }}>
          Tus datos han sido registrados correctamente en ARM Racing Performance.
          Pronto nos pondremos en contacto contigo.
        </p>
        <p style={{ color: "#6B7280", fontSize: "12px" }}>
          📞 323 233 8894
        </p>
      </div>
    </div>
  )

  return (
    <div style={{
      minHeight: "100vh", background: "#0A0E1A",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem"
    }}>
      <div style={{
        background: "#111827", border: "1px solid #1F2937",
        borderRadius: "16px", overflow: "hidden",
        maxWidth: "460px", width: "100%"
      }}>
        {/* Header */}
        <div style={{
          background: "#065F46", padding: "1.5rem",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔧</div>
          <h1 style={{ color: "#10B981", fontSize: "20px", fontWeight: "700" }}>
            ARM Racing Performance
          </h1>
          <p style={{ color: "#9CA3AF", fontSize: "13px", marginTop: "4px" }}>
            Registro de cliente y vehículo
          </p>
        </div>

        {/* Pasos */}
        <div style={{
          display: "flex", borderBottom: "1px solid #1F2937"
        }}>
          {["Datos personales", "Tu vehículo"].map((label, i) => (
            <div key={i} style={{
              flex: 1, padding: "12px",
              textAlign: "center", fontSize: "13px",
              fontWeight: paso === i + 1 ? "600" : "400",
              color: paso === i + 1 ? "#10B981" : "#6B7280",
              borderBottom: paso === i + 1 ? "2px solid #10B981" : "2px solid transparent",
            }}>{i + 1}. {label}</div>
          ))}
        </div>

        <div style={{ padding: "1.5rem" }}>
          {error && (
            <div style={{
              background: "#3B0A0A", border: "1px solid #EF4444",
              borderRadius: "8px", padding: "10px 14px",
              marginBottom: "1rem", fontSize: "13px", color: "#FCA5A5"
            }}>{error}</div>
          )}

          {/* Paso 1 — Cliente */}
          {paso === 1 && (
            <>
              {[
                { name: "nombre",    label: "Nombre completo *", placeholder: "Juan Pérez" },
                { name: "documento", label: "Cédula / NIT *",    placeholder: "123456789" },
                { name: "telefono",  label: "WhatsApp / Teléfono *", placeholder: "3001234567" },
                { name: "correo",    label: "Correo electrónico", placeholder: "juan@email.com", type: "email" },
              ].map(f => (
                <div key={f.name} style={{ marginBottom: "1rem" }}>
                  <label style={{
                    display: "block", fontSize: "12px", fontWeight: "600",
                    color: "#9CA3AF", marginBottom: "6px", textTransform: "uppercase"
                  }}>{f.label}</label>
                  <input
                    type={f.type || "text"}
                    value={cliente[f.name]}
                    onChange={e => setCliente({...cliente, [f.name]: e.target.value})}
                    placeholder={f.placeholder}
                    style={{
                      width: "100%", background: "#1F2937",
                      border: "1px solid #374151", color: "#F9FAFB",
                      borderRadius: "8px", padding: "10px 12px",
                      fontSize: "14px", outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              ))}
              <button onClick={registrarCliente} disabled={loading} style={{
                width: "100%", background: "#10B981", border: "none",
                color: "white", borderRadius: "8px", padding: "12px",
                fontSize: "14px", fontWeight: "600", cursor: "pointer",
                marginTop: "0.5rem"
              }}>
                {loading ? "Registrando..." : "Continuar →"}
              </button>
            </>
          )}

          {/* Paso 2 — Vehículo */}
          {paso === 2 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {[
                  { name: "placa",  label: "Placa *",  placeholder: "ABC123" },
                  { name: "marca",  label: "Marca *",  placeholder: "Honda" },
                  { name: "linea",  label: "Línea",    placeholder: "CB190R" },
                  { name: "modelo", label: "Año *",    placeholder: "2022" },
                ].map(f => (
                  <div key={f.name}>
                    <label style={{
                      display: "block", fontSize: "12px", fontWeight: "600",
                      color: "#9CA3AF", marginBottom: "6px", textTransform: "uppercase"
                    }}>{f.label}</label>
                    <input
                      value={vehiculo[f.name]}
                      onChange={e => setVehiculo({...vehiculo, [f.name]: e.target.value})}
                      placeholder={f.placeholder}
                      style={{
                        width: "100%", background: "#1F2937",
                        border: "1px solid #374151", color: "#F9FAFB",
                        borderRadius: "8px", padding: "10px 12px",
                        fontSize: "14px", outline: "none",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block", fontSize: "12px", fontWeight: "600",
                  color: "#9CA3AF", marginBottom: "6px", textTransform: "uppercase"
                }}>Tipo de vehículo</label>
                <select
                  value={vehiculo.tipo}
                  onChange={e => setVehiculo({...vehiculo, tipo: e.target.value})}
                  style={{
                    width: "100%", background: "#1F2937",
                    border: "1px solid #374151", color: "#F9FAFB",
                    borderRadius: "8px", padding: "10px 12px",
                    fontSize: "14px", outline: "none",
                  }}>
                  <option value="moto">Moto</option>
                  <option value="auto">Auto</option>
                  <option value="bicicleta">Bicicleta eléctrica</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setPaso(1)} style={{
                  background: "#1F2937", border: "1px solid #374151",
                  color: "#9CA3AF", borderRadius: "8px", padding: "12px",
                  fontSize: "14px", cursor: "pointer", flex: 1
                }}>← Atrás</button>
                <button onClick={registrarVehiculo} disabled={loading} style={{
                  background: "#10B981", border: "none",
                  color: "white", borderRadius: "8px", padding: "12px",
                  fontSize: "14px", fontWeight: "600", cursor: "pointer", flex: 2
                }}>
                  {loading ? "Registrando..." : "Finalizar registro"}
                </button>
              </div>
            </>
          )}
        </div>

        <div style={{
          padding: "1rem", borderTop: "1px solid #1F2937",
          textAlign: "center", fontSize: "12px", color: "#6B7280"
        }}>
          ARM Racing Performance · Carrera 54b #50-09 sur, Venecia, Bogotá
        </div>
      </div>
    </div>
  )
}
