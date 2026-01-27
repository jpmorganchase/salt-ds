import { Code, StackLayout, Text, useId } from "@salt-ds/core";
import {
  Table,
  TableContainer,
  TBody,
  TD,
  TFoot,
  TH,
  THead,
  TR,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import type { ComponentProps } from "react";

interface GenerateCustomRowParams {
  label: string;
  colCount?: number;
  Cell?: typeof TH | typeof TD;
  cellProps?: ComponentProps<typeof TH> | ComponentProps<typeof TD>;
  rowProps?: ComponentProps<typeof TR>;
}

const generateCustomRows = ({
  label,
  colCount = 3,
  Cell = TH,
  cellProps,
  rowProps,
}: GenerateCustomRowParams) => {
  const columns = Array.from({ length: colCount }).map((_, index) => ({
    id: `${label.toLowerCase()}-col-${index + 1}`,
    position: index + 1,
  }));

  return (
    <TR {...rowProps}>
      {columns.map((col) => (
        <Cell key={col.id} {...cellProps}>
          {label} {col.position}
        </Cell>
      ))}
    </TR>
  );
};

interface GenerateRowsParams {
  rowCount?: number;
  colCount?: number;
  rowProps?: ComponentProps<typeof TR>;
  cellProps?: ComponentProps<typeof TD>;
}

const generateRows = ({
  rowCount = 20,
  colCount = 3,
  rowProps,
  cellProps,
}: GenerateRowsParams = {}) => {
  const rows = Array.from({ length: rowCount }).map((_, index) => ({
    id: `row-${index + 1}`,
    position: index + 1,
  }));

  const columns = Array.from({ length: colCount }).map((_, index) => ({
    id: `col-${index + 1}`,
    position: index + 1,
  }));

  return (
    <>
      {rows.map((row) => (
        <TR key={row.id} {...rowProps}>
          {columns.map((col) => (
            <TD key={`${row.id}-${col.id}`} {...cellProps}>
              Row {row.position} Col {col.position}
            </TD>
          ))}
        </TR>
      ))}
    </>
  );
};

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
    zebra: false,
    THeadProps: { sticky: false, variant: undefined, divider: "primary" },
    TFootProps: { sticky: false, variant: undefined, divider: "tertiary" },
    TRProps: { divider: "secondary" },
    TBodyProps: {},
  },
} as Meta<TablePropsAndCustomArgs>;

const Template: StoryFn<TablePropsAndCustomArgs> = ({
  THeadProps,
  TBodyProps,
  TFootProps,
  TRProps,
  TDProps,
  THProps,
  ...args
}) => {
  const labelId = useId();
  return (
    <TableContainer
      labelId={labelId}
      style={{ width: "800px", height: "300px" }}
    >
      <Table {...args}>
        <caption id={labelId}>Sample data table</caption>
        <THead {...THeadProps}>
          {generateCustomRows({
            label: "Header",
            colCount: 7,
            Cell: TH,
            cellProps: THProps,
            rowProps: TRProps,
          })}
        </THead>
        <TBody {...TBodyProps}>
          {generateRows({
            rowCount: 10,
            colCount: 7,
            rowProps: TRProps,
            cellProps: TDProps,
          })}
        </TBody>
        <TFoot {...TFootProps}>
          {generateCustomRows({
            label: "Footer",
            colCount: 7,
            Cell: TD,
            cellProps: TDProps,
            rowProps: TRProps,
          })}
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
  zebra: true,
};

export const HeaderVariant = Template.bind({});
HeaderVariant.args = {
  THeadProps: { variant: "secondary" },
};

export const FooterVariant = Template.bind({});
FooterVariant.args = {
  TFootProps: { variant: "tertiary" },
};

export const StickyHeaderFooter: StoryFn<TablePropsAndCustomArgs> = ({
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
          {generateCustomRows({
            label: "Header",
            colCount: 7,
            Cell: TH,
            cellProps: THProps,
            rowProps: TRProps,
          })}
        </THead>
        <TBody {...TBodyProps}>
          {generateRows({
            rowCount: 10,
            colCount: 7,
            rowProps: TRProps,
            cellProps: TDProps,
          })}
        </TBody>
        <TFoot {...TFootProps}>
          {generateCustomRows({
            label: "Footer",
            colCount: 7,
            Cell: TD,
            cellProps: TDProps,
            rowProps: TRProps,
          })}
        </TFoot>
      </Table>
    </StackLayout>
  );
};
StickyHeaderFooter.args = {
  THeadProps: { sticky: true },
  TFootProps: { sticky: true },
};

export const ColumnHeaders: StoryFn<TablePropsAndCustomArgs> = ({
  THeadProps: _THeadProps,
  TBodyProps,
  TFootProps: _TFootProps,
  TRProps,
  TDProps,
  THProps,
  ...args
}) => {
  const labelId = useId();
  return (
    <TableContainer labelId={labelId}>
      <Table divider="none" {...args} aria-label="Column headers">
        <caption id={labelId}>Scrollable column headers</caption>
        <TBody {...TBodyProps}>
          <TR {...TRProps}>
            <TH {...THProps} scope="row">
              Label
            </TH>
            <TD {...TDProps}>Value</TD>
          </TR>
          <TR {...TRProps}>
            <TH {...THProps} scope="row">
              Label
            </TH>
            <TD {...TDProps}>Value</TD>
          </TR>
          <TR {...TRProps}>
            <TH {...THProps} scope="row">
              Label
            </TH>
            <TD {...TDProps}>Value</TD>
          </TR>
        </TBody>
      </Table>
    </TableContainer>
  );
};

export const LongCellContent: StoryFn<TablePropsAndCustomArgs> = ({
  THeadProps,
  TBodyProps,
  TFootProps: _TFootProps,
  TRProps,
  TDProps,
  THProps,
  ...args
}) => {
  const labelId = useId();
  return (
    <TableContainer labelId={labelId}>
      <Table style={{ width: 200 }} {...args} aria-label="Long cell content">
        <caption id={labelId}>Scrollable long cell content</caption>
        <THead {...THeadProps}>
          <TR {...TRProps}>
            <TH {...THProps}>Super long column header that will wrap</TH>
            <TH {...THProps}>Two</TH>
          </TR>
        </THead>
        <TBody {...TBodyProps}>
          <TR {...TRProps}>
            <TD {...TDProps}>Super long cell content that will wrap</TD>
            <TD {...TDProps}>Value</TD>
          </TR>
          <TR {...TRProps}>
            <TD {...TDProps}>Value</TD>
            <TD {...TDProps}>Value</TD>
          </TR>
          <TR {...TRProps}>
            <TD {...TDProps}>Value</TD>
            <TD {...TDProps}>Value</TD>
          </TR>
        </TBody>
      </Table>
    </TableContainer>
  );
};

export const NumericalData: StoryFn<TablePropsAndCustomArgs> = ({
  THeadProps,
  TBodyProps,
  TFootProps: _TFootProps,
  TRProps,
  TDProps,
  THProps,
  ...args
}) => {
  const labelId = useId();
  return (
    <TableContainer labelId={labelId}>
      <Table {...args} aria-label="Numerical Data Table">
        <caption id={labelId}>Numerical data table</caption>
        <THead {...THeadProps}>
          <TR {...TRProps}>
            <TH {...THProps}>City</TH>
            <TH {...THProps} textAlign="right">
              Population
            </TH>
          </TR>
        </THead>
        <TBody {...TBodyProps}>
          <TR {...TRProps}>
            <TD {...TDProps}>London</TD>
            <TD {...TDProps} textAlign="right">
              9.8 million
            </TD>
          </TR>
          <TR {...TRProps}>
            <TD {...TDProps}>New York</TD>
            <TD {...TDProps} textAlign="right">
              8.8 million
            </TD>
          </TR>
        </TBody>
      </Table>
    </TableContainer>
  );
};

export const ScrollableVertically: StoryFn<TablePropsAndCustomArgs> = ({
  THeadProps,
  TBodyProps,
  TFootProps: _TFootProps,
  TRProps,
  TDProps,
  THProps,
  ...args
}) => {
  const labelId = useId();
  return (
    <StackLayout style={{ width: 300 }}>
      <TableContainer labelId={labelId}>
        <Table {...args}>
          <caption id={labelId}>Scrollable vertically</caption>
          <THead {...THeadProps}>
            {generateCustomRows({
              label: "Header",
              colCount: 10,
              Cell: TH,
              cellProps: THProps,
              rowProps: TRProps,
            })}
          </THead>
          <TBody {...TBodyProps}>
            {generateRows({
              rowCount: 3,
              colCount: 10,
              rowProps: TRProps,
              cellProps: TDProps,
            })}
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

export const ScrollableCaptionTable: StoryFn<TablePropsAndCustomArgs> = ({
  THeadProps,
  TBodyProps,
  TFootProps: _TFootProps,
  TRProps,
  TDProps,
  THProps,
  ...args
}) => {
  const labelId = useId();
  return (
    <TableContainer labelId={labelId} style={{ height: 120 }}>
      <Table {...args}>
        <caption id={labelId}>Caption Name</caption>
        <THead {...THeadProps}>
          {generateCustomRows({
            label: "Header",
            colCount: 3,
            Cell: TH,
            cellProps: THProps,
            rowProps: TRProps,
          })}
        </THead>
        <TBody {...TBodyProps}>
          {generateRows({
            rowCount: 20,
            colCount: 3,
            cellProps: TDProps,
            rowProps: TRProps,
          })}
        </TBody>
      </Table>
    </TableContainer>
  );
};

export const ScrollableAriaLabelTable: StoryFn<TablePropsAndCustomArgs> = ({
  THeadProps,
  TBodyProps,
  TFootProps: _TFootProps,
  TRProps,
  TDProps,
  THProps,
  ...args
}) => (
  <TableContainer
    label="Scrollable Aria Labelled Table"
    style={{ height: 120 }}
  >
    <Table aria-label="Aria Labelled Table" {...args}>
      <THead {...THeadProps}>
        {generateCustomRows({
          label: "Header",
          colCount: 3,
          Cell: TH,
          cellProps: THProps,
          rowProps: TRProps,
        })}
      </THead>
      <TBody {...TBodyProps}>
        {generateRows({
          rowCount: 20,
          colCount: 3,
          cellProps: TDProps,
          rowProps: TRProps,
        })}
      </TBody>
    </Table>
  </TableContainer>
);

export const ScrollableAriaLabelledByTable: StoryFn<
  TablePropsAndCustomArgs
> = ({
  THeadProps,
  TBodyProps,
  TFootProps: _TFootProps,
  TRProps,
  TDProps,
  THProps,
  ...args
}) => {
  const labelId = useId();
  return (
    <>
      <Text id={labelId}>Labelled Table Name</Text>
      <TableContainer labelId={labelId} style={{ height: 120 }}>
        <Table aria-labelledby={labelId} {...args}>
          <THead {...THeadProps}>
            {generateCustomRows({
              label: "Header",
              colCount: 3,
              Cell: TH,
              cellProps: THProps,
              rowProps: TRProps,
            })}
          </THead>
          <TBody {...TBodyProps}>
            {generateRows({
              rowCount: 20,
              colCount: 3,
              cellProps: TDProps,
              rowProps: TRProps,
            })}
          </TBody>
        </Table>
      </TableContainer>
    </>
  );
};

export const NonScrollableTable: StoryFn<TablePropsAndCustomArgs> = ({
  THeadProps,
  TBodyProps,
  TFootProps,
  TRProps,
  TDProps,
  THProps,
  ...args
}) => {
  const labelId = useId();
  return (
    <TableContainer
      labelId={labelId}
      data-testid="non-scrollable-container"
      style={{ width: 400 }}
    >
      <Table {...args}>
        <caption id={labelId}>Non-Scrollable Table</caption>
        <THead {...THeadProps}>
          <TR {...TRProps}>
            <TH {...THProps}>H1</TH>
            <TH {...THProps}>H2</TH>
          </TR>
        </THead>
        <TBody>
          <TR {...TRProps}>
            <TD {...TDProps}>Data</TD>
            <TD {...TDProps}>More Data</TD>
          </TR>
        </TBody>
        <TFoot {...TFootProps}>
          <TR {...TRProps}>
            <TD {...TDProps}>Foot</TD>
            <TD {...TDProps}>Foot</TD>
          </TR>
        </TFoot>
      </Table>
    </TableContainer>
  );
};
