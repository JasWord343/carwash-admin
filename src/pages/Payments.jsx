import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Banknote, ArrowRightLeft, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const methodIcons = { cash: Banknote, card: CreditCard, transfer: ArrowRightLeft };
const methodLabels = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia' };

export default function Payments() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client_id: '', amount: '', method: 'cash', date: format(new Date(), 'yyyy-MM-dd'), concept: '', notes: '' });
  const queryClient = useQueryClient();

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: () => base44.entities.Payment.list('-date', 200),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Payment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setShowForm(false);
      setForm({ client_id: '', amount: '', method: 'cash', date: format(new Date(), 'yyyy-MM-dd'), concept: '', notes: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Payment.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
  });

  const handleSave = (e) => {
    e.preventDefault();
    const client = clients.find(c => c.id === form.client_id);
    createMutation.mutate({ ...form, amount: Number(form.amount), client_name: client?.name || '' });
  };

  const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div>
      <PageHeader title="Pagos" subtitle={`Total: $${total.toLocaleString()}`} onAdd={() => setShowForm(true)} addLabel="Registrar Pago" />

      {payments.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground"><p>No hay pagos registrados</p></div>
      ) : (
        <div className="space-y-3">
          {payments.map(pay => {
            const Icon = methodIcons[pay.method] || CreditCard;
            return (
              <Card key={pay.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{pay.client_name}</p>
                    <p className="text-sm text-muted-foreground">{pay.concept || methodLabels[pay.method]} • {pay.date}</p>
                  </div>
                  <span className="font-bold text-lg text-green-600">${pay.amount?.toLocaleString()}</span>
                  <Badge variant="secondary">{methodLabels[pay.method]}</Badge>
                  <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(pay.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={() => setShowForm(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Pago</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Cliente *</Label>
              <Select value={form.client_id} onValueChange={v => setForm({...form, client_id: v})}>
                <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Monto *</Label><Input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required /></div>
              <div>
                <Label>Método *</Label>
                <Select value={form.method} onValueChange={v => setForm({...form, method: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="card">Tarjeta</SelectItem>
                    <SelectItem value="transfer">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Fecha *</Label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
            <div><Label>Concepto</Label><Input value={form.concept} onChange={e => setForm({...form, concept: e.target.value})} /></div>
            <div><Label>Notas</Label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} /></div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" disabled={createMutation.isPending || !form.client_id} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {createMutation.isPending ? 'Guardando...' : 'Registrar Pago'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}