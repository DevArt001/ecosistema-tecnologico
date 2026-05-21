import { useState, useEffect } from "react"
import API from "../services/api"

const ROLES = [
  { value: "admin",        label: "Administrador", color: "#10B981" },
  { value: "contabilidad", label: "Contabilidad",  color: "#3B82F6" },
  { value: "tecnico",      label: "Técnico",        color: "#F59E0B" },
]

const MODULOS = [
  { value: "dashboard",    label: "Dashboard" },
  { value: "clientes",     label: "Clientes" },
  { value: "vehiculos",    label: "Vehículos" },
  { value: "ordenes",      label: "Órdenes" },
  { value: "inventario",   label: "Inventario" },
  { value: "cotizaciones", label: "Cotizaciones" },
  { value: "facturas",     label: "Facturas" },
  { value: "agendamiento", label: "Agendamiento" },
  { value: "gastos",       label: "Gastos" },
  { value: "reportes",     label: "Reportes" },
]

const PERMISOS_POR_ROL = {
  admin:        MODULOS.map(m => m.value),
  contabilidad: ["dashboard", "cotizaciones", "facturas", "reportes", "gastos"],
  tecnico:      ["dashboard", "ordenes"],
}

const rolColor = { admin: "#10B981", contabilidad: "#3B82F6", tecnico: "#F59E0B" }

export default function Usuarios() {
  const [usuarios, setUsuarios]     = useState([])
  const [modal, setModal]           = useState(null)
  const [userActual, setUserActual] = useState(null)
  const [form, setForm]             = useState({
    username: "", first_name: "", last_name: "",
    email: "", password: "", rol: "tecnico", telefono: ""
  })
  const [permisos, setPermisos]     = useState([])
  const [nuevaClave, setNuevaClave] = useState("")
  const [loading, setLoading]       = useState(false)
  const [mensaje, setMensaje]       = useState("")

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    try {
      const res = await API.get("/usuarios/")
      setUsuarios(res.data.results || res.data)
    } catch { mostrarMensaje("❌ Error al cargar usuarios") }
  }

  const mostrarMensaje = (msg) => {
    setMensaje(msg)
    setTimeout(() => setMensaje(""), 3000)
  }

  const abrirNuevo = () => {
    setForm({ username: "", first_name: "", last_name: "",
      email: "", password: "", rol: "tecnico", telefono: "" })
    setPermisos(PERMISOS_POR_ROL["tecnico"])
    setModal("nuevo")
  }

  const crearUsuario = async () => {
    if (!form.username || !form.password) {
      mostrarMensaje("❌ Usuario y contraseña son obligatorios")
      return
    }
    setLoading(true)
    try {
      await API.post("/usuarios/", { ...form })
      mostrarMensaje("✅ Usuario creado")
      setModal(null)
      cargar()
    } catch (e) {
      mostrarMensaje("❌ Error: " + (e.response?.data?.username?.[0] || "Usuario ya existe"))
    }
    setLoading(false)
  }

  const cambiarRol = async (userId, rol) => {
    try {
      await API.patch(`/usuarios/${userId}/cambiar_rol/`, { rol })
      mostrarMensaje("✅ Rol actualizado")
      cargar()
    } catch { mostrarMensaje("❌ Error al cambiar rol") }
  }

  const guardarPermisos = async () => {
    try {
      await API.patch(`/usuarios/${userActual.id}/cambiar_permisos/`, { permisos })
      mostrarMensaje("✅ Permisos actualizados")
      setModal(null)
      cargar()
    } catch { mostrarMensaje("❌ Error al guardar permisos") }
  }

  const cambiarContrasena = async () => {
    if (!nuevaClave || nuevaClave.length < 4) {
      mostrarMensaje("❌ La contraseña debe tener al menos 4 caracteres")
      return
    }
    setLoading(true)
    try {
      await API.patch(`/usuarios/${userActual.id}/`, { password: nuevaClave })
      mostrarMensaje("✅ Contraseña actualizada")
      setModal(null)
      setNuevaClave("")
    } catch { mostrarMensaje("❌ Error al cambiar contraseña") }
    setLoading(false)
  }

  const togglePermiso = (modulo) => {
    setPermisos(prev =>
      prev.includes(modulo) ? prev.filter(p => p !== modulo) : [...prev, modulo]
    )
  }

  return (
    <div>
      {mensaje && (
        <div style={{
          position: "fixed", top: "1rem", right: "1rem", zIndex: 9999,
          background: mensaje.startsWith("✅") ? "#065F46" : "#3B0A0A",
          border: `1px solid ${mensaje.startsWith("✅") ? "#10B981" : "#EF4444"}`,
          color: "white", borderRadius: "8px", padding: "12px 20px", fontSize: "13px"
        }}>{mensaje}</div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700",
            color: "var(--text)", marginBottom: "4px" }}>Usuarios</h1>
          <p style={{ color: "var(--text3)", fontSize: "13px" }}>
            {usuarios.length} usuarios registrados
          </p>
        </div>
        <button className="btn btn-primary" onClick={abrirNuevo}>
          + Nuevo usuario
        </button>
      </div>

      {/* Tarjetas de usuarios */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "1rem", marginBottom: "1.5rem" }}>
        {usuarios.map(u => {
          const rol = u.perfil?.rol || "tecnico"
          const color = rolColor[rol] || "#F59E0B"
          const inicial = (u.first_name || u.username)[0]?.toUpperCase()
          return (
            <div key={u.id} style={{
              background: "var(--bg2)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)", overflow: "hidden"
            }}>
              {/* Header tarjeta */}
              <div style={{
                padding: "1.25rem", borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "center", gap: "12px"
              }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "50%",
                  background: color + "22", border: `2px solid ${color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px", fontWeight: "700", color, flexShrink: 0
                }}>{inicial}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: "600", color: "var(--text)",
                    fontSize: "15px" }}>
                    {u.first_name ? `${u.first_name} ${u.last_name}` : u.username}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text3)",
                    fontFamily: "monospace" }}>@{u.username}</div>
                </div>
                <span style={{
                  background: color + "22", color,
                  padding: "4px 10px", borderRadius: "20px",
                  fontSize: "11px", fontWeight: "700",
                  textTransform: "uppercase", letterSpacing: ".06em",
                  flexShrink: 0
                }}>{rol}</span>
              </div>

              {/* Info */}
              <div style={{ padding: "1rem 1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between",
                  marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text3)" }}>Módulos</span>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text)" }}>
                    {u.perfil?.permisos?.length || 0} módulos
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between",
                  marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text3)" }}>Estado</span>
                  <span style={{
                    fontSize: "11px", fontWeight: "600",
                    color: u.is_active ? "#10B981" : "#EF4444"
                  }}>{u.is_active ? "● Activo" : "● Inactivo"}</span>
                </div>
                {u.email && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "var(--text3)" }}>Correo</span>
                    <span style={{ fontSize: "12px", color: "var(--text2)" }}>{u.email}</span>
                  </div>
                )}
              </div>

              {/* Cambiar rol */}
              <div style={{ padding: "0 1.25rem 0.75rem" }}>
                <label style={{ fontSize: "11px", color: "var(--text3)",
                  display: "block", marginBottom: "4px", textTransform: "uppercase",
                  letterSpacing: ".06em" }}>Rol</label>
                <select value={rol} onChange={e => cambiarRol(u.id, e.target.value)}
                  style={{ width: "100%" }}>
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Acciones */}
              <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid var(--border)",
                display: "flex", gap: "8px" }}>
                <button onClick={() => {
                  setUserActual(u)
                  setPermisos(u.perfil?.permisos || [])
                  setModal("permisos")
                }} style={{
                  flex: 1, background: "#1E3A5F", border: "1px solid #3B82F6",
                  color: "#3B82F6", borderRadius: "6px",
                  padding: "6px", fontSize: "12px", cursor: "pointer"
                }}>🔐 Permisos</button>
                <button onClick={() => {
                  setUserActual(u)
                  setNuevaClave("")
                  setModal("clave")
                }} style={{
                  flex: 1, background: "#1F2937", border: "1px solid #374151",
                  color: "#9CA3AF", borderRadius: "6px",
                  padding: "6px", fontSize: "12px", cursor: "pointer"
                }}>🔑 Contraseña</button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal nuevo usuario */}
      {modal === "nuevo" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "1.5rem",
            width: "100%", maxWidth: "500px" }}>
            <h2 style={{ marginBottom: "1.5rem", color: "var(--text)", fontSize: "18px" }}>
              Nuevo usuario
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {[
                { name: "username",   label: "Usuario *" },
                { name: "password",   label: "Contraseña *", type: "password" },
                { name: "first_name", label: "Nombre" },
                { name: "last_name",  label: "Apellido" },
                { name: "email",      label: "Correo", type: "email" },
                { name: "telefono",   label: "Teléfono" },
              ].map(f => (
                <div key={f.name}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                    color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>
                    {f.label}
                  </label>
                  <input type={f.type || "text"} value={form[f.name]}
                    onChange={e => setForm({...form, [f.name]: e.target.value})}
                    style={{ width: "100%" }} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>
                Rol
              </label>
              <select value={form.rol}
                onChange={e => {
                  setForm({...form, rol: e.target.value})
                  setPermisos(PERMISOS_POR_ROL[e.target.value] || ["dashboard"])
                }} style={{ width: "100%" }}>
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-primary" onClick={crearUsuario}
                disabled={loading} style={{ flex: 1 }}>
                {loading ? "Creando..." : "Crear usuario"}
              </button>
              <button className="btn btn-secondary" onClick={() => setModal(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal permisos */}
      {modal === "permisos" && userActual && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "1.5rem",
            width: "100%", maxWidth: "440px" }}>
            <h2 style={{ marginBottom: "4px", color: "var(--text)", fontSize: "18px" }}>
              Permisos — @{userActual.username}
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "1.5rem" }}>
              Módulos accesibles para este usuario
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: "8px", marginBottom: "1.5rem" }}>
              {MODULOS.map(m => (
                <label key={m.value} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "8px 12px", borderRadius: "8px", cursor: "pointer",
                  background: permisos.includes(m.value) ? "#065F4633" : "var(--bg1)",
                  border: `1px solid ${permisos.includes(m.value) ? "#10B981" : "var(--border)"}`,
                  fontSize: "13px",
                  color: permisos.includes(m.value) ? "#10B981" : "var(--text2)"
                }}>
                  <input type="checkbox" checked={permisos.includes(m.value)}
                    onChange={() => togglePermiso(m.value)}
                    style={{ width: "14px", height: "14px" }} />
                  {m.label}
                </label>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-primary" onClick={guardarPermisos} style={{ flex: 1 }}>
                Guardar permisos
              </button>
              <button className="btn btn-secondary" onClick={() => setModal(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal cambiar contraseña */}
      {modal === "clave" && userActual && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "1.5rem",
            width: "100%", maxWidth: "380px" }}>
            <h2 style={{ marginBottom: "4px", color: "var(--text)", fontSize: "18px" }}>
              Cambiar contraseña
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "1.5rem" }}>
              @{userActual.username}
            </p>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>
                Nueva contraseña
              </label>
              <input type="password" value={nuevaClave}
                onChange={e => setNuevaClave(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                style={{ width: "100%" }} />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-primary" onClick={cambiarContrasena}
                disabled={loading} style={{ flex: 1 }}>
                {loading ? "Guardando..." : "Cambiar contraseña"}
              </button>
              <button className="btn btn-secondary" onClick={() => setModal(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
