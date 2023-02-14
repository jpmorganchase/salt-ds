import React, { FC, ReactElement, ReactNode } from "react";

import styles from "./LayoutFullWidth.module.css";

export interface LayoutFullWidthProps {
  Footer?: ReactElement;
  children: ReactNode;
}

export const LayoutFullWidth: FC<LayoutFullWidthProps> = ({
  Footer,
  children = null,
}) => (
  <div className={styles.root}>
    <main>{children}</main>
    {Footer && Footer}
  </div>
);
