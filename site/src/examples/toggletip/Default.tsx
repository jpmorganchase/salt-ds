import {
  StackLayout,
  Text,
  Toggletip,
  ToggletipPanel,
  ToggletipTrigger,
} from "@salt-ds/core";
import { HelpCircleIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const Default = (): ReactElement => (
  <Toggletip>
    <ToggletipTrigger aria-label="Content locked">
      <HelpCircleIcon aria-hidden />
    </ToggletipTrigger>
    <ToggletipPanel>
      <StackLayout gap={1}>
        <Text>
          <strong>Content locked</strong>
        </Text>
        <Text>
          This setting is managed at a project level. Contact your administrator
          for assistance.
        </Text>
      </StackLayout>
    </ToggletipPanel>
  </Toggletip>
);
