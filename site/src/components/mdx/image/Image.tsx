import { useColorMode } from "@jpmorganchase/mosaic-store";
import { clsx } from "clsx";
import NextImage, { type ImageProps as NextImageProps } from "next/image";
import { forwardRef } from "react";
import { useResolveRelativeUrl } from "../../../utils/useResolveRelativeUrl";
import styles from "./Image.module.css";

export interface ImageProps extends Omit<NextImageProps, "src"> {
  /**
   * Image source url
   */
  src: string;
  /**
   * Image source url for dark mode.
   */
  srcDark?: string;
}

export const Image = forwardRef<HTMLDivElement, ImageProps>(function Image(
  { className, src, srcDark, fill, width, height, alt, unoptimized, ...rest },
  ref,
) {
  const siteMode = useColorMode();

  const srcToUse = siteMode === "dark" && srcDark ? srcDark : src;

  const resolvedSrc = useResolveRelativeUrl(srcToUse);

  const resolvedSrcToUse =
    srcToUse.match(/^(http[s]?:)?\/{1,2}/) === null ? resolvedSrc : srcToUse;

  return (
    // Can't use `picture` with `src`, it only works with system preference
    <div className={clsx(styles.root, className)} ref={ref}>
      {fill || (width && height) ? (
        <NextImage
          alt={alt}
          className={clsx(styles.nextImage)}
          {...rest}
          height={height}
          fill={fill}
          src={resolvedSrcToUse}
          width={width}
          unoptimized={unoptimized}
        />
      ) : (
        <img alt={alt} className={styles.img} src={resolvedSrcToUse} />
      )}
    </div>
  );
});
