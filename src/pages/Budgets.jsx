import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, MessageCircle, Pencil, Trash2 } from "lucide-react";

import { base44 } from "@/api/base44Client";
import BudgetFormDialog from "@/components/budgets/BudgetFormDialog";
import PageHeader from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const statusLabels = { draft: "Borrador", sent: "Enviado", accepted: "Aceptado", rejected: "Rechazado" };
const statusColors = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};
const GOOGLE_MAPS_REVIEW_LINK = "https://maps.app.goo.gl/hqZ715T4NiExmDbT9";

export default function Budgets() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const queryClient = useQueryClient();

  const { data: budgets = [] } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => base44.entities.Budget.list("-created_date"),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Budget.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Budget.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  });

  const sendWhatsApp = (budget) => {
    const client = clients.find((item) => item.id === budget.client_id);
    if (!client?.phone) {
      return;
    }

    const items = (budget.items || []).map((item) => `- ${item.name} x${item.quantity || 1}`).join("\n");
    const msg = `Hola ${client.name}, con mucho gusto te compartimos tu presupuesto:\n\n${items}\n\n*Total:* $${budget.total?.toLocaleString()}${budget.valid_until ? `\n*Valido hasta:* ${budget.valid_until}` : ""}\n\nSi ya trabajaste con nosotros, nos ayudaria mucho tu resena:\n${GOOGLE_MAPS_REVIEW_LINK}\n\nQuedamos atentos para ayudarte.`;
    window.open(`https://wa.me/${client.phone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");

    if (budget.status === "draft") {
      updateMutation.mutate({ id: budget.id, data: { status: "sent" } });
    }
  };

  return (
    <div>
      <PageHeader
        title="Presupuestos"
        subtitle="Cotizaciones para clientes"
        onAdd={() => {
          setEditing(null);
          setShowForm(true);
        }}
        addLabel="Nuevo Presupuesto"
      />

      {budgets.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <FileText className="mx-auto mb-2 h-10 w-10 opacity-40" />
          <p>No hay presupuestos</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {budgets.map((budget) => (
            <Card key={budget.id} className="p-5 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{budget.client_name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {(budget.items || []).length} items {budget.valid_until ? `- Valido hasta ${budget.valid_until}` : ""}
                  </p>
                </div>
                <Badge className={statusColors[budget.status]} variant="secondary">
                  {statusLabels[budget.status]}
                </Badge>
              </div>

              {budget.items?.length > 0 && (
                <div className="mt-3 space-y-1">
                  {budget.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.name} x{item.quantity || 1}
                      </span>
                      <span>${(item.price * (item.quantity || 1)).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between border-t pt-3">
                <span className="text-lg font-bold">${budget.total?.toLocaleString()}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(budget);
                      setShowForm(true);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" className="bg-green-600 text-white hover:bg-green-700" onClick={() => sendWhatsApp(budget)}>
                    <MessageCircle className="mr-1 h-3.5 w-3.5" /> Enviar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(budget.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <BudgetFormDialog
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
        budget={editing}
      />
    </div>
  );
}
