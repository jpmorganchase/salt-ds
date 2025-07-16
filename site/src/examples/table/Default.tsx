import { Table, TBody, TD, TFoot, TH, THead, TR } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Default = (): ReactElement => {
  return (
    <Table>
      <THead>
        <TR>
          {Array.from({ length: 3 }, (_, i) => {
            return <TH key={`col-${i}`}>Column {i + 1}</TH>;
          })}
        </TR>
      </THead>
      <TBody>
        {Array.from({ length: 5 }, (_, x) => {
          return (
            <TR key={`tr-${x}`}>
              {Array.from({ length: 3 }, (_, i) => {
                return <TD key={`td-${i}`}>Row {x + 1}</TD>;
              })}
            </TR>
          );
        })}
      </TBody>
      <TFoot>
        <TR>
          {Array.from({ length: 3 }, (_, i) => {
            return <TD key={`footer-${i}`}>Footer {i + 1}</TD>;
          })}
        </TR>
      </TFoot>
    </Table>
  );
};
