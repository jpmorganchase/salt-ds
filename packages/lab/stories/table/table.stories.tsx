import {
  Button,
  Code,
  FlexLayout,
  StackLayout,
  Switch,
  Text,
} from "@salt-ds/core";
import { Table, TBody, TD, TFoot, TH, THead, TR } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import type { ComponentProps } from "react";

type TablePropsAndCustomArgs = ComponentProps<typeof Table> & {
  THeadProps: ComponentProps<typeof THead>;
  TFootProps: ComponentProps<typeof TFoot>;
  TRProps: ComponentProps<typeof TR>;
  TDProps: ComponentProps<typeof TD>;
  THProps: ComponentProps<typeof TH>;
  TBodyProps: ComponentProps<typeof TBody>;
};

export default {
  title: "Lab/Table",
  component: Table,
  subcomponents: { TD, TH, Text, Code, TBody, THead, TR, TFoot },
  args: {
    variant: "primary",
    zebra: undefined,
    THeadProps: { sticky: false, variant: undefined, divider: "primary" },
    TFootProps: { sticky: false, variant: undefined, divider: "tertiary" },
    TRProps: { divider: "secondary" },
    TBodyProps: {},
  },
} as Meta<TablePropsAndCustomArgs>;

const NUM_COLS = 7;
const NUM_ROWS = 10;

const Template: StoryFn = ({
  THeadProps,
  TBodyProps,
  TFootProps,
  TRProps,
  TDProps,
  THProps,
  ...args
}) => {
  return (
    <StackLayout
      style={{ width: "800px", height: "300px", overflow: "auto" }}
      tabIndex={0}
    >
      <Table {...args}>
        <THead {...THeadProps}>
          <TR {...TRProps}>
            {Array.from({ length: NUM_COLS }, (_, i) => {
              return (
                <TH {...THProps} key={`col-${i}`}>
                  Column {i}
                </TH>
              );
            })}
          </TR>
        </THead>
        <TBody {...TBodyProps}>
          {Array.from({ length: NUM_ROWS }, (_, x) => {
            return (
              <TR {...TRProps} key={`tr-${x}`}>
                {Array.from({ length: NUM_COLS }, (_, i) => {
                  return (
                    <TD {...TDProps} key={`td-${i}`}>
                      Row {x}
                    </TD>
                  );
                })}
              </TR>
            );
          })}
        </TBody>
        <TFoot {...TFootProps}>
          <TR {...TRProps}>
            {Array.from({ length: NUM_COLS }, (_, i) => {
              return (
                <TD {...TDProps} key={`footer-${i}`}>
                  Footer {i}
                </TD>
              );
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

export const Tertiary = Template.bind({});
Tertiary.args = {
  variant: "tertiary",
};

export const Zebra = Template.bind({});
Zebra.args = {
  zebra: "tertiary",
};

export const HeaderVariant = Template.bind({});
HeaderVariant.args = {
  THeadProps: { variant: "secondary" },
};

export const FooterVariant = Template.bind({});
FooterVariant.args = {
  TFootProps: { variant: "tertiary" },
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
              <StackLayout gap={0}>
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

export const StickyHeaderFooter: StoryFn<typeof Text> = ({
  THeadProps,
  TFootProps,
}) => {
  return (
    <StackLayout
      style={{ width: "800px", height: "300px", overflow: "auto" }}
      tabIndex={0}
    >
      <Table>
        <THead {...THeadProps}>
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
        <TFoot {...TFootProps}>
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
StickyHeaderFooter.args = {
  THeadProps: { sticky: true },
  TFootProps: { sticky: true },
};
