import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { PasswordProtection } from "@/components/auth/PasswordProtection";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PasswordProtection>
      <App />
    </PasswordProtection>
  </StrictMode>
);
