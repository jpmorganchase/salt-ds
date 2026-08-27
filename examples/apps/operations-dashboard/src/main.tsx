import "@salt-ds/theme/css/global.css";
import "@salt-ds/theme/css/theme-next.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { OperationsDashboard } from "./OperationsDashboard";
import "./dashboard.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <OperationsDashboard />
  </React.StrictMode>,
);
