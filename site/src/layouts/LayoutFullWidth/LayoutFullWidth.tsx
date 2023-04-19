import React, { FC } from "react";
import { LayoutProps } from "../types/index";
import styles from "./LayoutFullWidth.module.css";

export const LayoutFullWidth: FC<LayoutProps> = ({
  Footer,
  children,
  ...rest
}) => (
  <div className={styles.root} {...rest}>
    <main>{children}</main>
    {Footer && Footer}
  </div>
);
