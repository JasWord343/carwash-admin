import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

export default function AppointmentFormDialog({ open, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    client_id: '', date: format(new Date(), 'yyyy-MM-dd'), time: '10:00',
    service_type: 'service', service_id: '', notes: ''
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

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Appointment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      onClose();
      setForm({ client_id: '', date: format(new Date(), 'yyyy-MM-dd'), time: '10:00', service_type: 'service', service_id: '', notes: '' });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const client = clients.find(c => c.id === form.client_id);
    const items = form.service_type === 'service' ? services : packages;
    const item = items.find(i => i.id === form.service_id);

    createMutation.mutate({
      ...form,
      client_name: client?.name || '',
      service_name: item?.name || '',
      amount: item?.price || 0,
      status: 'scheduled',
    });
  };

  const optionsList = form.service_type === 'service'
    ? services.filter(s => s.active !== false)
    : packages.filter(p => p.active !== false);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nueva Cita</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Cliente *</Label>
            <Select value={form.client_id} onValueChange={v => setForm({...form, client_id: v})}>
              <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
              <SelectContent>
                {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name} — {c.phone}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Fecha *</Label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
            <div><Label>Hora *</Label><Input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={form.service_type} onValueChange={v => setForm({...form, service_type: v, service_id: ''})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Servicio</SelectItem>
                  <SelectItem value="package">Paquete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{form.service_type === 'service' ? 'Servicio' : 'Paquete'}</Label>
              <Select value={form.service_id} onValueChange={v => setForm({...form, service_id: v})}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {optionsList.map(i => <SelectItem key={i.id} value={i.id}>{i.name} — ${i.price}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Notas</Label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} /></div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={createMutation.isPending || !form.client_id} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {createMutation.isPending ? 'Creando...' : 'Agendar Cita'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}