import {
  StackLayout,
  Table,
  type TableProps,
  TBody,
  TD,
  TFoot,
  TH,
  THead,
  TR,
} from "@salt-ds/core";
import type { StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

import "docs/story.css";

const NUM_COLS = 2;
const NUM_ROWS = 3;

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
            return (
              <TH key={`col-${arrItem}`} textAlign={i === 1 ? "right" : "left"}>
                Column {i}
              </TH>
            );
          })}
        </TR>
      </THead>
      <TBody>
        {Array.from({ length: NUM_ROWS }, (arrItem, x) => {
          return (
            <TR key={`tr-${arrItem}`}>
              {Array.from({ length: NUM_COLS }, (nestedArrItem, i) => {
                return (
                  <TD
                    key={`tr-td-${nestedArrItem}`}
                    textAlign={i === 1 ? "right" : "left"}
                  >
                    Row {x}
                  </TD>
                );
              })}
            </TR>
          );
        })}
      </TBody>
      <TFoot>
        <TR>
          {Array.from({ length: NUM_COLS }, (arrItem, i) => {
            return (
              <TD
                key={`footer-${arrItem}`}
                textAlign={i === 1 ? "right" : "left"}
              >
                Footer {i}
              </TD>
            );
          })}
        </TR>
      </TFoot>
    </Table>
  );
};

export const QA: StoryFn<QAContainerProps> = () => (
  <QAContainer
    transposeDensity
    vertical
    cols={7}
    itemPadding={6}
    width={1400}
    itemWidthAuto
  >
    {(["primary", "secondary", "tertiary"] as const).map((variant) => (
      <StackLayout key={variant} direction="row" gap={1}>
        <TableComp variant={variant} />
        <TableComp variant={variant} zebra />
        <TableComp variant={variant} divider="primary" />
        <TableComp variant={variant} divider="secondary" />
        <TableComp variant={variant} divider="tertiary" />
      </StackLayout>
    ))}
  </QAContainer>
);

QA.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
