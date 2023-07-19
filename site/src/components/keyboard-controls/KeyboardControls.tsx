import { FC, ReactNode } from "react";
import clsx from "clsx";
import tableStyles from "../mdx/table/Table.module.css";
import styles from "./KeyboardControls.module.css";

export interface KeyboardControlsProps {
  children: ReactNode;
  className?: string;
}

export const KeyboardControls: FC<KeyboardControlsProps> = ({
  children,
  className,
}) => {
  return (
    <table className={clsx(styles.table, tableStyles.table, className)}>
      <thead>
        <tr>
          <th className={styles.keyCol}>Key</th>
          <th>Function</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
};
