import { makePrefixer, useId } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, HTMLAttributes, ImgHTMLAttributes } from "react";
import { classBase } from "./internal/constants";
import { DefaultAvatar } from "./internal/DefaultAvatar";
import { useLoaded } from "./internal/useLoaded";

import "./Avatar.css";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  alt?: string;
  id?: string;
  imgProps?: ImgHTMLAttributes<HTMLImageElement>;
  size?: number;
  sizes?: string;
  src?: string;
  srcSet?: string;
  title?: string;
}

const withBaseName = makePrefixer(classBase);
const DEFAULT_AVATAR_SIZE = 2; // medium

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  {
    alt = "",
    className,
    children: childrenProp,
    id: idProp,
    size = DEFAULT_AVATAR_SIZE,
    src,
    srcSet,
    title = "user",
    imgProps,
    sizes,
    style: styleProp,
    ...rest
  },
  ref
) {
  let children;
  const id = useId(idProp);

  const loaded = useLoaded({ ...imgProps, src, srcSet });
  const hasImg = src || srcSet;
  const hasImgNotFailing = hasImg && loaded !== "error";

  const style = {
    ...styleProp,
    "--saltAvatar-size-multiplier": `${size}`,
  };

  if (hasImgNotFailing) {
    children = (
      <img
        className={withBaseName("image")}
        alt={alt}
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        {...imgProps}
      />
    );
  } else if (childrenProp != null) {
    children = childrenProp;
  } else if (hasImg && alt) {
    children = alt[0];
  } else {
    children = <DefaultAvatar id={id} title={title} {...rest} />;
  }

  return (
    <div
      ref={ref}
      style={style}
      className={clsx(withBaseName(), className)}
      {...rest}
    >
      {children}
    </div>
  );
});
