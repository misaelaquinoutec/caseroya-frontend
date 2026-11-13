# Informe Final de Proyecto: CaseroYa - Sistema de Gestión de Inventarios y Ventas (Frontend)

## 1. Portada
- **Título del Proyecto:** CaseroYa - Solución Integral de Inventario y Ventas para Negocios Minoristas
- **Nombre del Curso:** CS 2031 Desarrollo Basado en Plataformas
- **Periodo Académico:** 2026-2
- **Integrantes del Equipo:**
    - Adrian Omar Cespedes Llanos – 202510675
    - Enzo Mathias Calderon Soto – 202510032
    - Juan Diego Lama Flor – 202410401
    - Misael Osvaldo Aquino Hidalgo – 202510626
    - Victor Paolo Soto Ruiz – 202510343

---

## 2. Índice
1. Portada
2. Índice
3. Introducción
4. Identificación del Problema o Necesidad
5. Descripción de la Solución
6. Arquitectura y Estructura de Componentes
7. Navegación, Routing y Estado Global
8. Manejo de Errores, Estados de Carga y Validaciones
9. Diseño Visual y Experiencia de Usuario (UI/UX)
10. Integración con Backend y Seguridad JWT
11. GitHub & Project Management
12. Instrucciones de Ejecución
13. Conclusión
14. Apéndices

---

## 3. Introducción

### Contexto
La digitalización de las bodegas, minimarkets y comercios minoristas requiere no solo de un motor transaccional seguro en el servidor, sino de interfaces de usuario ágiles, intuitivas y accesibles desde cualquier dispositivo. En el día a día de un punto de venta minorista, el cajero o administrador necesita registrar operaciones en cuestión de segundos, consultar existencias en tiempo real y visualizar el rendimiento financiero del negocio sin fricción técnica.

### Objetivos del Proyecto
El objetivo de esta segunda fase de **CaseroYa** es diseñar, construir y desplegar el ecosistema Frontend conectado de extremo a extremo con nuestra API REST en la nube (**Render + Supabase**).
Los objetivos específicos incluyen:
- Implementar una aplicación web moderna en **React + TypeScript** orientada a la gestión rápida de ventas (POS), inventario y reportes.
- Garantizar una arquitectura modular basada en componentes reutilizables, *custom hooks* y estado global con Context API.
- Proteger la experiencia de usuario mediante autenticación JWT, rutas privadas, manejo centralizado de errores y estados de carga reactivos.

---

## 4. Identificación del Problema o Necesidad

### Descripción del Problema
Incluso cuando un comercio minorista cuenta con una base de datos estructurada, el uso de interfaces complejas, lentas o poco intuitivas provoca cuellos de botella en la atención al cliente, errores al digitar cantidades o precios, y desconocimiento del stock disponible al momento de vender.

### Justificación
Desarrollar una interfaz web reactiva (Single Page Application) que calcule automáticamente subtotales e impuestos (IGV 18%), valide en tiempo real que la cantidad vendida no supere el stock físico disponible y ofrezca búsqueda instantánea con *debounce* reduce drásticamente el tiempo de atención por cliente y elimina los errores operativos en caja.

---

## 5. Descripción de la Solución

### Funcionalidades Implementadas
La plataforma Frontend de **CaseroYa** se divide en módulos funcionales directamente integrados con el backend:

1. **Autenticación y Control de Sesión (`Login`):**
   - Inicio de sesión validado contra `/api/auth/login`.
   - Almacenamiento y gestión automática del token JWT y perfil del operador activo.
2. **Panel Principal (`Dashboard`):**
   - Resumen ejecutivo con indicadores clave (KPIs): ingresos acumulados, ventas del día, productos activos y alertas automáticas de productos con stock crítico ($\le 10$ unidades).
   - Accesos rápidos a las operaciones frecuentes y tabla de últimas transacciones.
3. **Gestión de Inventario y Control de Stock (`Inventario`):**
   - Catálogo completo de productos con búsqueda reactiva (*debounce*), filtrado por categoría y paginación dinámica.
   - Creación, edición y eliminación lógica de productos mediante modales interactivos.
   - Ajuste directo de existencias (aumento y disminución de unidades en almacén) conectado a las funciones transaccionales del servidor.
4. **Punto de Venta Interactivo (`NuevaVenta`):**
   - Buscador instantáneo de productos con indicador de stock disponible.
   - Carrito de compras interactivo con validación de límites de stock, selección de cliente, moneda (Soles `PEN` / Dólares `USD`) y desglose automático de Subtotal, IGV (18%) y Total.
5. **Historial y Detalle de Ventas (`Ventas` y `DetalleVenta`):**
   - Listado paginado de comprobantes emitidos con filtro por estado (*Completadas* / *Anuladas*) y buscador por número de documento o cliente.
   - Vista detallada por comprobante (`/ventas/:id`) con opción de anulación segura y reversión de stock.
6. **Reportes Financieros (`Reportes`):**
   - Consulta de ventas por rango de fechas (`desde` / `hasta`) con cálculo de ticket promedio, volumen recaudado y desglose por documento.

### Tecnologías Utilizadas
- **Librería Principal:** React 19
- **Lenguaje:** TypeScript 5
- **Entorno de Construcción:** Vite
- **Enrutamiento:** React Router DOM v7
- **Cliente HTTP:** Axios (con interceptores y `AbortController`)
- **Estilización:** Tailwind CSS v4 (con soporte nativo para Modo Claro / Modo Oscuro)
- **Iconografía:** Lucide React

---

## 6. Arquitectura y Estructura de Componentes

El proyecto aplica una separación clara entre la capa de presentación, la lógica de estado y los servicios de red:

```text
web/src/
├── components/
│   ├── common/          # 12 Componentes presentacionales reutilizables
│   │   ├── Alert.tsx
│   │   ├── Badge.tsx
│   │   ├── Breadcrumbs.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Pagination.tsx
│   │   ├── Skeleton.tsx
│   │   └── Spinner.tsx
│   └── layout/          # 3 Componentes estructurales de navegación
│       ├── AppLayout.tsx
│       ├── Navbar.tsx
│       └── Sidebar.tsx
├── context/             # Gestión de estado global (Context API)
│   ├── AuthContext.tsx
│   └── ToastContext.tsx
├── hooks/               # Custom Hooks para lógica compartida
│   ├── useDebounce.ts
│   ├── useFetch.ts
│   └── usePagination.ts
├── pages/               # Vistas principales de la aplicación
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Inventario.tsx
│   ├── Ventas.tsx
│   ├── NuevaVenta.tsx
│   ├── DetalleVenta.tsx
│   ├── Reportes.tsx
│   └── NotFound.tsx
├── routes/
│   └── PrivateRoute.tsx # Guardián de rutas autenticadas
├── services/            # Capa de abstracción de servicios API REST
│   ├── api.ts
│   ├── authService.ts
│   ├── productoService.ts
│   └── ventaService.ts
└── types/
    └── index.ts         # Contratos e interfaces TypeScript
```

---

## 7. Navegación, Routing y Estado Global

- **Rutas Protegidas (`PrivateRoute`):** Verifica la existencia y validez de la sesión antes de renderizar cualquier vista interna, redirigiendo a `/login` en caso contrario.
- **Rutas Dinámicas y Query Params:**
  - Uso de parámetros de ruta en `/ventas/:id` para consultar el detalle individual de un comprobante.
  - Sincronización bidireccional con *query params* (`?page=1&size=10&search=...`) en los listados de Inventario y Ventas para preservar el estado de navegación al compartir URLs.
- **Lazy Loading (`React.lazy` + `Suspense`):** Todas las páginas principales se cargan bajo demanda (code-splitting), optimizando el tamaño del paquete inicial.
- **Indicadores de Ubicación (`Breadcrumbs`) y Ruta 404 (`NotFound`):** Navegación contextual en cada vista y captura de rutas inexistentes.

---

## 8. Manejo de Errores, Estados de Carga y Validaciones

- **Error Boundary Global (`ErrorBoundary.tsx`):** Captura errores inesperados en el árbol de renderizado de React mostrando una pantalla de recuperación amigable.
- **Estados de Carga (`Skeleton` y `Spinner`):** Mientras se resuelven las peticiones asíncronas hacia Render y Supabase, la interfaz muestra esqueletos animados y bloquea botones de envío (`isLoading`) para prevenir envíos duplicados (*double-submit*).
- **Cancelación de Peticiones (`AbortController`):** El hook `useFetch` cancela automáticamente las peticiones HTTP en vuelo si el componente se desmonta antes de recibir respuesta, evitando fugas de memoria.
- **Validación en Tiempo Real y Feedback (`ToastContext`):** Validaciones de campos obligatorios, precios mayores a cero y stock suficiente antes de emitir solicitudes, acompañadas de notificaciones flotantes (*toasts*) de éxito, advertencia o error.

---

## 9. Diseño Visual y Experiencia de Usuario (UI/UX)

- **Diseño Responsivo y Consistente:** Interfaz adaptable a pantallas móviles, tablets y monitores de escritorio mediante grillas flexibles y barra lateral colapsable.
- **Modo Oscuro (`Dark Mode`):** Selector integrado en la barra superior (`Navbar.tsx`) con persistencia en `localStorage`, adaptando toda la paleta visual para entornos de baja iluminación.
- **Confirmación de Acciones Destructivas:** Uso de modales de confirmación antes de dar de baja un producto o anular un comprobante de venta.
- **Paginación Completa (`Pagination.tsx`):** Controles intuitivos de página anterior, siguiente, numeración directa, selector de tamaño de página (`10`, `25`, `50`, `100` registros) y contador de resultados (`Mostrando X - Y de Z resultados`).

---

## 10. Integración con Backend y Seguridad JWT

La comunicación con el servidor se centraliza en `src/services/api.ts`:
- **Interceptor de Solicitud (Request):** Adjunta automáticamente el encabezado `Authorization: Bearer <token>` en cada llamada hacia la API REST.
- **Interceptor de Respuesta (Response):** Detecta respuestas `401 Unauthorized` (token expirado o inválido), limpia la sesión local y redirige de forma segura a `/login`. Asimismo, extrae los mensajes semánticos enviados por el `GlobalExceptionHandler` del backend.

---

## 11. GitHub & Project Management

- **Organización Modular:** Separación limpia entre `/web` y `/mobile` dentro del repositorio de Frontend.
- **Control de Versiones:** Uso de `.gitignore` para excluir dependencias (`node_modules`), compilados (`dist`) y archivos de variables de entorno locales (`.env`), manteniendo una plantilla `.env.example` documentada.

---

## 12. Instrucciones de Ejecución

### Requisitos Previos
- Node.js 18+ y npm

### Pasos para Ejecutar la Aplicación Web en Local
1. **Clonar el repositorio e ingresar al módulo web:**
   ```bash
   git clone https://github.com/misaelaquinoutec/caseroya-frontend.git
   cd caseroya-frontend/web
   ```
2. **Configurar variables de entorno (`.env`):**
   ```env
   VITE_API_URL=https://proyecto-caseroya-cr2n.onrender.com/api
   ```
3. **Instalar dependencias:**
   ```bash
   npm install
   ```
4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
5. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## 13. Conclusión

### Logros del Proyecto
Con el desarrollo del Frontend de **CaseroYa**, se completó la integración de punta a punta entre la interfaz de usuario, la API REST en Spring Boot desplegada en Render y la base de datos PostgreSQL en Supabase. La aplicación resultante ofrece una experiencia fluida, segura y veloz que digitaliza por completo el flujo operativo de un negocio minorista.

### Aprendizajes Clave
El equipo consolidó el dominio de patrones modernos en React con TypeScript: diseño de componentes desacoplados, creación de *custom hooks* para encapsular lógica de red y paginación, manejo de ciclo de vida de peticiones con `AbortController` y sincronización de estado con parámetros de URL.

---

## 14. Apéndices

- **Licencia:** MIT License.
- **Backend API en Producción (Render):** [https://proyecto-caseroya-cr2n.onrender.com](https://proyecto-caseroya-cr2n.onrender.com)
- **Documentación Swagger UI:** [https://proyecto-caseroya-cr2n.onrender.com/swagger-ui/index.html](https://proyecto-caseroya-cr2n.onrender.com/swagger-ui/index.html)
- **Credenciales de Acceso para Pruebas:**
  - **Administrador Principal:** Usuario `ADMIN01` | Contraseña `admin123`
  - **Cuentas del Equipo:** Usuarios `ACESPEDES`, `PSOTO`, `ECALDERON`, `JLAMA` | Contraseña `1234`
