import { useState, useEffect } from "react"
import Sidebar from "./Sidebar"
import { Outlet } from "react-router-dom"

export default function Layout({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [vh, setVh] = useState(window.innerHeight)

  useEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth <= 768)
      setVh(window.innerHeight)
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#111827" }}>

      {sidebarOpen && isMobile && (
        <div
          onPointerDown={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,.6)",
            zIndex: 300,
          }}
        />
      )}

      <div style={{
        position: "fixed",
        left: 0, top: 0,
        width: "240px",
        height: `${vh}px`,
        zIndex: 400,
        transition: "transform .25s ease",
        transform: isMobile && !sidebarOpen ? "translateX(-100%)" : "translateX(0)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}>
        <Sidebar onLogout={onLogout} onClose={() => setSidebarOpen(false)} />
      </div>

      {isMobile && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0,
          height: "56px", background: "#0D1117",
          borderBottom: "1px solid #1F2937",
          display: "flex",
          alignItems: "center", padding: "0 1rem",
          zIndex: 200,
          justifyContent: "space-between",
        }}>
          <button
            onPointerDown={() => setSidebarOpen(prev => !prev)}
            style={{
              background: "none", border: "none", color: "white",
              fontSize: "26px", cursor: "pointer", padding: "8px",
              lineHeight: 1, touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
            }}
          >☰</button>
          <div style={{ fontWeight: "700", color: "white", fontSize: "15px" }}>
            🔧 TallerOS
          </div>
          <div style={{ width: "42px" }} />
        </div>
      )}

      <main style={{
        marginLeft: isMobile ? "0" : "240px",
        flex: 1,
        padding: isMobile ? "4.5rem 1rem 1rem" : "2rem 2.5rem",
        minHeight: "100vh",
        maxWidth: isMobile ? "100vw" : "calc(100vw - 240px)",
      }}>
        <Outlet />
      </main>
    </div>
  )
}
