import { Avatar, type AvatarProps, makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef } from "react";

export interface AvatarGroupSurplusProps extends AvatarProps {}

const withBaseName = makePrefixer("saltAvatarGroupSurplus");

export const AvatarGroupSurplus = forwardRef<
  HTMLDivElement,
  AvatarGroupSurplusProps
>(function AvatarGroupSurplus({ className, ...rest }, ref) {
  return (
    <Avatar ref={ref} className={clsx(withBaseName(), className)} {...rest} />
  );
});
