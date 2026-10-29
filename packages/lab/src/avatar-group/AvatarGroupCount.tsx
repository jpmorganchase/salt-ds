import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import avatarGroupCountCss from "./AvatarGroupCount.css";

export interface AvatarGroupCountProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /**
   * The number of members the count represents. Rendered as `+{count}`, and used
   * as the default `aria-label` of `{count} more`.
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
  {
    className,
    count,
    kind = "person",
    "aria-label": ariaLabel = `${count} more`,
    ...rest
  },
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
      aria-label={ariaLabel}
      className={clsx(withBaseName(), withBaseName(kind), className)}
      {...rest}
    >
      {`+${count}`}
    </div>
  );
});
