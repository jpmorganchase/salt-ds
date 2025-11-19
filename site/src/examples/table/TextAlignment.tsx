import { Table, TBody, TD, TH, THead, TR } from "@salt-ds/core";
import type { ReactElement } from "react";
import { planetData, planetDataColumns } from "./exampleData";

export const TextAlignment = (): ReactElement => {
  return (
    <Table>
      <THead>
        <TR>
          {planetDataColumns.map(({ title, type }) => {
            return (
              <TH key={title} textAlign={type === "number" ? "right" : "left"}>
                {title}
              </TH>
            );
          })}
        </TR>
      </THead>
      <TBody>
        {planetData.map((data) => {
          return (
            <TR key={data.planet}>
              {Object.values(data).map((value) => {
                return (
                  <TD
                    key={value}
                    textAlign={typeof value === "number" ? "right" : "left"}
                  >
                    {value}
                  </TD>
                );
              })}
            </TR>
          );
        })}
      </TBody>
    </Table>
  );
};
