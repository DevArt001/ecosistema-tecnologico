import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { portalAPI } from "../services/api"

export default function Portal() {
  const { token } = useParams()
  const [datos, setDatos] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [tabActiva, setTabActiva] = useState("resumen")

  useEffect(() => {
    cargarPortal()
  }, [token])

  const cargarPortal = async () => {
    setLoading(true)
    try {
      const res = await portalAPI.accederPortal(token)
      setDatos(res.data)
    } catch (e) {
      setError(e.response?.data?.error || "Link inválido o expirado")
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div style={{ background: "#0D1117", minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center", color: "#F9FAFB" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "1rem" }}>⏳</div>
          <p>Cargando tu información...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ background: "#0D1117", minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center", color: "#F9FAFB", padding: "2rem" }}>
        <div style={{ textAlign: "center", maxWidth: "600px" }}>
          <div style={{ fontSize: "48px", marginBottom: "1rem" }}>⚠️</div>
          <h1 style={{ fontSize: "24px", marginBottom: "1rem", color: "#EF4444" }}>Link inválido o expirado</h1>
          <p style={{ color: "#9CA3AF", marginBottom: "2rem" }}>{error}</p>
          <p style={{ color: "#6B7280", fontSize: "14px" }}>
            Si crees que esto es un error, contacta al taller.
          </p>
        </div>
      </div>
    )
  }

  const { cliente, vehiculo, orden, dias_restantes } = datos

  return (
    <div style={{ background: "#0D1117", color: "#F9FAFB", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "64px", marginBottom: "1rem" }}>🔧</div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>
            Portal de Cliente — ARM Racing Performance
          </h1>
          <p style={{ color: "#9CA3AF", fontSize: "14px" }}>
            Tu información de vehículo y progreso de trabajo
          </p>
        </div>

        {/* Advertencia de expiración */}
        {dias_restantes <= 3 && (
          <div style={{ background: "#451A03", border: "1px solid #F59E0B", borderRadius: "12px",
            padding: "1rem 1.25rem", marginBottom: "2rem", color: "#F59E0B", fontSize: "14px" }}>
            ⏰ Este link caduca en <strong>{dias_restantes} día(s)</strong>. Descarga tus documentos si los necesitas.
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "2rem", borderBottom: "1px solid #374151", paddingBottom: "1rem" }}>
          <button onClick={() => setTabActiva("resumen")}
            style={{
              background: "none", border: "none", color: tabActiva === "resumen" ? "#10B981" : "#6B7280",
              fontSize: "16px", fontWeight: "600", cursor: "pointer",
              borderBottom: tabActiva === "resumen" ? "2px solid #10B981" : "none",
              paddingBottom: "8px"
            }}>
            📋 Resumen
          </button>
          <button onClick={() => setTabActiva("proceso")}
            style={{
              background: "none", border: "none", color: tabActiva === "proceso" ? "#10B981" : "#6B7280",
              fontSize: "16px", fontWeight: "600", cursor: "pointer",
              borderBottom: tabActiva === "proceso" ? "2px solid #10B981" : "none",
              paddingBottom: "8px"
            }}>
            🔧 Proceso ({orden.pasos?.length || 0} pasos)
          </button>
          <button onClick={() => setTabActiva("fotos")}
            style={{
              background: "none", border: "none", color: tabActiva === "fotos" ? "#10B981" : "#6B7280",
              fontSize: "16px", fontWeight: "600", cursor: "pointer",
              borderBottom: tabActiva === "fotos" ? "2px solid #10B981" : "none",
              paddingBottom: "8px"
            }}>
            📸 Galería ({orden.fotos?.length || 0} fotos)
          </button>
        </div>

        {/* TAB: RESUMEN */}
        {tabActiva === "resumen" && (
          <>
            {/* Cliente */}
            <div className="card" style={{ marginBottom: "2rem", padding: "1.5rem" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#10B981", marginBottom: "1rem" }}>
                👤 Tu Información
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
                <div>
                  <p style={{ color: "#6B7280", fontSize: "12px", marginBottom: "4px" }}>Nombre</p>
                  <p style={{ fontSize: "16px", fontWeight: "600" }}>{cliente.nombre}</p>
                </div>
                <div>
                  <p style={{ color: "#6B7280", fontSize: "12px", marginBottom: "4px" }}>Documento</p>
                  <p style={{ fontSize: "16px", fontWeight: "600" }}>{cliente.documento}</p>
                </div>
                <div>
                  <p style={{ color: "#6B7280", fontSize: "12px", marginBottom: "4px" }}>Teléfono</p>
                  <p style={{ fontSize: "16px", fontWeight: "600" }}>
                    <a href={`tel:${cliente.telefono}`} style={{ color: "#10B981", textDecoration: "none" }}>
                      {cliente.telefono}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Vehículo */}
            <div className="card" style={{ marginBottom: "2rem", padding: "1.5rem" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#3B82F6", marginBottom: "1rem" }}>
                🚗 Tu Vehículo
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
                <div>
                  <p style={{ color: "#6B7280", fontSize: "12px", marginBottom: "4px" }}>Placa</p>
                  <p style={{ fontSize: "16px", fontWeight: "600", fontFamily: "monospace" }}>{vehiculo.placa}</p>
                </div>
                <div>
                  <p style={{ color: "#6B7280", fontSize: "12px", marginBottom: "4px" }}>Marca</p>
                  <p style={{ fontSize: "16px", fontWeight: "600" }}>{vehiculo.marca}</p>
                </div>
                <div>
                  <p style={{ color: "#6B7280", fontSize: "12px", marginBottom: "4px" }}>Modelo</p>
                  <p style={{ fontSize: "16px", fontWeight: "600" }}>{vehiculo.modelo}</p>
                </div>
              </div>
            </div>

            {/* Orden de trabajo */}
            <div className="card" style={{ marginBottom: "2rem", padding: "1.5rem" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#EF4444", marginBottom: "1rem" }}>
                📋 Orden de Trabajo
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
                <div>
                  <p style={{ color: "#6B7280", fontSize: "12px", marginBottom: "4px" }}>Código</p>
                  <p style={{ fontSize: "16px", fontWeight: "600", fontFamily: "monospace" }}>{orden.codigo}</p>
                </div>
                <div>
                  <p style={{ color: "#6B7280", fontSize: "12px", marginBottom: "4px" }}>Estado</p>
                  <p style={{
                    fontSize: "16px", fontWeight: "600",
                    background: orden.estado === "entregado" ? "#065F46" : "#1E3A5F",
                    color: orden.estado === "entregado" ? "#10B981" : "#3B82F6",
                    padding: "4px 12px", borderRadius: "20px", display: "inline-block"
                  }}>
                    {orden.estado}
                  </p>
                </div>
                <div>
                  <p style={{ color: "#6B7280", fontSize: "12px", marginBottom: "4px" }}>Costo Final</p>
                  <p style={{ fontSize: "16px", fontWeight: "600", color: "#10B981" }}>
                    ${Number(orden.costo_final || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {orden.descripcion && (
                <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid #374151" }}>
                  <p style={{ color: "#6B7280", fontSize: "12px", marginBottom: "8px" }}>Descripción del trabajo</p>
                  <p style={{ color: "#D1D5DB", fontSize: "14px", lineHeight: "1.6" }}>{orden.descripcion}</p>
                </div>
              )}

              {orden.trabajo_realizado && (
                <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #374151" }}>
                  <p style={{ color: "#6B7280", fontSize: "12px", marginBottom: "8px" }}>Trabajo realizado</p>
                  <p style={{ color: "#10B981", fontSize: "14px", lineHeight: "1.6" }}>{orden.trabajo_realizado}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB: PROCESO */}
        {tabActiva === "proceso" && (
          <div className="card" style={{ padding: "1.5rem" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#3B82F6", marginBottom: "1.5rem" }}>
              🔧 Proceso de Trabajo
            </h2>
            {!orden.pasos || orden.pasos.length === 0 ? (
              <p style={{ color: "#9CA3AF", textAlign: "center", padding: "2rem" }}>
                Aún no hay pasos registrados en este trabajo
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {orden.pasos.map((paso, idx) => (
                  <div key={paso.id} style={{
                    background: "#111827", borderRadius: "12px", padding: "1.25rem",
                    border: `2px solid ${
                      paso.estado === "completado" ? "#10B981" :
                      paso.estado === "en_proceso" ? "#F59E0B" : "#374151"
                    }`
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{
                            background: paso.estado === "completado" ? "#065F46" : "#1E3A5F",
                            color: paso.estado === "completado" ? "#10B981" : "#3B82F6",
                            width: "28px", height: "28px", borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: "700", fontSize: "12px"
                          }}>
                            {paso.estado === "completado" ? "✓" : paso.numero}
                          </span>
                          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text)" }}>
                            {paso.titulo}
                          </h3>
                        </div>
                        <p style={{ color: "#9CA3AF", fontSize: "12px", marginLeft: "36px" }}>
                          {paso.estado === "completado" ? "✅ Completado" :
                           paso.estado === "en_proceso" ? "⏳ En proceso" : "⏱️ Pendiente"}
                        </p>
                      </div>
                      {paso.tiempo_minutos && (
                        <span style={{ background: "#1E3A5F", color: "#3B82F6", padding: "4px 10px",
                          borderRadius: "8px", fontSize: "12px", fontWeight: "600" }}>
                          ⏱️ {paso.tiempo_minutos} min
                        </span>
                      )}
                    </div>
                    <p style={{ color: "#D1D5DB", fontSize: "13px", lineHeight: "1.6", marginLeft: "36px" }}>
                      {paso.descripcion}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: FOTOS */}
        {tabActiva === "fotos" && (
          <div className="card" style={{ padding: "1.5rem" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#EF4444", marginBottom: "1.5rem" }}>
              📸 Galería del Trabajo
            </h2>
            {!orden.fotos || orden.fotos.length === 0 ? (
              <p style={{ color: "#9CA3AF", textAlign: "center", padding: "2rem" }}>
                Aún no hay fotos del proceso disponibles
              </p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1.5rem" }}>
                {orden.fotos.map((foto) => (
                  <div key={foto.id} style={{
                    background: "#111827", borderRadius: "12px", overflow: "hidden",
                    border: "1px solid #374151"
                  }}>
                    <img src={foto.foto} alt={foto.descripcion}
                      style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                    <div style={{ padding: "1rem" }}>
                      {foto.descripcion && (
                        <p style={{ color: "#D1D5DB", fontSize: "13px", lineHeight: "1.5" }}>
                          {foto.descripcion}
                        </p>
                      )}
                      {foto.paso_numero && (
                        <p style={{ color: "#6B7280", fontSize: "12px", marginTop: "8px" }}>
                          Paso {foto.paso_numero}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pie */}
        <div style={{ textAlign: "center", padding: "2rem", color: "#6B7280", fontSize: "13px", marginTop: "2rem" }}>
          <p>Este link caduca en {dias_restantes} día(s)</p>
          <p style={{ marginTop: "1rem" }}>
            ¿Preguntas? Contacta al taller: 
            <a href="tel:3232338894" style={{ color: "#10B981", textDecoration: "none", marginLeft: "4px" }}>
              +57 323 233 8894
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
