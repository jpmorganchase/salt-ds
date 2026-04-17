import {
  Text,
  Toggletip,
  ToggletipPanel,
  ToggletipTrigger,
} from "@salt-ds/core";
import { HelpCircleIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const Default = (): ReactElement => (
  <Toggletip>
    <ToggletipTrigger aria-label="More info about locked content">
      <HelpCircleIcon aria-hidden />
    </ToggletipTrigger>
    <ToggletipPanel>
      <Text>
        This setting is managed at a project level. Contact your administrator
        for assistance.
      </Text>
    </ToggletipPanel>
  </Toggletip>
);
