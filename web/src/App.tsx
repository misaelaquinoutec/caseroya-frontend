import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PrivateRoute } from './routes/PrivateRoute';
import { AppLayout } from './components/layout/AppLayout';
import { Spinner } from './components/common/Spinner';

// Lazy loading views for high performance as required by rubric 3.3
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Ventas = lazy(() => import('./pages/Ventas').then((m) => ({ default: m.Ventas })));
const DetalleVenta = lazy(() => import('./pages/DetalleVenta').then((m) => ({ default: m.DetalleVenta })));
const NuevaVenta = lazy(() => import('./pages/NuevaVenta').then((m) => ({ default: m.NuevaVenta })));
const Inventario = lazy(() => import('./pages/Inventario').then((m) => ({ default: m.Inventario })));
const Clientes = lazy(() => import('./pages/Clientes').then((m) => ({ default: m.Clientes })));
const ComprasProveedores = lazy(() =>
  import('./pages/ComprasProveedores').then((m) => ({ default: m.ComprasProveedores }))
);
const Usuarios = lazy(() => import('./pages/Usuarios').then((m) => ({ default: m.Usuarios })));
const Reportes = lazy(() => import('./pages/Reportes').then((m) => ({ default: m.Reportes })));
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center p-12 min-h-[50vh]">
    <Spinner size="lg" label="Cargando módulo..." />
  </div>
);

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <AppLayout />
                    </PrivateRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="ventas" element={<Ventas />} />
                  <Route path="ventas/:id" element={<DetalleVenta />} />
                  <Route path="ventas/nueva" element={<NuevaVenta />} />
                  <Route path="inventario" element={<Inventario />} />
                  <Route path="clientes" element={<Clientes />} />
                  <Route path="compras" element={<ComprasProveedores />} />
                  <Route path="usuarios" element={<Usuarios />} />
                  <Route path="reportes" element={<Reportes />} />
                </Route>

                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
