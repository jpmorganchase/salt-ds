import { FC, PropsWithChildren } from "react";
import { components } from "@jpmorganchase/mosaic-site-components";
import type { PreProps } from "@jpmorganchase/mosaic-components";
import styles from "./Pre.module.css";

const MosaicPre = components.pre;

export const Pre: FC<PropsWithChildren<PreProps>> = ({ ...props }) => (
  <div className={styles.pre}>
    <MosaicPre {...props} />
  </div>
);
