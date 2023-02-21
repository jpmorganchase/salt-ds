import { makePrefixer } from "@salt-ds/core";
import { UserIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import { forwardRef, HTMLAttributes, ReactNode } from "react";
import { useLoaded } from "./internal/useLoaded";

import "./Avatar.css";

export type InitialsGetter = (name: string) => string | undefined;

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name?: string;
  initialsGetter?: InitialsGetter;
  src?: string;
  srcSet?: string;
  size?: number;
  fallbackIcon?: ReactNode;
}

const withBaseName = makePrefixer("saltAvatar");
const DEFAULT_AVATAR_SIZE = 2; // medium

const initialsDefaultGetter = (name: string | undefined) =>
  name &&
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  {
    className,
    children: childrenProp,
    name,
    initialsGetter = initialsDefaultGetter,
    src,
    size = DEFAULT_AVATAR_SIZE,
    style: styleProp,
    fallbackIcon = <UserIcon />,
    ...rest
  },
  ref
) {
  let children;

  const style = {
    ...styleProp,
    "--saltAvatar-size-multiplier": `${size}`,
  };

  const loaded = useLoaded({ src });
  const hasImgNotFailing = src && loaded !== "error";

  if (hasImgNotFailing) {
    children = <img className={withBaseName("image")} alt={name} src={src} />;
  } else if (childrenProp != null) {
    children = childrenProp;
  }

  const avatarInitials = name && initialsGetter(name);

  return (
    <div
      ref={ref}
      style={style}
      className={clsx(withBaseName(), className)}
      {...rest}
    >
      {children || avatarInitials || fallbackIcon}
    </div>
  );
});
