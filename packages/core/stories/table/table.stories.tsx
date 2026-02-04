import {
  Code,
  StackLayout,
  Table,
  TableContainer,
  TBody,
  TD,
  Text,
  TFoot,
  TH,
  THead,
  TR,
  useId,
} from "@salt-ds/core";
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
  return (
    <TableContainer style={{ width: "800px", height: "300px" }}>
      <Table {...args}>
        <caption>Sample data table</caption>
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
  return (
    <TableContainer data-testid="non-scrollable-container">
      <Table divider="none" {...args} aria-label="Column headers">
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
  return (
    <TableContainer>
      <Table style={{ width: 200 }} {...args} aria-label="Long cell content">
        <caption>Scrollable long cell content</caption>
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
  return (
    <TableContainer>
      <Table {...args} aria-label="Numerical Data Table">
        <caption>Numerical data table</caption>
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
  return (
    <StackLayout style={{ width: 300 }}>
      <TableContainer>
        <Table {...args}>
          <caption>Scrollable vertically</caption>
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
        Extra long text to ensure only the table container is scrollable and not
        the entire page. Lorem ipsum dolor sit amet, consectetur adipiscing
        elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
        ut aliquip ex ea commodo consequat. Duis aute irure dolor in
        reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
        pariatur.
      </Text>
    </StackLayout>
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
  <TableContainer style={{ height: 120 }}>
    <Table aria-label="Aria Label Table" {...args}>
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

export const ScrollableExternalLabelTable: StoryFn<TablePropsAndCustomArgs> = ({
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
      <Text id={labelId}>External Table Name</Text>
      <TableContainer style={{ height: 120 }}>
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

export const ScrollableIdOverride: StoryFn<TablePropsAndCustomArgs> = ({
  THeadProps,
  TBodyProps,
  TFootProps: _TFootProps,
  TRProps,
  TDProps,
  THProps,
  ...args
}) => {
  return (
    <TableContainer style={{ height: 120 }}>
      {/** biome-ignore lint/correctness/useUniqueElementIds: Added for testing purposes */}
      <Table id="user-provided-id" {...args}>
        <caption>Caption Name</caption>
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

export const ScrollableAriaLabelledByOverride: StoryFn<
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
  const tableId = "external-aria-labelledby";
  const containerId = "user-provided-aria-labelledby";
  return (
    <>
      <Text id={containerId}>External Table Container Name</Text>
      <Text id={tableId}>External Table Name</Text>
      <TableContainer aria-labelledby={containerId} style={{ height: 120 }}>
        <Table aria-labelledby={tableId} {...args}>
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
export const ScrollableContainerAriaLabelOverride: StoryFn<
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
  return (
    <TableContainer
      aria-label="User Provided Aria Label"
      style={{ height: 120 }}
    >
      <Table {...args}>
        <caption>Caption Name</caption>
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
