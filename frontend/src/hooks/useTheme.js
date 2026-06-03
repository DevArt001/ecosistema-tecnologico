import { useState, useEffect } from "react"

export function useTheme() {
  const [tema, setTema] = useState(() =>
    localStorage.getItem("tema") || "oscuro"
  )

  useEffect(() => {
    document.documentElement.setAttribute("data-tema", tema)
    localStorage.setItem("tema", tema)
  }, [tema])

  const toggleTema = () => setTema(t => t === "oscuro" ? "claro" : "oscuro")

  return { tema, toggleTema }
}
