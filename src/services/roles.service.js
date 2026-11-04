// URL base del backend desde variables de entorno con fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v2';

/**
 * Función genérica para realizar peticiones HTTP hacia el microservicio
 */
async function peticion(ruta, metodo = 'GET', datos = null) {
  const opciones = {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (datos) {
    opciones.body = JSON.stringify(datos);
  }

  const url = `${API_URL}${ruta}`;
  let respuesta;

  try {
    respuesta = await fetch(url, opciones);
  } catch (error) {
    throw new Error('No se pudo conectar con el backend. Verifica que esté corriendo en ' + API_URL);
  }

  const json = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    const errorMsg = json.message || json.error || `Error ${respuesta.status}: Solicitud fallida`;
    throw new Error(errorMsg);
  }

  return json;
}

// GET /roles -> lista todos los roles
export function obtenerRoles() {
  return peticion('/roles');
}

// GET /roles/:id -> consulta un solo rol
export function obtenerRol(id) {
  return peticion(`/roles/${id}`);
}

// POST /roles -> crea un nuevo rol
export function crearRol(rol) {
  return peticion('/roles', 'POST', rol);
}

// PUT /roles/:id -> actualiza un rol
export function actualizarRol(id, rol) {
  return peticion(`/roles/${id}`, 'PUT', rol);
}

// DELETE /roles/:id -> elimina un rol
export function eliminarRol(id) {
  return peticion(`/roles/${id}`, 'DELETE');
}
