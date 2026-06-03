import { useState, useEffect, useRef } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Sidebar from "./Sidebar"
import BusquedaGlobal from "./BusquedaGlobal"
import ThemeToggle from "./ThemeToggle"
import { useTheme } from "../hooks/useTheme"

export default function Layout({ onLogout }) {
  const [sidebarOpen, setSidebarOpen]       = useState(false)
  useTheme() // Activa el sistema de temas
  const [isMobile, setIsMobile]             = useState(window.innerWidth <= 768)
  const [busquedaAbierta, setBusquedaAbierta] = useState(false)
  const [pageKey, setPageKey]               = useState(0)
  const location = useLocation()

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  useEffect(() => {
    setPageKey(k => k + 1)
    setSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setBusquedaAbierta(p => !p)
      }
      if (e.key === "Escape") setBusquedaAbierta(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>

      {/* Overlay mobile */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,.75)",
          backdropFilter: "blur(4px)",
          zIndex: 998,
          animation: "fadeIn .2s ease"
        }}/>
      )}

      {/* Sidebar */}
      <div style={{
        position: "fixed", left: 0, top: 0,
        width: "240px", height: "100dvh", zIndex: 999,
        transform: isMobile ? (sidebarOpen ? "translateX(0)" : "translateX(-100%)") : "translateX(0)",
        transition: "transform .28s cubic-bezier(.4,0,.2,1)",
        boxShadow: isMobile && sidebarOpen ? "8px 0 40px rgba(0,0,0,.7)" : "none",
      }}>
        <Sidebar onLogout={onLogout} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Header mobile */}
      {isMobile && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0,
          height: "54px",
          background: "var(--bg2)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1rem", zIndex: 997,
        }}>
          <button onClick={() => setSidebarOpen(p => !p)} style={{
            background: "none", border: "none", color: "#E0E8FF",
            fontSize: "20px", cursor: "pointer", padding: "8px",
            lineHeight: 1,
          }}>☰</button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img src="/logo_arm.png" alt="ARM" style={{ width: "24px", height: "24px",
              borderRadius: "6px", border: "1px solid rgba(0,229,160,.3)" }} />
            <span style={{ fontWeight: "700", color: "#00E5A0", fontSize: "14px",
              letterSpacing: "-.2px" }}>ARM Racing</span>
          </div>
          <button onClick={() => setBusquedaAbierta(p => !p)} style={{
            background: "none", border: "none", color: "#6A7A92",
            fontSize: "16px", cursor: "pointer", padding: "8px"
          }}>🔍</button>
        </div>
      )}

      {/* Header desktop con búsqueda */}
      {!isMobile && busquedaAbierta && (
        <div style={{
          position: "fixed", top: 0, left: "240px", right: 0,
          height: "56px",
          background: "var(--bg2)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center",
          padding: "0 2rem", zIndex: 100,
          animation: "slideDown .2s ease",
        }}>
          <BusquedaGlobal onClose={() => setBusquedaAbierta(false)} />
          <button onClick={() => setBusquedaAbierta(false)} style={{
            background: "none", border: "none", color: "#3A4A62",
            fontSize: "20px", cursor: "pointer", padding: "8px", marginLeft: "8px"
          }}>×</button>
        </div>
      )}

      {/* Búsqueda mobile */}
      {isMobile && busquedaAbierta && (
        <div style={{
          position: "fixed", top: "54px", left: 0, right: 0,
          background: "rgba(8,12,24,.98)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border)",
          padding: "10px 1rem",
          zIndex: 996,
          animation: "slideDown .2s ease",
        }}>
          <BusquedaGlobal onClose={() => setBusquedaAbierta(false)} />
        </div>
      )}

      <ThemeToggle />
      {/* Main content */}
      <main key={pageKey} style={{
        marginLeft: isMobile ? 0 : "240px",
        flex: 1,
        padding: isMobile ? "70px 1rem 2rem" : (busquedaAbierta ? "76px 2.5rem 2rem" : "2rem 2.5rem"),
        minHeight: "100vh",
        width: isMobile ? "100%" : "calc(100vw - 240px)",
        overflowX: "hidden",
        boxSizing: "border-box",
        animation: "fadeIn .3s ease",
      }}>
        <Outlet />
      </main>
    </div>
  )
}
