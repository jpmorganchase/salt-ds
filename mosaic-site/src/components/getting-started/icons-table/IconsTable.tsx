import { ReactElement, cloneElement, useRef, useEffect } from "react";
import { SaltProvider, Density } from "@salt-ds/core";
import { PrintIcon } from "@salt-ds/icons";

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

type IconProps = {
  density: Density;
  iconSize: number;
  children: ReactElement;
};

export const DensityIcon = ({ density, iconSize, children }: IconProps) => (
  <>
    <SaltProvider density={density}>
      <PrintIcon size={iconSize} />
    </SaltProvider>
    <p className={styles.colored}>{children}</p>
  </>
);
