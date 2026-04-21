import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock, DollarSign, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Services() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', duration_minutes: '', active: true });
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list('-created_date'),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing
      ? base44.entities.Service.update(editing.id, data)
      : base44.entities.Service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setShowForm(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Service.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });

  const openForm = (service = null) => {
    setEditing(service);
    setForm(service ? {
      name: service.name || '', description: service.description || '',
      price: service.price || '', duration_minutes: service.duration_minutes || '', active: service.active !== false
    } : { name: '', description: '', price: '', duration_minutes: '', active: true });
    setShowForm(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveMutation.mutate({ ...form, price: Number(form.price), duration_minutes: Number(form.duration_minutes) || undefined });
  };

  return (
    <div>
      <PageHeader title="Servicios" subtitle="Gestiona tu catálogo de servicios" onAdd={() => openForm()} addLabel="Nuevo Servicio" />

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Card key={i} className="p-5 animate-pulse h-32" />)}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>No hay servicios registrados</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(s => (
            <Card key={s.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{s.name}</h3>
                    {s.active === false && <Badge variant="secondary" className="text-xs">Inactivo</Badge>}
                  </div>
                  {s.description && <p className="text-sm text-muted-foreground mt-1">{s.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <DollarSign className="w-4 h-4 text-accent" />${s.price?.toLocaleString()}
                </span>
                {s.duration_minutes && (
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{s.duration_minutes} min</span>
                )}
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t">
                <Button size="sm" variant="outline" onClick={() => openForm(s)}><Pencil className="w-3.5 h-3.5 mr-1" /> Editar</Button>
                <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(s.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={() => { setShowForm(false); setEditing(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Editar Servicio' : 'Nuevo Servicio'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div><Label>Nombre *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
            <div><Label>Descripción</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Precio *</Label><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required /></div>
              <div><Label>Duración (min)</Label><Input type="number" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: e.target.value})} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.active} onCheckedChange={(v) => setForm({...form, active: v})} />
              <Label>Servicio activo</Label>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" disabled={saveMutation.isPending} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}