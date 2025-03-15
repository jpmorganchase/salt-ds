import { clsx } from "clsx";
import type { ReactNode } from "react";
import { Image } from "../mdx/image";

import { useColorMode } from "@jpmorganchase/mosaic-store";
import { SaltProvider, SaltProviderNext } from "@salt-ds/core";
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
}: DiagramProps) => {
  const colorMode = useColorMode();

  return (
    <div
      className={clsx(styles.diagram, {
        [styles.contentTop]: contentPosition === "top" && children,
      })}
    >
      {contentPosition === "top" && children && (
        <div className={styles.textContainer}>{children}</div>
      )}
      {src && (
        <SaltProvider mode="light" applyClassesTo="child">
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
              <SaltProviderNext applyClassesTo="child" mode={colorMode}>
                <figcaption className={styles.caption}>{caption}</figcaption>
              </SaltProviderNext>
            )}
          </figure>
        </SaltProvider>
      )}
      {contentPosition === "bottom" && children && (
        <div className={styles.textContainer}>{children}</div>
      )}
    </div>
  );
};
