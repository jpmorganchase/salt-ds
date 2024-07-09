import { type ReactElement, cloneElement, useEffect, useRef } from "react";
import styles from "./IconsTable.module.css";

type IconsTableProps = { children: ReactElement; caption: string };

export const IconsTable = ({ children, caption }: IconsTableProps) => {
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    // Add table caption
    if (tableRef.current) {
      tableRef.current.createCaption().textContent = caption;
    }
  }, [caption]);

  return (
    <div className={styles.iconsTableContainer}>
      {cloneElement(children, { ref: tableRef })}
    </div>
  );
};
