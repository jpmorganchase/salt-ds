import { StackLayout } from "@salt-ds/core";
import { NotificationIcon } from "@salt-ds/icons";
import { OnSolid as OnSolidButton } from "@salt-ds/lab";
import type { ReactElement } from "react";

const backgrounds = [
  "var(--salt-status-error-bold-background)",
  "var(--salt-status-info-bold-background)",
  "var(--salt-status-warning-bold-background)",
  "var(--salt-status-success-bold-background)",
];

export const OnSolid = (): ReactElement => (
  <StackLayout gap={3} align="start">
    {backgrounds.map((background) => (
      <div
        key={background}
        style={{
          background,
          padding: "var(--salt-spacing-300)",
          borderRadius: "var(--salt-palette-corner-weak)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <OnSolidButton>
          <NotificationIcon aria-hidden />
          Dismiss
        </OnSolidButton>
      </div>
    ))}
  </StackLayout>
);
