import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "@/hooks/useAuth";
import { PasswordProtection } from "@/components/auth/PasswordProtection";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <PasswordProtection>
        <AuthProvider>
          <App />
        </AuthProvider>
      </PasswordProtection>
    </BrowserRouter>
  </StrictMode>
);
