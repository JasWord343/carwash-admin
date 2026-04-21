import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowRightLeft,
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  MessageCircle,
  Play,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react";

import { base44 } from "@/api/base44Client";
import AddDailyServiceDialog from "@/components/daily/AddDailyServiceDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const CUENTA_TRANSFERENCIA = "Cuenta: 0000 0000 0000 0000 | Banco: Tu banco | A nombre de: CarWash";

const statusConfig = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  in_progress: { label: "En proceso", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Loader2 },
  completed: { label: "Listo", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
};

const methodLabel = { cash: "Efectivo", card: "Tarjeta", transfer: "Transferencia" };
const methodIcon = { cash: Banknote, card: CreditCard, transfer: ArrowRightLeft };

export default function DailyControl() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [showAdd, setShowAdd] = useState(false);
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["daily-services", selectedDate],
    queryFn: () => base44.entities.DailyService.filter({ date: selectedDate }, "created_date"),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DailyService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["daily-services", selectedDate] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DailyService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["daily-services", selectedDate] }),
  });

  const completed = entries.filter((entry) => entry.status === "completed");
  const totalRevenue = completed.reduce((sum, entry) => sum + (entry.price || 0), 0);
  const byCash = completed.filter((entry) => entry.payment_method === "cash").reduce((sum, entry) => sum + (entry.price || 0), 0);
  const byCard = completed.filter((entry) => entry.payment_method === "card").reduce((sum, entry) => sum + (entry.price || 0), 0);
  const byTransfer = completed
    .filter((entry) => entry.payment_method === "transfer")
    .reduce((sum, entry) => sum + (entry.price || 0), 0);

  const advanceStatus = (entry) => {
    const next = { pending: "in_progress", in_progress: "completed" };
    if (next[entry.status]) {
      updateMutation.mutate({ id: entry.id, data: { status: next[entry.status] } });
    }
  };

  const sendWhatsApp = (entry) => {
    const client = clients.find((item) => item.id === entry.client_id);
    const phone = client?.phone?.replace(/\D/g, "");
    if (!phone) {
      return;
    }

    const msg =
      entry.payment_method === "transfer"
        ? `Hola ${entry.client_name || "cliente"}, tu vehiculo ya esta listo en *CarWash*.\n\n*Servicio:* ${entry.service_name}\n*Total a pagar:* $${entry.price?.toLocaleString()}\n\n*Datos para transferencia:*\n${CUENTA_TRANSFERENCIA}\n\nGracias por tu preferencia.`
        : `Hola ${entry.client_name || "cliente"}, tu vehiculo ya esta listo en *CarWash*.\n\n*Servicio:* ${entry.service_name}\n*Total:* $${entry.price?.toLocaleString()}\n\nTe esperamos.`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const canSendWhatsApp = (entry) => {
    const client = clients.find((item) => item.id === entry.client_id);
    return Boolean(client?.phone);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Control del Dia</h1>
          <p className="capitalize text-muted-foreground">
            {format(new Date(`${selectedDate}T12:00:00`), "EEEE d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="w-auto" />
          <Button onClick={() => setShowAdd(true)} className="shrink-0 bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="mr-2 h-4 w-4" /> Agregar Servicio
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total del Dia</p>
          <p className="mt-1 text-2xl font-bold text-accent">${totalRevenue.toLocaleString()}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {completed.length} listos / {entries.length} total
          </p>
        </Card>
        <Card className="p-4">
          <div className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
            <Banknote className="h-3.5 w-3.5" /> Efectivo
          </div>
          <p className="text-2xl font-bold">${byCash.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <div className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
            <CreditCard className="h-3.5 w-3.5" /> Tarjeta
          </div>
          <p className="text-2xl font-bold">${byCard.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <div className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
            <ArrowRightLeft className="h-3.5 w-3.5" /> Transferencia
          </div>
          <p className="text-2xl font-bold">${byTransfer.toLocaleString()}</p>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((item) => <Card key={item} className="h-20 animate-pulse p-4" />)}</div>
      ) : entries.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <TrendingUp className="mx-auto mb-3 h-12 w-12 opacity-30" />
          <p className="font-medium">No hay servicios para este dia</p>
          <Button onClick={() => setShowAdd(true)} className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="mr-2 h-4 w-4" /> Agregar Servicio
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, index) => {
            const config = statusConfig[entry.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            const PayIcon = methodIcon[entry.payment_method] || Banknote;
            const isDone = entry.status === "completed";
            const hasWhatsApp = canSendWhatsApp(entry);

            return (
              <Card key={entry.id} className={`group p-4 transition-all ${isDone ? "opacity-80" : "hover:shadow-md"}`}>
                <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {entry.service_name}
                      {entry.client_name && <span className="text-sm font-normal text-muted-foreground"> - {entry.client_name}</span>}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2">
                      {entry.vehicle_info && <span className="text-xs text-muted-foreground">{entry.vehicle_info}</span>}
                      {entry.notes && <span className="text-xs italic text-muted-foreground">- {entry.notes}</span>}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-lg font-bold">${entry.price?.toLocaleString()}</p>
                    <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                      <PayIcon className="h-3 w-3" />
                      {methodLabel[entry.payment_method]}
                    </div>
                  </div>

                  <div className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${config.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {config.label}
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    {!isDone && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => advanceStatus(entry)}
                        title={entry.status === "pending" ? "Marcar en proceso" : "Marcar como listo"}
                        className="text-xs"
                      >
                        {entry.status === "pending" ? (
                          <>
                            <Play className="mr-1 h-3 w-3" /> Iniciar
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Listo
                          </>
                        )}
                      </Button>
                    )}

                    {hasWhatsApp && (
                      <Button
                        size="sm"
                        className="bg-green-600 text-xs text-white hover:bg-green-700"
                        onClick={() => sendWhatsApp(entry)}
                        title="Avisar al cliente por WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </Button>
                    )}

                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      onClick={() => deleteMutation.mutate(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}

          <Card className="bg-primary p-4 text-primary-foreground">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total Cobrado del Dia</span>
              <span className="text-2xl font-bold text-accent">${totalRevenue.toLocaleString()}</span>
            </div>
          </Card>
        </div>
      )}

      <AddDailyServiceDialog open={showAdd} onClose={() => setShowAdd(false)} date={selectedDate} />
    </div>
  );
}
