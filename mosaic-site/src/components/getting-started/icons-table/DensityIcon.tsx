import { ReactElement } from "react";
import { SaltProvider, Density } from "@salt-ds/core";
import { PrintIcon } from "@salt-ds/icons";
import styles from "./IconsTable.module.css";

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
