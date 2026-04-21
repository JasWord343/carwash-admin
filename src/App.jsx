import { BrowserRouter, Route, Routes } from "react-router-dom";

import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/ui/ProtectedRoute";
import UserNotRegisteredError from "@/components/ui/UserNotRegisteredError";
import PageNotFound from "@/lib/PageNotFound";
import Appointments from "@/pages/Appointments";
import Budgets from "@/pages/Budgets";
import Clients from "@/pages/Clients";
import DailyControl from "@/pages/DailyControl";
import Dashboard from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import Packages from "@/pages/Packages";
import Payments from "@/pages/Payments";
import Services from "@/pages/Services";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/not-registered" element={<UserNotRegisteredError />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="daily" element={<DailyControl />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="clients" element={<Clients />} />
          <Route path="services" element={<Services />} />
          <Route path="packages" element={<Packages />} />
          <Route path="payments" element={<Payments />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="budgets" element={<Budgets />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
