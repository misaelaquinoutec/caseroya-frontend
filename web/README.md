# 🛒 CaseroYa POS - Sistema Web de Gestión de Ventas e Inventario

**Curso**: CS 2031 - Desarrollo Basado en Plataformas (DBP 2026-2)  
**Componente**: Frontend Web (React 19 + TypeScript + Vite + Tailwind CSS v4)  
**Backend Desplegado (Render)**: [https://proyecto-caseroya-cr2n.onrender.com](https://proyecto-caseroya-cr2n.onrender.com)  
**Swagger / OpenAPI**: [https://proyecto-caseroya-cr2n.onrender.com/swagger-ui/index.html](https://proyecto-caseroya-cr2n.onrender.com/swagger-ui/index.html)

---

## 📋 Descripción del Proyecto

**CaseroYa POS** es una plataforma web moderna para bodegas y minimarkets que centraliza el punto de venta (POS), el control de stock en tiempo real, el catálogo de productos y los reportes financieros conectados a una API REST en **Spring Boot** y base de datos **PostgreSQL en Supabase**.

---

## 🏗️ Arquitectura del Frontend Web

El proyecto sigue una arquitectura modular con separación estricta de responsabilidades:

```text
web/src/
├── components/
│   ├── common/          # 12 Componentes reutilizables de UI
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
│   └── layout/          # 3 Componentes estructurales (incluye Dark Mode)
│       ├── AppLayout.tsx
│       ├── Navbar.tsx
│       └── Sidebar.tsx
├── context/             # Estado global con React Context API
│   ├── AuthContext.tsx  # Sesión JWT y usuario autenticado
│   └── ToastContext.tsx # Notificaciones flotantes contextuales
├── hooks/               # Custom Hooks reutilizables
│   ├── useDebounce.ts   # Búsqueda optimizada sin saturar renders
│   ├── useFetch.ts      # Fetching con AbortController y retry
│   └── usePagination.ts # Paginación sincronizada con URL query params
├── pages/               # 7 Vistas principales con Lazy Loading
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Inventario.tsx
│   ├── Ventas.tsx
│   ├── NuevaVenta.tsx
│   ├── DetalleVenta.tsx
│   ├── Reportes.tsx
│   └── NotFound.tsx
├── routes/
│   └── PrivateRoute.tsx # Protección de rutas autenticadas
├── services/            # Capa de cliente HTTP Axios con interceptores
│   ├── api.ts
│   ├── authService.ts
│   ├── productoService.ts
│   └── ventaService.ts
└── types/
    └── index.ts         # Interfaces TypeScript de dominio
```

---

## ✨ Características Principales

* **Consumo de API REST**: Configurado con Axios (`api.ts`), inyección automática de `Authorization: Bearer <token>`, cierre de sesión automático ante `401 Unauthorized` y cancelación de peticiones con `AbortController`.
* **Componentes Reutilizables**: 15 componentes modulares tipados con TypeScript y diseñados bajo el principio de responsabilidad única (SRP).
* **Routing Avanzado y Lazy Loading**: Rutas protegidas (`PrivateRoute`), rutas dinámicas (`/ventas/:id`), sincronización de filtros y paginación en query params (`?page=1&size=10&search=...`), carga diferida con `React.lazy` + `Suspense`, `Breadcrumbs` y página `404`.
* **Manejo de Errores y Estados de Carga**: `ErrorBoundary` global, indicadores `Skeleton` y `Spinner`, notificaciones `Toast`, prevención de doble envío y botón de reintento (`retry`).
* **Dark Mode (Modo Oscuro)**: Selector de tema claro/oscuro persistente en `localStorage` integrado en la barra de navegación.

---

## 🚀 Instalación y Ejecución Local

1. **Instalar dependencias**:
   ```bash
   cd web
   npm install
   ```

2. **Configurar variables de entorno (`.env`)**:
   ```env
   VITE_API_URL=https://proyecto-caseroya-cr2n.onrender.com/api
   ```

3. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. **Compilar para producción**:
   ```bash
   npm run build
   ```

---

## 🔑 Credenciales de Prueba

| Usuario | Contraseña | Rol |
| :--- | :--- | :--- |
| `ADMIN01` | `admin123` | `ADM` (Administrador) |
| `ACESPEDES` | `1234` | `ADM` (Administrador) |
| `PSOTO` | `1234` | `ADM` (Administrador) |
| `ECALDERON` | `1234` | `ADM` (Administrador) |
| `JLAMA` | `1234` | `ADM` (Administrador) |
