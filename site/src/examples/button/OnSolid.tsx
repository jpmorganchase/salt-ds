import { StackLayout } from "@salt-ds/core";
import { OnSolidButton } from "@salt-ds/lab";
import type { ReactElement } from "react";

const surfaces = [
  { name: "error", background: "var(--salt-status-error-bold-background)" },
  { name: "info", background: "var(--salt-status-info-bold-background)" },
  { name: "warning", background: "var(--salt-status-warning-bold-background)" },
  { name: "success", background: "var(--salt-status-success-bold-background)" },
];

export const OnSolid = (): ReactElement => (
  <StackLayout gap={3} align="start">
    {surfaces.map(({ name, background }) => (
      <div
        key={name}
        style={{
          background,
          padding: "var(--salt-spacing-300)",
          borderRadius: "var(--salt-palette-corner-weak)",
        }}
      >
        <OnSolidButton aria-label={`Dismiss ${name} message`}>
          Dismiss
        </OnSolidButton>
      </div>
    ))}
  </StackLayout>
);
