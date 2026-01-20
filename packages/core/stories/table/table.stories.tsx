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

const generateCustomRow = (
  label: string,
  colCount = 3,
  Cell: typeof TH | typeof TD = TH,
  cellProps?: ComponentProps<typeof TH> | ComponentProps<typeof TD>,
  rowProps?: ComponentProps<typeof TR>,
) => {
  const columns = Array.from({ length: colCount }, (_, index) => ({
    id: `${label.toLowerCase()}-col-${index + 1}`,
    position: index + 1,
  }));

  return (
    <TR {...rowProps}>
      {columns.map(({ id, position }) => (
        <Cell key={id} {...cellProps}>
          {label} {position}
        </Cell>
      ))}
    </TR>
  );
};

const generateRows = (
  rowCount = 20,
  colCount = 3,
  rowProps?: ComponentProps<typeof TR>,
  cellProps?: ComponentProps<typeof TD>,
) => {
  const rows = Array.from({ length: rowCount }, (_, index) => ({
    id: `row-${index + 1}`,
    position: index + 1,
  }));

  const columns = Array.from({ length: colCount }, (_, index) => ({
    id: `col-${index + 1}`,
    position: index + 1,
  }));

  return (
    <>
      {rows.map(({ id: rowId, position: rowNumber }) => (
        <TR key={rowId} {...rowProps}>
          {columns.map(({ id: colId, position: colNumber }) => (
            <TD key={`${rowId}-${colId}`} {...cellProps}>
              Row {rowNumber} Col {colNumber}
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
  title: "Core/Table",
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
        <THead {...THeadProps}>
          {generateCustomRow("Header", 7, TH, THProps, TRProps)}
        </THead>
        <TBody {...TBodyProps}>{generateRows(10, 7, TRProps, TDProps)}</TBody>
        <TFoot {...TFootProps}>
          {generateCustomRow("Footer", 7, TD, TDProps, TRProps)}
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
          {generateCustomRow("Header", 7, TH, THProps, TRProps)}
        </THead>
        <TBody {...TBodyProps}>{generateRows(10, 7, TRProps, TDProps)}</TBody>
        <TFoot {...TFootProps}>
          {generateCustomRow("Footer", 7, TD, TDProps, TRProps)}
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
  TBodyProps: _TBodyProps,
  TFootProps: _TFootProps,
  TRProps: _TRProps,
  ...args
}) => {
  return (
    <TableContainer aria-label="Scrollable column headers">
      <Table divider="none" {...args} aria-label="Column headers">
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
            <TH scope="row">Label</TH>
            <TD>Value</TD>
          </TR>
        </TBody>
      </Table>
    </TableContainer>
  );
};

export const LongCellContent: StoryFn<TablePropsAndCustomArgs> = ({
  THeadProps: _THeadProps,
  TBodyProps: _TBodyProps,
  TFootProps: _TFootProps,
  TRProps: _TRProps,
  TDProps,
  THProps,
  ...args
}) => {
  return (
    <TableContainer aria-label="Scrollable long cell content">
      <Table style={{ width: 200 }} {...args} aria-label="Long cell content">
        <THead>
          <TR>
            <TH {...THProps}>Super long column header that will wrap</TH>
            <TH {...THProps}>Two</TH>
          </TR>
        </THead>
        <TBody>
          <TR>
            <TD {...TDProps}>Super long cell content that will wrap</TD>
            <TD {...TDProps}>Value</TD>
          </TR>
          <TR>
            <TD {...TDProps}>Value</TD>
            <TD {...TDProps}>Value</TD>
          </TR>
          <TR>
            <TD {...TDProps}>Value</TD>
            <TD {...TDProps}>Value</TD>
          </TR>
        </TBody>
      </Table>
    </TableContainer>
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
    <TableContainer aria-label="Scrollable Numerical Data Table">
      <Table {...args} aria-label="Numerical Data Table">
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

export const ScrollableVertically: StoryFn<TablePropsAndCustomArgs> = ({
  THeadProps: _THeadProps,
  TBodyProps: _TBodyProps,
  TFootProps: _TFootProps,
  TRProps: _TRProps,
  TDProps,
  THProps,
  ...args
}) => {
  const id = useId();
  return (
    <StackLayout style={{ width: 300 }}>
      <TableContainer aria-labelledby={id}>
        <Table {...args}>
          <caption id={id}>Scrollable vertically</caption>
          <THead>{generateCustomRow("Header", 10)}</THead>
          <TBody>{generateRows(3, 10)}</TBody>
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
  THeadProps: _THeadProps,
  TBodyProps: _TBodyProps,
  TFootProps: _TFootProps,
  TRProps: _TRProps,
  TDProps,
  THProps,
  ...args
}) => {
  const id = useId();
  return (
    <TableContainer style={{ height: 120 }} aria-labelledby={id}>
      <Table {...args}>
        <caption id={id}>Caption Name</caption>
        <THead>{generateCustomRow("Header", 3)}</THead>
        <TBody>{generateRows()}</TBody>
      </Table>
    </TableContainer>
  );
};

export const ScrollableAriaLabelTable: StoryFn<TablePropsAndCustomArgs> = ({
  THeadProps: _THeadProps,
  TBodyProps: _TBodyProps,
  TFootProps: _TFootProps,
  TRProps: _TRProps,
  TDProps,
  THProps,
  ...args
}) => (
  <TableContainer
    aria-label="Scrollable Aria Labelled Table"
    style={{ height: 120 }}
  >
    <Table aria-label="Aria Labelled Table" {...args}>
      <THead>{generateCustomRow("Header", 3)}</THead>
      <TBody>{generateRows()}</TBody>
    </Table>
  </TableContainer>
);

export const ScrollableAriaLabelledByTable: StoryFn<
  TablePropsAndCustomArgs
> = ({
  THeadProps: _THeadProps,
  TBodyProps: _TBodyProps,
  TFootProps: _TFootProps,
  TRProps: _TRProps,
  TDProps,
  THProps,
  ...args
}) => {
  const id = useId();
  return (
    <>
      <Text id={id}>Labelled Table Name</Text>
      <TableContainer style={{ height: 120 }} aria-labelledby={id}>
        <Table aria-labelledby={id} {...args}>
          <THead>{generateCustomRow("Header", 3)}</THead>
          <TBody>{generateRows()}</TBody>
        </Table>
      </TableContainer>
    </>
  );
};

export const NonScrollableTable: StoryFn<TablePropsAndCustomArgs> = ({
  THeadProps: _THeadProps,
  TBodyProps: _TBodyProps,
  TFootProps: _TFootProps,
  TRProps: _TRProps,
  TDProps,
  THProps,
  ...args
}) => {
  const id = useId();
  return (
    <TableContainer
      aria-labelledby={id}
      data-testid="non-scrollable-container"
      style={{ width: 400 }}
    >
      <Table {...args}>
        <caption id={id}>Non-Scrollable Table</caption>
        <THead>
          <TR>
            <TH>H1</TH>
            <TH>H2</TH>
          </TR>
        </THead>
        <TBody>
          <TR>
            <TD>Data</TD>
            <TD>More Data</TD>
          </TR>
        </TBody>
        <TFoot>
          <TR>
            <TD>Foot</TD>
            <TD>Foot</TD>
          </TR>
        </TFoot>
      </Table>
    </TableContainer>
  );
};
