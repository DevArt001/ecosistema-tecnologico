import { useState, useEffect } from "react"
import { agendamientoAPI } from "../services/api"
import { useNavigate } from "react-router-dom"

const MESES = ["","Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
const DIAS_SEM = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"]

const estadoBadge = {
  pendiente:   { bg: "#451A03", color: "#F59E0B" },
  confirmada:  { bg: "#065F46", color: "#10B981" },
  completada:  { bg: "#1E3A5F", color: "#3B82F6" },
  cancelada:   { bg: "#3B0A0A", color: "#EF4444" },
  no_cumplida: { bg: "#1F2937", color: "#6B7280" },
}

export default function Agendamiento() {
  const navigate = useNavigate()
  const [mes, setMes]           = useState(new Date().getMonth() + 1)
  const [anio, setAnio]         = useState(new Date().getFullYear())
  const [citas, setCitas]       = useState([])
  const [festivos, setFestivos] = useState([])
  const [loading, setLoading]   = useState(true)
  const [diaSelec, setDiaSelec] = useState(null)
  const [citasDia, setCitasDia] = useState([])
  const [vista, setVista]       = useState("calendario")
  const [showFestivo, setShowFestivo] = useState(false)
  const [formFestivo, setFormFestivo] = useState({ fecha: "", tipo: "festivo", descripcion: "" })
  const [convirtiendo, setConvirtiendo] = useState(null)
  const [mensajeExito, setMensajeExito] = useState("")

  useEffect(() => { cargar() }, [mes, anio])

  const cargar = async () => {
    setLoading(true)
    try {
      const [citasRes, festivosRes] = await Promise.all([
        agendamientoAPI.listarCitas({ mes, anio }),
        agendamientoAPI.listarFestivos(),
      ])
      setCitas(citasRes.data.results || citasRes.data)
      setFestivos(festivosRes.data.results || festivosRes.data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const cambiarMes = (dir) => {
    let m = mes + dir, a = anio
    if (m > 12) { m = 1;  a++ }
    if (m < 1)  { m = 12; a-- }
    setMes(m); setAnio(a)
    setDiaSelec(null)
  }

  const cambiarEstadoCita = async (id, estado) => {
    await agendamientoAPI.editarCita(id, { estado })
    await cargar()
    if (diaSelec) {
      const res = await agendamientoAPI.listarCitas({ fecha: diaSelec })
      setCitasDia(res.data.results || res.data)
    }
  }

  const handleConvertirOrden = async (citaId) => {
    setConvirtiendo(citaId)
    try {
      const res = await agendamientoAPI.convertirOrden(citaId)
      setMensajeExito(`✅ Orden ${res.data.orden_codigo} creada exitosamente`)
      await cargar()
      if (diaSelec) {
        const r = await agendamientoAPI.listarCitas({ fecha: diaSelec })
        setCitasDia(r.data.results || r.data)
      }
      setTimeout(() => {
        navigate("/ordenes")
      }, 1500)
    } catch (e) {
      const msg = e.response?.data?.error || "Error al convertir en orden"
      if (e.response?.data?.orden_id) {
        setMensajeExito(`⚠️ Ya existe una orden para esta cita`)
      } else {
        setMensajeExito(`❌ ${msg}`)
      }
    }
    setConvirtiendo(null)
    setTimeout(() => setMensajeExito(""), 3000)
  }

  const eliminarFestivo = async (id) => {
    await agendamientoAPI.eliminarFestivo(id)
    cargar()
  }

  const crearFestivo = async () => {
    await agendamientoAPI.crearFestivo(formFestivo)
    setShowFestivo(false)
    setFormFestivo({ fecha: "", tipo: "festivo", descripcion: "" })
    cargar()
  }

  const seleccionarDia = async (fecha) => {
    setDiaSelec(fecha)
    const res = await agendamientoAPI.listarCitas({ fecha })
    setCitasDia(res.data.results || res.data)
  }

  const getDias = () => {
    const primerDia = new Date(anio, mes - 1, 1).getDay()
    const diasMes   = new Date(anio, mes, 0).getDate()
    const dias = []
    for (let i = 0; i < primerDia; i++) dias.push(null)
    for (let d = 1; d <= diasMes; d++) {
      const fecha     = `${anio}-${String(mes).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      const esDom     = new Date(fecha).getDay() === 0
      const esFestivo = festivos.some(f => f.fecha === fecha && ['festivo','bloqueado'].includes(f.tipo))
      const citasD    = citas.filter(c => c.fecha === fecha)
      const especiales = citasD.filter(c => c.tipo === 'especial' && c.estado === 'pendiente')
      dias.push({ dia: d, fecha, esDom, esFestivo, citasD, especiales })
    }
    return dias
  }

  const citasEspecialesPendientes = citas.filter(c => c.tipo === 'especial' && c.estado === 'pendiente')

  return (
    <div>
      {/* Mensaje éxito/error */}
      {mensajeExito && (
        <div style={{
          position: "fixed", top: "1rem", right: "1rem", zIndex: 9999,
          background: mensajeExito.startsWith("✅") ? "#065F46" : mensajeExito.startsWith("⚠️") ? "#451A03" : "#3B0A0A",
          border: `1px solid ${mensajeExito.startsWith("✅") ? "#10B981" : mensajeExito.startsWith("⚠️") ? "#F59E0B" : "#EF4444"}`,
          color: "white", borderRadius: "8px", padding: "12px 20px", fontSize: "13px", fontWeight: "500"
        }}>{mensajeExito}</div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text)", marginBottom: "4px" }}>
            Agendamiento
          </h1>
          <p style={{ color: "var(--text3)", fontSize: "13px" }}>
            {citas.length} citas en {MESES[mes]} {anio}
            {citasEspecialesPendientes.length > 0 && (
              <span style={{ marginLeft: "12px", background: "#451A03", color: "#F59E0B",
                padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "600" }}>
                ⚡ {citasEspecialesPendientes.length} especial(es) pendiente(s)
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setVista(vista === "calendario" ? "lista" : "calendario")}
            style={{ background: "#1F2937", border: "1px solid #374151", color: "#D1D5DB",
              borderRadius: "8px", padding: "8px 14px", fontSize: "12px", cursor: "pointer" }}>
            {vista === "calendario" ? "📋 Lista" : "📅 Calendario"}
          </button>
          <button onClick={() => setShowFestivo(true)}
            style={{ background: "#1F2937", border: "1px solid #374151", color: "#D1D5DB",
              borderRadius: "8px", padding: "8px 14px", fontSize: "12px", cursor: "pointer" }}>
            + Día especial
          </button>
        </div>
      </div>

      {/* Citas especiales pendientes */}
      {citasEspecialesPendientes.length > 0 && (
        <div style={{ background: "#451A03", border: "1px solid #F59E0B", borderRadius: "12px",
          padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ fontWeight: "600", color: "#F59E0B", marginBottom: "8px", fontSize: "13px" }}>
            ⚡ Solicitudes de cita especial pendientes de aprobación
          </div>
          {citasEspecialesPendientes.map(c => (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "8px 0", borderBottom: "1px solid #92400E", fontSize: "13px" }}>
              <div>
                <span style={{ color: "#F9FAFB", fontWeight: "500" }}>{c.cliente_nombre}</span>
                <span style={{ color: "#9CA3AF", marginLeft: "8px" }}>{c.vehiculo_placa}</span>
                <span style={{ color: "#F59E0B", marginLeft: "8px" }}>{c.fecha} {c.hora?.slice(0,5)}</span>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={() => cambiarEstadoCita(c.id, "confirmada")}
                  style={{ background: "#065F46", border: "1px solid #10B981", color: "#10B981",
                    borderRadius: "6px", padding: "4px 10px", fontSize: "11px", cursor: "pointer" }}>
                  ✓ Aprobar
                </button>
                <button onClick={() => cambiarEstadoCita(c.id, "cancelada")}
                  style={{ background: "#3B0A0A", border: "1px solid #EF4444", color: "#EF4444",
                    borderRadius: "6px", padding: "4px 10px", fontSize: "11px", cursor: "pointer" }}>
                  ✗ Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vista Calendario */}
      {vista === "calendario" && (
        <div style={{ display: "grid", gridTemplateColumns: diaSelec ? "1fr 340px" : "1fr", gap: "1.5rem" }}>
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <button onClick={() => cambiarMes(-1)}
                style={{ background: "#1F2937", border: "1px solid #374151", color: "#D1D5DB",
                  borderRadius: "8px", padding: "6px 14px", cursor: "pointer" }}>←</button>
              <h2 style={{ color: "var(--text)", fontSize: "16px", fontWeight: "600" }}>
                {MESES[mes]} {anio}
              </h2>
              <button onClick={() => cambiarMes(1)}
                style={{ background: "#1F2937", border: "1px solid #374151", color: "#D1D5DB",
                  borderRadius: "8px", padding: "6px 14px", cursor: "pointer" }}>→</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "8px" }}>
              {DIAS_SEM.map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: "11px", color: "var(--text3)",
                  fontWeight: "600", padding: "4px" }}>{d}</div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
              {getDias().map((d, i) => {
                if (!d) return <div key={i} />
                const noLaboral = d.esDom || d.esFestivo
                const selec = diaSelec === d.fecha
                return (
                  <div key={i} onClick={() => seleccionarDia(d.fecha)}
                    style={{
                      minHeight: "56px", padding: "4px", borderRadius: "8px", cursor: "pointer",
                      background: selec ? "#1E3A5F" : noLaboral ? "#0D1117" : "#1F2937",
                      border: `1px solid ${selec ? "#3B82F6" : noLaboral ? "#111827" : "#374151"}`,
                      opacity: noLaboral ? 0.5 : 1,
                    }}>
                    <div style={{ fontSize: "12px", fontWeight: "600",
                      color: noLaboral ? "#4B5563" : selec ? "#93C5FD" : "var(--text)" }}>
                      {d.dia}
                    </div>
                    {d.citasD.length > 0 && (
                      <div style={{ marginTop: "2px" }}>
                        <span style={{ background: "#10B981", color: "white", borderRadius: "10px",
                          padding: "1px 6px", fontSize: "10px", fontWeight: "600" }}>
                          {d.citasD.length}
                        </span>
                      </div>
                    )}
                    {d.especiales.length > 0 && (
                      <div style={{ marginTop: "2px" }}>
                        <span style={{ background: "#F59E0B", color: "#0D1117", borderRadius: "10px",
                          padding: "1px 6px", fontSize: "10px", fontWeight: "600" }}>
                          ⚡{d.especiales.length}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div style={{ marginTop: "1rem", display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", color: "var(--text3)" }}>🟢 Citas normales</span>
              <span style={{ fontSize: "11px", color: "var(--text3)" }}>⚡ Citas especiales</span>
              <span style={{ fontSize: "11px", color: "#4B5563" }}>⬛ No laboral / Festivo</span>
            </div>
          </div>

          {/* Panel detalle del día */}
          {diaSelec && (
            <div className="card" style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ color: "var(--text)", fontSize: "14px", fontWeight: "600" }}>{diaSelec}</h3>
                <button onClick={() => setDiaSelec(null)}
                  style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: "18px" }}>×</button>
              </div>
              {citasDia.length === 0 ? (
                <p style={{ color: "var(--text3)", fontSize: "13px" }}>No hay citas este día</p>
              ) : (
                citasDia.map(c => (
                  <div key={c.id} style={{ background: "#111827", borderRadius: "8px",
                    padding: "12px", marginBottom: "10px", border: "1px solid #1F2937" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ color: "var(--text)", fontWeight: "600", fontSize: "13px" }}>
                        {c.hora?.slice(0,5)} — {c.cliente_nombre}
                      </span>
                      {c.tipo === "especial" && (
                        <span style={{ fontSize: "10px", color: "#F59E0B" }}>⚡</span>
                      )}
                    </div>
                    <div style={{ color: "var(--text3)", fontSize: "11px", marginBottom: "6px" }}>
                      {c.vehiculo_placa} · {c.vehiculo_marca}
                    </div>
                    {c.descripcion && (
                      <div style={{ color: "#9CA3AF", fontSize: "11px", marginBottom: "8px", fontStyle: "italic" }}>
                        "{c.descripcion}"
                      </div>
                    )}

                    {/* Estado + cambio */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span className="badge" style={{
                        background: estadoBadge[c.estado]?.bg || "#1F2937",
                        color: estadoBadge[c.estado]?.color || "#9CA3AF",
                        fontSize: "10px"
                      }}>{c.estado}</span>
                      <select value={c.estado} onChange={e => cambiarEstadoCita(c.id, e.target.value)}
                        style={{ background: "#1F2937", border: "1px solid #374151", color: "#D1D5DB",
                          borderRadius: "6px", padding: "3px 6px", fontSize: "11px", cursor: "pointer" }}>
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="completada">Completada</option>
                        <option value="cancelada">Cancelada</option>
                        <option value="no_cumplida">No cumplida</option>
                      </select>
                    </div>

                    {/* Botón convertir en orden */}
                    {c.estado === "confirmada" && !c.orden && (
                      <button
                        onClick={() => handleConvertirOrden(c.id)}
                        disabled={convirtiendo === c.id}
                        style={{
                          width: "100%",
                          background: "#065F46",
                          border: "1px solid #10B981",
                          color: "#10B981",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}>
                        {convirtiendo === c.id ? "Creando orden..." : "🔧 Convertir en Orden de Trabajo"}
                      </button>
                    )}

                    {c.orden && (
                      <div style={{ background: "#1E3A5F", border: "1px solid #3B82F6",
                        borderRadius: "8px", padding: "8px 12px", fontSize: "12px",
                        color: "#93C5FD", textAlign: "center" }}>
                        ✅ Orden generada — ve a Órdenes para verla
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Vista Lista */}
      {vista === "lista" && (
        <div className="card">
          {loading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>Cargando...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Fecha</th><th>Hora</th><th>Cliente</th><th>Vehículo</th>
                  <th>Tipo</th><th>Estado</th><th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {citas.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{c.fecha}</td>
                    <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{c.hora?.slice(0,5)}</td>
                    <td style={{ color: "var(--text)", fontWeight: "500" }}>{c.cliente_nombre}</td>
                    <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{c.vehiculo_placa}</td>
                    <td>
                      {c.tipo === "especial"
                        ? <span style={{ color: "#F59E0B", fontSize: "12px" }}>⚡ Especial</span>
                        : <span style={{ color: "#9CA3AF", fontSize: "12px" }}>Normal</span>}
                    </td>
                    <td>
                      <select value={c.estado} onChange={e => cambiarEstadoCita(c.id, e.target.value)}
                        style={{ background: estadoBadge[c.estado]?.bg || "#1F2937",
                          color: estadoBadge[c.estado]?.color || "#9CA3AF",
                          border: "none", borderRadius: "12px", padding: "3px 8px",
                          fontSize: "11px", cursor: "pointer" }}>
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="completada">Completada</option>
                        <option value="cancelada">Cancelada</option>
                        <option value="no_cumplida">No cumplida</option>
                      </select>
                    </td>
                    <td>
                      {c.estado === "confirmada" && !c.orden ? (
                        <button onClick={() => handleConvertirOrden(c.id)}
                          disabled={convirtiendo === c.id}
                          style={{ background: "#065F46", border: "1px solid #10B981",
                            color: "#10B981", borderRadius: "6px", padding: "4px 10px",
                            fontSize: "11px", cursor: "pointer", whiteSpace: "nowrap" }}>
                          {convirtiendo === c.id ? "..." : "🔧 Crear orden"}
                        </button>
                      ) : c.orden ? (
                        <span style={{ color: "#3B82F6", fontSize: "11px" }}>✅ Con orden</span>
                      ) : (
                        <span style={{ color: "#4B5563", fontSize: "11px" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal festivo */}
      {showFestivo && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "var(--bg2)", borderRadius: "12px", border: "1px solid var(--border)",
            width: "100%", maxWidth: "400px", padding: "1.5rem" }}>
            <h3 style={{ color: "var(--text)", marginBottom: "1rem" }}>Agregar día especial</h3>
            <input type="date" value={formFestivo.fecha}
              onChange={e => setFormFestivo({...formFestivo, fecha: e.target.value})}
              style={{ width: "100%", marginBottom: "0.75rem" }} />
            <select value={formFestivo.tipo}
              onChange={e => setFormFestivo({...formFestivo, tipo: e.target.value})}
              style={{ width: "100%", marginBottom: "0.75rem" }}>
              <option value="festivo">Festivo nacional</option>
              <option value="bloqueado">Día bloqueado</option>
              <option value="especial">Horario especial</option>
            </select>
            <input placeholder="Descripción" value={formFestivo.descripcion}
              onChange={e => setFormFestivo({...formFestivo, descripcion: e.target.value})}
              style={{ width: "100%", marginBottom: "1rem" }} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button className="btn btn-secondary" onClick={() => setShowFestivo(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={crearFestivo}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
