import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { applyCssVariables } from "./theme";
import App from "./App";

applyCssVariables();

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
