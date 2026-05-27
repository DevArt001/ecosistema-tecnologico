import { useState } from "react"
import API from "../services/api"

export default function Login({ onLogin }) {
  const [form, setForm]       = useState({ username: "", password: "" })
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)
  const [paso, setPaso]       = useState(1) // 1=login, 2=2fa
  const [codigo2FA, setCodigo2FA] = useState("")
  const [tokenTemp, setTokenTemp] = useState(null)

  const handleLogin = async () => {
    if (!form.username || !form.password) {
      setError("Usuario y contraseña son obligatorios")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await API.post("/auth/login/", form)

      // Verificar si tiene 2FA activo
      const statusRes = await fetch(`${API.defaults.baseURL}/usuarios/2fa/status/`, {
        headers: { "Authorization": `Bearer ${res.data.access}` }
      })
      const statusData = await statusRes.json()

      if (statusData.tiene_2fa) {
        // Guardar token temporalmente y pedir codigo 2FA
        setTokenTemp(res.data)
        setPaso(2)
        setLoading(false)
        return
      }

      // Sin 2FA — login directo
      await completarLogin(res.data)
    } catch {
      setError("Usuario o contraseña incorrectos")
    }
    setLoading(false)
  }

  const handleVerify2FA = async () => {
    if (!codigo2FA || codigo2FA.length !== 6) {
      setError("Ingresa el codigo de 6 digitos")
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

      if (data.valido) {
        await completarLogin(tokenTemp)
      } else {
        setError("Codigo incorrecto o expirado")
      }
    } catch {
      setError("Error al verificar el codigo")
    }
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
    <div style={{ minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", width: "100%", maxWidth: "380px", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "2rem 2rem 1.5rem", textAlign: "center",
          borderBottom: "1px solid var(--border)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px",
            background: "linear-gradient(135deg, #10B981, #065F46)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px", margin: "0 auto 1rem" }}>🔧</div>
          <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--text)" }}>
            TallerOS
          </div>
          <div style={{ fontSize: "13px", color: "var(--text3)", marginTop: "4px" }}>
            {paso === 1 ? "Sistema de gestión del taller" : "Verificacion de seguridad"}
          </div>
        </div>

        <div style={{ padding: "1.5rem 2rem 2rem" }}>
          {error && (
            <div style={{ background: "#3B0A0A", border: "1px solid var(--red)",
              borderRadius: "8px", padding: "10px 14px", marginBottom: "1rem",
              fontSize: "13px", color: "var(--red)" }}>{error}</div>
          )}

          {/* Paso 1 — Usuario y contraseña */}
          {paso === 1 && (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "500",
                  color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase",
                  letterSpacing: ".04em" }}>Usuario</label>
                <input value={form.username}
                  onChange={e => setForm({...form, username: e.target.value})}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  placeholder="usuario" autoComplete="off" style={{ width: "100%" }} />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "500",
                  color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase",
                  letterSpacing: ".04em" }}>Contraseña</label>
                <input type="password" value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  placeholder="••••••••" autoComplete="new-password" style={{ width: "100%" }} />
              </div>
              <button className="btn btn-primary" onClick={handleLogin}
                disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "10px" }}>
                {loading ? "Verificando..." : "Ingresar al sistema"}
              </button>
            </>
          )}

          {/* Paso 2 — Código 2FA */}
          {paso === 2 && (
            <>
              <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "48px", marginBottom: "8px" }}>🔐</div>
                <p style={{ fontSize: "13px", color: "var(--text2)" }}>
                  Abre <strong>Google Authenticator</strong> e ingresa el codigo de 6 digitos para <strong>TallerOS</strong>
                </p>
              </div>
              <input
                type="text"
                value={codigo2FA}
                onChange={e => setCodigo2FA(e.target.value.replace(/\D/g,'').slice(0,6))}
                onKeyDown={e => e.key === "Enter" && handleVerify2FA()}
                placeholder="000000"
                maxLength={6}
                autoComplete="off"
                style={{ width: "100%", textAlign: "center", fontSize: "28px",
                  letterSpacing: "12px", marginBottom: "1.5rem", fontFamily: "monospace" }}
              />
              <button className="btn btn-primary" onClick={handleVerify2FA}
                disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "10px" }}>
                {loading ? "Verificando..." : "Confirmar codigo"}
              </button>
              <button onClick={() => { setPaso(1); setCodigo2FA(""); setError("") }}
                style={{ width: "100%", background: "none", border: "none",
                  color: "var(--text3)", fontSize: "12px", cursor: "pointer",
                  marginTop: "8px", padding: "6px" }}>
                ← Volver al login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
