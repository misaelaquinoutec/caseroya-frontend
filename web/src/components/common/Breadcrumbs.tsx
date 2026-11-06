import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeNames: Record<string, string> = {
  '': 'Inicio',
  'ventas': 'Ventas',
  'nueva': 'Nueva Venta',
  'inventario': 'Inventario & Stock',
  'reportes': 'Reportes de Ventas',
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-500 mb-4" aria-label="Breadcrumb">
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Inicio</span>
      </Link>

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNames[name] || (!isNaN(Number(name)) ? `Venta #${name}` : name);

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-800">{displayName}</span>
            ) : (
              <Link to={routeTo} className="hover:text-indigo-600 transition-colors">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
