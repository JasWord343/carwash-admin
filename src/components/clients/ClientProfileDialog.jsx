import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Car, Mail, MessageCircle, Pencil, Phone, Trash2 } from "lucide-react";

import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ClientProfileDialog({ open, onClose, client, onEdit, onDelete, onWhatsApp }) {
  const { data: appointments = [] } = useQuery({
    queryKey: ["client-appointments", client?.id],
    queryFn: () => base44.entities.Appointment.filter({ client_id: client.id }, "-date"),
    enabled: !!client?.id,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["client-payments", client?.id],
    queryFn: () => base44.entities.Payment.filter({ client_id: client.id }, "-date"),
    enabled: !!client?.id,
  });

  if (!client) {
    return null;
  }

  const totalSpent = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Perfil del Cliente</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="border-b pb-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-xl font-bold text-accent">
              {client.name?.[0]?.toUpperCase()}
            </div>
            <h2 className="mt-3 text-xl font-bold">{client.name}</h2>
            <div className="mt-2 flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {client.phone}
              </span>
              {client.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {client.email}
                </span>
              )}
            </div>
          </div>

          {client.vehicle_brand && (
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <Car className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm font-medium">
                  {client.vehicle_brand} {client.vehicle_model} {client.vehicle_year}
                </p>
                <p className="text-xs text-muted-foreground">
                  {client.vehicle_color} - {client.vehicle_plates}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-lg font-bold">{appointments.length}</p>
              <p className="text-xs text-muted-foreground">Citas</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-lg font-bold">{payments.length}</p>
              <p className="text-xs text-muted-foreground">Pagos</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-lg font-bold text-green-600">${totalSpent.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>

          {appointments.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold">Ultimas Citas</h3>
              <div className="space-y-2">
                {appointments.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between rounded bg-muted/30 p-2 text-sm">
                    <span>{appointment.service_name}</span>
                    <span className="text-muted-foreground">{appointment.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {client.notes && (
            <div>
              <h3 className="mb-1 text-sm font-semibold">Notas</h3>
              <p className="text-sm text-muted-foreground">{client.notes}</p>
            </div>
          )}

          <div className="flex gap-2 border-t pt-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(client)}>
              <Pencil className="mr-1 h-3.5 w-3.5" /> Editar
            </Button>
            <Button size="sm" className="bg-green-600 text-white hover:bg-green-700" onClick={() => onWhatsApp(client.phone)}>
              <MessageCircle className="mr-1 h-3.5 w-3.5" /> WhatsApp
            </Button>
            <Button variant="destructive" size="sm" className="ml-auto" onClick={() => onDelete(client.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
