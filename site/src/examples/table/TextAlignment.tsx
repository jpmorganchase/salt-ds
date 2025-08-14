import { Table, TBody, TD, TFoot, TH, THead, TR } from "@salt-ds/lab";
import type { ReactElement } from "react";

export const TextAlignment = (): ReactElement => {
  return (
    <Table>
      <THead>
        <TR>
          {Array.from({ length: 3 }, (arrItem, i) => {
            return (
              <TH textAlign={i === 0 ? "left" : "right"} key={`col-${arrItem}`}>
                Column {i + 1}
              </TH>
            );
          })}
        </TR>
      </THead>
      <TBody>
        {Array.from({ length: 5 }, (arrItem, x) => {
          return (
            <TR key={`tr-${arrItem}`}>
              {Array.from({ length: 3 }, (nestedArrItem, i) => {
                return (
                  <TD
                    textAlign={i === 0 ? "left" : "right"}
                    key={`td-${nestedArrItem}`}
                  >
                    Row {x + 1}
                  </TD>
                );
              })}
            </TR>
          );
        })}
      </TBody>
      <TFoot>
        <TR>
          {Array.from({ length: 3 }, (arrItem, i) => {
            return (
              <TD
                textAlign={i === 0 ? "left" : "right"}
                key={`footer-${arrItem}`}
              >
                Footer {i + 1}
              </TD>
            );
          })}
        </TR>
      </TFoot>
    </Table>
  );
};
