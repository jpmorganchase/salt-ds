import { SaltShakerIcon } from "@salt-ds/icons";
import { OnSolid as OnSolidButton } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const OnSolid = (): ReactElement => (
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
    <OnSolidButton>
      <SaltShakerIcon aria-hidden />
      Dismiss
    </OnSolidButton>
  </div>
);

