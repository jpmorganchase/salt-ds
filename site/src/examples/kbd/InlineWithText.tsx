import { FlexLayout, Text } from "@salt-ds/core";
import { Kbd } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const InlineWithText = (): ReactElement => (
  <FlexLayout gap={0.5} align="center" wrap>
    <Text>Press</Text>
    <Kbd>Ctrl</Kbd>
    <Text>+</Text>
    <Kbd>Shift</Kbd>
    <Text>+</Text>
    <Kbd>k</Kbd>
    <Text>to open the command palette</Text>
  </FlexLayout>
);
