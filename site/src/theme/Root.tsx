import React from "react";
import { ToolkitProvider } from "@jpmorganchase/uitk-core";
import "@jpmorganchase/uitk-theme/index.css";

export default function Root({ children }) {
  return <ToolkitProvider>{children}</ToolkitProvider>;
}
