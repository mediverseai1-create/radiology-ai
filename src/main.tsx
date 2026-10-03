import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./lib/auth";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Legal from "./pages/Legal";
import AppShell from "./pages/app/AppShell";
import CheckIn from "./pages/CheckIn";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/privacy" element={<Legal kind="privacy" />} />
          <Route path="/terms" element={<Legal kind="terms" />} />
          <Route path="/app/*" element={<AppShell />} />
          <Route path="/checkin/:token" element={<CheckIn />} />
          <Route path="*" element={<Landing />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
