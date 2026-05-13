import Sidebar from "./Sidebar"
import { Outlet } from "react-router-dom"

export default function Layout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F5F5F5" }}>
      <Sidebar />
      <main style={{
        marginLeft: "220px", flex: 1,
        padding: "2rem", minHeight: "100vh",
      }}>
        <Outlet />
      </main>
    </div>
  )
}