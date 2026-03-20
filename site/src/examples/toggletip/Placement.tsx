import {
  StackLayout,
  Text,
  Toggletip,
  ToggletipPanel,
  ToggletipTrigger,
} from "@salt-ds/core";
import { HelpCircleIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const Placement = (): ReactElement => (
  <StackLayout direction="row">
    <Toggletip placement="left">
      <ToggletipTrigger aria-label="Left">
        <HelpCircleIcon aria-hidden />
      </ToggletipTrigger>
      <ToggletipPanel>
        <Text>Toggletips can be positioned to the left.</Text>
      </ToggletipPanel>
    </Toggletip>
    <Toggletip placement="top">
      <ToggletipTrigger aria-label="Top">
        <HelpCircleIcon aria-hidden />
      </ToggletipTrigger>
      <ToggletipPanel>
        <Text>Toggletips can be positioned to the top.</Text>
      </ToggletipPanel>
    </Toggletip>
    <Toggletip placement="bottom">
      <ToggletipTrigger aria-label="Bottom">
        <HelpCircleIcon aria-hidden />
      </ToggletipTrigger>
      <ToggletipPanel>
        <Text>Toggletips can be positioned to the bottom.</Text>
      </ToggletipPanel>
    </Toggletip>
    <Toggletip placement="right">
      <ToggletipTrigger aria-label="Right">
        <HelpCircleIcon aria-hidden />
      </ToggletipTrigger>
      <ToggletipPanel>
        <Text>Toggletips can be positioned to the right.</Text>
      </ToggletipPanel>
    </Toggletip>
  </StackLayout>
);
