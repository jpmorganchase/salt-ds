import type { Meta, StoryFn } from "@storybook/react";

import {
  Table,TD,TH,TR,THead,TBody
} from "@salt-ds/lab";
import {
  Text,
  Code,
  Card
} from "@salt-ds/core";

export default {
  title: "Lab/Table",
  component: Table,
  subcomponents: { TD, TH, Text, Code, TBody, THead, TR },
} as Meta<typeof Text>;

export const Primary: StoryFn<typeof Text> = () => {
  return (
    <Card variant='secondary'>
    <Table>
      <THead>
        <TR>
          <TH>Salt</TH>
          <TH>Pepper</TH>
        </TR>
      </THead>
      <TBody>
        <TR>
          <TD>one</TD>
          <TD>two</TD>
        </TR>
      </TBody>
    </Table>
    </Card>
  );
};