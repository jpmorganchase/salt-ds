import clsx from "clsx";
import { type HTMLProps, forwardRef } from "react";
import styles from "./Table.module.css";

export interface TableProps extends HTMLProps<HTMLTableElement> {}

export const Table = forwardRef<HTMLDivElement, TableProps>(function Table(
  { children, className, ...rest },
  ref,
) {
  return (
    <div className={clsx(styles.root, className)} ref={ref}>
      <table className={styles.table} {...rest}>
        {children}
      </table>
    </div>
  );
});
