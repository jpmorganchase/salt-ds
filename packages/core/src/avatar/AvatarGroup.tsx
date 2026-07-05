import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  Children,
  cloneElement,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { makePrefixer } from "../utils";
import { Avatar, type AvatarProps, DEFAULT_AVATAR_SIZE } from "./Avatar";

import avatarGroupCss from "./AvatarGroup.css";

/**
 * Details passed to `renderOverflow` describing the Avatars hidden by `max`.
 */
export interface AvatarGroupOverflowProps {
  /**
   * The number of Avatars hidden by `max`.
   */
  count: number;
  /**
   * The Avatars hidden by `max`, in source order.
   */
  hiddenAvatars: ReactElement<AvatarProps>[];
  /**
   * Multiplier for the base avatar, resolved from the group's `size`.
   */
  size: number;
}

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The maximum number of Avatars to display in the group.
   */
  max?: number;
  /**
   * Multiplier for the base avatar.
   */
  size?: number;
  /**
   * Render the overflow indicator shown when the number of children exceeds `max`.
   */
  renderOverflow?: (props: AvatarGroupOverflowProps) => ReactNode;
  /**
   * The children to be rendered inside the AvatarGroup. Should be Avatar components.
   */
  children?: ReactNode;
}

const withBaseName = makePrefixer("saltAvatarGroup");
const DEFAULT_AVATAR_GROUP_MAX = 5;

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  function AvatarGroup(
    {
      className,
      children,
      max = DEFAULT_AVATAR_GROUP_MAX,
      size = DEFAULT_AVATAR_SIZE,
      renderOverflow,
      ...rest
    },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-avatar-group",
      css: avatarGroupCss,
      window: targetWindow,
    });

    // Preserve all valid children (e.g. Avatars wrapped in a Tooltip or Badge),
    // only injecting `size` into direct Avatar children.
    const items = Children.toArray(children).filter(
      isValidElement,
    ) as ReactElement<AvatarProps>[];

    const visibleItems = items.slice(0, max).map((child) =>
      child.type === Avatar
        ? cloneElement(child, {
            size: child.props.size ?? size,
          })
        : child,
    );
    const hiddenAvatars = items.slice(visibleItems.length);
    const hiddenAvatarsCount = hiddenAvatars.length;

    return (
      <div className={clsx(withBaseName(), className)} ref={ref} {...rest}>
        {visibleItems}
        {hiddenAvatarsCount > 0 &&
          (renderOverflow ? (
            renderOverflow({
              count: hiddenAvatarsCount,
              hiddenAvatars,
              size,
            })
          ) : (
            <Avatar size={size} name={`${hiddenAvatarsCount} more`}>
              {`+${hiddenAvatarsCount}`}
            </Avatar>
          ))}
      </div>
    );
  },
);
