<script setup>
import { ref, onMounted } from 'vue'
import {
  obtenerRoles,
  obtenerRol,
  crearRol,
  actualizarRol,
  eliminarRol,
} from '../services/roles.service'

// Estados reactivos
const roles = ref([])
const cargando = ref(false)
const nombre = ref('')
const descripcion = ref('')
const idEditando = ref(null)
const mensajeExito = ref('')
const mensajeError = ref('')
const respuestaBackend = ref(null)

// Modal de detalle
const rolSeleccionado = ref(null)
const cargandoDetalle = ref(false)

// Métodos de notificación
function notificarExito(json, textoPersonalizado = '') {
  respuestaBackend.value = json
  mensajeExito.value = textoPersonalizado || json.message || 'Operación completada con éxito'
  mensajeError.value = ''
}

function notificarError(error) {
  mensajeError.value = error.message || 'Error en la petición'
  mensajeExito.value = ''
}

function limpiarNotificaciones() {
  mensajeExito.value = ''
  mensajeError.value = ''
}

// Cargar todos los roles (GET /roles)
async function cargarRoles() {
  cargando.value = true
  limpiarNotificaciones()
  try {
    const json = await obtenerRoles()
    roles.value = json.data || []
    respuestaBackend.value = json
  } catch (error) {
    notificarError(error)
  } finally {
    cargando.value = false
  }
}

// Ver detalle de un rol por ID (GET /roles/:id)
async function verDetalle(id) {
  cargandoDetalle.value = true
  try {
    const json = await obtenerRol(id)
    rolSeleccionado.value = json.data
    respuestaBackend.value = json
    notificarExito(json, `Detalle del rol #${id} consultado`)
  } catch (error) {
    notificarError(error)
  } finally {
    cargandoDetalle.value = false
  }
}

function cerrarModal() {
  rolSeleccionado.value = null
}

// Guardar (Crear o Actualizar)
async function guardarRol() {
  const nombreLimpio = nombre.value.trim()

  if (!nombreLimpio) {
    mensajeError.value = 'El nombre del rol es requerido.'
    return
  }

  const payload = {
    name: nombreLimpio,
    description: descripcion.value.trim() || null,
  }

  try {
    let json
    if (idEditando.value) {
      json = await actualizarRol(idEditando.value, payload)
      notificarExito(json, `Rol #${idEditando.value} actualizado`)
    } else {
      json = await crearRol(payload)
      notificarExito(json, 'Rol creado exitosamente')
    }
    limpiarFormulario()
    await cargarRoles()
  } catch (error) {
    notificarError(error)
  }
}

// Preparar edición
function iniciarEdicion(rol) {
  idEditando.value = rol.id
  nombre.value = rol.name
  descripcion.value = rol.description || ''
  limpiarNotificaciones()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function limpiarFormulario() {
  idEditando.value = null
  nombre.value = ''
  descripcion.value = ''
}

// Eliminar rol (DELETE /roles/:id)
async function borrarRol(rol) {
  const confirmar = confirm(`¿Deseas eliminar el rol ${rol.name} (ID: ${rol.id})?`)
  if (!confirmar) return

  try {
    const json = await eliminarRol(rol.id)
    notificarExito(json, `Rol ${rol.name} eliminado`)
    await cargarRoles()
  } catch (error) {
    notificarError(error)
  }
}

onMounted(() => {
  cargarRoles()
})
</script>

<template>
  <div class="crud-container">
    <!-- Encabezado Principal -->
    <header class="main-header">
      <div class="header-titles">
        <h1>CRUD de Roles</h1>
        <p class="subtitle">Consumo de API REST - Microservicio</p>
      </div>
      <div class="student-badge">
        <strong>22160984</strong>
        <span>Acevedo García José Antonio</span>
      </div>
    </header>

    <!-- Notificaciones de éxito y error -->
    <div v-if="mensajeExito" class="alert alert-success">
      <span>{{ mensajeExito }}</span>
      <button class="alert-close" @click="mensajeExito = ''">×</button>
    </div>

    <div v-if="mensajeError" class="alert alert-danger">
      <span>{{ mensajeError }}</span>
      <button class="alert-close" @click="mensajeError = ''">×</button>
    </div>

    <!-- Sección del Formulario -->
    <section class="card form-card">
      <div class="card-header">
        <h2>{{ idEditando ? `Editar Rol #${idEditando}` : 'Nuevo Rol' }}</h2>
        <span v-if="idEditando" class="editing-pill">Modo Edición</span>
      </div>

      <form @submit.prevent="guardarRol" class="form-body">
        <div class="form-grid">
          <div class="form-group">
            <label for="nombre">Nombre</label>
            <input
              id="nombre"
              v-model="nombre"
              type="text"
              maxlength="30"
              placeholder="Nombre del rol"
              required
            />
          </div>

          <div class="form-group">
            <label for="descripcion">Descripción</label>
            <input
              id="descripcion"
              v-model="descripcion"
              type="text"
              placeholder="Descripción del rol"
            />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">
            {{ idEditando ? 'Actualizar' : 'Crear' }}
          </button>
          <button
            v-if="idEditando"
            type="button"
            class="btn btn-secondary"
            @click="limpiarFormulario"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>

    <!-- Sección de la Tabla -->
    <section class="card table-card">
      <div class="card-header table-header">
        <div>
          <h2>Listado de Roles</h2>
          <span class="count-badge">{{ roles.length }} registro(s)</span>
        </div>
        <button class="btn btn-outline" @click="cargarRoles" :disabled="cargando">
          {{ cargando ? 'Cargando...' : 'Recargar' }}
        </button>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 80px;">ID</th>
              <th style="width: 180px;">Nombre</th>
              <th>Descripción</th>
              <th style="width: 220px; text-align: center;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="roles.length === 0">
              <td colspan="4" class="empty-state">
                No hay registros disponibles.
              </td>
            </tr>
            <tr v-for="rol in roles" :key="rol.id">
              <td class="cell-id">#{{ rol.id }}</td>
              <td>
                <span class="role-tag">{{ rol.name }}</span>
              </td>
              <td class="cell-desc">{{ rol.description || 'Sin descripción' }}</td>
              <td class="cell-actions">
                <button
                  class="btn-action btn-view"
                  title="Ver"
                  @click="verDetalle(rol.id)"
                >
                  Ver
                </button>
                <button
                  class="btn-action btn-edit"
                  title="Editar"
                  @click="iniciarEdicion(rol)"
                >
                  Editar
                </button>
                <button
                  class="btn-action btn-delete"
                  title="Eliminar"
                  @click="borrarRol(rol)"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Modal Detalle del Rol -->
    <div v-if="rolSeleccionado" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Detalle del Rol</h3>
          <button class="modal-close" @click="cerrarModal">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-row">
            <span class="detail-label">ID:</span>
            <span class="detail-value font-mono">#{{ rolSeleccionado.id }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Nombre:</span>
            <span class="detail-value">
              <span class="role-tag">{{ rolSeleccionado.name }}</span>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Descripción:</span>
            <span class="detail-value">{{ rolSeleccionado.description || 'Sin descripción' }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cerrarModal">Cerrar</button>
          <button
            class="btn btn-primary"
            @click="iniciarEdicion(rolSeleccionado); cerrarModal()"
          >
            Editar Rol
          </button>
        </div>
      </div>
    </div>

    <!-- Visor de Respuesta del Microservicio JSON -->
    <section class="card raw-card">
      <details>
        <summary>
          <strong>Respuesta JSON del Microservicio</strong>
        </summary>
        <div class="json-viewer">
          <pre>{{ respuestaBackend ? JSON.stringify(respuestaBackend, null, 2) : 'Sin datos' }}</pre>
        </div>
      </details>
    </section>
  </div>
</template>

<style scoped>
.crud-container {
  max-width: 980px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header */
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  background: var(--surface-color);
  padding: 18px 24px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.header-titles h1 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-main);
}

.subtitle {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.student-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  background: var(--primary-light);
  padding: 8px 16px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(37, 99, 235, 0.2);
}

.student-badge strong {
  font-size: 0.95rem;
  color: var(--primary);
}

.student-badge span {
  color: var(--text-muted);
  font-size: 0.82rem;
}

/* Alertas */
.alert {
  padding: 12px 18px;
  border-radius: var(--radius-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.alert-success {
  background: var(--success-bg);
  border: 1px solid rgba(22, 163, 74, 0.25);
  color: var(--success);
}

.alert-danger {
  background: var(--danger-light);
  border: 1px solid rgba(220, 38, 38, 0.25);
  color: var(--danger);
}

.alert-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  line-height: 1;
  color: inherit;
  cursor: pointer;
  padding: 0 4px;
}

/* Cards */
.card {
  background: var(--surface-color);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.card-header {
  padding: 16px 22px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  font-size: 1.1rem;
  font-weight: 600;
}

.editing-pill {
  background: #fef3c7;
  color: #b45309;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}

/* Formulario */
.form-body {
  padding: 20px 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-main);
}

.form-group input {
  padding: 9px 12px;
}

.form-actions {
  display: flex;
  gap: 10px;
}

/* Botones */
.btn {
  padding: 8px 16px;
  font-size: 0.9rem;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-secondary {
  background: #f1f5f9;
  color: var(--text-main);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-outline {
  background: transparent;
  color: var(--text-main);
  border: 1px solid var(--border-color);
}

.btn-outline:hover {
  background: #f8fafc;
}

/* Tabla */
.table-header {
  flex-wrap: wrap;
  gap: 12px;
}

.count-badge {
  display: inline-block;
  margin-top: 2px;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  background: #f8fafc;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 12px 18px;
  border-bottom: 1px solid var(--border-color);
}

.data-table td {
  padding: 12px 18px;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
}

.data-table tbody tr:hover {
  background-color: #f8fafc;
}

.cell-id {
  font-family: monospace;
  font-weight: 600;
  color: var(--text-muted);
}

.role-tag {
  display: inline-block;
  background: #e0e7ff;
  color: #3730a3;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
}

.cell-desc {
  color: var(--text-muted);
}

.cell-actions {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.btn-action {
  padding: 5px 10px;
  font-size: 0.78rem;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
}

.btn-view:hover {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #15803d;
}

.btn-edit:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
}

.btn-delete:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #b91c1c;
}

.empty-state {
  text-align: center;
  padding: 32px !important;
  color: var(--text-muted);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.modal-card {
  background: var(--surface-color);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 480px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.05rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.3rem;
  color: var(--text-muted);
  cursor: pointer;
}

.modal-body {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
}

.detail-value {
  font-size: 0.95rem;
  color: var(--text-main);
}

.modal-footer {
  padding: 12px 20px;
  background: #f8fafc;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Raw JSON viewer */
.raw-card {
  padding: 14px 18px;
}

.raw-card summary {
  cursor: pointer;
  user-select: none;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.raw-card summary strong {
  color: var(--text-main);
}

.json-viewer {
  margin-top: 10px;
  background: #0f172a;
  border-radius: var(--radius-md);
  padding: 12px;
  max-height: 220px;
  overflow: auto;
}

.json-viewer pre {
  color: #38bdf8;
  font-family: monospace;
  font-size: 0.82rem;
}
</style>
