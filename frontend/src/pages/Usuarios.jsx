import { useState, useEffect } from "react"
import API from "../services/api"
import { PageHeader, Toast, ConfirmModal, EmptyState, KPICard,
         TableSkeleton, ModalForm, Field } from "../components/UI"

const ROLES = [
  { value: "admin",        label: "Administrador", color: "#E8213A", icon: "👑" },
  { value: "contabilidad", label: "Contabilidad",  color: "#F5A623", icon: "💼" },
  { value: "tecnico",      label: "Técnico",       color: "#1E5FD4", icon: "🔧" },
]

const MODULOS_DISPONIBLES = [
  { value: "dashboard",    label: "Dashboard" },
  { value: "clientes",     label: "Clientes" },
  { value: "vehiculos",    label: "Vehículos" },
  { value: "ordenes",      label: "Órdenes" },
  { value: "inventario",   label: "Inventario" },
  { value: "cotizaciones", label: "Cotizaciones" },
  { value: "facturas",     label: "Facturas" },
  { value: "agendamiento", label: "Agendamiento" },
  { value: "reportes",     label: "Reportes" },
  { value: "gastos",       label: "Gastos" },
]

export default function Usuarios() {
  const [usuarios, setUsuarios]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(null)
  const [modalPermisos, setModalPermisos] = useState(null)
  const [modalPass, setModalPass] = useState(null)
  const [modal2FA, setModal2FA]   = useState(false)
  const [qrCode, setQrCode]       = useState(null)
  const [codigo2FA, setCodigo2FA] = useState("")
  const [paso2FA, setPaso2FA]     = useState(1)
  const [estado2FA, setEstado2FA] = useState(false)
  const [mensaje, setMensaje]     = useState("")
  const [guardando, setGuardando] = useState(false)
  const [formNuevo, setFormNuevo] = useState({
    username:"", password:"", first_name:"", last_name:"",
    email:"", telefono:"", rol:"tecnico"
  })
  const [formPass, setFormPass]   = useState({ password:"", confirmar:"" })
  const [permisosEdit, setPermisosEdit] = useState([])

  useEffect(() => { cargar(); cargar2FAStatus() }, [])

  const cargar = async () => {
    setLoading(true)
    try {
      const r = await API.get("/usuarios/")
      setUsuarios(r.data.results || r.data)
    } catch { mostrar("❌ Error al cargar") }
    setLoading(false)
  }

  const cargar2FAStatus = async () => {
    try {
      const r = await API.get("/usuarios/2fa/status/")
      setEstado2FA(r.data.tiene_2fa)
    } catch {}
  }

  const mostrar = (msg) => { setMensaje(msg); setTimeout(() => setMensaje(""), 3000) }

  const crearUsuario = async () => {
    if (!formNuevo.username || !formNuevo.password) {
      mostrar("❌ Usuario y contraseña son obligatorios")
      return
    }
    setGuardando(true)
    try {
      await API.post("/usuarios/", formNuevo)
      mostrar("✅ Usuario creado")
      setModal(null)
      cargar()
    } catch(e) {
      mostrar("❌ " + (e.response?.data?.username?.[0] || "Error al crear"))
    }
    setGuardando(false)
  }

  const cambiarContrasena = async () => {
    if (!formPass.password || formPass.password !== formPass.confirmar) {
      mostrar("❌ Las contraseñas no coinciden")
      return
    }
    setGuardando(true)
    try {
      await API.patch(`/usuarios/${modalPass.id}/`, { password: formPass.password })
      mostrar("✅ Contraseña actualizada")
      setModalPass(null)
      setFormPass({ password:"", confirmar:"" })
    } catch { mostrar("❌ Error al cambiar contraseña") }
    setGuardando(false)
  }

  const guardarPermisos = async () => {
    try {
      await API.patch(`/usuarios/${modalPermisos.id}/cambiar_permisos/`,
        { permisos: permisosEdit })
      mostrar("✅ Permisos actualizados")
      setModalPermisos(null)
      cargar()
    } catch { mostrar("❌ Error") }
  }

  const togglePermiso = (mod) => {
    setPermisosEdit(prev =>
      prev.includes(mod) ? prev.filter(p => p !== mod) : [...prev, mod]
    )
  }

  const iniciarSetup2FA = async () => {
    try {
      const r = await API.get("/usuarios/2fa/setup/")
      setQrCode(r.data.qr_code)
      setPaso2FA(1)
      setModal2FA(true)
    } catch { mostrar("❌ Error al configurar 2FA") }
  }

  const verificar2FA = async () => {
    if (!codigo2FA || codigo2FA.length !== 6) {
      mostrar("❌ Ingresa el código de 6 dígitos")
      return
    }
    try {
      await API.post("/usuarios/2fa/verify/", { code: codigo2FA })
      mostrar("✅ 2FA activado")
      setModal2FA(false)
      setCodigo2FA("")
      setEstado2FA(true)
    } catch { mostrar("❌ Código incorrecto") }
  }

  const desactivar2FA = async () => {
    if (!window.confirm("¿Desactivar el 2FA?")) return
    try {
      await API.post("/usuarios/2fa/disable/")
      mostrar("✅ 2FA desactivado")
      setEstado2FA(false)
    } catch { mostrar("❌ Error") }
  }

  return (
    <div>
      <Toast mensaje={mensaje} />

      {/* Modal nuevo usuario */}
      {modal !== null && (
        <ModalForm titulo="Nuevo usuario" onClose={() => setModal(null)}
          onGuardar={crearUsuario} loading={guardando}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Usuario *" style={{ gridColumn: "1/-1" }}>
              <input value={formNuevo.username}
                onChange={e => setFormNuevo({...formNuevo, username: e.target.value})}
                placeholder="nombre_usuario" autoComplete="off" />
            </Field>
            <Field label="Contraseña *" style={{ gridColumn: "1/-1" }}>
              <input type="password" value={formNuevo.password}
                onChange={e => setFormNuevo({...formNuevo, password: e.target.value})}
                placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
            </Field>
            <Field label="Nombre">
              <input value={formNuevo.first_name}
                onChange={e => setFormNuevo({...formNuevo, first_name: e.target.value})}
                placeholder="Nombre" />
            </Field>
            <Field label="Apellido">
              <input value={formNuevo.last_name}
                onChange={e => setFormNuevo({...formNuevo, last_name: e.target.value})}
                placeholder="Apellido" />
            </Field>
            <Field label="Correo">
              <input value={formNuevo.email}
                onChange={e => setFormNuevo({...formNuevo, email: e.target.value})}
                placeholder="correo@ejemplo.com" />
            </Field>
            <Field label="Teléfono">
              <input value={formNuevo.telefono}
                onChange={e => setFormNuevo({...formNuevo, telefono: e.target.value})}
                placeholder="3001234567" />
            </Field>
            <Field label="Rol inicial" style={{ gridColumn: "1/-1" }}>
              <select value={formNuevo.rol}
                onChange={e => setFormNuevo({...formNuevo, rol: e.target.value})}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.icon} {r.label}</option>)}
              </select>
            </Field>
          </div>
        </ModalForm>
      )}

      {/* Modal cambiar contraseña */}
      {modalPass && (
        <ModalForm titulo={`Cambiar contraseña — @${modalPass.username}`}
          onClose={() => setModalPass(null)} onGuardar={cambiarContrasena} loading={guardando}>
          <Field label="Nueva contraseña">
            <input type="password" value={formPass.password}
              onChange={e => setFormPass({...formPass, password: e.target.value})}
              placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
          </Field>
          <Field label="Confirmar contraseña">
            <input type="password" value={formPass.confirmar}
              onChange={e => setFormPass({...formPass, confirmar: e.target.value})}
              placeholder="Repite la contraseña" autoComplete="new-password" />
          </Field>
        </ModalForm>
      )}

      {/* Modal permisos */}
      {modalPermisos && (
        <ModalForm titulo={`Permisos — @${modalPermisos.username}`}
          onClose={() => setModalPermisos(null)} onGuardar={guardarPermisos}>
          <p style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "1rem" }}>
            Selecciona los módulos a los que tendrá acceso este usuario.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {MODULOS_DISPONIBLES.map(m => (
              <label key={m.value} style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "8px 12px", borderRadius: "8px", cursor: "pointer",
                background: permisosEdit.includes(m.value) ? "rgba(232,33,58,.08)" : "var(--bg3)",
                border: `1px solid ${permisosEdit.includes(m.value) ? "rgba(232,33,58,.3)" : "var(--border)"}`,
                transition: "all .15s",
              }}>
                <input type="checkbox"
                  checked={permisosEdit.includes(m.value)}
                  onChange={() => togglePermiso(m.value)}
                  style={{ width: "auto", accentColor: "var(--red)" }} />
                <span style={{ fontSize: "13px", color: "var(--text2)" }}>{m.label}</span>
              </label>
            ))}
          </div>
        </ModalForm>
      )}

      {/* Modal 2FA */}
      {modal2FA && (
        <div className="modal-overlay">
          <div className="modal-box scale-in" style={{ maxWidth: "380px" }}>
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ color: "var(--text)" }}>Activar 2FA</h2>
              <button onClick={() => setModal2FA(false)} style={{
                background: "none", border: "none", color: "var(--text3)",
                fontSize: "22px", cursor: "pointer" }}>×</button>
            </div>
            {paso2FA === 1 && qrCode && (
              <>
                <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                  <div style={{ background: "white", padding: "12px",
                    borderRadius: "12px", display: "inline-block",
                    boxShadow: "0 0 20px rgba(232,33,58,.15)" }}>
                    <img src={qrCode} alt="QR 2FA"
                      style={{ width: "180px", height: "180px", display: "block" }} />
                  </div>
                </div>
                <p style={{ fontSize: "13px", color: "var(--text3)", textAlign: "center",
                  marginBottom: "1.5rem" }}>
                  Escanea este QR con <strong style={{ color: "var(--text)" }}>Google Authenticator</strong>
                </p>
                <button className="btn btn-primary" onClick={() => setPaso2FA(2)}
                  style={{ width: "100%" }}>Ya escaneé el QR →</button>
              </>
            )}
            {paso2FA === 2 && (
              <>
                <p style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "1rem",
                  textAlign: "center" }}>
                  Ingresa el código de 6 dígitos de Google Authenticator
                </p>
                <input type="text" value={codigo2FA}
                  onChange={e => setCodigo2FA(e.target.value.replace(/\D/g,'').slice(0,6))}
                  placeholder="000000" maxLength={6} autoComplete="off"
                  style={{ textAlign: "center", fontSize: "28px",
                    letterSpacing: "12px", fontFamily: "var(--font-mono)",
                    fontWeight: "600", marginBottom: "1.25rem" }} />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="btn btn-primary" onClick={verificar2FA} style={{ flex: 1 }}>
                    Activar 2FA
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

      <PageHeader titulo="Usuarios" sub={`${usuarios.length} usuarios registrados`}>
        <button onClick={estado2FA ? desactivar2FA : iniciarSetup2FA} style={{
          background: estado2FA ? "rgba(0,212,160,.08)" : "rgba(245,166,35,.08)",
          border: `1px solid ${estado2FA ? "rgba(0,212,160,.3)" : "rgba(245,166,35,.3)"}`,
          color: estado2FA ? "#00D4A0" : "#F5A623",
          borderRadius: "8px", padding: "8px 14px",
          fontSize: "13px", cursor: "pointer", fontWeight: "500",
          fontFamily: "var(--font)"
        }}>
          {estado2FA ? "🔐 2FA Activo" : "🔓 Activar 2FA"}
        </button>
        <button className="btn btn-primary" onClick={() => {
          setFormNuevo({ username:"", password:"", first_name:"", last_name:"",
            email:"", telefono:"", rol:"tecnico" })
          setModal({})
        }}>+ Nuevo usuario</button>
      </PageHeader>

      {/* KPIs */}
      <div className="stagger" style={{ display: "flex", gap: "1rem",
        flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <KPICard titulo="Total usuarios" valor={usuarios.length}
          color="#1E5FD4" icon="👥" delay={0} />
        {ROLES.map((r, i) => (
          <KPICard key={r.value}
            titulo={r.label}
            valor={usuarios.filter(u => u.perfil?.rol === r.value).length}
            color={r.color} icon={r.icon} delay={(i+1) * .04} />
        ))}
      </div>

      {/* Tarjetas de usuarios */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {loading ? (
          <div className="card" style={{ padding: "2rem", textAlign: "center",
            color: "var(--text3)" }}>Cargando...</div>
        ) : usuarios.length === 0 ? (
          <div className="card">
            <EmptyState icon="👤" titulo="Sin usuarios" sub="Crea el primer usuario" />
          </div>
        ) : usuarios.map((u, idx) => {
          const rol = ROLES.find(r => r.value === u.perfil?.rol) || ROLES[2]
          const modCount = u.perfil?.permisos?.length || 0
          const nombre = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username

          return (
            <div key={u.id} className="card fade-in card-hover" style={{
              animationDelay: `${idx * .05}s`,
              borderLeft: `3px solid ${rol.color}`,
            }}>
              <div style={{ padding: "1.25rem", display: "flex",
                alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>

                {/* Avatar */}
                <div style={{
                  width: "46px", height: "46px", borderRadius: "12px",
                  background: `${rol.color}15`,
                  border: `2px solid ${rol.color}35`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px", fontWeight: "800", color: rol.color,
                  flexShrink: 0, fontFamily: "var(--font-mono)",
                }}>
                  {u.username[0]?.toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: "150px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px",
                    flexWrap: "wrap" }}>
                    <span style={{ fontWeight: "700", color: "var(--text)", fontSize: "15px" }}>
                      {nombre}
                    </span>
                    <span style={{ background: `${rol.color}15`, color: rol.color,
                      padding: "2px 10px", borderRadius: "20px",
                      fontSize: "10px", fontWeight: "700",
                      textTransform: "uppercase", letterSpacing: ".06em" }}>
                      {rol.icon} {rol.label}
                    </span>
                    <span style={{ background: u.is_active ? "#00D4A015" : "#E8213A15",
                      color: u.is_active ? "#00D4A0" : "#E8213A",
                      padding: "2px 8px", borderRadius: "20px",
                      fontSize: "10px", fontWeight: "600" }}>
                      {u.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "3px" }}>
                    @{u.username}
                    {u.email && ` · ${u.email}`}
                  </div>
                </div>

                {/* Módulos */}
                <div style={{ textAlign: "center", minWidth: "70px" }}>
                  <div style={{ fontSize: "22px", fontWeight: "700", color: rol.color }}>
                    {modCount}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--text3)" }}>módulos</div>
                </div>

                {/* Acciones */}
                <div style={{ display: "flex", gap: "6px", flexShrink: 0,
                  flexWrap: "wrap" }}>
                  <button onClick={() => {
                    setModalPermisos(u)
                    setPermisosEdit(u.perfil?.permisos || [])
                  }} className="btn btn-secondary"
                    style={{ padding: "5px 10px", fontSize: "12px" }}>
                    🔒 Permisos
                  </button>
                  <button onClick={() => {
                    setModalPass(u)
                    setFormPass({ password:"", confirmar:"" })
                  }} className="btn btn-secondary"
                    style={{ padding: "5px 10px", fontSize: "12px" }}>
                    🔑 Contraseña
                  </button>
                </div>
              </div>

              {/* Módulos activos */}
              {u.perfil?.permisos?.length > 0 && (
                <div style={{ padding: "8px 1.25rem",
                  borderTop: "1px solid var(--border2)",
                  display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {u.perfil.permisos.map(p => (
                    <span key={p} style={{
                      background: "var(--bg3)", color: "var(--text3)",
                      padding: "2px 8px", borderRadius: "6px",
                      fontSize: "10px", fontFamily: "var(--font-mono)"
                    }}>{p}</span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
