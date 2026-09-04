import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import avatarGroupCountCss from "./AvatarGroupCount.css";

export interface AvatarGroupCountProps
  extends Omit<ComponentPropsWithoutRef<"div">, "color"> {
  /**
   * The number of members the count represents. Used in rendering `aria-label` and `+{count}` inside component as default.
   */
  count: number;
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
  { children, className, count, kind = "person", ...rest },
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
      aria-label={`${count} more`}
      className={clsx(withBaseName(), withBaseName(kind), className)}
      {...rest}
    >
      {children ?? `+${count}`}
    </div>
  );
});
