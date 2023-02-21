import { makePrefixer } from "@salt-ds/core";
import { UserIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import { forwardRef, HTMLAttributes, ReactNode } from "react";
import { useLoaded } from "./internal/useLoaded";

import "./Avatar.css";

export type InitialsGetter = (name: string) => string | undefined;

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The name that Avatar represents.
   */
  name?: string;
  /**
   * Defines the function that gets initials. Default is capital first letter of each separate word in name.
   * If a function is not passed or returns undefined, Avatar will default to Icon.
   */
  initialsGetter?: InitialsGetter;
  /**
   * Image src of Avatar.
   */
  src?: string;
  /**
   * Multiplier for the base avatar.
   */
  size?: number;
  /**
   * Icon to be used as a default item. Defaults to `UserIcon`
   */
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
