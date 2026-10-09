import {
  Button,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const CustomRoot = (): ReactElement => {
  return (
    <Collapsible>
      <CollapsibleTrigger>
        <Button>Release notes</Button>
      </CollapsibleTrigger>
      <CollapsiblePanel render={<section />}>
        <p style={{ paddingTop: "var(--salt-spacing-100)", maxWidth: "80ch" }}>
          This panel renders as a section element instead of the default div. It
          expands and collapses in the same way as the default panel.
        </p>
      </CollapsiblePanel>
    </Collapsible>
  );
};
