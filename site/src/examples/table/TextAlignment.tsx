import { useId } from "@salt-ds/core";
import { Table, TableContainer, TBody, TD, TH, THead, TR } from "@salt-ds/lab";
import type { ReactElement } from "react";
import { planetData, planetDataColumns } from "./exampleData";

export const TextAlignment = (): ReactElement => {
  const id = useId();
  return (
    <TableContainer labelId={id}>
      <Table>
        <caption id={id}>Planet Data</caption>
        <THead>
          <TR>
            {planetDataColumns.map(({ title, type }) => {
              return (
                <TH
                  key={title}
                  textAlign={type === "number" ? "right" : "left"}
                >
                  {title}
                </TH>
              );
            })}
          </TR>
        </THead>
        <TBody>
          {planetData.map((row) => (
            <TR key={row.planet}>
              {planetDataColumns.map(({ key, type }) => (
                <TD
                  key={`${row.planet}-${key}`}
                  textAlign={type === "number" ? "right" : "left"}
                >
                  {row[key]}
                </TD>
              ))}
            </TR>
          ))}
        </TBody>
      </Table>
    </TableContainer>
  );
};
