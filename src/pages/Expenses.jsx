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
import { Receipt, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const categoryLabels = {
  supplies: 'Insumos', payroll: 'Nómina', rent: 'Renta',
  utilities: 'Servicios', maintenance: 'Mantenimiento',
  marketing: 'Marketing', other: 'Otro'
};

export default function Expenses() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ concept: '', amount: '', category: 'supplies', date: format(new Date(), 'yyyy-MM-dd'), notes: '' });
  const queryClient = useQueryClient();

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list('-date', 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Expense.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setShowForm(false);
      setForm({ concept: '', amount: '', category: 'supplies', date: format(new Date(), 'yyyy-MM-dd'), notes: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Expense.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });

  const handleSave = (e) => {
    e.preventDefault();
    createMutation.mutate({ ...form, amount: Number(form.amount) });
  };

  const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div>
      <PageHeader title="Gastos" subtitle={`Total: $${total.toLocaleString()}`} onAdd={() => setShowForm(true)} addLabel="Registrar Gasto" />

      {expenses.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground"><p>No hay gastos registrados</p></div>
      ) : (
        <div className="space-y-3">
          {expenses.map(exp => (
            <Card key={exp.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <Receipt className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{exp.concept}</p>
                  <p className="text-sm text-muted-foreground">{exp.date}</p>
                </div>
                <span className="font-bold text-lg text-red-600">-${exp.amount?.toLocaleString()}</span>
                <Badge variant="secondary">{categoryLabels[exp.category] || exp.category}</Badge>
                <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(exp.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={() => setShowForm(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Gasto</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div><Label>Concepto *</Label><Input value={form.concept} onChange={e => setForm({...form, concept: e.target.value})} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Monto *</Label><Input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required /></div>
              <div>
                <Label>Categoría *</Label>
                <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Fecha *</Label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
            <div><Label>Notas</Label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} /></div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" disabled={createMutation.isPending} className="bg-accent text-accent-foreground hover:bg-accent/90">
                {createMutation.isPending ? 'Guardando...' : 'Registrar Gasto'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}