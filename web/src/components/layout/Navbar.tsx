import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, UserCircle } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
          C
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-800 leading-tight">CaseroYa POS</h1>
          <p className="text-xs text-slate-400">Sistema de Ventas & Gestión</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-lg">
            <UserCircle className="w-5 h-5 text-indigo-600" />
            <div className="text-left">
              <span className="block text-xs font-semibold text-slate-800">{user.codigoUsuario}</span>
              <span className="block text-[10px] text-slate-500 font-medium">{user.perfilId || 'ADMIN'}</span>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-rose-200"
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
          <span>Salir</span>
        </button>
      </div>
    </header>
  );
};
