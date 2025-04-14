import type { Meta, StoryFn } from "@storybook/react";

import {
  Table,TD,TH,TR,THead,TBody,TFoot
} from "@salt-ds/lab";
import {
  Text,
  Code,
  StackLayout,Button,FlexLayout,
  Switch
} from "@salt-ds/core";

export default {
  title: "Lab/Table",
  component: Table,
  subcomponents: { TD, TH, Text, Code, TBody, THead, TR,TFoot },
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
              return <TH>Column {i}</TH>;
            })}
          </TR>
        </THead>
        <TBody>
            {Array.from({ length: NUM_ROWS }, (_, i) => {
              return (
                <TR>
                {Array.from({ length: NUM_COLS }, (_, i) => 
                {
                  return <TD>Row {i}</TD>;}
                  )}
                </TR>
              );
            })}
        </TBody>
        <TFoot>
            <TR>
            {Array.from({ length: NUM_COLS }, (_, i) => 
            {
              return <TD>Footer {i}</TD>;}
              )}
            </TR>
        </TFoot>
      </Table>
    </StackLayout>);
};

export const Primary = Template.bind({});
Primary.args = {
  variant: 'primary'
};

export const Secondary = Template.bind({});
Secondary.args = {
  variant: 'secondary'
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
              <FlexLayout justify='space-between' align='center'>
                <Button>Click me</Button>
                <Text><strong>Date:</strong> {new Date().toDateString()}</Text>
              </FlexLayout>
            </TD>
            <TD>
              <StackLayout gap={1}>
                <Switch label='Click me' />
                <Text>12345</Text>
              </StackLayout>
           </TD>
        </TR>
        <TR>
            <TD>
              Some standard text
            </TD>
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