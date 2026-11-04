<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  obtenerRoles,
  obtenerRol,
  crearRol,
  actualizarRol,
  eliminarRol,
} from '../services/roles.service'

const roles = ref([])
const nombre = ref('')
const descripcion = ref('')
const idEditando = ref(null)
const busqueda = ref('')
const rolDetalle = ref(null)
const mensaje = ref('')
const error = ref('')
const respuestaRaw = ref(null)

function notificar(txt, json = null) {
  mensaje.value = txt
  error.value = ''
  if (json) respuestaRaw.value = json
}

function fallar(err) {
  error.value = err.message || 'Error en la petición'
  mensaje.value = ''
}

// 1. Listar todos
async function cargarRoles() {
  try {
    const json = await obtenerRoles()
    roles.value = json.data || []
    respuestaRaw.value = json
  } catch (e) {
    fallar(e)
  }
}

// 2. Buscar por ID o por nombre
async function buscar() {
  const termino = busqueda.value.trim()
  if (!termino) {
    cargarRoles()
    rolDetalle.value = null
    return
  }

  // Si es un número entero, consulta el endpoint específico GET /roles/:id
  if (/^\d+$/.test(termino)) {
    try {
      const json = await obtenerRol(termino)
      rolDetalle.value = json.data
      notificar(`Rol #${termino} encontrado`, json)
    } catch (e) {
      rolDetalle.value = null
      fallar(e)
    }
  } else {
    // Si es texto, filtra por nombre en la lista
    rolDetalle.value = null
    notificar(`Filtrando por: ${termino}`)
  }
}

function limpiarBusqueda() {
  busqueda.value = ''
  rolDetalle.value = null
  cargarRoles()
}

// 3. Ver uno en detalle
async function verUno(id) {
  try {
    const json = await obtenerRol(id)
    rolDetalle.value = json.data
    notificar(`Detalle del rol #${id}`, json)
  } catch (e) {
    fallar(e)
  }
}

// 4. Crear o Actualizar
async function guardar() {
  const n = nombre.value.trim()
  if (!n) {
    error.value = 'El campo nombre es obligatorio'
    return
  }

  const payload = {
    name: n,
    description: descripcion.value.trim() || null,
  }

  try {
    let json
    if (idEditando.value) {
      json = await actualizarRol(idEditando.value, payload)
      notificar(`Rol #${idEditando.value} actualizado`, json)
    } else {
      json = await crearRol(payload)
      notificar('Rol creado', json)
    }
    limpiarForm()
    await cargarRoles()
  } catch (e) {
    fallar(e)
  }
}

function editar(rol) {
  idEditando.value = rol.id
  nombre.value = rol.name
  descripcion.value = rol.description || ''
}

function limpiarForm() {
  idEditando.value = null
  nombre.value = ''
  descripcion.value = ''
}

// 5. Eliminar
async function borrar(rol) {
  if (!confirm(`¿Eliminar el rol ${rol.name} (#${rol.id})?`)) return
  try {
    const json = await eliminarRol(rol.id)
    notificar(`Rol #${rol.id} eliminado`, json)
    if (rolDetalle.value && rolDetalle.value.id === rol.id) {
      rolDetalle.value = null
    }
    await cargarRoles()
  } catch (e) {
    fallar(e)
  }
}

// Filtrado de tabla
const listaVisible = computed(() => {
  const termino = busqueda.value.toLowerCase().trim()
  if (!termino || /^\d+$/.test(termino)) {
    return roles.value
  }
  return roles.value.filter(
    (r) =>
      r.name.toLowerCase().includes(termino) ||
      (r.description && r.description.toLowerCase().includes(termino))
  )
})

onMounted(cargarRoles)
</script>

<template>
  <div class="panel">
    <!-- Header -->
    <header class="header">
      <h2>CRUD de Roles</h2>
      <p>22160984 - Acevedo García José Antonio</p>
    </header>

    <!-- Avisos -->
    <div v-if="mensaje" class="msg msg-ok">{{ mensaje }}</div>
    <div v-if="error" class="msg msg-err">{{ error }}</div>

    <!-- Búsqueda -->
    <section class="bloque">
      <h3>Buscar Rol</h3>
      <form @submit.prevent="buscar" class="fila">
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por ID o Nombre..."
          class="input-grow"
        />
        <button type="submit">Buscar</button>
        <button type="button" @click="limpiarBusqueda">Ver todos</button>
      </form>
    </section>

    <!-- Detalle consultado individualmente -->
    <section v-if="rolDetalle" class="bloque detalle">
      <h3>Detalle del Rol #{{ rolDetalle.id }}</h3>
      <p><strong>ID:</strong> {{ rolDetalle.id }}</p>
      <p><strong>Nombre:</strong> {{ rolDetalle.name }}</p>
      <p><strong>Descripción:</strong> {{ rolDetalle.description || 'Sin descripción' }}</p>
      <div class="fila-btns">
        <button @click="editar(rolDetalle)">Editar</button>
        <button @click="rolDetalle = null">Cerrar</button>
      </div>
    </section>

    <!-- Formulario Crear / Editar -->
    <section class="bloque">
      <h3>{{ idEditando ? `Editar Rol #${idEditando}` : 'Nuevo Rol' }}</h3>
      <form @submit.prevent="guardar" class="formulario">
        <div class="campo">
          <label>Nombre:</label>
          <input v-model="nombre" type="text" maxlength="30" required />
        </div>
        <div class="campo">
          <label>Descripción:</label>
          <input v-model="descripcion" type="text" />
        </div>
        <div class="fila-btns">
          <button type="submit">{{ idEditando ? 'Guardar Cambios' : 'Crear' }}</button>
          <button v-if="idEditando" type="button" @click="limpiarForm">Cancelar</button>
        </div>
      </form>
    </section>

    <!-- Tabla de Roles -->
    <section class="bloque">
      <div class="fila-titulo">
        <h3>Lista de Roles ({{ listaVisible.length }})</h3>
        <button @click="cargarRoles">Actualizar lista</button>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 60px;">ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th style="width: 170px;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="listaVisible.length === 0">
            <td colspan="4" style="text-align: center; color: #777;">
              No hay registros disponibles.
            </td>
          </tr>
          <tr v-for="rol in listaVisible" :key="rol.id">
            <td>{{ rol.id }}</td>
            <td><strong>{{ rol.name }}</strong></td>
            <td>{{ rol.description || '-' }}</td>
            <td>
              <button class="btn-sm" @click="verUno(rol.id)">Ver</button>
              <button class="btn-sm" @click="editar(rol)">Editar</button>
              <button class="btn-sm" @click="borrar(rol)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Respuesta JSON del backend -->
    <section class="bloque">
      <details>
        <summary>Respuesta del microservicio (JSON)</summary>
        <pre class="json-box">{{ respuestaRaw }}</pre>
      </details>
    </section>
  </div>
</template>

<style scoped>
.panel {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header {
  border-bottom: 2px solid #111;
  padding-bottom: 8px;
}

.header h2 {
  font-size: 20px;
  margin-bottom: 2px;
}

.header p {
  font-size: 13px;
  color: #555;
}

.msg {
  padding: 8px 12px;
  border: 1px solid #111;
  font-size: 13px;
}

.msg-ok {
  background: #f4f4f4;
}

.msg-err {
  background: #ffffff;
  border-left: 5px solid #111;
  font-weight: 600;
}

.bloque {
  border: 1px solid #ccc;
  padding: 14px;
  background: #fff;
}

.bloque h3 {
  font-size: 15px;
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 4px;
}

.fila {
  display: flex;
  gap: 8px;
}

.input-grow {
  flex: 1;
}

.fila-titulo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.campo label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.fila-btns {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.btn-sm {
  padding: 3px 8px;
  font-size: 12px;
  margin-right: 4px;
}

.detalle {
  background: #fafafa;
  border: 1px solid #111;
}

.detalle p {
  font-size: 13px;
  margin-bottom: 4px;
}

details summary {
  cursor: pointer;
  font-size: 13px;
  color: #444;
}

.json-box {
  background: #f7f7f7;
  border: 1px solid #ddd;
  padding: 8px;
  margin-top: 8px;
  font-size: 11px;
  overflow: auto;
  max-height: 200px;
  font-family: monospace;
}
</style>
