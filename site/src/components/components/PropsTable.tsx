import { FC } from "react";
import ReactMarkdown from "react-markdown";
import { Table } from "../mdx/table";
import props from "../../props/props.json";

import styles from "./PropsTable.module.css";

type PropsTableType = {
  /**
   * Component package name e.g. Button
   */
  componentName: string;
};

export const PropsTable: FC<PropsTableType> = ({ componentName }) => {
  const propsTableData = props.find(
    ({ displayName }) => displayName === componentName
  )?.props;

  return (
    <div className={styles.tableWrapper}>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
            <th>Default</th>
          </tr>
        </thead>
        <tbody>
          {propsTableData &&
            Object.values(propsTableData).map(
              ({ name, type, description, defaultValue }) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>
                    <code>{type.name}</code>
                  </td>
                  <td>
                    <ReactMarkdown>{description}</ReactMarkdown>
                  </td>
                  <td>
                    <code>{defaultValue ? defaultValue.value : "-"}</code>
                  </td>
                </tr>
              )
            )}
        </tbody>
      </Table>
    </div>
  );
};
