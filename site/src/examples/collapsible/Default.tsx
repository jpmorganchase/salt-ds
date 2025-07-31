import { Button } from "@salt-ds/core";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Default = (): ReactElement => {
  return (
    <Collapsible>
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
