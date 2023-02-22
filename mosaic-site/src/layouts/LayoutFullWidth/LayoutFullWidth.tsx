import React, { FC } from "react";
import { LayoutProps } from "../types/index";
import styles from "./LayoutFullWidth.module.css";

export const LayoutFullWidth: FC<LayoutProps> = ({ Footer, children }) => (
  <div className={styles.root}>
    <main>{children}</main>
    {Footer && Footer}
  </div>
);
