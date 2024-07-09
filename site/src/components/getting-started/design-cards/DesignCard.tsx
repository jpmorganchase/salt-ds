import { Image } from "@jpmorganchase/mosaic-site-components";
import type { ReactNode } from "react";

import styles from "./DesignCards.module.css";

type DesignCardProps = {
  src: string;
  alt: string;
  children: ReactNode;
};

export const DesignCard = ({ src, alt, children }: DesignCardProps) => (
  <div className={styles.card}>
    {src && <Image src={src} alt={alt} />}
    <div className={styles.textContainer}>{children}</div>
  </div>
);
