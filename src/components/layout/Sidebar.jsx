import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  Users,
  Wrench,
  X,
} from "lucide-react";

import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Control del Dia", icon: ClipboardList, path: "/daily" },
  { label: "Citas", icon: Calendar, path: "/appointments" },
  { label: "Clientes", icon: Users, path: "/clients" },
  { label: "Servicios", icon: Wrench, path: "/services" },
  { label: "Paquetes", icon: Package, path: "/packages" },
  { label: "Pagos", icon: CreditCard, path: "/payments" },
  { label: "Gastos", icon: Receipt, path: "/expenses" },
  { label: "Presupuestos", icon: FileText, path: "/budgets" },
];

export default function Sidebar() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <div className="flex h-full flex-col">
      <div className="border-b border-sidebar-border p-5">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary font-bold text-primary-foreground">
            CW
          </div>
          {!collapsed && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sidebar-primary">CarWash</p>
              <p className="text-sm text-sidebar-foreground/70">Panel administrativo</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-sidebar-primary")} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="h-4 w-4 text-sidebar-primary" />}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        {!collapsed && user ? (
          <div className="mb-3 rounded-lg bg-sidebar-accent/60 px-3 py-2 text-xs text-sidebar-foreground/80">
            <p className="font-medium text-sidebar-foreground">{user.name || user.email}</p>
            <p className="truncate">{user.email}</p>
          </div>
        ) : null}

        <div className={cn("flex gap-2", collapsed && "flex-col")}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden flex-1 items-center justify-center rounded-lg border border-sidebar-border p-2 text-sidebar-foreground transition-colors hover:text-sidebar-primary lg:flex"
            type="button"
            title="Contraer menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <button
            onClick={() => {
              setMobileOpen(false);
              logout();
            }}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg border border-sidebar-border px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-primary",
              collapsed ? "w-full" : "flex-1",
            )}
            type="button"
            title="Cerrar sesion"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Cerrar sesion</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-primary p-2 text-primary-foreground shadow-lg lg:hidden"
        type="button"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="h-full w-64 bg-sidebar-background" onClick={(event) => event.stopPropagation()}>
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 text-sidebar-foreground hover:text-white"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
            <NavContent />
          </div>
        </div>
      )}

      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar-background transition-all duration-300 lg:flex",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <NavContent />
      </aside>
    </>
  );
}
