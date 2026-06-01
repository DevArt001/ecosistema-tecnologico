import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import API from "../services/api"

const TIPO_COLOR = {
  cliente:  "#3B82F6",
  vehiculo: "#F59E0B",
  orden:    "#10B981",
  factura:  "#8B5CF6",
  producto: "#EF4444",
}

export default function BusquedaGlobal({ onClose }) {
  const [query, setQuery]         = useState("")
  const [resultados, setResultados] = useState([])
  const [loading, setLoading]     = useState(false)
  const [abierto, setAbierto]     = useState(false)
  const [seleccionado, setSeleccionado] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])
  let timer = useRef(null)

  useEffect(() => {
    if (query.length < 2) { setResultados([]); setAbierto(false); return }
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      setLoading(true)
      try {
        const r = await API.get(`/buscar/?q=${encodeURIComponent(query)}`)
        setResultados(r.data.resultados || [])
        setAbierto(true)
        setSeleccionado(0)
      } catch { setResultados([]) }
      setLoading(false)
    }, 300)
  }, [query])

  useEffect(() => {
    // Atajo teclado Ctrl+K
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === "Escape") { setAbierto(false); setQuery(""); onClose?.() }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const irA = (resultado) => {
    navigate(resultado.url)
    setAbierto(false)
    setQuery("")
  }

  const handleKeyDown = (e) => {
    if (!abierto) return
    if (e.key === "ArrowDown") { e.preventDefault(); setSeleccionado(s => Math.min(s+1, resultados.length-1)) }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSeleccionado(s => Math.max(s-1, 0)) }
    if (e.key === "Enter" && resultados[seleccionado]) irA(resultados[seleccionado])
  }

  return (
    <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)",
          color: "var(--text3)", fontSize: "14px", pointerEvents: "none"
        }}>🔍</span>
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setAbierto(true)}
          onBlur={() => setTimeout(() => setAbierto(false), 200)}
          placeholder="Buscar... (Ctrl+K)"
          autoComplete="off"
          style={{
            width: "100%", paddingLeft: "32px", paddingRight: "12px",
            height: "36px", fontSize: "13px",
            background: "var(--bg1)", border: "1px solid var(--border)",
            borderRadius: "8px", color: "var(--text)"
          }}
        />
        {loading && (
          <span style={{
            position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
            color: "var(--text3)", fontSize: "11px"
          }}>...</span>
        )}
      </div>

      {abierto && resultados.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: "var(--bg2)", border: "1px solid var(--border)",
          borderRadius: "10px", boxShadow: "0 8px 32px rgba(0,0,0,.4)",
          zIndex: 9999, overflow: "hidden", maxHeight: "400px", overflowY: "auto"
        }}>
          {resultados.map((r, i) => (
            <div
              key={`${r.tipo}-${r.id}`}
              onMouseDown={() => irA(r)}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 14px", cursor: "pointer",
                background: i === seleccionado ? "var(--bg1)" : "transparent",
                borderBottom: "1px solid var(--border2)"
              }}
            >
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
                background: (TIPO_COLOR[r.tipo] || "#6B7280") + "22",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px"
              }}>{r.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.titulo}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text3)", marginTop: "2px",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.sub}
                </div>
              </div>
              <span style={{
                fontSize: "10px", fontWeight: "600", color: TIPO_COLOR[r.tipo] || "#6B7280",
                background: (TIPO_COLOR[r.tipo] || "#6B7280") + "22",
                padding: "2px 8px", borderRadius: "20px", flexShrink: 0
              }}>{r.tipo}</span>
            </div>
          ))}
          <div style={{ padding: "8px 14px", fontSize: "11px", color: "var(--text3)",
            background: "var(--bg1)", display: "flex", justifyContent: "space-between" }}>
            <span>↑↓ navegar · Enter seleccionar · Esc cerrar</span>
            <span>{resultados.length} resultados</span>
          </div>
        </div>
      )}

      {abierto && query.length >= 2 && resultados.length === 0 && !loading && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: "var(--bg2)", border: "1px solid var(--border)",
          borderRadius: "10px", padding: "1.5rem", textAlign: "center",
          color: "var(--text3)", fontSize: "13px", zIndex: 9999
        }}>
          Sin resultados para "{query}"
        </div>
      )}
    </div>
  )
}
