import { GridLayout, Text } from "@salt-ds/core";
import { OnSolidButton } from "@salt-ds/lab";
import { Fragment, type ReactElement } from "react";

const surfaces = [
  { name: "Error", background: "var(--salt-status-error-bold-background)" },
  { name: "Info", background: "var(--salt-status-info-bold-background)" },
  { name: "Warning", background: "var(--salt-status-warning-bold-background)" },
  { name: "Success", background: "var(--salt-status-success-bold-background)" },
];

export const OnSolid = (): ReactElement => (
  <GridLayout
    columns="min-content auto"
    gap={3}
    style={{ alignItems: "center" }}
  >
    {surfaces.map(({ name, background }) => (
      <Fragment key={name}>
        <Text>{name}</Text>
        <div
          style={{
            background,
            padding: "var(--salt-spacing-300)",
            borderRadius: "var(--salt-palette-corner-weak)",
          }}
        >
          <OnSolidButton aria-label={`Dismiss ${name.toLowerCase()} message`}>
            Dismiss
          </OnSolidButton>
        </div>
      </Fragment>
    ))}
  </GridLayout>
);
