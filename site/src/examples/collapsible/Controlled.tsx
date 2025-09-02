import {
  Button,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@salt-ds/core";
import { type ReactElement, useState } from "react";

export const Controlled = (): ReactElement => {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible
      open={open}
      onOpenChange={(_event, newOpen) => setOpen(newOpen)}
    >
      <CollapsibleTrigger>
        <Button>Click</Button>
      </CollapsibleTrigger>
      <CollapsiblePanel>
        <p style={{ maxWidth: "80ch" }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </CollapsiblePanel>
    </Collapsible>
  );
};
