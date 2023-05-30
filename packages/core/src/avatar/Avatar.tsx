import { UserSolidIcon } from "@salt-ds/icons";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { clsx } from "clsx";
import { forwardRef, HTMLAttributes, ReactNode } from "react";
import { useAvatarImage } from "./useAvatarImage";

import { makePrefixer } from "../utils";
import avatarCss from "./Avatar.css";

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
    fallbackIcon = <UserSolidIcon aria-label="User Avatar" />,
    ...rest
  },
  ref
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-avatar",
    css: avatarCss,
    window: targetWindow,
  });

  let children;

  const style = {
    ...styleProp,
    "--saltAvatar-size-multiplier": `${size}`,
  };

  const status = useAvatarImage({ src });
  const hasImgNotFailing = status === "loaded";
  if (hasImgNotFailing) {
    children = <img alt={name} src={src} />;
  } else if (childrenProp != null) {
    children = childrenProp;
  }

  const avatarInitials = nameToInitials(name);

  const initialsProps = avatarInitials
    ? {
        role: "img",
        "aria-label": name,
      }
    : {};

  return (
    <div
      ref={ref}
      style={style}
      className={clsx(
        withBaseName(),
        { [withBaseName("withImage")]: hasImgNotFailing },
        className
      )}
      {...initialsProps}
      {...rest}
    >
      {children || avatarInitials || fallbackIcon}
    </div>
  );
});
