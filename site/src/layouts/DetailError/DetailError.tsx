import type { LayoutProps } from "@jpmorganchase/mosaic-layouts";
import type { FC } from "react";
import { Base } from "../Base/index";
import styles from "./DetailError.module.css";

export const DetailError: FC<LayoutProps> = ({ children }) => {
  return <Base className={styles.root}>{children}</Base>;
};
