import {
  Button,
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@salt-ds/core";
import type { ReactElement } from "react";

export const Default = (): ReactElement => {
  return (
    <Collapsible>
      <CollapsibleTrigger>
        <Button>Click</Button>
      </CollapsibleTrigger>
      <CollapsiblePanel>
        <p style={{maxWidth: "80ch"}}>
          This sample paragraph is intended to demonstrate how text will appear
          within the component. The content shown here is for illustrative
          purposes and does not contain specific information or advice. Using
          placeholder text like this helps review formatting, spacing, and
          overall presentation in the user interface. Adjust the wording as
          needed to suit your particular requirements or design preferences.
        </p>
      </CollapsiblePanel>
    </Collapsible>
  );
};
