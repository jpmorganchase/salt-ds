import {
  Display3,
  StackLayout,
  Text,
  Toggletip,
  ToggletipPanel,
  ToggletipTrigger,
} from "@salt-ds/core";
import { HelpCircleIcon } from "@salt-ds/icons";
import type { ReactElement } from "react";

export const WithMetric = (): ReactElement => (
  <StackLayout gap={0}>
    <StackLayout direction="row" gap={1}>
      <Text>
        <strong>Active users</strong>
      </Text>
      <Toggletip>
        <ToggletipTrigger aria-label="Active users explanation">
          <HelpCircleIcon aria-hidden />
        </ToggletipTrigger>
        <ToggletipPanel>
          <Text>
            Users who have logged in at least once in the past 7 days.
          </Text>
        </ToggletipPanel>
      </Toggletip>
    </StackLayout>
    <Display3>14,209</Display3>
  </StackLayout>
);
