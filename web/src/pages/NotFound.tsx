import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="text-8xl font-black text-indigo-200">404</div>
      <h2 className="text-2xl font-bold text-slate-800 mt-2">Página no encontrada</h2>
      <p className="text-slate-500 max-w-md mt-2 mb-6">
        Lo sentimos, la dirección a la que intentas acceder no existe o fue movida.
      </p>
      <Link to="/">
        <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
          Volver al Inicio
        </Button>
      </Link>
    </div>
  );
};
