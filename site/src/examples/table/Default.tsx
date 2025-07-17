import { Table, TBody, TD, TFoot, TH, THead, TR } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Default = (): ReactElement => {
  return (
    <Table>
      <THead>
        <TR>
          {Array.from({ length: 3 }, (arrItem, i) => {
            return <TH key={`col-${arrItem}`}>Column {i + 1}</TH>;
          })}
        </TR>
      </THead>
      <TBody>
        {Array.from({ length: 5 }, (arrItem, x) => {
          return (
            <TR key={`tr-${arrItem}`}>
              {Array.from({ length: 3 }, (nestedArrItem) => {
                return <TD key={`td-${nestedArrItem}`}>Row {x + 1}</TD>;
              })}
            </TR>
          );
        })}
      </TBody>
      <TFoot>
        <TR>
          {Array.from({ length: 3 }, (arrItem, i) => {
            return <TD key={`footer-${arrItem}`}>Footer {i + 1}</TD>;
          })}
        </TR>
      </TFoot>
    </Table>
  );
};
