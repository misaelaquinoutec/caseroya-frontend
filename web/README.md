# Informe Final de Proyecto: CaseroYa - Sistema de Gestión de Inventarios y Ventas (Frontend)

## 1. Portada
- **Título del Proyecto:** CaseroYa - Solución Integral de Inventario y Ventas para Negocios Minoristas
- **Nombre del Curso:** CS 2031 Desarrollo Basado en Plataformas
- **Periodo Académico:** 2026-2
- **Integrantes del Equipo:**
    - Enzo Mathias Calderon Soto – 202510032
    - Misael Osvaldo Aquino Hidalgo – 202510626
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
La digitalización de las bodegas, minimarkets y comercios minoristas requiere no solo de un motor transaccional seguro en el servidor, sino de interfaces de usuario ágiles, intuitivas y accesibles desde cualquier dispositivo. En el día a día de un punto de venta minorista, el cajero o administrador necesita registrar operaciones en cuestión de segundos, reabastecer mercadería, consultar existencias en tiempo real y visualizar el rendimiento financiero del negocio sin fricción técnica.

### Objetivos del Proyecto
El objetivo de esta segunda fase de **CaseroYa** es diseñar, construir y desplegar el ecosistema Frontend conectado de extremo a extremo con nuestra API REST en la nube (**Render + Supabase**).
Los objetivos específicos incluyen:
- Implementar una aplicación web moderna en **React + TypeScript** orientada a la gestión rápida de ventas (POS), abastecimiento por compras a proveedores, control de inventario, cartera de clientes, administración de operadores y reportes analíticos.
- Garantizar una arquitectura modular basada en componentes reutilizables, *custom hooks* y estado global con Context API.
- Proteger la experiencia de usuario mediante autenticación JWT, rutas privadas, manejo centralizado de errores y estados de carga reactivos.

---

## 4. Identificación del Problema o Necesidad

### Descripción del Problema
Incluso cuando un comercio minorista cuenta con una base de datos estructurada, el uso de interfaces complejas, lentas o poco intuitivas provoca cuellos de botella en la atención al cliente, errores al digitar cantidades o precios, y desconocimiento del stock disponible al momento de vender o reabastecer.

### Justificación
Desarrollar una interfaz web reactiva (Single Page Application) que asigne automáticamente el precio unitario de catálogo de cada producto, actualice los importes y el IGV (18%) de forma dinámica al variar la cantidad, valide en tiempo real que la venta no supere el stock físico disponible y ofrezca búsqueda instantánea con *debounce* reduce drásticamente el tiempo de atención por cliente y elimina los errores operativos en caja.

---

## 5. Descripción de la Solución

### Funcionalidades Implementadas
La plataforma Frontend de **CaseroYa** abarca 8 módulos operativos directamente integrados con todos los controladores del backend:

1. **Autenticación y Control de Sesión (`Login`):**
   - Inicio de sesión validado contra `/api/auth/login`.
   - Almacenamiento y gestión automática del token JWT y perfil del operador activo (`ADM`, `CAJ`, `VEN`).
2. **Panel Principal (`Dashboard`):**
   - Resumen ejecutivo con indicadores clave (KPIs): ingresos acumulados de ventas activas, total de comprobantes emitidos, estado de sincronización del inventario y monitoreo de las últimas transacciones.
3. **Punto de Venta Interactivo (`NuevaVenta`):**
   - Asignación automática del precio unitario oficial (`precioVenta`) al seleccionar un producto y recálculo inmediato del importe al incrementar o disminuir la cantidad.
   - Registro rápido de clientes en vivo (`+ Nuevo Cliente`) mediante ventana modal sin abandonar la venta.
   - Selección de Tipo de Comprobante (**Boleta de Venta `B001`** o **Factura Electrónica `F001`**) y Moneda (**Soles `PEN`** o **Dólares `USD`**), con desglose automático de Op. Gravada, IGV (18%) y Total.
4. **Historial y Detalle de Ventas (`Ventas` y `DetalleVenta`):**
   - Listado paginado de comprobantes emitidos con buscador reactivo, visualización del nombre real del cliente y estado del documento (`REGISTRADO` / `ANULADO`).
   - Vista detallada e imprimible por comprobante (`/ventas/:id`) con resolución de nombres de productos y opción de anulación segura con reversión automática de stock.
5. **Gestión de Inventario y Reabastecimiento Rápido (`Inventario`):**
   - Catálogo completo de productos sincronizado en paralelo con `/api/productos` y `/api/stock`, con búsqueda reactiva (*debounce*), filtrado por categoría y paginación sincronizada con URL.
   - Creación (`+ Nuevo Producto`), edición y baja lógica de productos mediante modales interactivos.
   - Reabastecimiento directo de unidades (`+ Stock` conectado a `PUT /api/stock/{id}/aumentar`) cuando un producto tiene stock bajo o agotado.
6. **Compras y Directorio de Proveedores (`ComprasProveedores`):**
   - **Órdenes de Compra (`/api/compras`):** Registro de facturas/guías de compra a proveedores que incrementa automáticamente el stock de los productos adquiridos, además de consulta y anulación de compras por ID.
   - **Proveedores (`/api/proveedores`):** Mantenimiento completo (CRUD) de empresas distribuidoras con RUC, razón social, teléfono y dirección.
7. **Directorio de Clientes (`Clientes`):**
   - Mantenimiento completo (CRUD) conectado a `/api/clientes` con soporte para DNI, RUC y Carné de Extranjería, buscador en tiempo real y baja lógica.
8. **Gestión de Usuarios y Roles (`Usuarios`) y Reportes por Fecha (`Reportes`):**
   - Administración de cuentas de operadores y cajeros (`/api/usuarios` y `/api/perfiles`) con contraseñas cifradas en BCrypt.
   - Reportes analíticos filtrados por rango de fechas (`/api/reportes/ventas`) con cálculo de facturación neta, comprobantes válidos vs. anulados y ticket promedio.

### Tecnologías Utilizadas
- **Librería Principal:** React 19
- **Lenguaje:** TypeScript 5
- **Entorno de Construcción:** Vite
- **Enrutamiento:** React Router DOM v7
- **Cliente HTTP:** Axios (con interceptores y `AbortController`)
- **Estilización:** Tailwind CSS v4 (con soporte completo para Modo Claro y Modo Oscuro)
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
├── pages/               # 11 Vistas principales de la aplicación
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Inventario.tsx
│   ├── Ventas.tsx
│   ├── NuevaVenta.tsx
│   ├── DetalleVenta.tsx
│   ├── ComprasProveedores.tsx
│   ├── Clientes.tsx
│   ├── Usuarios.tsx
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
- **Indicadores de Ubicación (`Breadcrumbs`) y Ruta 404 (`NotFound`):** Navegación contextual en cada vista, resaltado exacto de ruta activa (`end`) en la barra lateral y captura de rutas inexistentes.

---

## 8. Manejo de Errores, Estados de Carga y Validaciones

- **Error Boundary Global (`ErrorBoundary.tsx`):** Captura errores inesperados en el árbol de renderizado de React mostrando una pantalla de recuperación amigable.
- **Estados de Carga (`Skeleton` y `Spinner`):** Mientras se resuelven las peticiones asíncronas hacia Render y Supabase, la interfaz muestra indicadores de carga y bloquea botones de envío (`isLoading`) para prevenir envíos duplicados (*double-submit*).
- **Cancelación de Peticiones (`AbortController`):** El hook `useFetch` cancela automáticamente las peticiones HTTP en vuelo si el componente se desmonta antes de recibir respuesta, evitando fugas de memoria.
- **Validación en Tiempo Real y Feedback (`ToastContext`):** Validaciones de campos obligatorios, precios mayores a cero y stock suficiente antes de emitir solicitudes, acompañadas de notificaciones flotantes (*toasts*) de éxito, información o error.

---

## 9. Diseño Visual y Experiencia de Usuario (UI/UX)

- **Diseño Responsivo y Consistente:** Interfaz adaptable a distintas resoluciones de pantalla mediante grillas flexibles y barra de navegación lateral estructurada.
- **Modo Claro y Modo Oscuro (`Dark Mode`):** Selector integrado en la barra superior (`Navbar.tsx`) con persistencia en `localStorage`, adaptando fondos, tarjetas, tablas, formularios y etiquetas de estado (`Badge`) con alto contraste.
- **Confirmación de Acciones Destructivas:** Uso de modales de confirmación antes de inactivar registros o anular comprobantes de venta.
- **Paginación Completa (`Pagination.tsx`):** Controles intuitivos de página anterior, siguiente, numeración directa, selector de tamaño de página (`10`, `25`, `50`, `100` registros) y contador de resultados (`Mostrando X - Y de Z resultados`).

---

## 10. Integración con Backend y Seguridad JWT

La comunicación con el servidor se centraliza en `src/services/api.ts`:
- **Interceptor de Solicitud (Request):** Adjunta automáticamente el encabezado `Authorization: Bearer <token>` en cada llamada hacia la API REST.
- **Interceptor de Respuesta (Response):** Detecta respuestas `401 Unauthorized` (token expirado o inválido), limpia la sesión local y redirige de forma segura a `/login`. Asimismo, normaliza los DTOs provenientes del servidor y extrae los mensajes semánticos enviados por el `GlobalExceptionHandler` del backend.

---

## 11. GitHub & Project Management

- **Organización Modular:** Separación limpia dentro del repositorio de Frontend.
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
Con el desarrollo del Frontend de **CaseroYa**, se completó la integración de punta a punta entre la interfaz de usuario, la API REST en Spring Boot desplegada en Render y la base de datos PostgreSQL en Supabase. La aplicación resultante ofrece una experiencia fluida, segura y veloz que digitaliza por completo el flujo comercial, de abastecimiento y de control de inventario de un negocio minorista.

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
