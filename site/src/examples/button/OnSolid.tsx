import { FlowLayout } from "@salt-ds/core";
import { SaltShakerIcon } from "@salt-ds/icons";
import { OnSolid as OnSolidButton } from "@salt-ds/lab";
import type { ReactElement } from "react";

const backgrounds = [
  "var(--salt-status-error-bold-background)",
  "var(--salt-status-info-bold-background)",
  "var(--salt-status-warning-bold-background)",
  "var(--salt-status-success-bold-background)",
];

export const OnSolid = (): ReactElement => (
  <FlowLayout gap={3}>
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
          <SaltShakerIcon aria-hidden />
          Dismiss
        </OnSolidButton>
      </div>
    ))}
  </FlowLayout>
);
