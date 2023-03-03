import { forwardRef, HTMLProps } from "react";
import styles from "./Table.module.css";

export interface TableProps extends HTMLProps<HTMLTableElement> {}

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { children },
  ref
) {
  return (
    <table className={styles.table} ref={ref}>
      {children}
    </table>
  );
});
