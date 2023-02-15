import { FlexLayout, makePrefixer } from "@salt-ds/core";
import { UserIcon } from "@salt-ds/icons";
import { clsx } from "clsx";
import { forwardRef, HTMLAttributes, ReactNode } from "react";

import "./Avatar.css";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode | string;
  size?: number;
  fallbackIcon?: ReactNode;
}

const withBaseName = makePrefixer("saltAvatar");
const DEFAULT_AVATAR_SIZE = 2; // medium

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  {
    className,
    children: childrenProp,
    size = DEFAULT_AVATAR_SIZE,
    style: styleProp,
    fallbackIcon = <UserIcon />,
    ...rest
  },
  ref
) {
  const style = {
    ...styleProp,
    "--saltAvatar-size-multiplier": `${size}`,
  };

  let children = childrenProp;
  if (typeof children === "string") {
    children = children.slice(0, 2).toUpperCase();
  }

  return (
    <FlexLayout
      ref={ref}
      style={style}
      align="center"
      justify="center"
      className={clsx(withBaseName(), className)}
      {...rest}
    >
      {children || fallbackIcon}
    </FlexLayout>
  );
});
