import { Table, TBody, TD, TH, THead, TR } from "@salt-ds/lab";
import type { ReactElement } from "react";
import { planetData, planetDataColumns } from "./exampleData";

const columns = planetDataColumns.filter(({ key }) =>
  ["planet", "type", "atmosphere"].includes(key),
);

export const Default = (): ReactElement => {
  return (
    <Table>
      <THead>
        <TR>
          {columns.map(({ title }) => {
            return <TH key={title}>{title}</TH>;
          })}
        </TR>
      </THead>
      <TBody>
        {planetData.map((data) => {
          return (
            <TR key={data.planet}>
              {columns.map(({ key }) => {
                return <TD key={key}>{data[key]}</TD>;
              })}
            </TR>
          );
        })}
      </TBody>
    </Table>
  );
};
