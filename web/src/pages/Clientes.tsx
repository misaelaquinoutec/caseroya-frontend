import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Spinner } from '../components/common/Spinner';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../context/ToastContext';
import { clienteService } from '../services/productoService';
import type { Cliente } from '../types';
import { Users, UserPlus, Search, Edit2, Trash2, Phone, MapPin } from 'lucide-react';

export const Clientes: React.FC = () => {
  const toast = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    numeroDocumento: '',
    tipoDocumentoId: 1,
    telefono: '',
    direccion: '',
  });

  const loadClientes = async () => {
    setIsLoading(true);
    try {
      const data = await clienteService.obtenerClientes();
      setClientes(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error((err as Error)?.message || 'Error al cargar directorio de clientes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredClientes = useMemo(() => {
    if (!debouncedSearch) return clientes;
    const term = debouncedSearch.toLowerCase();
    return clientes.filter(
      (c) =>
        (c.nombre && c.nombre.toLowerCase().includes(term)) ||
        (c.numeroDocumento && c.numeroDocumento.toLowerCase().includes(term)) ||
        (c.telefono && c.telefono.toLowerCase().includes(term)) ||
        (c.direccion && c.direccion.toLowerCase().includes(term))
    );
  }, [clientes, debouncedSearch]);

  const openNewModal = () => {
    setEditingCliente(null);
    setFormData({
      nombre: '',
      numeroDocumento: '',
      tipoDocumentoId: 1,
      telefono: '',
      direccion: '',
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (c: Cliente) => {
    setEditingCliente(c);
    setFormData({
      nombre: c.nombre || c.nombreRazonSocial || '',
      numeroDocumento: c.numeroDocumento || '',
      tipoDocumentoId: c.tipoDocumentoId || 1,
      telefono: c.telefono || '',
      direccion: c.direccion || '',
    });
    setIsFormModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.numeroDocumento.trim()) {
      toast.error('Completa el Nombre y Número de Documento.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        nombre: formData.nombre.trim(),
        numeroDocumento: formData.numeroDocumento.trim(),
        tipoDocumentoId: Number(formData.tipoDocumentoId),
        telefono: formData.telefono.trim() || '999999999',
        direccion: formData.direccion.trim() || 'Lima',
      };

      if (editingCliente) {
        await clienteService.actualizarCliente(editingCliente.id, payload);
        toast.success(`Cliente "${payload.nombre}" actualizado correctamente.`);
      } else {
        await clienteService.crearCliente(payload);
        toast.success(`Cliente "${payload.nombre}" registrado exitosamente.`);
      }
      setIsFormModalOpen(false);
      await loadClientes();
    } catch (err) {
      toast.error((err as Error)?.message || 'Error al guardar datos del cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!clienteToDelete) return;
    setIsSubmitting(true);
    try {
      await clienteService.eliminarCliente(clienteToDelete.id);
      toast.success(`Cliente "${clienteToDelete.nombre}" inactivado del sistema.`);
      setIsDeleteModalOpen(false);
      setClienteToDelete(null);
      await loadClientes();
    } catch (err) {
      toast.error((err as Error)?.message || 'No se pudo inactivar el cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTipoDocLabel = (id?: number) => {
    if (id === 2) return 'RUC';
    if (id === 3) return 'CE';
    return 'DNI';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Directorio de Clientes</h2>
          <p className="text-sm text-slate-500">
            Gestión de compradores con DNI, RUC y Carné de Extranjería para emisión de comprobantes
          </p>
        </div>
        <Button
          variant="primary"
          onClick={openNewModal}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Nuevo Cliente
        </Button>
      </div>

      <Card>
        <div className="mb-4 max-w-sm">
          <Input
            placeholder="Buscar por nombre, DNI/RUC o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {isLoading ? (
          <Spinner size="lg" label="Cargando cartera de clientes..." />
        ) : filteredClientes.length === 0 ? (
          <EmptyState
            title="Sin clientes registrados"
            description="Agrega tu primer cliente para seleccionarlo rápidamente durante las ventas."
            icon={<Users className="w-6 h-6" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">ID</th>
                  <th className="py-3 px-3.5">Tipo / Documento</th>
                  <th className="py-3 px-3.5">Nombre / Razón Social</th>
                  <th className="py-3 px-3.5">Teléfono</th>
                  <th className="py-3 px-3.5">Dirección</th>
                  <th className="py-3 px-3.5">Estado</th>
                  <th className="py-3 px-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClientes.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-xs text-slate-500">#{c.id}</td>
                    <td className="py-3 px-3.5">
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {getTipoDocLabel(c.tipoDocumentoId)}: {c.numeroDocumento}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-semibold text-slate-800">
                      {c.nombre || c.nombreRazonSocial}
                    </td>
                    <td className="py-3 px-3.5 text-xs">
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {c.telefono || 'Sin registro'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-xs">
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {c.direccion || 'Lima'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5">
                      <Badge variant={c.activo === false ? 'danger' : 'success'}>
                        {c.activo === false ? 'INACTIVO' : 'ACTIVO'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Editar cliente"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setClienteToDelete(c);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Inactivar cliente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Crear / Editar Cliente */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingCliente ? `Editar Cliente: ${editingCliente.nombre}` : 'Registrar Nuevo Cliente'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave} isLoading={isSubmitting}>
              {editingCliente ? 'Guardar Cambios' : 'Registrar Cliente'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tipo de Documento
              </label>
              <select
                value={formData.tipoDocumentoId}
                onChange={(e) =>
                  setFormData({ ...formData, tipoDocumentoId: Number(e.target.value) })
                }
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={1}>DNI (1)</option>
                <option value={2}>RUC (2)</option>
                <option value={3}>Carné de Extranjería (3)</option>
              </select>
            </div>
            <Input
              label="Número de Documento"
              placeholder={formData.tipoDocumentoId === 2 ? 'Ej. 20512345678' : 'Ej. 72345678'}
              value={formData.numeroDocumento}
              onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
              required
            />
          </div>
          <Input
            label="Nombre Completo o Razón Social"
            placeholder="Ej. Carlos Mendoza"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Teléfono"
              placeholder="Ej. 987654321"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            />
            <Input
              label="Dirección"
              placeholder="Ej. Av. Javier Prado 450, Lima"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Modal Eliminar Cliente */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Inactivación de Cliente"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isSubmitting}>
              Sí, Inactivar
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          ¿Deseas dar de baja al cliente <strong>{clienteToDelete?.nombre}</strong>? Su historial de
          comprobantes emitidos se conservará intacto.
        </p>
      </Modal>
    </div>
  );
};
