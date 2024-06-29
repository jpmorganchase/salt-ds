import clsx from "clsx";
import { type HTMLProps, forwardRef } from "react";
import styles from "./Table.module.css";

export interface TableProps extends HTMLProps<HTMLTableElement> {}

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { children, className },
  ref,
) {
  return (
    <table className={clsx(styles.table, className)} ref={ref}>
      {children}
    </table>
  );
});
