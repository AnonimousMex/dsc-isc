import { useEffect, useState } from 'react';
import { ZodError } from 'zod';
import { userCreateSchema, userUpdateSchema, type Role, type User } from '@dsc-isc/shared';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { apiDelete, apiGet, apiPost, apiPut, ApiError } from '../lib/apiClient';
import { useAuth } from '../lib/AuthContext';

const ROLES: Role[] = ['SUPERADMIN', 'EDITOR', 'VIEWER'];

const emptyForm = { name: '', email: '', password: '', role: 'EDITOR' as Role, isActive: true };

export default function Usuarios() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<User | null>(null);

  const load = async () => {
    setLoading(true);
    setUsers(await apiGet<User[]>('/users'));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, password: '', role: user.role, isActive: user.isActive });
    setError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      if (editingId) {
        const payload = {
          name: form.name,
          email: form.email,
          role: form.role,
          isActive: form.isActive,
          ...(form.password ? { password: form.password } : {}),
        };
        userUpdateSchema.parse(payload);
        await apiPut(`/users/${editingId}`, payload);
      } else {
        const payload = { name: form.name, email: form.email, password: form.password, role: form.role };
        userCreateSchema.parse(payload);
        await apiPost('/users', payload);
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      if (err instanceof ZodError) setError(err.issues[0]?.message ?? 'Datos inválidos');
      else setError(err instanceof ApiError ? err.message : 'No se pudo guardar');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Usuarios</h1>
          <p className="mt-1 text-sm text-muted">Exclusivo de SUPERADMIN.</p>
        </div>
        <Button onClick={openCreate}>Nuevo usuario</Button>
      </div>

      <div className="mt-6">
        <DataTable
          data={users}
          getRowId={(u) => u.id}
          emptyMessage={loading ? 'Cargando…' : 'Sin usuarios.'}
          columns={[
            { header: 'Nombre', cell: (u) => <span className="font-medium text-ink">{u.name}</span> },
            { header: 'Correo', cell: (u) => u.email },
            { header: 'Rol', cell: (u) => u.role },
            { header: '2FA', cell: (u) => (u.has2fa ? 'Sí' : 'No') },
            {
              header: 'Estado',
              cell: (u) => (
                <span className={u.isActive ? 'text-green-700' : 'text-muted'}>
                  {u.isActive ? 'Activo' : 'Inactivo'}
                </span>
              ),
            },
          ]}
          actions={(u) => (
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => openEdit(u)}>
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={u.id === currentUser?.id}
                onClick={() => setDeactivateTarget(u)}
              >
                Desactivar
              </Button>
            </div>
          )}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">{editingId ? 'Nueva contraseña (opcional)' : 'Contraseña'}</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <p className="text-xs text-muted">Mínimo 12 caracteres.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Rol</Label>
              <Select value={form.role} onValueChange={(role) => setForm({ ...form, role: role as Role })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editingId && (
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Activo
              </label>
            )}
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deactivateTarget)}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
        title="Desactivar usuario"
        description={`¿Desactivar a ${deactivateTarget?.name}? Podrá reactivarse después editándolo.`}
        confirmLabel="Desactivar"
        onConfirm={async () => {
          if (!deactivateTarget) return;
          await apiDelete(`/users/${deactivateTarget.id}`);
          await load();
        }}
      />
    </div>
  );
}
