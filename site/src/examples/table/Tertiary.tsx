import { Table, TBody, TD, TFoot, TH, THead, TR } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const Tertiary = (): ReactElement => {
  return (
    <Table variant="tertiary">
      <THead>
        <TR>
          {Array.from({ length: 3 }, (_, i) => {
            return <TH key={`col-${i}`}>Column {i}</TH>;
          })}
        </TR>
      </THead>
      <TBody>
        {Array.from({ length: 5 }, (_, i) => {
          return (
            <TR key={`tr-${i}`}>
              {Array.from({ length: 3 }, (_, i) => {
                return <TD key={`td-${i}`}>Row {i}</TD>;
              })}
            </TR>
          );
        })}
      </TBody>
      <TFoot>
        <TR>
          {Array.from({ length: 3 }, (_, i) => {
            return <TD key={`footer-${i}`}>Footer {i}</TD>;
          })}
        </TR>
      </TFoot>
    </Table>
  );
};
