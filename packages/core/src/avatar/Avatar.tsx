import { UserSolidIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import { forwardRef, HTMLAttributes, ReactNode } from "react";
import { useAvatarImage } from "./useAvatarImage";
import { makePrefixer } from "../utils";

import "./Avatar.css";

export type NameToInitials = (name?: string) => string;

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The name that Avatar represents.
   */
  name?: string;
  /**
   * Defines the function that gets initials. Default is capital first letter of each separate word in name.
   * If a function is not passed or returns undefined, Avatar will default to Icon.
   */
  nameToInitials?: NameToInitials;
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

const defaultNameToInitials = (name?: string) =>
  name
    ?.split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  {
    className,
    children: childrenProp,
    name,
    nameToInitials = defaultNameToInitials,
    src,
    size = DEFAULT_AVATAR_SIZE,
    style: styleProp,
    fallbackIcon = <UserSolidIcon />,
    role = name ? "img" : undefined,
    ...rest
  },
  ref
) {
  let children;

  const style = {
    ...styleProp,
    "--saltAvatar-size-multiplier": `${size}`,
  };

  const status = useAvatarImage({ src });
  const hasImgNotFailing = status === "loaded";
  if (hasImgNotFailing) {
    children = <img alt="" src={src} />;
  } else if (childrenProp != null) {
    children = childrenProp;
  }

  const avatarInitials = nameToInitials(name);
  return (
    <div
      ref={ref}
      style={style}
      className={clsx(
        withBaseName(),
        { [withBaseName("withImage")]: hasImgNotFailing },
        className
      )}
      role={role}
      aria-label={name}
      aria-hidden={name ? undefined : true}
      {...rest}
    >
      {children || avatarInitials || fallbackIcon}
    </div>
  );
});
