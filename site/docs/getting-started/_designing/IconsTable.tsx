import { ReactElement, cloneElement, useRef, useEffect } from "react";
import { SaltProvider, Density } from "@salt-ds/core";

import styles from "./IconsTable.module.css";

type IconsTableProps = { children: ReactElement; caption: string };

const IconsTable = ({ children, caption }: IconsTableProps) => {
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    // Add table caption
    tableRef.current.createCaption().textContent = caption;
  }, [caption]);

  return (
    <div className={styles.iconsTableContainer}>
      {cloneElement(children, { ref: tableRef })}
    </div>
  );
};

type IconProps = {
  density: Density;
  icon: JSX.Element;
  children: ReactElement;
};

export const DensityIcon = ({ density, icon, children }: IconProps) => (
  <>
    <SaltProvider density={density}>{icon}</SaltProvider>
    <p className={styles.colored}>{children}</p>
  </>
);

export default IconsTable;
