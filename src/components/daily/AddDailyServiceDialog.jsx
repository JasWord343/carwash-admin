import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AddDailyServiceDialog({ open, onClose, date }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    client_id: '', service_id: '', service_name: '', price: '',
    payment_method: 'cash', vehicle_info: '', notes: ''
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list('-created_date'),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: () => base44.entities.Package.list(),
  });

  const allOptions = [
    ...services.filter(s => s.active !== false).map(s => ({ ...s, _type: 'Servicio' })),
    ...packages.filter(p => p.active !== false).map(p => ({ ...p, _type: 'Paquete' })),
  ];

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DailyService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-services', date] });
      setForm({ client_id: '', service_id: '', service_name: '', price: '', payment_method: 'cash', vehicle_info: '', notes: '' });
      onClose();
    },
  });

  const selectService = (id) => {
    const item = allOptions.find(o => o.id === id);
    if (item) setForm(f => ({ ...f, service_id: id, service_name: item.name, price: item.price }));
  };

  const selectClient = (id) => {
    const client = clients.find(c => c.id === id);
    if (client) {
      const vInfo = [client.vehicle_brand, client.vehicle_model, client.vehicle_color, client.vehicle_plates].filter(Boolean).join(' ');
      setForm(f => ({ ...f, client_id: id, vehicle_info: vInfo }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const client = clients.find(c => c.id === form.client_id);
    createMutation.mutate({
      date,
      client_id: form.client_id || undefined,
      client_name: client?.name || '',
      service_id: form.service_id || undefined,
      service_name: form.service_name,
      price: Number(form.price),
      payment_method: form.payment_method,
      status: 'pending',
      vehicle_info: form.vehicle_info,
      notes: form.notes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Servicio del Día</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Quick service buttons */}
          {allOptions.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Selección rápida</Label>
              <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                {allOptions.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => selectService(opt.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      form.service_id === opt.id
                        ? 'bg-accent text-accent-foreground border-accent'
                        : 'bg-muted hover:bg-muted/80 border-transparent'
                    }`}
                  >
                    {opt.name} — ${opt.price?.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Service & price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Servicio *</Label>
              <Input value={form.service_name} onChange={e => setForm({...form, service_name: e.target.value, service_id: ''})} placeholder="Nombre" required />
            </div>
            <div>
              <Label>Precio *</Label>
              <Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="$0" required />
            </div>
          </div>

          {/* Client */}
          <div>
            <Label>Cliente (opcional)</Label>
            <Select value={form.client_id} onValueChange={selectClient}>
              <SelectTrigger><SelectValue placeholder="Sin cliente registrado" /></SelectTrigger>
              <SelectContent>
                {clients.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name} — {c.vehicle_brand} {c.vehicle_model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vehicle info */}
          <div>
            <Label>Vehículo</Label>
            <Input value={form.vehicle_info} onChange={e => setForm({...form, vehicle_info: e.target.value})} placeholder="Marca, modelo, color, placas..." />
          </div>

          {/* Payment method */}
          <div>
            <Label>Método de pago</Label>
            <Select value={form.payment_method} onValueChange={v => setForm({...form, payment_method: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="card">Tarjeta</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Notas</Label>
            <Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} placeholder="Observaciones..." />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={createMutation.isPending || !form.service_name || !form.price} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {createMutation.isPending ? 'Guardando...' : 'Agregar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}