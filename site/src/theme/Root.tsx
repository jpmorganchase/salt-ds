import React from "react";
import { ToolkitProvider } from "@jpmorganchase/uitk-core";

export default function Root({ children }) {
  return <ToolkitProvider>{children}</ToolkitProvider>;
}
