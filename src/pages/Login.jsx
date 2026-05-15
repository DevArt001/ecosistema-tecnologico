import { useState } from "react"
import axios from "axios"

export default function Login({ onLogin }) {
  const [form, setForm]     = useState({ username: "", password: "" })
  const [error, setError]   = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.username || !form.password) {
      setError("Usuario y contraseña son obligatorios")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await axios.post("/api/auth/login/", form)
      localStorage.setItem("access",  res.data.access)
      localStorage.setItem("refresh", res.data.refresh)
      localStorage.setItem("username", form.username)

      onLogin(res.data.access)
    } catch {
      setError("Usuario o contraseña incorrectos")
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem"
    }}>
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", width: "100%", maxWidth: "380px",
        overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{ padding: "2rem 2rem 1.5rem", textAlign: "center",
          borderBottom: "1px solid var(--border)" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            background: "linear-gradient(135deg, #10B981, #065F46)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px", margin: "0 auto 1rem"
          }}>🔧</div>
          <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--text)" }}>
            TallerOS
          </div>
          <div style={{ fontSize: "13px", color: "var(--text3)", marginTop: "4px" }}>
            Sistema de gestión del taller
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: "1.5rem 2rem 2rem" }}>
          {error && (
            <div style={{ background: "#3B0A0A", border: "1px solid var(--red)",
              borderRadius: "8px", padding: "10px 14px", marginBottom: "1rem",
              fontSize: "13px", color: "var(--red)" }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "500",
              color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase",
              letterSpacing: ".04em" }}>Usuario</label>
            <input
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="usuario"
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "500",
              color: "var(--text2)", marginBottom: "6px", textTransform: "uppercase",
              letterSpacing: ".04em" }}>Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="••••••••"
              style={{ width: "100%" }}
            />
          </div>

          <button className="btn btn-primary" onClick={handleSubmit}
            disabled={loading} style={{ width: "100%", justifyContent: "center",
              padding: "10px" }}>
            {loading ? "Ingresando..." : "Ingresar al sistema"}
          </button>
        </div>
      </div>
    </div>
  )
}