import { useResolveRelativeUrl } from "../../../utils/useResolveRelativeUrl";
import { clsx } from "clsx";
import NextImage, { type ImageProps as NextImageProps } from "next/image";
import { forwardRef } from "react";
import styles from "./Image.module.css";

export interface ImageProps extends Omit<NextImageProps, "src"> {
  /**
   * Image source url
   */
  src: string;
}

export const Image = forwardRef<HTMLDivElement, ImageProps>(function Image(
  { className, src, fill, width, height, alt, unoptimized, ...rest },
  ref,
) {
  const resolvedSrc = useResolveRelativeUrl(src);
  return (
    <div className={clsx(styles.root, className)} ref={ref}>
      {fill || (width && height) ? (
        <NextImage
          alt={alt}
          className={clsx(styles.nextImage)}
          {...rest}
          height={height}
          fill={fill}
          src={src.match(/^(http[s]?:)?\/{1,2}/) === null ? resolvedSrc : src}
          width={width}
          unoptimized={unoptimized}
        />
      ) : (
        <img
          alt={alt}
          className={styles.img}
          src={src.match(/^(http[s]?:)?\/{1,2}/) === null ? resolvedSrc : src}
        />
      )}
    </div>
  );
});
