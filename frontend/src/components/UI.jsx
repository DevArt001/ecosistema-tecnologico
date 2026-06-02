// Componentes UI reutilizables para TallerOS ARM Racing

// ============ PAGE HEADER ============
export function PageHeader({ titulo, sub, children }) {
  return (
    <div className="fade-in" style={{
      display: "flex", justifyContent: "space-between",
      alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem"
    }}>
      <div>
        <h1 style={{ color: "var(--text)", marginBottom: "3px" }}>{titulo}</h1>
        {sub && <p style={{ color: "var(--text3)", fontSize: "13px" }}>{sub}</p>}
      </div>
      {children && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ============ TOAST ============
export function Toast({ mensaje }) {
  if (!mensaje) return null
  const isOk  = mensaje.startsWith("✅")
  const isErr = mensaje.startsWith("❌")
  const cls   = isOk ? "toast-success" : isErr ? "toast-error" : "toast-info"
  return (
    <div className={`toast ${cls} slide-down`}>
      {mensaje}
    </div>
  )
}

// ============ CONFIRM MODAL ============
export function ConfirmModal({ titulo, texto, onConfirm, onCancel, danger = true }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box scale-in" style={{ maxWidth: "380px" }}>
        <h2 style={{ marginBottom: "8px", color: "var(--text)" }}>{titulo}</h2>
        <p style={{ color: "var(--text3)", fontSize: "13px", marginBottom: "1.5rem",
          lineHeight: 1.6 }}>{texto}</p>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}>
            {danger ? "🗑️ Eliminar" : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============ EMPTY STATE ============
export function EmptyState({ icon = "📭", titulo, sub, action }) {
  return (
    <div style={{ padding: "3rem", textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "12px", opacity: .5 }}>{icon}</div>
      <div style={{ fontSize: "15px", fontWeight: "600", color: "var(--text2)",
        marginBottom: "6px" }}>{titulo}</div>
      {sub && <div style={{ fontSize: "13px", color: "var(--text3)",
        marginBottom: "1.25rem" }}>{sub}</div>}
      {action}
    </div>
  )
}

// ============ KPI CARD ============
export function KPICard({ titulo, valor, sub, color, icon, delay = 0, onClick }) {
  return (
    <div className="stat-card fade-in" style={{
      flex: 1, minWidth: "140px", cursor: onClick ? "pointer" : "default",
      animationDelay: `${delay}s`,
    }}
    onClick={onClick}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = color + "40"
      e.currentTarget.style.transform = "translateY(-3px)"
      e.currentTarget.style.boxShadow = `0 8px 32px ${color}14`
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = "var(--border)"
      e.currentTarget.style.transform = "translateY(0)"
      e.currentTarget.style.boxShadow = "none"
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px",
        background: `linear-gradient(90deg, ${color}, ${color}55)`,
        borderRadius: "3px 3px 0 0" }}/>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "10px", fontWeight: "700", color: "var(--text3)",
            textTransform: "uppercase", letterSpacing: ".1em", marginBottom: "10px" }}>
            {titulo}
          </div>
          <div style={{ fontSize: "30px", fontWeight: "800", color,
            lineHeight: 1, letterSpacing: "-1px" }}>
            {valor}
          </div>
          {sub && <div style={{ fontSize: "11px", color: "var(--text3)",
            marginTop: "6px" }}>{sub}</div>}
        </div>
        {icon && (
          <div style={{ width: "38px", height: "38px", borderRadius: "10px",
            background: color + "12",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "16px" }}>{icon}</div>
        )}
      </div>
    </div>
  )
}

// ============ SEARCH BAR ============
export function SearchBar({ value, onChange, placeholder = "Buscar...", width = "260px" }) {
  return (
    <div style={{ position: "relative", width }}>
      <span style={{ position: "absolute", left: "10px", top: "50%",
        transform: "translateY(-50%)", color: "var(--text3)", fontSize: "13px",
        pointerEvents: "none" }}>🔍</span>
      <input value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ paddingLeft: "32px" }} />
    </div>
  )
}

// ============ STATUS BADGE ============
export function StatusBadge({ estado, config }) {
  const s = config[estado] || { color: "#6A7A92", label: estado, icon: "●" }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      background: s.color + "15", color: s.color,
      padding: "3px 10px", borderRadius: "20px",
      fontSize: "11px", fontWeight: "600",
    }}>
      {s.icon && <span style={{ fontSize: "10px" }}>{s.icon}</span>}
      {s.label}
    </span>
  )
}

// ============ TABLE SKELETON ============
export function TableSkeleton({ rows = 4, cols = 5 }) {
  return Array(rows).fill(0).map((_, i) => (
    <tr key={i}>
      {Array(cols).fill(0).map((_, j) => (
        <td key={j}>
          <div className="skeleton" style={{
            height: "14px", width: `${60 + Math.random() * 80}px`,
            borderRadius: "4px"
          }}/>
        </td>
      ))}
    </tr>
  ))
}

// ============ MODAL FORM ============
export function ModalForm({ titulo, onClose, onGuardar, loading, children, maxWidth = "480px" }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box scale-in" style={{ maxWidth, maxHeight: "90vh",
        overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ color: "var(--text)" }}>{titulo}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none",
            color: "var(--text3)", cursor: "pointer", fontSize: "22px",
            lineHeight: 1, transition: "color .15s" }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--red)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text3)"}>×</button>
        </div>
        {children}
        {onGuardar && (
          <div style={{ display: "flex", gap: "8px", marginTop: "1.5rem" }}>
            <button className="btn btn-primary" onClick={onGuardar}
              disabled={loading} style={{ flex: 1 }}>
              {loading ? "Guardando..." : "Guardar"}
            </button>
            <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ============ FORM FIELD ============
export function Field({ label, children, style = {} }) {
  return (
    <div style={{ marginBottom: "12px", ...style }}>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

// ============ TABS ============
export function Tabs({ tabs, activo, onChange }) {
  return (
    <div style={{ display: "flex", borderBottom: "1px solid var(--border)",
      marginBottom: "1.5rem", overflowX: "auto" }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)} style={{
          background: "none", border: "none", padding: "10px 16px",
          fontSize: "13px", fontWeight: activo === t.key ? "600" : "400",
          color: activo === t.key ? "var(--red)" : "var(--text3)",
          borderBottom: activo === t.key ? "2px solid var(--red)" : "2px solid transparent",
          cursor: "pointer", marginBottom: "-1px", whiteSpace: "nowrap",
          transition: "color .15s",
        }}>{t.label}</button>
      ))}
    </div>
  )
}

// ============ SECTION HEADER ============
export function SectionHeader({ titulo, children }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between",
      alignItems: "center", padding: "1rem 1.25rem",
      borderBottom: "1px solid var(--border)" }}>
      <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "14px" }}>
        {titulo}
      </div>
      {children}
    </div>
  )
}
