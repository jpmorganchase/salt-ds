import { Text } from "@salt-ds/core";
import type { ReactNode } from "react";

export const ContentExample = ({ children }: { children?: ReactNode }) => (
  <div
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: "var(--salt-spacing-200)",
      padding: "var(--salt-spacing-300)",
      overflow: "auto",
    }}
  >
    {children}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "var(--salt-spacing-200)",
        flex: 1,
      }}
    >
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          style={{
            backgroundColor: "var(--salt-container-secondary-background)",
            borderRadius: "var(--salt-palette-corner-weak)",
            border:
              "var(--salt-size-fixed-100) dashed var(--salt-container-primary-borderColor)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 80,
          }}
        />
      ))}
    </div>
  </div>
);

