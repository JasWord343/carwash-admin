import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function ClientFormDialog({ open, onClose, onSave, client, isLoading }) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    vehicle_brand: '', vehicle_model: '', vehicle_year: '', vehicle_color: '', vehicle_plates: '',
    notes: ''
  });

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name || '', phone: client.phone || '', email: client.email || '',
        vehicle_brand: client.vehicle_brand || '', vehicle_model: client.vehicle_model || '',
        vehicle_year: client.vehicle_year || '', vehicle_color: client.vehicle_color || '',
        vehicle_plates: client.vehicle_plates || '', notes: client.notes || ''
      });
    } else {
      setForm({ name: '', phone: '', email: '', vehicle_brand: '', vehicle_model: '', vehicle_year: '', vehicle_color: '', vehicle_plates: '', notes: '' });
    }
  }, [client, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Nombre *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div>
              <Label>Teléfono *</Label>
              <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
          </div>
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-muted-foreground mb-3">Datos del Vehículo</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Marca</Label>
                <Input value={form.vehicle_brand} onChange={e => setForm({...form, vehicle_brand: e.target.value})} />
              </div>
              <div>
                <Label>Modelo</Label>
                <Input value={form.vehicle_model} onChange={e => setForm({...form, vehicle_model: e.target.value})} />
              </div>
              <div>
                <Label>Año</Label>
                <Input value={form.vehicle_year} onChange={e => setForm({...form, vehicle_year: e.target.value})} />
              </div>
              <div>
                <Label>Color</Label>
                <Input value={form.vehicle_color} onChange={e => setForm({...form, vehicle_color: e.target.value})} />
              </div>
              <div className="col-span-2">
                <Label>Placas</Label>
                <Input value={form.vehicle_plates} onChange={e => setForm({...form, vehicle_plates: e.target.value})} />
              </div>
            </div>
          </div>
          <div>
            <Label>Notas</Label>
            <Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isLoading} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {isLoading ? 'Guardando...' : client ? 'Actualizar' : 'Crear Cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}