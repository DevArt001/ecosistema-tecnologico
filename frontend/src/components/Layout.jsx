import { useState, useEffect } from "react"
import Sidebar from "./Sidebar"
import { Outlet } from "react-router-dom"

export default function Layout({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile]       = useState(window.innerWidth <= 768)

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0A0E1A" }}>

      {/* Overlay oscuro detrás del sidebar en móvil */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,.65)",
          zIndex: 998,
        }}/>
      )}

      {/* Sidebar */}
      <div style={{
        position: "fixed", left: 0, top: 0,
        width: "240px", height: "100dvh",
        zIndex: 999,
        background: "#111827",
        transform: isMobile && !sidebarOpen ? "translateX(-240px)" : "translateX(0)",
        transition: "transform .25s ease",
        display: "flex", flexDirection: "column",
        boxShadow: sidebarOpen ? "4px 0 32px rgba(0,0,0,.7)" : "none",
      }}>
        <Sidebar onLogout={onLogout} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Topbar móvil */}
      {isMobile && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0,
          height: "54px", background: "#111827",
          borderBottom: "1px solid #1F2937",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1rem", zIndex: 997,
        }}>
          <button onClick={() => setSidebarOpen(p => !p)} style={{
            background: "none", border: "none", color: "#F9FAFB",
            fontSize: "22px", cursor: "pointer", padding: "8px",
            lineHeight: 1, WebkitTapHighlightColor: "transparent",
          }}>☰</button>
          <div style={{ fontWeight: "700", color: "#10B981", fontSize: "15px" }}>
            🔧 TallerOS
          </div>
          <div style={{ width: "38px" }}/>
        </div>
      )}

      {/* Contenido principal */}
      <main style={{
        marginLeft: isMobile ? 0 : "240px",
        flex: 1,
        padding: isMobile ? "70px 1rem 1.5rem" : "2rem 2.5rem",
        minHeight: "100vh",
        width: isMobile ? "100vw" : "calc(100vw - 240px)",
        overflowX: "hidden",
      }}>
        <Outlet />
      </main>
    </div>
  )
}
