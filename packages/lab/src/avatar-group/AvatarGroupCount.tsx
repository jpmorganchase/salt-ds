import { Avatar, type AvatarProps, makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef } from "react";

export interface AvatarGroupCountProps extends AvatarProps {}

const withBaseName = makePrefixer("saltAvatarGroupCount");

export const AvatarGroupCount = forwardRef<
  HTMLDivElement,
  AvatarGroupCountProps
>(function AvatarGroupCount({ className, ...rest }, ref) {
  return (
    <Avatar ref={ref} className={clsx(withBaseName(), className)} {...rest} />
  );
});
