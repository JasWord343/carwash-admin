import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import ClientFormDialog from '@/components/clients/ClientFormDialog';
import ClientProfileDialog from '@/components/clients/ClientProfileDialog';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Phone, Car, MessageCircle, Eye } from 'lucide-react';

export default function Clients() {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [viewingClient, setViewingClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Client.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setShowForm(false);
      setEditingClient(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Client.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setViewingClient(null);
    },
  });

  const handleSave = (data) => {
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openWhatsApp = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleaned}`, '_blank');
  };

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery) ||
    c.vehicle_plates?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle={`${clients.length} clientes registrados`}
        onAdd={() => { setEditingClient(null); setShowForm(true); }}
        addLabel="Nuevo Cliente"
      />

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, teléfono o placas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Card key={i} className="p-5 animate-pulse h-40" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>No se encontraron clientes</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <Card key={client.id} className="p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{client.name}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{client.phone}</span>
                  </div>
                  {client.vehicle_brand && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                      <Car className="w-3.5 h-3.5" />
                      <span className="truncate">{client.vehicle_brand} {client.vehicle_model} {client.vehicle_color}</span>
                    </div>
                  )}
                  {client.vehicle_plates && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-accent/10 text-accent text-xs font-semibold rounded">
                      {client.vehicle_plates}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t">
                <Button size="sm" variant="outline" onClick={() => setViewingClient(client)}>
                  <Eye className="w-3.5 h-3.5 mr-1" /> Ver
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setEditingClient(client); setShowForm(true); }}>
                  Editar
                </Button>
                {client.phone && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white ml-auto" onClick={() => openWhatsApp(client.phone)}>
                    <MessageCircle className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ClientFormDialog
        open={showForm}
        onClose={() => { setShowForm(false); setEditingClient(null); }}
        onSave={handleSave}
        client={editingClient}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ClientProfileDialog
        open={!!viewingClient}
        onClose={() => setViewingClient(null)}
        client={viewingClient}
        onEdit={(c) => { setViewingClient(null); setEditingClient(c); setShowForm(true); }}
        onDelete={(id) => deleteMutation.mutate(id)}
        onWhatsApp={openWhatsApp}
      />
    </div>
  );
}