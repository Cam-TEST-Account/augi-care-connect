import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SecurePasswordProtection } from "@/components/auth/SecurePasswordProtection";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SecurePasswordProtection>
      <App />
    </SecurePasswordProtection>
  </StrictMode>
);
