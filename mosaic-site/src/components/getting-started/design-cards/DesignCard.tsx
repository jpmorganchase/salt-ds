import { ReactNode } from "react";
import { Image } from "@jpmorganchase/mosaic-site-components";

import styles from "./DesignCards.module.css";

type DesignCardProps = { src: string; alt: string; children: ReactNode };

export const DesignCard = ({ src, alt, children }: DesignCardProps) => (
  <div className={styles.card}>
    <Image src={src} alt={alt} nextImageClassName={""} />
    <div className={styles.textContainer}>{children}</div>
  </div>
);
