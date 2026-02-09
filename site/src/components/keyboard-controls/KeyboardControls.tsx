import { Table, TBody, TH, THead, TR } from "@salt-ds/core";
import { clsx } from "clsx";
import type { FC, ReactNode } from "react";
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
      <THead>
        <TR>
          <TH className={styles.keyCol}>Key</TH>
          <th>Function</th>
        </TR>
      </THead>
      <TBody>{children}</TBody>
    </Table>
  );
};
