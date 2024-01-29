import { Button, Link, Tooltip } from "@salt-ds/core";
import { CopyIcon } from "@salt-ds/icons";
import { Table } from "../mdx/table";
import { BlockView } from "./BlockView";
import { copyToClipboard } from "./utils";

import { CSSVariableData } from "./CSSVariables";

import styles from "./TokenTable.module.css";

export const TokenTable: React.FC<{ data: CSSVariableData }> = ({ data }) => {
  return (
    <Table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.viewColumn}>View</th>
          <th>Name</th>
          <th>Default Value</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(data).map(([name, value]) => (
          <tr key={name}>
            <td className={styles.viewColumn}>
              <BlockView name={name} />
            </td>
            <td>
              <Tooltip
                className={styles.tooltip}
                content={<BlockView name={name} />}
                onOpenChange={function _l() {}}
              >
                <Link className={styles.tooltip}> {name}</Link>
              </Tooltip>
              <div className={styles.hideView}>
                {name}
                <Button
                  aria-label="Copy to clipboard"
                  className={styles.alignButton}
                  onClick={() => copyToClipboard(name)}
                  variant="secondary"
                >
                  <CopyIcon />
                </Button>
              </div>
            </td>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
