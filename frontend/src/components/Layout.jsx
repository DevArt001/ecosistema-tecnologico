import Sidebar from "./Sidebar"
import { Outlet } from "react-router-dom"

export default function Layout({ onLogout }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar onLogout={onLogout} />
      <main style={{
        marginLeft: "240px", flex: 1,
        padding: "2rem 2.5rem", minHeight: "100vh",
        maxWidth: "calc(100vw - 240px)",
      }}>
        <Outlet />
      </main>
    </div>
  )
}