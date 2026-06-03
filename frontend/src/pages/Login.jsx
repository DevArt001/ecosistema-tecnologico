import { useState } from "react"
import API from "../services/api"
import ThemeToggle from "../components/ThemeToggle"
import { useTheme } from "../hooks/useTheme"

export default function Login({ onLogin }) {
  useTheme()
  const [form, setForm]           = useState({ username: "", password: "" })
  const [error, setError]         = useState("")
  const [loading, setLoading]     = useState(false)
  const [paso, setPaso]           = useState(1)
  const [codigo2FA, setCodigo2FA] = useState("")
  const [tokenTemp, setTokenTemp] = useState(null)

  const handleLogin = async () => {
    if (!form.username || !form.password) {
      setError("Ingresa usuario y contraseña")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await API.post("/auth/login/", form)
      const statusRes = await fetch(`${API.defaults.baseURL}/usuarios/2fa/status/`, {
        headers: { "Authorization": `Bearer ${res.data.access}` }
      })
      const statusData = await statusRes.json()
      if (statusData.tiene_2fa) {
        setTokenTemp(res.data)
        setPaso(2)
        setLoading(false)
        return
      }
      await completarLogin(res.data)
    } catch {
      setError("Usuario o contraseña incorrectos")
    }
    setLoading(false)
  }

  const handleVerify2FA = async () => {
    if (!codigo2FA || codigo2FA.length !== 6) {
      setError("Ingresa el código de 6 dígitos")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API.defaults.baseURL}/usuarios/2fa/validate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, code: codigo2FA })
      })
      const data = await res.json()
      if (data.valido) await completarLogin(tokenTemp)
      else setError("Código incorrecto o expirado")
    } catch { setError("Error al verificar") }
    setLoading(false)
  }

  const completarLogin = async (tokens) => {
    localStorage.setItem("access", tokens.access)
    localStorage.setItem("refresh", tokens.refresh)
    localStorage.setItem("username", form.username)
    const perfil = await API.get("/usuarios/me/", {
      headers: { "Authorization": `Bearer ${tokens.access}` }
    })
    const p = perfil.data.perfil || {}
    localStorage.setItem("rol", p.rol || "tecnico")
    localStorage.setItem("permisos", JSON.stringify(p.permisos || ["dashboard"]))
    onLogin(tokens.access)
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem",
      position: "relative",
      overflow: "hidden",
    }}>
      <ThemeToggle />
      {/* Fondo decorativo */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse 60% 50% at 20% 50%, rgba(232,33,58,.06) 0%, transparent 60%),
          radial-gradient(ellipse 50% 60% at 80% 50%, rgba(30,95,212,.05) 0%, transparent 60%)
        `
      }}/>

      {/* Grid pattern */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(30,95,212,.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(30,95,212,.03) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}/>

      <div className="float-up" style={{ width: "100%", maxWidth: "400px", position: "relative" }}>

        {/* Logo y nombre */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "80px", height: "80px",
            borderRadius: "20px",
            background: "#0A0A0A",
            border: "2px solid rgba(232,33,58,.3)",
            boxShadow: "0 0 30px rgba(232,33,58,.2), 0 0 60px rgba(232,33,58,.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1.25rem",
            padding: "8px",
            animation: "glowRed 3s ease-in-out infinite",
          }}>
            <img src="/logo_arm.png" alt="ARM Racing"
              style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div style={{
            fontSize: "22px", fontWeight: "800", letterSpacing: "-.5px",
            background: "linear-gradient(135deg, #E8213A 0%, #FF6B6B 50%, #1E5FD4 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>ARM Racing Performance</div>
          <div style={{ fontSize: "12px", color: "var(--text3)", marginTop: "4px",
            fontWeight: "500", letterSpacing: ".08em", textTransform: "uppercase" }}>
            {paso === 1 ? "Sistema de gestión TallerOS" : "Verificación de seguridad"}
          </div>
        </div>

        {/* Card login */}
        <div style={{
          background: "var(--bg2)",
          border: "1.5px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,.6)",
          position: "relative",
        }}>
          {/* Línea superior */}
          <div style={{
            height: "3px",
            background: "linear-gradient(90deg, var(--red) 0%, var(--blue) 100%)",
          }}/>

          <div style={{ padding: "1.75rem" }}>
            {error && (
              <div className="slide-down" style={{
                background: "rgba(232,33,58,.08)",
                border: "1px solid rgba(232,33,58,.3)",
                borderRadius: "var(--radius)",
                padding: "10px 14px",
                marginBottom: "1.25rem",
                fontSize: "13px", color: "var(--red)",
                display: "flex", alignItems: "center", gap: "8px"
              }}>
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Paso 1 — Login */}
            {paso === 1 && (
              <div className="stagger">
                <div style={{ marginBottom: "1rem" }}>
                  <label className="label">Usuario</label>
                  <input
                    value={form.username}
                    onChange={e => setForm({...form, username: e.target.value})}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    placeholder="Ingresa tu usuario"
                    autoComplete="off"
                  />
                </div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label className="label">Contraseña</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
                <button className="btn btn-primary" onClick={handleLogin}
                  disabled={loading}
                  style={{ width: "100%", padding: "11px", fontSize: "14px" }}>
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ display: "inline-block", width: "14px", height: "14px",
                        border: "2px solid rgba(255,255,255,.3)",
                        borderTopColor: "white", borderRadius: "50%",
                        animation: "spin 0.7s linear infinite" }}/>
                      Verificando...
                    </span>
                  ) : "Ingresar al sistema →"}
                </button>
              </div>
            )}

            {/* Paso 2 — 2FA */}
            {paso === 2 && (
              <div className="stagger">
                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: "40px", marginBottom: "10px" }}>🔐</div>
                  <div style={{ fontSize: "14px", color: "var(--text2)", lineHeight: 1.6 }}>
                    Abre <strong style={{ color: "var(--text)" }}>Google Authenticator</strong> e ingresa el código de 6 dígitos para <strong style={{ color: "#E8213A" }}>TallerOS</strong>
                  </div>
                </div>
                <input
                  type="text"
                  value={codigo2FA}
                  onChange={e => setCodigo2FA(e.target.value.replace(/\D/g,'').slice(0,6))}
                  onKeyDown={e => e.key === "Enter" && handleVerify2FA()}
                  placeholder="000000"
                  maxLength={6}
                  autoComplete="off"
                  style={{
                    textAlign: "center", fontSize: "28px",
                    letterSpacing: "12px", marginBottom: "1.25rem",
                    fontFamily: "var(--font-mono)", fontWeight: "600",
                  }}
                />
                <button className="btn btn-primary" onClick={handleVerify2FA}
                  disabled={loading}
                  style={{ width: "100%", padding: "11px", fontSize: "14px", marginBottom: "10px" }}>
                  {loading ? "Verificando..." : "Confirmar código →"}
                </button>
                <button onClick={() => { setPaso(1); setCodigo2FA(""); setError("") }}
                  className="btn btn-ghost"
                  style={{ width: "100%", fontSize: "12px" }}>
                  ← Volver al login
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.25rem",
          fontSize: "11px", color: "var(--text3)" }}>
          TallerOS · ARM Racing Performance · Bogotá, Colombia
        </div>
      </div>
    </div>
  )
}
