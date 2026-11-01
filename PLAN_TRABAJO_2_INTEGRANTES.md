# 📋 Plan de Distribución y Arquitectura (Equipo de 2 Integrantes)
### Proyecto CS2031 - DBP (Fase 2: Frontend & Deployment)

---

## 🎯 Resumen Ejecutivo

Debido a la reducción del equipo de 5 a 2 integrantes, se distribuyen las responsabilidades de forma equitativa, vertical y alineada 100% con los criterios de evaluación de la **Rúbrica de Proyecto 2 (20 pts)**:

| Integrante | Rol Principal | Puntos Rúbrica Directos | Tecnologías Core |
| :--- | :--- | :---: | :--- |
| **Integrante 1** | **Web Lead & Cloud Deployment** | **7 pts** (Web 5 pts + Deployment 2 pts) | React, Vite, Tailwind CSS, React Router, Axios, Vercel/Netlify |
| **Integrante 2** | **Mobile Lead & Sensores / APIs** | **6.5 pts** (Mobile 5 pts + Expo/Deploy 1.5 pts) | React Native, Expo, SecureStore, Cámara, GPS, Axios |
| **Ambos** | **Pitch, Demo en Vivo & Preguntas** | **6.5 pts** (Exposición 5 pts + Ajustes) | PPT estilo Apple, guión del demo de 20 min |

---

## 💻 Integrante 1: Web Lead & Cloud Deployment

### 1. Entregables Web (5 puntos)
* **Arquitectura & Componentes Reutilizables (3.2 - 1 pt)**:
  - Mantener y extender la biblioteca de **>10 componentes reutilizables** (`Button`, `Input`, `Modal`, `Table`, `Badge`, `Spinner`, `Skeleton`, `Pagination`, `Alert`, `EmptyState`, etc.).
  - Implementación de custom hooks (`useAuth`, `usePagination`, `useDebounce`, `useFetch`).
* **Routing y Navegación (3.3 - 1 pt)**:
  - `React Router v7` con rutas protegidas (`PrivateRoute`), lazy loading (`React.lazy` + `Suspense`) y manejo de `404 Not Found`.
* **Consumo de API & Manejo de Errores (3.1 & 3.4 - 2 pts)**:
  - Consumo del Backend REST con Axios (`src/services/api.ts`), interceptores de JWT, control de cancelación de peticiones con `AbortController`.
  - Formularios con validaciones y deshabilitación de botones para prevenir doble-submit.
* **UI/UX y Paginación Doble (4.1 a 4.4 - 2 pts)**:
  - Diseño responsive y estilizado con **Tailwind CSS**.
  - **Paginación en al menos 2 vistas**:
    1. Listado de Ventas (`/ventas`) con búsqueda con `debounce`.
    2. Inventario y Stock (`/inventario`).
  - Vistas completas: `Login`, `Dashboard` con métricas, `Ventas`, `NuevaVenta`, `Inventario`.

### 2. Despliegue en la Nube (3.1 & 5.0)
* Desplegar la aplicación Web en **Vercel** o **Netlify**.
* Conectar las variables de entorno de producción (`VITE_API_URL`) hacia el backend en producción.
* Verificar que no existan bloqueos de CORS y que funcione sobre HTTPS.

---

## 📱 Integrante 2: Mobile Lead, Sensores & Expo

### 1. Entregables Mobile (5 puntos)
* **Integración API & Seguridad (2.1 - 1.5 pts)**:
  - Cliente Axios centralizado (`mobile/src/services/api.ts`).
  - Almacenamiento seguro de tokens JWT utilizando **Expo SecureStore** (`mobile/src/services/storage.ts`).
  - Interceptores para inyectar `Authorization: Bearer <token>` y auto-logout en 401.
* **Arquitectura & Separación de Capas (2.2 - 1 pt)**:
  - Estructura limpia por capas: `services/`, `context/`, `hooks/`, `components/`, `screens/`.
  - Manejo de estado de autenticación con `AuthContext`.
* **Sensores & API Externa (2.3 - 1.5 pts)**:
  - **Sensor 1 (Cámara)**: Escáner de código de barras y códigos QR usando `expo-camera` para registrar o buscar productos rápidamente.
  - **Sensor 2 (GPS / Ubicación)**: Obtención de geolocalización en tiempo real usando `expo-location` para registrar la ubicación del punto de venta/despacho.
  - **API Externa**: Consumo en tiempo real del Tipo de Cambio (SUNAT / SBS) para cotización de ventas en Soles y Dólares.
  - Manejo amigable de permisos y mensajes de fallback si el usuario deniega el acceso.
* **Manejo de Errores y Loading (2.4 - 1 pt)**:
  - `ActivityIndicator` en llamadas asíncronas, alertas de confirmación y feedback visual.

### 2. Publicación Mobile (5.0)
* Configuración de **Expo Go** / **Expo EAS** para que el docente y evaluadores puedan probar la app escaneando un código QR desde su celular.

---

## 🎤 Trabajo Conjunto: Pitch y Presentación Final (5 puntos)

* **Estructura recomendada (20 minutos)**:
  1. **Gancho inicial (1 min)**: Problema común en bodegas y minimarkets al gestionar inventario y emitir comprobantes sin conexión ágil.
  2. **Planteamiento del problema (2 min)**: Brecha entre la gestión de escritorio y la venta en el punto móvil.
  3. **Solución CaseroYa (4 min)**: Ecosistema integrado: Backend Spring Boot + Web Administrativa (React/Tailwind) + Mobile Operativo (React Native con sensores).
  4. **Arquitectura Técnica (2 min)**: Diagrama mostrando Backend REST, Base de Datos, Web y Mobile comunicándose vía JWT.
  5. **Demo en Vivo (6 min)**:
     - *Paso 1*: Integrante 1 hace login en la Web y muestra el Dashboard de ventas.
     - *Paso 2*: Integrante 2 en la App Mobile escanea un producto con la cámara, toma la ubicación GPS y emite una venta express.
     - *Paso 3*: Integrante 1 refresca la Web y muestra la venta recién registrada y el stock actualizado en tiempo real.
  6. **Ronda de Preguntas (5 min)**: Ambos responden dudas técnicas del código y arquitectura.
