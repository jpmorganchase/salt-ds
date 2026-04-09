import {
  StackLayout,
  Text,
  Toggletip,
  ToggletipPanel,
  ToggletipTrigger,
} from "@salt-ds/core";
import { HelpCircleIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const LongContent = (): ReactElement => (
  <Toggletip>
    <ToggletipTrigger aria-label="Help info">
      <HelpCircleIcon aria-hidden />
    </ToggletipTrigger>
    <ToggletipPanel style={{ maxHeight: 100 }}>
      <StackLayout gap={1}>
        <Text>
          This example text is intended to demonstrate layout and formatting
          within the component. The content shown here is for illustrative
          purposes and does not represent actual information or advice.
        </Text>
        <Text>
          Sample paragraphs like this can be used to visualize how text will
          appear in different scenarios. The wording is generic and designed to
          help review spacing, alignment, and overall presentation in the user
          interface.
        </Text>
      </StackLayout>
    </ToggletipPanel>
  </Toggletip>
);
