import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import App from "@/App";
import "@/index.css";
import { AuthProvider } from "@/lib/AuthContext";
import { queryClientInstance } from "@/lib/query-client";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClientInstance}>
      <AuthProvider>
        <App />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
