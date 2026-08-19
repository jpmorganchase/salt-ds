import { Avatar, type AvatarProps, makePrefixer } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes } from "react";

export interface AvatarGroupCountProps
  /**
   * TODO: user can still pass color prop ignoring type errors, and categories will work.
   * Pending design decision on coloring
   * DO NOT MERGE UNTIL RESOLVED
   */
  extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  /**
   * The visible label of the count, for example `+3`.
   */
  children: string;
  /**
   * Matches the shape of the avatars the count summarizes.
   *
   * @default "person"
   */
  kind?: AvatarProps["kind"];
}

const withBaseName = makePrefixer("saltAvatarGroupCount");

export const AvatarGroupCount = forwardRef<
  HTMLDivElement,
  AvatarGroupCountProps
>(function AvatarGroupCount({ children, className, ...rest }, ref) {
  return (
    <Avatar
      role="img"
      ref={ref}
      className={clsx(withBaseName(), className)}
      {...rest}
    >
      {children}
    </Avatar>
  );
});
