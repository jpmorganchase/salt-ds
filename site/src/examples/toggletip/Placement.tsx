import {
  StackLayout,
  Text,
  Toggletip,
  ToggletipPanel,
  ToggletipTrigger,
} from "@salt-ds/core";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
} from "@salt-ds/icons";
import type { ReactElement } from "react";

export const Placement = (): ReactElement => (
  <StackLayout direction="row">
    <Toggletip placement="left">
      <ToggletipTrigger aria-label="Left">
        <ArrowLeftIcon aria-hidden />
      </ToggletipTrigger>
      <ToggletipPanel>
        <Text>Toggletips can be positioned to the left.</Text>
      </ToggletipPanel>
    </Toggletip>
    <Toggletip placement="top">
      <ToggletipTrigger aria-label="Top">
        <ArrowUpIcon aria-hidden />
      </ToggletipTrigger>
      <ToggletipPanel>
        <Text>Toggletips can be positioned to the top.</Text>
      </ToggletipPanel>
    </Toggletip>
    <Toggletip placement="bottom">
      <ToggletipTrigger aria-label="Bottom">
        <ArrowDownIcon aria-hidden />
      </ToggletipTrigger>
      <ToggletipPanel>
        <Text>Toggletips can be positioned to the bottom.</Text>
      </ToggletipPanel>
    </Toggletip>
    <Toggletip placement="right">
      <ToggletipTrigger aria-label="Right">
        <ArrowRightIcon aria-hidden />
      </ToggletipTrigger>
      <ToggletipPanel>
        <Text>Toggletips can be positioned to the right.</Text>
      </ToggletipPanel>
    </Toggletip>
  </StackLayout>
);
