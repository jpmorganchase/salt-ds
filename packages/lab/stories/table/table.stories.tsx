import {
  Button,
  Code,
  FlexLayout,
  StackLayout,
  Switch,
  Table,
  TableContainer,
  TBody,
  TD,
  Text,
} from "@salt-ds/core";
import { Table, TBody, TD, TFoot, TH, THead, TR } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import type { ComponentProps } from "react";
import { planetData, planetDataColumns } from "./exampleData";

type TablePropsAndCustomArgs = ComponentProps<typeof Table> & {
  THeadProps: ComponentProps<typeof THead>;
  TFootProps: ComponentProps<typeof TFoot>;
  TRProps: ComponentProps<typeof TR>;
  TDProps: ComponentProps<typeof TD>;
  THProps: ComponentProps<typeof TH>;
  TBodyProps: ComponentProps<typeof TBody>;
};

export default {
  title: "Core/Table",
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
    <TableContainer style={{ width: "800px", height: "300px" }}>
      <Table {...args}>
        <THead {...THeadProps}>
          <TR {...TRProps}>
            {Array.from({ length: NUM_COLS }, (arrItem, i) => {
              return (
                <TH {...THProps} key={`col-${arrItem}`}>
                  Column {i}
                </TH>
              );
            })}
          </TR>
        </THead>
        <TBody {...TBodyProps}>
          {Array.from({ length: NUM_ROWS }, (arrItem, x) => {
            return (
              <TR {...TRProps} key={`tr-${arrItem}`}>
                {Array.from({ length: NUM_COLS }, (nestedArrItem) => {
                  return (
                    <TD {...TDProps} key={`td-${nestedArrItem}`}>
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
            {Array.from({ length: NUM_COLS }, (arrItem, i) => {
              return (
                <TD {...TDProps} key={`footer-${arrItem}`}>
                  Footer {i}
                </TD>
              );
            })}
          </TR>
        </TFoot>
      </Table>
    </TableContainer>
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
      <TableContainer>
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
      </TableContainer>
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
            {Array.from({ length: NUM_COLS }, (arrItem, i) => {
              return <TH key={`col-${arrItem}`}>Column {i + 1}</TH>;
            })}
          </TR>
        </THead>
        <TBody>
          {Array.from({ length: NUM_ROWS }, (arrItem, i) => {
            return (
              <TR key={`tr-${arrItem}`}>
                {Array.from({ length: NUM_COLS }, (nestedArrItem) => {
                  return <TD key={`td-${nestedArrItem}`}>Row {i + 1}</TD>;
                })}
              </TR>
            );
          })}
        </TBody>
        <TFoot {...TFootProps}>
          <TR>
            {Array.from({ length: NUM_COLS }, (arrItem, i) => {
              return <TD key={`footer-${arrItem}`}>Footer {i + 1}</TD>;
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

export const ColumnHeaders: StoryFn<typeof Table> = (args) => {
  return (
    <Table divider="none" {...args}>
      <THead>
        <TR>
          <TH>One</TH>
          <TH>Two</TH>
        </TR>
      </THead>
      <TBody>
        <TR>
          <TH scope="row">Label</TH>
          <TD>Value</TD>
        </TR>
        <TR>
          <TH scope="row">Label</TH>
          <TD>Value</TD>
        </TR>
        <TR>
          <TD {...TDProps}>Value</TD>
          <TD {...TDProps}>Value</TD>
        </TR>
      </TBody>
    </Table>
  );
};

export const NumericalData: StoryFn<TablePropsAndCustomArgs> = ({
  THeadProps: _THeadProps,
  TBodyProps: _TBodyProps,
  TFootProps: _TFootProps,
  TRProps: _TRProps,
  TDProps,
  THProps,
  ...args
}) => {
  return (
    <TableContainer>
      <Table {...args}>
        <THead>
          <TR>
            <TH>City</TH>
            <TH textAlign="right">Population</TH>
          </TR>
        </THead>
        <TBody>
          <TR>
            <TD>London</TD>
            <TD textAlign="right">9.8 million</TD>
          </TR>
          <TR>
            <TD>New York</TD>
            <TD textAlign="right">8.8 million</TD>
          </TR>
        </TBody>
      </Table>
    </TableContainer>
  );
};

export const Scrollable: StoryFn<TablePropsAndCustomArgs> = ({
  THeadProps: _THeadProps,
  TBodyProps: _TBodyProps,
  TFootProps: _TFootProps,
  TRProps: _TRProps,
  TDProps,
  THProps,
  ...args
}) => {
  return (
    <StackLayout style={{ height: 300, width: 300 }}>
      <TableContainer>
        <Table {...args} aria-label="Planet data table">
          <THead>
            <TR>
              {planetDataColumns.map(({ key, title, type }) => {
                return (
                  <TH
                    key={key}
                    textAlign={type === "number" ? "right" : "left"}
                    style={{
                      whiteSpace: "nowrap",
                    }}
                  >
                    {title}
                  </TH>
                );
              })}
            </TR>
          </THead>
          <TBody>
            {planetData.map((row) => (
              <TR key={row.planet}>
                {planetDataColumns.map(({ key, type }) => (
                  <TD
                    key={`${row.planet}-${key}`}
                    textAlign={type === "number" ? "right" : "left"}
                  >
                    {row[key]}
                  </TD>
                ))}
              </TR>
            ))}
          </TBody>
        </Table>
      </TableContainer>

      <Text>
        A data table relies on two-dimensional layout for understanding, but by
        presenting the table in its own scrollable container it allows other
        content which does not meet a two-dimensional layout exception to reflow
        as its containing element adjusts. for example, due to browser resizing,
        or zooming.
      </Text>
    </StackLayout>
  );
};
