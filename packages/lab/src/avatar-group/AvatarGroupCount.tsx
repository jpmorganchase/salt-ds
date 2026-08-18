import { Avatar, makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

export interface AvatarGroupCountProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  /**
   * The visible label of the count, for example `+3`.
   */
  children: ReactNode;
  /**
   * The accessible name of the count, describing the members that aren't
   * displayed, for example `3 more`.
   */
  name: string;
}

const withBaseName = makePrefixer("saltAvatarGroupCount");

export const AvatarGroupCount = forwardRef<
  HTMLDivElement,
  AvatarGroupCountProps
>(function AvatarGroupCount({ children, className, name, ...rest }, ref) {
  return (
    <Avatar
      ref={ref}
      className={clsx(withBaseName(), className)}
      name={name}
      {...rest}
    >
      {children}
    </Avatar>
  );
});
