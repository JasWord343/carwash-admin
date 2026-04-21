import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, CheckCircle2, CreditCard, Receipt, TrendingUp, Users } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "react-router-dom";

import { base44 } from "@/api/base44Client";
import StatCard from "@/components/shared/StatCard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => base44.entities.Appointment.list("-created_date", 100),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["payments"],
    queryFn: () => base44.entities.Payment.list("-created_date", 100),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list("-created_date"),
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => base44.entities.Expense.list("-created_date", 100),
  });

  const todayAppointments = appointments.filter((appointment) => appointment.date === today);
  const todayPayments = payments.filter((payment) => payment.date === today);
  const todayIncome = todayPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const monthExpenses = expenses
    .filter((expense) => expense.date?.startsWith(format(new Date(), "yyyy-MM")))
    .reduce((sum, expense) => sum + (expense.amount || 0), 0);

  const statusColors = {
    scheduled: "bg-blue-100 text-blue-700",
    in_progress: "bg-amber-100 text-amber-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const statusLabels = {
    scheduled: "Agendada",
    in_progress: "En proceso",
    completed: "Completada",
    cancelled: "Cancelada",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary text-lg font-bold text-primary-foreground shadow-sm">
          CW
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Buenos dias</h1>
          <p className="text-muted-foreground">{format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Citas Hoy" value={todayAppointments.length} icon={Calendar} />
        <StatCard title="Ingresos Hoy" value={`$${todayIncome.toLocaleString()}`} icon={TrendingUp} />
        <StatCard title="Clientes" value={clients.length} icon={Users} />
        <StatCard title="Gastos del Mes" value={`$${monthExpenses.toLocaleString()}`} icon={Receipt} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Citas de Hoy</h2>
            <Link to="/appointments" className="text-sm text-accent hover:underline">
              Ver todas
            </Link>
          </div>
          {todayAppointments.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Calendar className="mx-auto mb-2 h-10 w-10 opacity-40" />
              <p>No hay citas para hoy</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.slice(0, 5).map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                    {appointment.time?.slice(0, 5)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{appointment.client_name}</p>
                    <p className="truncate text-xs text-muted-foreground">{appointment.service_name}</p>
                  </div>
                  <Badge className={statusColors[appointment.status] || ""} variant="secondary">
                    {statusLabels[appointment.status] || appointment.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Pagos Recientes</h2>
            <Link to="/payments" className="text-sm text-accent hover:underline">
              Ver todos
            </Link>
          </div>
          {payments.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <CreditCard className="mx-auto mb-2 h-10 w-10 opacity-40" />
              <p>No hay pagos registrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.slice(0, 5).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{payment.client_name}</p>
                    <p className="text-xs text-muted-foreground">{payment.concept || payment.method}</p>
                  </div>
                  <span className="font-semibold text-green-600">${payment.amount?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
