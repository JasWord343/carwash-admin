import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import AppointmentFormDialog from '@/components/appointments/AppointmentFormDialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MessageCircle, CheckCircle2, XCircle, Play, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusLabels = {
  scheduled: 'Agendada',
  in_progress: 'En proceso',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

export default function Appointments() {
  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterStatus, setFilterStatus] = useState('all');
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list('-date', 200),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Appointment.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Appointment.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });

  const filtered = appointments.filter(a => {
    const dateMatch = !filterDate || a.date === filterDate;
    const statusMatch = filterStatus === 'all' || a.status === filterStatus;
    return dateMatch && statusMatch;
  });

  const getClientPhone = (clientId) => clients.find(c => c.id === clientId)?.phone;

  const openWhatsApp = (phone) => {
    if (!phone) return;
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
  };

  return (
    <div>
      <PageHeader title="Citas" subtitle="Gestiona la agenda" onAdd={() => setShowForm(true)} addLabel="Nueva Cita" />

      <div className="flex flex-wrap gap-3 mb-6">
        <Input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="w-auto" />
        <Button variant="outline" size="sm" onClick={() => setFilterDate('')}>Todas las fechas</Button>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="scheduled">Agendadas</SelectItem>
            <SelectItem value="in_progress">En proceso</SelectItem>
            <SelectItem value="completed">Completadas</SelectItem>
            <SelectItem value="cancelled">Canceladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Card key={i} className="p-5 animate-pulse h-24" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground"><Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" /><p>No hay citas</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(apt => {
            const phone = getClientPhone(apt.client_id);
            return (
              <Card key={apt.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex flex-col items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-accent" />
                      <span className="text-xs font-bold text-accent">{apt.time?.slice(0, 5)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{apt.client_name}</p>
                      <p className="text-sm text-muted-foreground truncate">{apt.service_name} {apt.amount ? `• $${apt.amount.toLocaleString()}` : ''}</p>
                      <p className="text-xs text-muted-foreground">{apt.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={statusColors[apt.status]} variant="secondary">{statusLabels[apt.status]}</Badge>
                    {apt.status === 'scheduled' && (
                      <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: apt.id, data: { status: 'in_progress' } })}>
                        <Play className="w-3.5 h-3.5 mr-1" /> Iniciar
                      </Button>
                    )}
                    {apt.status === 'in_progress' && (
                      <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: apt.id, data: { status: 'completed' } })}>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Completar
                      </Button>
                    )}
                    {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                      <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: apt.id, data: { status: 'cancelled' } })}>
                        <XCircle className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {phone && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => openWhatsApp(phone)}>
                        <MessageCircle className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(apt.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AppointmentFormDialog open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}