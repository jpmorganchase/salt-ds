import { Image } from "@jpmorganchase/mosaic-site-components";
import { clsx } from "clsx";
import type { ReactNode } from "react";

import styles from "./Diagrams.module.css";

interface DiagramProps {
  src: string;
  background?: "primary" | "secondary";
  border?: boolean;
  alt: string;
  children: ReactNode;
  contentPosition?: "top" | "bottom";
  caption?: string;
}

export const Diagram = ({
  src,
  alt,
  background = "primary",
  border,
  children,
  contentPosition = "top",
  caption,
}: DiagramProps) => (
  <div
    className={clsx(styles.diagram, {
      [styles.contentTop]: contentPosition === "top" && children,
    })}
  >
    {contentPosition === "top" && children && (
      <div className={styles.textContainer}>{children}</div>
    )}
    {src && (
      <figure className={styles.figure}>
        <Image
          className={clsx(styles.image, {
            [styles.imageBorder]: border,
            [styles.primaryBackground]: background === "primary",
            [styles.secondaryBackground]: background === "secondary",
          })}
          src={src}
          alt={alt}
        />
        {caption && (
          <figcaption className={styles.caption}>{caption}</figcaption>
        )}
      </figure>
    )}
    {contentPosition === "bottom" && children && (
      <div className={styles.textContainer}>{children}</div>
    )}
  </div>
);
