import React from "react";
import { ToolkitProvider } from "@jpmorganchase/uitk-core";
import "@jpmorganchase/uitk-theme/index.css";

// TODO: change density per viewport
// desktop: low density, tablet and mobile: touch density
const density = "low";

export default function Root({ children }) {
  return (
    <ToolkitProvider mode="dark" density={density}>
      {children}
    </ToolkitProvider>
  );
}
