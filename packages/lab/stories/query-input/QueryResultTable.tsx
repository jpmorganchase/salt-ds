import { HTMLAttributes } from "react";
import "./QueryResultTable.css";
import { makePrefixer } from "@salt-ds/core";
import cn from "classnames";

const withBaseName = makePrefixer("uitkQueryResultTable");

export interface QueryResultRow {
  name: string;
  role: string;
  location: string;
  project: string;
}

export interface QueryResultTableProps extends HTMLAttributes<HTMLDivElement> {
  rows: QueryResultRow[];
}

export const QueryResultTable = (props: QueryResultTableProps) => {
  const { rows, className, ...restProps } = props;
  return (
    <div className={cn(withBaseName(), className)} {...restProps}>
      <table>
        <colgroup>
          <col className={withBaseName("col")} />
          <col className={withBaseName("col")} />
          <col className={withBaseName("col")} />
          <col className={withBaseName("col")} />
        </colgroup>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Location</th>
            <th>Project</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            return (
              <tr key={i}>
                <td className={withBaseName("name")}>{row.name}</td>
                <td className={withBaseName("role")}>{row.role}</td>
                <td className={withBaseName("location")}>{row.location}</td>
                <td className={withBaseName("project")}>{row.project}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
