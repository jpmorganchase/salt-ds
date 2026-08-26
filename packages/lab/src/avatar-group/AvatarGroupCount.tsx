import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes } from "react";

import avatarGroupCountCss from "./AvatarGroupCount.css";

export interface AvatarGroupCountProps
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
  kind?: "person" | "entity";
}

const withBaseName = makePrefixer("saltAvatarGroupCount");

export const AvatarGroupCount = forwardRef<
  HTMLDivElement,
  AvatarGroupCountProps
>(function AvatarGroupCount(
  { children, className, kind = "person", ...rest },
  ref,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-avatar-group-count",
    css: avatarGroupCountCss,
    window: targetWindow,
  });

  return (
    <div
      ref={ref}
      role="img"
      className={clsx(withBaseName(), withBaseName(kind), className)}
      {...rest}
    >
      {children}
    </div>
  );
});
