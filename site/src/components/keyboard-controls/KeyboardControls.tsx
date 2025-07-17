import { clsx } from "clsx";
import type { FC, ReactNode } from "react";
import { Table } from "../mdx/table";
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
    <Table className={clsx(styles.table, className)}>
      <thead>
        <tr>
          <th className={styles.keyCol}>Key</th>
          <th>Function</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </Table>
  );
};
