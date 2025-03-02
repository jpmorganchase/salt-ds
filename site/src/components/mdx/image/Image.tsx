import { Image as MosaicImage } from "@jpmorganchase/mosaic-site-components";
import type { ComponentPropsWithoutRef } from "react";

import { clsx } from "clsx";
import styles from "./Image.module.css";

export function Image({
  className,
  ...rest
}: ComponentPropsWithoutRef<typeof MosaicImage>) {
  return <MosaicImage className={clsx(styles.root, className)} {...rest} />;
}
