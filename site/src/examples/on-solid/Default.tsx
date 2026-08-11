import { OnSolid } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Default = (): ReactElement => (
  <div
    style={{
      background: "var(--salt-status-info-bold-background)",
      padding: "var(--salt-spacing-300)",
      borderRadius: "var(--salt-palette-corner-weak)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <OnSolid>Dismiss</OnSolid>
  </div>
);

