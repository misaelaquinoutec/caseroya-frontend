import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  PlusCircle,
  Package,
  Users,
  Truck,
  ShieldCheck,
  FileBarChart,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { to: '/ventas', label: 'Ventas Realizadas', icon: <ShoppingCart className="w-5 h-5" /> },
    { to: '/ventas/nueva', label: 'Nueva Venta', icon: <PlusCircle className="w-5 h-5" /> },
    { to: '/inventario', label: 'Inventario & Stock', icon: <Package className="w-5 h-5" /> },
    { to: '/compras', label: 'Compras & Proveedores', icon: <Truck className="w-5 h-5" /> },
    { to: '/clientes', label: 'Clientes', icon: <Users className="w-5 h-5" /> },
    { to: '/usuarios', label: 'Usuarios & Roles', icon: <ShieldCheck className="w-5 h-5" /> },
    { to: '/reportes', label: 'Reportes por Fecha', icon: <FileBarChart className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-1.5">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Módulos
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/50 text-xs text-slate-400">
        <p className="font-semibold text-slate-200">DBP 2026-2</p>
        <p className="mt-0.5">Frontend Web v1.0.0</p>
      </div>
    </aside>
  );
};
