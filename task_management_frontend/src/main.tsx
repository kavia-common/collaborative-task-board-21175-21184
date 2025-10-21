import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { applyCssVariables } from "./theme";
import App from "./App";
import { getSupabaseVersion } from "./supabaseClient";

applyCssVariables();

// Small runtime health check: clarify schema usage and supabase-js version in console so issues are easy to spot
// eslint-disable-next-line no-console
console.info(`[App] Supabase-js version: ${getSupabaseVersion()}. Using schema 'app' for tasks. Realtime filters set to schema='app' for tasks.`);

const rootEl = document.getElementById("root") as HTMLElement | null;
if (!rootEl) {
  // eslint-disable-next-line no-console
  console.error("Root element #root not found. Ensure public/index.html contains a <div id=\"root\"></div>.");
} else {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
