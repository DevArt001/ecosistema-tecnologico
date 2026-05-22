import axios from "axios"

const getBaseURL = () => {
  const hostname = window.location.hostname
  if (hostname === 'localhost' || hostname.startsWith('192.') || hostname === '127.0.0.1') {
    return `http://192.168.0.8:8000/api`
  }
  if (hostname === 'app.armracing.com') {
    return `https://api.armracing.com/api`
  }
  return `${window.location.protocol}//${hostname}/api`
}

const API = axios.create({
  baseURL: getBaseURL(),
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
})

// Interceptor REQUEST — agrega token
API.interceptors.request.use(config => {
  const token = localStorage.getItem("access")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Interceptor RESPONSE — maneja errores globalmente
API.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      // Backend caído o sin red
      console.error("Sin conexión al servidor")
      return Promise.reject({ mensaje: "No se pudo conectar al servidor. Verifica que el backend esté corriendo." })
    }
    if (error.response.status === 401) {
      // Token expirado — limpiar y recargar
      localStorage.removeItem("access")
      localStorage.removeItem("refresh")
      window.location.href = "/"
    }
    if (error.response.status === 403) {
      return Promise.reject({ mensaje: "No tienes permiso para realizar esta acción." })
    }
    if (error.response.status >= 500) {
      return Promise.reject({ mensaje: "Error interno del servidor. Intenta de nuevo." })
    }
    return Promise.reject(error)
  }
)

export const clientesAPI = {
  listar:   ()         => API.get("/clientes/"),
  obtener:  (id)       => API.get(`/clientes/${id}/`),
  crear:    (data)     => API.post("/clientes/", data),
  editar:   (id, data) => API.put(`/clientes/${id}/`, data),
  eliminar: (id)       => API.delete(`/clientes/${id}/`),
}

export const vehiculosAPI = {
  listar:   ()         => API.get("/vehiculos/"),
  obtener:  (id)       => API.get(`/vehiculos/${id}/`),
  crear:    (data)     => API.post("/vehiculos/", data),
  editar:   (id, data) => API.put(`/vehiculos/${id}/`, data),
  eliminar: (id)       => API.delete(`/vehiculos/${id}/`),
}

export const ordenesAPI = {
  listar:        ()           => API.get("/ordenes/"),
  obtener:       (id)         => API.get(`/ordenes/${id}/`),
  crear:         (data)       => API.post("/ordenes/", data),
  editar:        (id, data)   => API.put(`/ordenes/${id}/`, data),
  eliminar:      (id)         => API.delete(`/ordenes/${id}/`),
  cambiarEstado: (id, estado) => API.patch(`/ordenes/${id}/`, { estado }),
}

export const productosAPI = {
  listar:   ()         => API.get("/productos/"),
  obtener:  (id)       => API.get(`/productos/${id}/`),
  crear:    (data)     => API.post("/productos/", data),
  editar:   (id, data) => API.put(`/productos/${id}/`, data),
  eliminar: (id)       => API.delete(`/productos/${id}/`),
}

export const facturasAPI = {
  listar:        ()            => API.get("/facturas/"),
  obtener:       (id)          => API.get(`/facturas/${id}/`),
  crear:         (data)        => API.post("/facturas/", data),
  editar:        (id, data)    => API.put(`/facturas/${id}/`, data),
  eliminar:      (id)          => API.delete(`/facturas/${id}/`),
  cambiarEstado: (id, estado)  => API.patch(`/facturas/${id}/`, { estado }),
  agregarLinea:  (id, data)    => API.post(`/facturas/${id}/agregar_linea/`, data),
  eliminarLinea: (id, lineaId) => API.delete(`/facturas/${id}/eliminar_linea/${lineaId}/`),
  pdf:           (id)          => `${API.defaults.baseURL.replace('/api','')}/api/facturas/${id}/pdf/?token=${localStorage.getItem('access')}`,
}

export const agendamientoAPI = {
  convertirOrden:     (citaId) => API.post(`/agendamiento/citas/${citaId}/convertir-orden/`),
  listarCitas:     (params)   => API.get("/agendamiento/citas/", { params }),
  obtenerCita:     (id)       => API.get(`/agendamiento/citas/${id}/`),
  editarCita:      (id, data) => API.patch(`/agendamiento/citas/${id}/`, data),
  eliminarCita:    (id)       => API.delete(`/agendamiento/citas/${id}/`),
  listarConfig:    ()         => API.get("/agendamiento/config-taller/"),
  listarFestivos:  ()         => API.get("/agendamiento/dias-especiales/"),
  crearFestivo:    (data)     => API.post("/agendamiento/dias-especiales/", data),
  eliminarFestivo: (id)       => API.delete(`/agendamiento/dias-especiales/${id}/`),
  buscarCliente:      (documento) => API.post("/agendamiento/publico/buscar-cliente/", { documento }),
  registrarCliente:   (data)      => API.post("/agendamiento/publico/registrar-cliente/", data),
  registrarVehiculo:  (data)      => API.post("/agendamiento/publico/registrar-vehiculo/", data),
  disponibilidadMes:  (mes, anio) => API.get("/agendamiento/publico/disponibilidad/", { params: { mes, anio } }),
  horasDisponibles:   (fecha)     => API.get("/agendamiento/publico/horas-disponibles/", { params: { fecha } }),
  crearCita:          (data)      => API.post("/agendamiento/publico/crear-cita/", data),
  citaEspecial:       (data)      => API.post("/agendamiento/publico/cita-especial/", data),
}

export const portalAPI = {
  generarLink:   (ordenId) => API.post(`/agendamiento/ordenes/${ordenId}/generar-link/`),
  accederPortal: (token)   => API.get(`/agendamiento/portal/${token}/`),
}

export const procesosAPI = {
  obtenerProceso: (ordenId)          => API.get(`/servicios/ordenes/${ordenId}/proceso/`),
  agregarPaso:    (ordenId, data)    => API.post(`/servicios/ordenes/${ordenId}/agregar-paso/`, data),
  agregarFoto:    (ordenId, formData) => API.post(`/servicios/ordenes/${ordenId}/agregar-foto/`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
}

export const cotizacionesAPI = {
  listar:        ()              => API.get("/cotizaciones/"),
  obtener:       (id)            => API.get(`/cotizaciones/${id}/`),
  crear:         (data)          => API.post("/cotizaciones/", data),
  editar:        (id, data)      => API.put(`/cotizaciones/${id}/`, data),
  eliminar:      (id)            => API.delete(`/cotizaciones/${id}/`),
  agregarLinea:  (id, data)      => API.post(`/cotizaciones/${id}/agregar_linea/`, data),
  eliminarLinea: (id, lineaId)   => API.delete(`/cotizaciones/${id}/eliminar_linea/${lineaId}/`),
  aprobar:       (id)            => API.post(`/cotizaciones/${id}/aprobar/`),
  pdf:           (id)            => `${API.defaults.baseURL.replace('/api','')}/api/cotizaciones/${id}/pdf/?token=${localStorage.getItem('access')}`,
}

export default API
