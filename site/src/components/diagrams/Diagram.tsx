import { ReactNode } from "react";
import { Image } from "@jpmorganchase/mosaic-site-components";
import { clsx } from "clsx";

import styles from "./Diagrams.module.css";

type DesignCardProps = {
  src: string;
  border?: boolean;
  alt: string;
  children: ReactNode;
  contentPosition?: "top" | "bottom";
};

export const Diagram = ({
  src,
  alt,
  border,
  children,
  contentPosition,
}: DesignCardProps) => (
  <div
    className={clsx(styles.diagram, {
      [styles.contentTop]: contentPosition === "top",
    })}
  >
    {contentPosition === "top" && (
      <div className={styles.textContainer}>{children}</div>
    )}
    {src && (
      <Image
        className={clsx(styles.image, { [styles.imageBorder]: border })}
        src={src}
        alt={alt}
      />
    )}
    {contentPosition === "bottom" && (
      <div className={styles.textContainer}>{children}</div>
    )}
  </div>
);
