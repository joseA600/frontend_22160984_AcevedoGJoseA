# frontend_22160984_AcevedoGJoseA

Frontend desarrollado en **Vue 3** y **Vite** con CSS personalizado (diseño limpio y responsivo sin frameworks pesados como Tailwind) para consumir el microservicio de roles del docente (repositorio `BanderoChinoZF/backend_for_students`, rama `BFS-0002`).

**Alumno:** 22160984 - Acevedo García José Antonio

---

## 📌 Endpoints que consume

- `GET /api/v2/roles` - Obtener lista de todos los roles
- `GET /api/v2/roles/:id` - Consultar un rol por ID
- `POST /api/v2/roles` - Crear un nuevo rol
- `PUT /api/v2/roles/:id` - Actualizar un rol existente
- `DELETE /api/v2/roles/:id` - Eliminar un rol

---

## 🚀 Cómo ejecutarlo

1. **Asegúrate de que el Backend esté corriendo:**
   En la carpeta de tu backend (`backend_base`), levanta el servidor con PostgreSQL:
   ```bash
   npm run dev
   ```
   (El backend por defecto corre en `http://localhost:3000`).

2. **Instalar dependencias del Frontend:**
   ```bash
   npm install
   ```

3. **Variables de entorno:**
   Copia el archivo `.env.example` a `.env` (si aún no existe):
   ```bash
   cp .env.example .env
   ```
   Asegúrate de que contenga:
   ```env
   VITE_API_URL=http://localhost:3000/api/v2
   ```

4. **Iniciar el frontend:**
   ```bash
   npm run dev
   ```
   Abre la aplicación en tu navegador: `http://localhost:5173`.
