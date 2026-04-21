import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

export default function BudgetFormDialog({ open, onClose, budget }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    client_id: '', items: [{ name: '', price: 0, quantity: 1 }], valid_until: '', notes: '', status: 'draft'
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list('-created_date'),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list(),
  });

  useEffect(() => {
    if (budget) {
      setForm({
        client_id: budget.client_id || '', items: budget.items?.length ? budget.items : [{ name: '', price: 0, quantity: 1 }],
        valid_until: budget.valid_until || '', notes: budget.notes || '', status: budget.status || 'draft'
      });
    } else {
      setForm({ client_id: '', items: [{ name: '', price: 0, quantity: 1 }], valid_until: '', notes: '', status: 'draft' });
    }
  }, [budget, open]);

  const saveMutation = useMutation({
    mutationFn: (data) => budget
      ? base44.entities.Budget.update(budget.id, data)
      : base44.entities.Budget.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      onClose();
    },
  });

  const updateItem = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm({ ...form, items: newItems });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { name: '', price: 0, quantity: 1 }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });

  const addServiceAsItem = (svc) => {
    setForm({ ...form, items: [...form.items.filter(i => i.name), { name: svc.name, price: svc.price, quantity: 1 }] });
  };

  const total = form.items.reduce((sum, i) => sum + ((i.price || 0) * (i.quantity || 1)), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const client = clients.find(c => c.id === form.client_id);
    saveMutation.mutate({ ...form, total, client_name: client?.name || '' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{budget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Cliente *</Label>
            <Select value={form.client_id} onValueChange={v => setForm({...form, client_id: v})}>
              <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
              <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {services.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Agregar servicio rápido</Label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {services.filter(s => s.active !== false).map(svc => (
                  <Button key={svc.id} type="button" variant="outline" size="sm" className="text-xs" onClick={() => addServiceAsItem(svc)}>
                    + {svc.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Ítems</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="w-3.5 h-3.5 mr-1" /> Agregar</Button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1"><Input placeholder="Descripción" value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} /></div>
                  <div className="w-20"><Input type="number" placeholder="Precio" value={item.price} onChange={e => updateItem(i, 'price', Number(e.target.value))} /></div>
                  <div className="w-16"><Input type="number" placeholder="Cant" value={item.quantity} onChange={e => updateItem(i, 'quantity', Number(e.target.value))} /></div>
                  {form.items.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  )}
                </div>
              ))}
            </div>
            <div className="text-right mt-2 font-bold text-lg">Total: ${total.toLocaleString()}</div>
          </div>

          <div><Label>Válido hasta</Label><Input type="date" value={form.valid_until} onChange={e => setForm({...form, valid_until: e.target.value})} /></div>
          <div><Label>Notas</Label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} /></div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saveMutation.isPending || !form.client_id} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}