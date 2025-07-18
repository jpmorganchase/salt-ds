import {
  Table,
  type TableProps,
  TBody,
  TD,
  TFoot,
  TH,
  THead,
  TR,
} from "@salt-ds/lab";
import type { StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

import "docs/story.css";

const NUM_COLS = 3;
const NUM_ROWS = 2;

export default {
  title: "Lab/Table/Table QA",
  component: Table,
};

const TableComp = (props: TableProps) => {
  return (
    <Table {...props}>
      <THead>
        <TR>
          {Array.from({ length: NUM_COLS }, (arrItem, i) => {
            return <TH key={`col-${arrItem}`}>Column {i}</TH>;
          })}
        </TR>
      </THead>
      <TBody>
        {Array.from({ length: NUM_ROWS }, (arrItem, x) => {
          return (
            <TR key={`tr-${arrItem}`}>
              {Array.from({ length: NUM_COLS }, (nestedArrItem) => {
                return <TD key={`tr-td-${nestedArrItem}`}>Row {x}</TD>;
              })}
            </TR>
          );
        })}
      </TBody>
      <TFoot>
        <TR>
          {Array.from({ length: NUM_COLS }, (arrItem, i) => {
            return <TD key={`footer-${arrItem}`}>Footer {i}</TD>;
          })}
        </TR>
      </TFoot>
    </Table>
  );
};

export const QA: StoryFn<QAContainerProps> = () => (
  <QAContainer cols={1} itemPadding={12} width={1200}>
    {(["primary", "secondary", "tertiary"] as TableProps["variant"][]).map(
      (variant) => (
        <>
          <TableComp variant={variant} />
          <TableComp variant={variant} zebra="primary" />
          <TableComp variant={variant} zebra="secondary" />
          <TableComp variant={variant} zebra="tertiary" />
          <TableComp variant={variant} divider="primary" />
          <TableComp variant={variant} divider="secondary" />
          <TableComp variant={variant} divider="tertiary" />
        </>
      ),
    )}
  </QAContainer>
);

QA.parameters = {
  chromatic: { disableSnapshot: false },
};
