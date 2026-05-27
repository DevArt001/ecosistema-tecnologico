import { useState, useEffect } from "react"
import API from "../services/api"

const ROLES = [
  { value: "admin",        label: "Administrador", color: "#10B981" },
  { value: "contabilidad", label: "Contabilidad",  color: "#3B82F6" },
  { value: "tecnico",      label: "Técnico",        color: "#F59E0B" },
]

const MODULOS = [
  { value: "dashboard",    label: "Dashboard",    icon: "⊞" },
  { value: "clientes",     label: "Clientes",     icon: "👥" },
  { value: "vehiculos",    label: "Vehículos",    icon: "🏍" },
  { value: "ordenes",      label: "Órdenes",      icon: "🔧" },
  { value: "inventario",   label: "Inventario",   icon: "📦" },
  { value: "cotizaciones", label: "Cotizaciones", icon: "📋" },
  { value: "facturas",     label: "Facturas",     icon: "💰" },
  { value: "agendamiento", label: "Agendamiento", icon: "📅" },
  { value: "gastos",       label: "Gastos",       icon: "📤" },
  { value: "reportes",     label: "Reportes",     icon: "📊" },
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
  const [permisos, setPermisos]     = useState([])
  const [nuevaClave, setNuevaClave] = useState("")
  const [editForm, setEditForm]     = useState({})
  const [formNuevo, setFormNuevo]   = useState({
    username: "", first_name: "", last_name: "",
    email: "", password: "", rol: "tecnico", telefono: ""
  })
  const [loading, setLoading]       = useState(false)
  const [modal2FA, setModal2FA]     = useState(false)
  const [qrCode, setQrCode]         = useState(null)
  const [codigo2FA, setCodigo2FA]   = useState("")
  const [estado2FA, setEstado2FA]   = useState(false)
  const [paso2FA, setPaso2FA]       = useState(1)
  const [mensaje, setMensaje]       = useState("")

  useEffect(() => { cargar(); cargar2FAStatus() }, [])

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

  const crearUsuario = async () => {
    if (!formNuevo.username || !formNuevo.password) {
      mostrarMensaje("❌ Usuario y contraseña son obligatorios")
      return
    }
    setLoading(true)
    try {
      await API.post("/usuarios/", formNuevo)
      mostrarMensaje("✅ Usuario creado")
      setModal(null)
      cargar()
    } catch (e) {
      mostrarMensaje("❌ " + (e.response?.data?.username?.[0] || "Error al crear"))
    }
    setLoading(false)
  }

  const guardarEdicion = async () => {
    setLoading(true)
    try {
      await API.patch(`/usuarios/${userActual.id}/`, editForm)
      mostrarMensaje("✅ Usuario actualizado")
      setModal(null)
      cargar()
    } catch { mostrarMensaje("❌ Error al actualizar") }
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
      mostrarMensaje("❌ Mínimo 4 caracteres")
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

  const cargar2FAStatus = async () => {
    try {
      const r = await API.get("/usuarios/2fa/status/")
      setEstado2FA(r.data.tiene_2fa)
    } catch {}
  }

  const iniciarSetup2FA = async () => {
    try {
      const r = await API.get("/usuarios/2fa/setup/")
      setQrCode(r.data.qr_code)
      setPaso2FA(1)
      setModal2FA(true)
      cargar2FAStatus()
    } catch { mostrarMensaje("❌ Error al configurar 2FA") }
  }

  const verificar2FA = async () => {
    if (!codigo2FA || codigo2FA.length !== 6) {
      mostrarMensaje("❌ Ingresa el código de 6 dígitos")
      return
    }
    setLoading(true)
    try {
      await API.post("/usuarios/2fa/verify/", { code: codigo2FA })
      mostrarMensaje("✅ 2FA activado correctamente")
      setModal2FA(false)
      setCodigo2FA("")
      setEstado2FA(true)
    } catch { mostrarMensaje("❌ Código incorrecto") }
    setLoading(false)
  }

  const desactivar2FA = async () => {
    if (!window.confirm("¿Desactivar el 2FA? Esto reduce la seguridad de tu cuenta.")) return
    try {
      await API.post("/usuarios/2fa/disable/")
      mostrarMensaje("✅ 2FA desactivado")
      setEstado2FA(false)
    } catch { mostrarMensaje("❌ Error al desactivar 2FA") }
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
            {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""} registrado{usuarios.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={estado2FA ? desactivar2FA : iniciarSetup2FA} style={{
            background: estado2FA ? "#065F46" : "#1F2937",
            border: `1px solid ${estado2FA ? "#10B981" : "#374151"}`,
            color: estado2FA ? "#10B981" : "#F59E0B",
            borderRadius: "8px", padding: "8px 14px",
            fontSize: "12px", cursor: "pointer"
          }}>
            {estado2FA ? "🔐 2FA Activo" : "🔓 Activar 2FA"}
          </button>
          <button className="btn btn-primary" onClick={() => {
            setFormNuevo({ username: "", first_name: "", last_name: "",
              email: "", password: "", rol: "tecnico", telefono: "" })
            setModal("nuevo")
          }}>+ Nuevo usuario</button>
        </div>
      </div>

      {/* Tarjetas individuales — una por fila */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {usuarios.map(u => {
          const rol   = u.perfil?.rol || "tecnico"
          const color = rolColor[rol] || "#F59E0B"
          const rolLabel = ROLES.find(r => r.value === rol)?.label || rol
          const inicial = (u.first_name || u.username)[0]?.toUpperCase()
          const modCount = u.perfil?.permisos?.length || 0

          return (
            <div key={u.id} style={{
              background: "var(--bg2)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)", overflow: "hidden"
            }}>
              {/* Barra de color superior */}
              <div style={{ height: "4px", background: color }} />

              <div style={{ padding: "1.5rem", display: "flex",
                alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>

                {/* Avatar */}
                <div style={{
                  width: "56px", height: "56px", borderRadius: "50%",
                  background: color + "22", border: `2px solid ${color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px", fontWeight: "700", color, flexShrink: 0
                }}>{inicial}</div>

                {/* Info principal */}
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px",
                    marginBottom: "4px" }}>
                    <span style={{ fontSize: "18px", fontWeight: "700", color: "var(--text)" }}>
                      {u.first_name ? `${u.first_name} ${u.last_name}` : u.username}
                    </span>
                    <span style={{
                      background: color + "22", color,
                      padding: "3px 10px", borderRadius: "20px",
                      fontSize: "11px", fontWeight: "700",
                      textTransform: "uppercase", letterSpacing: ".06em"
                    }}>{rolLabel}</span>
                    <span style={{
                      background: u.is_active ? "#065F4622" : "#3B0A0A",
                      color: u.is_active ? "#10B981" : "#EF4444",
                      padding: "3px 10px", borderRadius: "20px", fontSize: "11px"
                    }}>{u.is_active ? "Activo" : "Inactivo"}</span>
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text3)", fontFamily: "monospace" }}>
                    @{u.username}
                    {u.email && <span style={{ marginLeft: "12px" }}>· {u.email}</span>}
                  </div>
                </div>

                {/* Módulos y rol */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem",
                  flexShrink: 0 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "22px", fontWeight: "700", color }}>
                      {modCount}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text3)" }}>módulos</div>
                  </div>


                </div>

                {/* Acciones */}
                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <button onClick={() => {
                    setUserActual(u)
                    setEditForm({
                      username:   u.username   || "",
                      first_name: u.first_name || "",
                      last_name:  u.last_name  || "",
                      email:      u.email      || "",
                    })
                    setModal("editar")
                  }} style={{
                    background: "#1F2937", border: "1px solid #374151",
                    color: "#9CA3AF", borderRadius: "8px",
                    padding: "8px 14px", fontSize: "12px", cursor: "pointer"
                  }}>✏️ Editar</button>

                  <button onClick={() => {
                    setUserActual(u)
                    setPermisos(u.perfil?.permisos || [])
                    setModal("permisos")
                  }} style={{
                    background: "#1E3A5F", border: "1px solid #3B82F6",
                    color: "#3B82F6", borderRadius: "8px",
                    padding: "8px 14px", fontSize: "12px", cursor: "pointer"
                  }}>🔐 Permisos</button>

                  <button onClick={() => {
                    setUserActual(u)
                    setNuevaClave("")
                    setModal("clave")
                  }} style={{
                    background: "#1F2937", border: "1px solid #374151",
                    color: "#F59E0B", borderRadius: "8px",
                    padding: "8px 14px", fontSize: "12px", cursor: "pointer"
                  }}>🔑 Contraseña</button>
                </div>
              </div>

              {/* Módulos activos */}
              {u.perfil?.permisos?.length > 0 && (
                <div style={{ padding: "0.75rem 1.5rem 1rem",
                  borderTop: "1px solid var(--border)",
                  display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {MODULOS.filter(m => u.perfil.permisos.includes(m.value)).map(m => (
                    <span key={m.value} style={{
                      background: "var(--bg1)", border: "1px solid var(--border)",
                      color: "var(--text2)", padding: "3px 10px",
                      borderRadius: "20px", fontSize: "11px"
                    }}>{m.icon} {m.label}</span>
                  ))}
                </div>
              )}
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
                  <input type={f.type || "text"} value={formNuevo[f.name]}
                    onChange={e => setFormNuevo({...formNuevo, [f.name]: e.target.value})}
                    style={{ width: "100%" }} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>
                Rol inicial
              </label>
              <select value={formNuevo.rol}
                onChange={e => setFormNuevo({...formNuevo, rol: e.target.value})}
                style={{ width: "100%" }}>
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

      {/* Modal editar */}
      {modal === "editar" && userActual && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "1.5rem",
            width: "100%", maxWidth: "440px" }}>
            <h2 style={{ marginBottom: "4px", color: "var(--text)", fontSize: "18px" }}>
              Editar usuario
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "1.5rem" }}>
              @{userActual.username}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem",
              marginBottom: "1.5rem" }}>
              {[
                { name: "username",   label: "Usuario *", full: true },
                { name: "first_name", label: "Nombre" },
                { name: "last_name",  label: "Apellido" },
                { name: "email",      label: "Correo", type: "email", full: true },
              ].map(f => (
                <div key={f.name} style={{ gridColumn: f.full ? "1 / -1" : "auto" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600",
                    color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase" }}>
                    {f.label}
                  </label>
                  <input type={f.type || "text"} value={editForm[f.name] || ""}
                    onChange={e => setEditForm({...editForm, [f.name]: e.target.value})}
                    style={{ width: "100%" }} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-primary" onClick={guardarEdicion}
                disabled={loading} style={{ flex: 1 }}>
                {loading ? "Guardando..." : "Guardar cambios"}
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
            width: "100%", maxWidth: "460px" }}>
            <h2 style={{ marginBottom: "4px", color: "var(--text)", fontSize: "18px" }}>
              Permisos — @{userActual.username}
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "1.5rem" }}>
              Selecciona los módulos accesibles
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: "8px", marginBottom: "1.5rem" }}>
              {MODULOS.map(m => (
                <label key={m.value} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "10px 12px", borderRadius: "8px", cursor: "pointer",
                  background: permisos.includes(m.value) ? "#065F4633" : "var(--bg1)",
                  border: `1px solid ${permisos.includes(m.value) ? "#10B981" : "var(--border)"}`,
                  fontSize: "13px",
                  color: permisos.includes(m.value) ? "#10B981" : "var(--text2)"
                }}>
                  <input type="checkbox" checked={permisos.includes(m.value)}
                    onChange={() => togglePermiso(m.value)}
                    style={{ width: "14px", height: "14px" }} />
                  {m.icon} {m.label}
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

      {/* Modal contraseña */}
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
                onKeyDown={e => e.key === "Enter" && cambiarContrasena()}
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
    {/* Modal 2FA */}
      {modal2FA && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "1rem" }}>
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)", padding: "1.5rem",
            width: "100%", maxWidth: "420px" }}>
            <h2 style={{ marginBottom: "4px", color: "var(--text)", fontSize: "18px" }}>
              Activar 2FA
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "1.5rem" }}>
              Doble factor de autenticacion con Google Authenticator
            </p>
            {paso2FA === 1 && qrCode && (
              <>
                <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                  <img src={qrCode} alt="QR 2FA"
                    style={{ width: "200px", height: "200px", borderRadius: "8px" }} />
                </div>
                <p style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "1rem", textAlign: "center" }}>
                  Escanea este QR con Google Authenticator
                </p>
                <button className="btn btn-primary" onClick={() => setPaso2FA(2)}
                  style={{ width: "100%" }}>
                  Ya escanee el QR →
                </button>
              </>
            )}
            {paso2FA === 2 && (
              <>
                <p style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "1rem" }}>
                  Ingresa el codigo de 6 digitos que muestra Google Authenticator:
                </p>
                <input
                  type="text"
                  value={codigo2FA}
                  onChange={e => setCodigo2FA(e.target.value.replace(/\D/g,'').slice(0,6))}
                  placeholder="123456"
                  maxLength={6}
                  style={{ width: "100%", textAlign: "center", fontSize: "24px",
                    letterSpacing: "8px", marginBottom: "1.5rem" }}
                />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn btn-primary" onClick={verificar2FA}
                    disabled={loading} style={{ flex: 1 }}>
                    {loading ? "Verificando..." : "Activar 2FA"}
                  </button>
                  <button className="btn btn-secondary" onClick={() => setModal2FA(false)}>
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
