import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Alert';
import { Lock, User, Store } from 'lucide-react';

export const Login: React.FC = () => {
  const [codigoUsuario, setCodigoUsuario] = useState('ADMIN01');
  const [clave, setClave] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!codigoUsuario.trim() || !clave.trim()) {
      setError('Por favor complete todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      await login({ codigoUsuario, clave });
      navigate('/');
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl text-white mx-auto flex items-center justify-center shadow-md shadow-indigo-200 mb-3">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">CaseroYa POS</h2>
          <p className="text-sm text-slate-500 mt-1">Ingresa con tus credenciales de acceso</p>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
            className="mb-5"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Código de Usuario"
            placeholder="Ej. ADMIN01 o CAJERO01"
            value={codigoUsuario}
            onChange={(e) => setCodigoUsuario(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Iniciar Sesión
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Usuario demo: <code className="text-indigo-600 font-mono">ADMIN01</code> / <code className="text-indigo-600 font-mono">admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
};
