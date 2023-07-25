import { forwardRef, HTMLProps } from "react";
import styles from "./Table.module.css";
import clsx from "clsx";

export interface TableProps extends HTMLProps<HTMLTableElement> {}

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { children, className },
  ref
) {
  return (
    <table className={clsx(styles.table, className)} ref={ref}>
      {children}
    </table>
  );
});
