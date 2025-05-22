import type { Meta, StoryFn } from "@storybook/react";

import {
  Button,
  Code,
  FlexLayout,
  StackLayout,
  Switch,
  Text,
} from "@salt-ds/core";
import { TBody, TD, TFoot, TH, THead, TR, Table } from "@salt-ds/lab";

export default {
  title: "Lab/Table",
  component: Table,
  subcomponents: { TD, TH, Text, Code, TBody, THead, TR, TFoot },
} as Meta<typeof Text>;

const NUM_COLS = 7;
const NUM_ROWS = 10;

const Template: StoryFn = ({ ...args }) => {
  return (
    <StackLayout style={{ width: "800px", height: "300px", overflow: "auto" }}>
      <Table {...args}>
        <THead>
          <TR>
            {Array.from({ length: NUM_COLS }, (_, i) => {
              return <TH key={`col-${i}`}>Column {i}</TH>;
            })}
          </TR>
        </THead>
        <TBody>
          {Array.from({ length: NUM_ROWS }, (_, i) => {
            return (
              <TR key={`tr-${i}`}>
                {Array.from({ length: NUM_COLS }, (_, i) => {
                  return <TD key={`td-${i}`}>Row {i}</TD>;
                })}
              </TR>
            );
          })}
        </TBody>
        <TFoot>
          <TR>
            {Array.from({ length: NUM_COLS }, (_, i) => {
              return <TD key={`footer-${i}`}>Footer {i}</TD>;
            })}
          </TR>
        </TFoot>
      </Table>
    </StackLayout>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  variant: "primary",
};

export const Secondary = Template.bind({});
Secondary.args = {
  variant: "secondary",
};

export const Zebra = Template.bind({});
Zebra.args = {
  variant: "zebra",
};

export const CustomContent: StoryFn<typeof Text> = () => {
  return (
    <StackLayout style={{ width: "800px", height: "300px", overflow: "auto" }}>
      <Table>
        <THead>
          <TR>
            <TH>Col 1</TH>
            <TH>Col 2</TH>
          </TR>
        </THead>
        <TBody>
          <TR>
            <TD>
              <FlexLayout justify="space-between" align="center">
                <Button>Click me</Button>
                <Text>
                  <strong>Date:</strong> {new Date().toDateString()}
                </Text>
              </FlexLayout>
            </TD>
            <TD>
              <StackLayout gap={1}>
                <Switch label="Click me" />
                <Text>12345</Text>
              </StackLayout>
            </TD>
          </TR>
          <TR>
            <TD>Some standard text</TD>
            <TD>
              <StackLayout gap={1}>
                <strong>Data</strong>
                <Text>12345</Text>
              </StackLayout>
            </TD>
          </TR>
        </TBody>
      </Table>
    </StackLayout>
  );
};
