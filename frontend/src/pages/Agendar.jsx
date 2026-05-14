import { useState } from "react"
import { agendamientoAPI } from "../services/api"

const PASOS = ["Identificación", "Vehículo", "Fecha", "Hora", "Confirmación"]

const estiloBtn = (activo) => ({
  background: activo ? "#10B981" : "#1F2937",
  color: activo ? "white" : "#6B7280",
  border: `1px solid ${activo ? "#10B981" : "#374151"}`,
  borderRadius: "8px", padding: "10px 20px",
  fontSize: "14px", cursor: "pointer", fontWeight: "500",
})

export default function Agendar() {
  const [paso, setPaso]               = useState(0)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState("")
  const [documento, setDocumento]     = useState("")
  const [cliente, setCliente]         = useState(null)
  const [vehiculos, setVehiculos]     = useState([])
  const [vehiculoSel, setVehiculoSel] = useState(null)
  const [nuevoVeh, setNuevoVeh]       = useState(false)
  const [nuevoCliente, setNuevoCliente] = useState(false)
  const [formCliente, setFormCliente] = useState({ nombre:"", documento:"", telefono:"", correo:"", ciudad:"" })
  const [formVeh, setFormVeh]         = useState({ placa:"", marca:"", linea:"", modelo:"", tipo:"moto" })
  const [disponibilidad, setDisponibilidad] = useState(null)
  const [mesVista, setMesVista]       = useState(new Date().getMonth() + 1)
  const [anioVista, setAnioVista]     = useState(new Date().getFullYear())
  const [fechaSel, setFechaSel]       = useState(null)
  const [horas, setHoras]             = useState([])
  const [horaSel, setHoraSel]         = useState(null)
  const [descripcion, setDescripcion] = useState("")
  const [citaCreada, setCitaCreada]   = useState(null)
  const [citaEspecial, setCitaEspecial] = useState(false)

  const meses = ["","Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
  const diasSemana = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"]

  // ── PASO 1 — Buscar cliente ──────────────────────────────────────────────
  const buscarCliente = async () => {
    setError(""); setLoading(true)
    try {
      const res = await agendamientoAPI.buscarCliente(documento)
      if (res.data.existe) {
        setCliente(res.data.cliente)
        setVehiculos(res.data.vehiculos)
        setNuevoCliente(false)
        setPaso(1)
      } else {
        setNuevoCliente(true)
        setFormCliente(f => ({ ...f, documento }))
      }
    } catch { setError("Error buscando cliente") }
    setLoading(false)
  }

  const registrarCliente = async () => {
    if (!formCliente.nombre || !formCliente.documento || !formCliente.telefono) {
      setError("Nombre, documento y teléfono son obligatorios"); return
    }
    setLoading(true); setError("")
    try {
      const res = await agendamientoAPI.registrarCliente(formCliente)
      setCliente(res.data.cliente)
      setVehiculos([])
      setNuevoCliente(false)
      setPaso(1)
    } catch { setError("Error registrando cliente") }
    setLoading(false)
  }

  // ── PASO 2 — Vehículo ───────────────────────────────────────────────────
  const registrarVehiculo = async () => {
    if (!formVeh.placa || !formVeh.marca || !formVeh.linea || !formVeh.modelo) {
      setError("Placa, marca, línea y modelo son obligatorios"); return
    }
    setLoading(true); setError("")
    try {
      const res = await agendamientoAPI.registrarVehiculo({ ...formVeh, cliente: cliente.id })
      setVehiculoSel(res.data.vehiculo)
      setNuevoVeh(false)
      await cargarDisponibilidad(mesVista, anioVista)
      setPaso(2)
    } catch { setError("Error registrando vehículo") }
    setLoading(false)
  }

  const seleccionarVehiculo = async (v) => {
    setVehiculoSel(v)
    await cargarDisponibilidad(mesVista, anioVista)
    setPaso(2)
  }

  // ── PASO 3 — Calendario ─────────────────────────────────────────────────
  const cargarDisponibilidad = async (mes, anio) => {
    setLoading(true)
    try {
      const res = await agendamientoAPI.disponibilidadMes(mes, anio)
      setDisponibilidad(res.data)
    } catch { setError("Error cargando disponibilidad") }
    setLoading(false)
  }

  const cambiarMes = async (dir) => {
    let m = mesVista + dir, a = anioVista
    if (m > 12) { m = 1; a++ }
    if (m < 1)  { m = 12; a-- }
    setMesVista(m); setAnioVista(a)
    await cargarDisponibilidad(m, a)
  }

  const seleccionarFecha = async (fecha) => {
    setFechaSel(fecha); setHoraSel(null)
    setLoading(true)
    try {
      const res = await agendamientoAPI.horasDisponibles(fecha)
      setHoras(res.data.horas)
      setPaso(3)
    } catch { setError("Error cargando horas") }
    setLoading(false)
  }

  const getDiasCalendario = () => {
    const primerDia = new Date(anioVista, mesVista - 1, 1).getDay()
    const diasMes   = new Date(anioVista, mesVista, 0).getDate()
    const dias = []
    for (let i = 0; i < primerDia; i++) dias.push(null)
    for (let d = 1; d <= diasMes; d++) {
      const fecha = `${anioVista}-${String(mesVista).padStart(2,'0')}-${String(d).padStart(2,'0')}`
      const hoy   = new Date()
      const fDate = new Date(fecha)
      const esDomingo   = fDate.getDay() === 0
      const esPasado    = fDate < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
      const esBloqueado = disponibilidad?.bloqueados?.includes(fecha)
      const ocupacion   = disponibilidad?.ocupacion?.[fecha] || {}
      const maxHora     = disponibilidad?.max_citas_hora || 4
      const horasDisp   = disponibilidad?.config
        ? calcularHorasDisp(fDate, ocupacion, maxHora)
        : 0
      dias.push({ dia: d, fecha, esDomingo, esPasado, esBloqueado, horasDisp })
    }
    return dias
  }

  const calcularHorasDisp = (fDate, ocupacion, maxHora) => {
    let count = 0
    const esSabado = fDate.getDay() === 6
    const ap = esSabado ? disponibilidad.config.sabado_apertura : disponibilidad.config.hora_apertura
    const ci = esSabado ? disponibilidad.config.sabado_cierre   : disponibilidad.config.hora_cierre
    if (!ap || !ci) return 0
    const [hAp] = ap.split(':').map(Number)
    const [hCi] = ci.split(':').map(Number)
    for (let h = hAp; h < hCi; h++) {
      const key = `${String(h).padStart(2,'0')}:00:00`
      const ocupadas = ocupacion[key] || 0
      if (ocupadas < maxHora) count++
    }
    return count
  }

  // ── PASO 5 — Confirmar cita ─────────────────────────────────────────────
  const confirmarCita = async () => {
    setLoading(true); setError("")
    const horaCompleta = horaSel + ":00"
    const data = {
      cliente:     cliente.id,
      vehiculo:    vehiculoSel.id,
      fecha:       fechaSel,
      hora:        horaCompleta,
      descripcion,
      tipo:        citaEspecial ? "especial" : "normal",
    }
    try {
      const fn  = citaEspecial ? agendamientoAPI.citaEspecial : agendamientoAPI.crearCita
      const res = await fn(data)
      setCitaCreada(res.data.cita)
      setPaso(4)
    } catch (e) {
      setError(e.response?.data?.non_field_errors?.[0] || "Error al agendar la cita")
    }
    setLoading(false)
  }

  const inputStyle = { width: "100%", marginBottom: "0.75rem" }
  const cardStyle  = { background: "#1F2937", borderRadius: "12px", padding: "1.5rem", border: "1px solid #374151" }

  return (
    <div style={{ minHeight: "100vh", background: "#111827", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔧</div>
          <h1 style={{ color: "#F9FAFB", fontSize: "24px", fontWeight: "700", marginBottom: "4px" }}>
            TallerOS — Agendar Cita
          </h1>
          <p style={{ color: "#6B7280", fontSize: "13px" }}>
            Agenda tu cita de mantenimiento en minutos
          </p>
        </div>

        {/* Pasos */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "2rem", flexWrap: "wrap" }}>
          {PASOS.map((p, i) => (
            <div key={i} style={{
              padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "600",
              background: paso === i ? "#10B981" : paso > i ? "#065F46" : "#1F2937",
              color: paso >= i ? "white" : "#6B7280",
              border: `1px solid ${paso === i ? "#10B981" : paso > i ? "#065F46" : "#374151"}`,
            }}>{i + 1}. {p}</div>
          ))}
        </div>

        {error && (
          <div style={{ background: "#3B0A0A", border: "1px solid #EF4444", borderRadius: "8px",
            padding: "10px 14px", marginBottom: "1rem", fontSize: "13px", color: "#EF4444" }}>
            {error}
          </div>
        )}

        {/* ── PASO 0 — Identificación ── */}
        {paso === 0 && !nuevoCliente && (
          <div style={cardStyle}>
            <h2 style={{ color: "#F9FAFB", fontSize: "16px", fontWeight: "600", marginBottom: "1rem" }}>
              ¿Ya eres cliente del taller?
            </h2>
            <p style={{ color: "#9CA3AF", fontSize: "13px", marginBottom: "1rem" }}>
              Ingresa tu número de documento para identificarte
            </p>
            <input value={documento} onChange={e => setDocumento(e.target.value)}
              placeholder="Número de documento" style={inputStyle}
              onKeyDown={e => e.key === "Enter" && buscarCliente()} />
            <button onClick={buscarCliente} disabled={loading || !documento}
              style={{ ...estiloBtn(true), width: "100%" }}>
              {loading ? "Buscando..." : "Continuar →"}
            </button>
          </div>
        )}

        {paso === 0 && nuevoCliente && (
          <div style={cardStyle}>
            <h2 style={{ color: "#F9FAFB", fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>
              Cliente nuevo — Completa tus datos
            </h2>
            <p style={{ color: "#9CA3AF", fontSize: "13px", marginBottom: "1rem" }}>
              No encontramos tu documento. Regístrate para continuar.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
              <input placeholder="Nombre completo *" value={formCliente.nombre}
                onChange={e => setFormCliente({...formCliente, nombre: e.target.value})} style={inputStyle} />
              <input placeholder="Documento *" value={formCliente.documento}
                onChange={e => setFormCliente({...formCliente, documento: e.target.value})} style={inputStyle} />
              <input placeholder="Teléfono *" value={formCliente.telefono}
                onChange={e => setFormCliente({...formCliente, telefono: e.target.value})} style={inputStyle} />
              <input placeholder="Correo" value={formCliente.correo}
                onChange={e => setFormCliente({...formCliente, correo: e.target.value})} style={inputStyle} />
            </div>
            <input placeholder="Ciudad" value={formCliente.ciudad}
              onChange={e => setFormCliente({...formCliente, ciudad: e.target.value})} style={inputStyle} />
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setNuevoCliente(false)} style={{ ...estiloBtn(false), flex: 1 }}>
                ← Volver
              </button>
              <button onClick={registrarCliente} disabled={loading} style={{ ...estiloBtn(true), flex: 2 }}>
                {loading ? "Registrando..." : "Registrarme y continuar →"}
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 1 — Vehículo ── */}
        {paso === 1 && (
          <div style={cardStyle}>
            <h2 style={{ color: "#F9FAFB", fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>
              Hola, {cliente?.nombre} 👋
            </h2>
            <p style={{ color: "#9CA3AF", fontSize: "13px", marginBottom: "1.25rem" }}>
              Selecciona el vehículo para la cita
            </p>

            {vehiculos.map(v => (
              <div key={v.id} onClick={() => seleccionarVehiculo(v)}
                style={{ ...cardStyle, cursor: "pointer", marginBottom: "8px", padding: "1rem",
                  border: vehiculoSel?.id === v.id ? "1px solid #10B981" : "1px solid #374151" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ color: "#F9FAFB", fontWeight: "600", fontFamily: "monospace" }}>{v.placa}</div>
                    <div style={{ color: "#9CA3AF", fontSize: "12px" }}>{v.marca} {v.linea} {v.modelo}</div>
                  </div>
                  <span style={{ fontSize: "24px" }}>{v.tipo === "moto" ? "🏍️" : "🚗"}</span>
                </div>
              </div>
            ))}

            <button onClick={() => setNuevoVeh(!nuevoVeh)} style={{ ...estiloBtn(false), width: "100%", marginBottom: "1rem" }}>
              + Agregar nuevo vehículo
            </button>

            {nuevoVeh && (
              <div style={{ marginTop: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
                  <input placeholder="Placa *" value={formVeh.placa}
                    onChange={e => setFormVeh({...formVeh, placa: e.target.value.toUpperCase()})} style={inputStyle} />
                  <input placeholder="Marca *" value={formVeh.marca}
                    onChange={e => setFormVeh({...formVeh, marca: e.target.value})} style={inputStyle} />
                  <input placeholder="Línea *" value={formVeh.linea}
                    onChange={e => setFormVeh({...formVeh, linea: e.target.value})} style={inputStyle} />
                  <input placeholder="Modelo (año) *" value={formVeh.modelo} type="number"
                    onChange={e => setFormVeh({...formVeh, modelo: e.target.value})} style={inputStyle} />
                </div>
                <select value={formVeh.tipo} onChange={e => setFormVeh({...formVeh, tipo: e.target.value})}
                  style={{ ...inputStyle }}>
                  <option value="moto">Motocicleta</option>
                  <option value="carro">Automóvil</option>
                  <option value="bicicleta">Bicicleta eléctrica</option>
                </select>
                <button onClick={registrarVehiculo} disabled={loading} style={{ ...estiloBtn(true), width: "100%" }}>
                  {loading ? "Guardando..." : "Guardar vehículo →"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── PASO 2 — Calendario ── */}
        {paso === 2 && (
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <button onClick={() => cambiarMes(-1)} style={{ ...estiloBtn(false), padding: "6px 14px" }}>←</button>
              <h2 style={{ color: "#F9FAFB", fontSize: "16px", fontWeight: "600" }}>
                {meses[mesVista]} {anioVista}
              </h2>
              <button onClick={() => cambiarMes(1)} style={{ ...estiloBtn(false), padding: "6px 14px" }}>→</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "8px" }}>
              {diasSemana.map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: "11px", color: "#6B7280", fontWeight: "600", padding: "4px" }}>{d}</div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
              {getDiasCalendario().map((d, i) => {
                if (!d) return <div key={i} />
                const noDisp = d.esDomingo || d.esPasado || d.esBloqueado || d.horasDisp === 0
                const seleccionado = fechaSel === d.fecha
                return (
                  <div key={i} onClick={() => !noDisp && seleccionarFecha(d.fecha)}
                    style={{
                      textAlign: "center", padding: "8px 4px", borderRadius: "8px",
                      fontSize: "13px", fontWeight: "500", cursor: noDisp ? "not-allowed" : "pointer",
                      background: seleccionado ? "#10B981" : noDisp ? "#111827" : "#374151",
                      color: seleccionado ? "white" : noDisp ? "#374151" : "#F9FAFB",
                      border: seleccionado ? "1px solid #10B981" : "1px solid transparent",
                      opacity: noDisp ? 0.4 : 1,
                    }}>
                    {d.dia}
                    {!noDisp && (
                      <div style={{ fontSize: "9px", color: seleccionado ? "white" : "#10B981" }}>
                        {d.horasDisp}h
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div style={{ marginTop: "1rem", display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", color: "#6B7280" }}>● Disponible</span>
              <span style={{ fontSize: "11px", color: "#374151" }}>● No disponible</span>
              <span style={{ fontSize: "11px", color: "#10B981" }}>● Seleccionado</span>
            </div>

            <div style={{ marginTop: "1rem", borderTop: "1px solid #374151", paddingTop: "1rem" }}>
              <p style={{ color: "#9CA3AF", fontSize: "12px", marginBottom: "8px" }}>
                ¿Necesitas una cita en domingo, festivo o fuera de horario?
              </p>
              <button onClick={() => { setCitaEspecial(true); setPaso(3) }}
                style={{ ...estiloBtn(false), width: "100%", fontSize: "12px" }}>
                Solicitar cita especial →
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 3 — Hora ── */}
        {paso === 3 && (
          <div style={cardStyle}>
            <h2 style={{ color: "#F9FAFB", fontSize: "16px", fontWeight: "600", marginBottom: "4px" }}>
              {citaEspecial ? "Cita especial" : `Horas disponibles — ${fechaSel}`}
            </h2>
            <p style={{ color: "#9CA3AF", fontSize: "13px", marginBottom: "1.25rem" }}>
              {citaEspecial
                ? "Indica la fecha y hora que necesitas. El taller la aprobará."
                : "Selecciona la hora de tu cita"}
            </p>

            {citaEspecial ? (
              <div>
                <input type="date" value={fechaSel || ""} onChange={e => setFechaSel(e.target.value)} style={inputStyle} />
                <input type="time" value={horaSel || ""} onChange={e => setHoraSel(e.target.value)} style={inputStyle} />
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "1rem" }}>
                {horas.map(h => (
                  <div key={h.hora} onClick={() => h.disponibles > 0 && setHoraSel(h.hora)}
                    style={{
                      textAlign: "center", padding: "12px 8px", borderRadius: "8px", cursor: h.disponibles > 0 ? "pointer" : "not-allowed",
                      background: horaSel === h.hora ? "#10B981" : h.disponibles > 0 ? "#374151" : "#1F2937",
                      color: horaSel === h.hora ? "white" : h.disponibles > 0 ? "#F9FAFB" : "#4B5563",
                      border: `1px solid ${horaSel === h.hora ? "#10B981" : "transparent"}`,
                      opacity: h.disponibles === 0 ? 0.4 : 1,
                    }}>
                    <div style={{ fontWeight: "600", fontSize: "14px" }}>{h.hora}</div>
                    <div style={{ fontSize: "10px", color: horaSel === h.hora ? "white" : "#9CA3AF" }}>
                      {h.disponibles > 0 ? `${h.disponibles} cupos` : "Sin cupos"}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
              placeholder="¿Qué necesitas revisar? (opcional)" rows={3}
              style={{ width: "100%", marginBottom: "1rem", resize: "vertical" }} />

            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => { setPaso(citaEspecial ? 2 : 2); setCitaEspecial(false) }}
                style={{ ...estiloBtn(false), flex: 1 }}>← Volver</button>
              <button onClick={() => setPaso(4)} disabled={!horaSel || !fechaSel}
                style={{ ...estiloBtn(!!(horaSel && fechaSel)), flex: 2 }}>
                Revisar cita →
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 4 — Resumen antes de confirmar ── */}
        {paso === 4 && !citaCreada && (
          <div style={cardStyle}>
            <h2 style={{ color: "#F9FAFB", fontSize: "16px", fontWeight: "600", marginBottom: "1.25rem" }}>
              Confirma tu cita
            </h2>
            {[
              ["Cliente",   cliente?.nombre],
              ["Documento", cliente?.documento],
              ["Vehículo",  `${vehiculoSel?.placa} — ${vehiculoSel?.marca} ${vehiculoSel?.linea}`],
              ["Fecha",     fechaSel],
              ["Hora",      horaSel],
              ["Tipo",      citaEspecial ? "⚡ Especial (requiere aprobación)" : "✅ Normal"],
              ["Descripción", descripcion || "—"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0",
                borderBottom: "1px solid #374151", fontSize: "13px" }}>
                <span style={{ color: "#9CA3AF" }}>{k}</span>
                <span style={{ color: "#F9FAFB", fontWeight: "500", textAlign: "right", maxWidth: "60%" }}>{v}</span>
              </div>
            ))}

            <div style={{ marginTop: "1.25rem", display: "flex", gap: "8px" }}>
              <button onClick={() => setPaso(3)} style={{ ...estiloBtn(false), flex: 1 }}>← Editar</button>
              <button onClick={confirmarCita} disabled={loading} style={{ ...estiloBtn(true), flex: 2 }}>
                {loading ? "Agendando..." : citaEspecial ? "Enviar solicitud →" : "Confirmar cita →"}
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 5 — Cita creada ── */}
        {citaCreada && (
          <div style={{ ...cardStyle, textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "1rem" }}>
              {citaCreada.tipo === "especial" ? "⏳" : "✅"}
            </div>
            <h2 style={{ color: "#F9FAFB", fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>
              {citaCreada.tipo === "especial" ? "Solicitud enviada" : "¡Cita confirmada!"}
            </h2>
            <p style={{ color: "#9CA3AF", fontSize: "13px", marginBottom: "1.5rem" }}>
              {citaCreada.tipo === "especial"
                ? "Tu solicitud de cita especial fue recibida. El taller te contactará para confirmarla."
                : "Tu cita fue agendada exitosamente. Te esperamos puntual."}
            </p>
            <div style={{ background: "#111827", borderRadius: "8px", padding: "1rem", marginBottom: "1.5rem", textAlign: "left" }}>
              {[
                ["Fecha",    citaCreada.fecha],
                ["Hora",     citaCreada.hora?.slice(0,5)],
                ["Vehículo", vehiculoSel?.placa],
              ].map(([k,v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "4px 0" }}>
                  <span style={{ color: "#6B7280" }}>{k}</span>
                  <span style={{ color: "#F9FAFB", fontWeight: "600" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#065F46", borderRadius: "8px", padding: "1rem", fontSize: "12px", color: "#D1FAE5", textAlign: "left" }}>
              <strong>Recomendaciones para tu cita:</strong>
              <ul style={{ marginTop: "6px", paddingLeft: "16px", lineHeight: "1.8" }}>
                <li>Llega 5 minutos antes de tu hora</li>
                <li>Trae el vehículo limpio</li>
                <li>Tanque al menos a la mitad</li>
                <li>Trae los documentos del vehículo</li>
              </ul>
            </div>
            <button onClick={() => window.location.reload()}
              style={{ ...estiloBtn(false), marginTop: "1rem", width: "100%" }}>
              Agendar otra cita
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
