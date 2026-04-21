import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DollarSign, Pencil, Trash2, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Packages() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', services: [], active: true });
  const queryClient = useQueryClient();

  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => base44.entities.Package.list('-created_date'),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing
      ? base44.entities.Package.update(editing.id, data)
      : base44.entities.Package.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      setShowForm(false); setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Package.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packages'] }),
  });

  const openForm = (pkg = null) => {
    setEditing(pkg);
    setForm(pkg ? {
      name: pkg.name || '', description: pkg.description || '',
      price: pkg.price || '', services: pkg.services || [], active: pkg.active !== false
    } : { name: '', description: '', price: '', services: [], active: true });
    setShowForm(true);
  };

  const toggleService = (svcId) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(svcId)
        ? prev.services.filter(id => id !== svcId)
        : [...prev.services, svcId]
    }));
  };

  const getServiceName = (id) => services.find(s => s.id === id)?.name || id;

  const handleSave = (e) => {
    e.preventDefault();
    saveMutation.mutate({ ...form, price: Number(form.price) });
  };

  return (
    <div>
      <PageHeader title="Paquetes" subtitle="Combina servicios en paquetes" onAdd={() => openForm()} addLabel="Nuevo Paquete" />

      {packages.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground"><p>No hay paquetes registrados</p></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map(pkg => (
            <Card key={pkg.id} className="p-5 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg">{pkg.name}</h3>
              {pkg.description && <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>}
              <div className="flex items-center gap-1 mt-2 font-bold text-xl text-accent">
                <DollarSign className="w-5 h-5" />{pkg.price?.toLocaleString()}
              </div>
              {pkg.services?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {pkg.services.map(sId => (
                    <Badge key={sId} variant="secondary" className="text-xs">
                      <Wrench className="w-3 h-3 mr-1" />{getServiceName(sId)}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-4 pt-3 border-t">
                <Button size="sm" variant="outline" onClick={() => openForm(pkg)}><Pencil className="w-3.5 h-3.5 mr-1" /> Editar</Button>
                <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(pkg.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={() => { setShowForm(false); setEditing(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Editar Paquete' : 'Nuevo Paquete'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div><Label>Nombre *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
            <div><Label>Descripción</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} /></div>
            <div><Label>Precio *</Label><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required /></div>
            {services.length > 0 && (
              <div>
                <Label className="mb-2 block">Servicios incluidos</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {services.filter(s => s.active !== false).map(svc => (
                    <div key={svc.id} className="flex items-center gap-2">
                      <Checkbox checked={form.services.includes(svc.id)} onCheckedChange={() => toggleService(svc.id)} />
                      <span className="text-sm">{svc.name} — ${svc.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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