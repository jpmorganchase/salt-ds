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
          {Array.from({ length: NUM_COLS }, (_, i) => {
            return <TH key={`col-${i}`}>Column {i}</TH>;
          })}
        </TR>
      </THead>
      <TBody>
        {Array.from({ length: 3 }, (_, x) => {
          return (
            <TR key={`tr-${x}`}>
              {Array.from({ length: NUM_COLS }, (_, i) => {
                return <TD key={`td-${i}`}>Row {x}</TD>;
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
  );
};

export const QA: StoryFn<QAContainerProps> = () => (
  <QAContainer cols={1} itemPadding={12} width={1200}>
    <TableComp />
    <TableComp variant="secondary" />
    <TableComp variant="tertiary" />
  </QAContainer>
);
QA.parameters = {
  chromatic: { disableSnapshot: false },
};
