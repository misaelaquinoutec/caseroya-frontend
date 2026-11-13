import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Spinner } from '../components/common/Spinner';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { usuarioService } from '../services/productoService';
import type { PerfilSistema, UsuarioSistema } from '../types';
import { ShieldCheck, UserPlus, Edit2, Trash2, KeyRound } from 'lucide-react';

export const Usuarios: React.FC = () => {
  const toast = useToast();
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [perfiles, setPerfiles] = useState<PerfilSistema[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UsuarioSistema | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    codigoUsuario: '',
    nombre: '',
    clave: '',
    perfilId: 'CAJ',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [users, roles] = await Promise.all([
        usuarioService.obtenerUsuarios(),
        usuarioService.obtenerPerfiles().catch(() => [
          { codigoPerfil: 'ADM', nombrePerfil: 'Administrador' },
          { codigoPerfil: 'CAJ', nombrePerfil: 'Cajero' },
          { codigoPerfil: 'VEN', nombrePerfil: 'Vendedor' },
        ]),
      ]);
      setUsuarios(Array.isArray(users) ? users : []);
      setPerfiles(Array.isArray(roles) && roles.length > 0 ? roles : [
        { codigoPerfil: 'ADM', nombrePerfil: 'Administrador' },
        { codigoPerfil: 'CAJ', nombrePerfil: 'Cajero' },
        { codigoPerfil: 'VEN', nombrePerfil: 'Vendedor' },
      ]);
    } catch (err) {
      toast.error((err as Error)?.message || 'Error al cargar usuarios del sistema');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNewModal = () => {
    setEditingUser(null);
    setFormData({
      codigoUsuario: '',
      nombre: '',
      clave: '',
      perfilId: 'CAJ',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (u: UsuarioSistema) => {
    setEditingUser(u);
    setFormData({
      codigoUsuario: u.codigoUsuario,
      nombre: u.nombre,
      clave: '',
      perfilId: u.perfilId || 'CAJ',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigoUsuario.trim() || !formData.nombre.trim()) {
      toast.error('Completa el Código de Usuario y el Nombre.');
      return;
    }
    if (!editingUser && !formData.clave.trim()) {
      toast.error('Ingresa una contraseña inicial para el nuevo usuario.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        codigoUsuario: formData.codigoUsuario.trim().toUpperCase(),
        nombre: formData.nombre.trim(),
        clave: formData.clave.trim() || undefined,
        perfilId: formData.perfilId,
      };

      if (editingUser) {
        await usuarioService.actualizarUsuario(editingUser.codigoUsuario, payload);
        toast.success(`Usuario "${editingUser.codigoUsuario}" actualizado correctamente.`);
      } else {
        await usuarioService.crearUsuario(payload);
        toast.success(`Usuario "${payload.codigoUsuario}" creado con cifrado BCrypt.`);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error((err as Error)?.message || 'Error al guardar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (u: UsuarioSistema) => {
    if (u.codigoUsuario === 'ADMIN01') {
      toast.error('La cuenta principal ADMIN01 no puede ser eliminada.');
      return;
    }
    try {
      await usuarioService.eliminarUsuario(u.codigoUsuario);
      toast.success(`Usuario "${u.codigoUsuario}" inactivado.`);
      await loadData();
    } catch (err) {
      toast.error((err as Error)?.message || 'Error al inactivar usuario');
    }
  };

  const getRoleName = (perfilId: string) => {
    const found = perfiles.find((p) => p.codigoPerfil === perfilId);
    if (found) return `${found.nombrePerfil} (${found.codigoPerfil})`;
    if (perfilId === 'ADM') return 'Administrador (ADM)';
    if (perfilId === 'CAJ') return 'Cajero (CAJ)';
    if (perfilId === 'VEN') return 'Vendedor (VEN)';
    return perfilId;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Usuarios y Roles</h2>
          <p className="text-sm text-slate-500">
            Administración de operadores de caja, administradores y perfiles de seguridad JWT
          </p>
        </div>
        <Button
          variant="primary"
          onClick={openNewModal}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Nuevo Usuario
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <Spinner size="lg" label="Cargando cuentas de operadores..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">Código Usuario</th>
                  <th className="py-3 px-3.5">Nombre Completo</th>
                  <th className="py-3 px-3.5">Perfil / Rol</th>
                  <th className="py-3 px-3.5">Estado</th>
                  <th className="py-3 px-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map((u) => (
                  <tr key={u.codigoUsuario} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3.5 font-mono text-xs font-bold text-indigo-600">
                      {u.codigoUsuario}
                    </td>
                    <td className="py-3 px-3.5 font-semibold text-slate-800">{u.nombre}</td>
                    <td className="py-3 px-3.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                        {getRoleName(u.perfilId)}
                      </span>
                    </td>
                    <td className="py-3 px-3.5">
                      <Badge variant={u.activo === false ? 'danger' : 'success'}>
                        {u.activo === false ? 'INACTIVO' : 'ACTIVO'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
                          title="Editar usuario o cambiar contraseña"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {u.codigoUsuario !== 'ADMIN01' && (
                          <button
                            onClick={() => handleDelete(u)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                            title="Inactivar usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingUser
            ? `Editar Usuario: ${editingUser.codigoUsuario}`
            : 'Registrar Nuevo Operador / Usuario'
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave} isLoading={isSubmitting}>
              {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Código de Usuario (Login)"
              placeholder="Ej. CAJERO02"
              value={formData.codigoUsuario}
              disabled={Boolean(editingUser)}
              onChange={(e) =>
                setFormData({ ...formData, codigoUsuario: e.target.value.toUpperCase() })
              }
              required
            />
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Perfil / Rol Asignado
              </label>
              <select
                value={formData.perfilId}
                onChange={(e) => setFormData({ ...formData, perfilId: e.target.value })}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {perfiles.map((p) => (
                  <option key={p.codigoPerfil} value={p.codigoPerfil}>
                    {p.nombrePerfil} ({p.codigoPerfil})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Nombre Completo del Operador"
            placeholder="Ej. Lucía Fernández"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />

          <Input
            label={
              editingUser
                ? 'Nueva Contraseña (dejar en blanco para mantener la actual)'
                : 'Contraseña Inicial'
            }
            type="password"
            placeholder="••••••"
            value={formData.clave}
            onChange={(e) => setFormData({ ...formData, clave: e.target.value })}
            leftIcon={<KeyRound className="w-4 h-4" />}
            required={!editingUser}
          />
        </form>
      </Modal>
    </div>
  );
};
