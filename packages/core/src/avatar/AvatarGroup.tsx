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
   * The maximum number of Avatars to display in the group. If the number of children exceeds this value, an overflow Avatar will be displayed with the count of hidden Avatars.
   */
  max?: number;
  /**
   * Multiplier for the base avatar.
   */
  size?: number;
  /**
   * Render the overflow indicator shown when the number of children exceeds `max`.
   *
   * Use this to control what the overflow Avatar renders as, for example wrapping it in a Menu, Tooltip or Dialog. Defaults to a non-interactive Avatar displaying `+{count}`.
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
      style: styleProp,
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

    const style = {
      ...styleProp,
      "--saltAvatarGroup-size-multiplier": `${size}`,
    };

    const avatars = Children.toArray(children).filter(
      (child): child is ReactElement<AvatarProps> =>
        isValidElement(child) && child.type === Avatar,
    );
    const visibleAvatars = avatars.slice(0, max).map((child) =>
      cloneElement(child, {
        size: child.props.size ?? size,
      }),
    );
    const hiddenAvatars = avatars.slice(visibleAvatars.length);
    const hiddenAvatarsCount = hiddenAvatars.length;

    return (
      <div
        className={clsx(withBaseName(), className)}
        ref={ref}
        style={style}
        {...rest}
      >
        {visibleAvatars}
        {hiddenAvatarsCount > 0 &&
          (renderOverflow ? (
            renderOverflow({
              count: hiddenAvatarsCount,
              hiddenAvatars,
              size,
            })
          ) : (
            <Avatar
              className={withBaseName("hiddenAvatar")}
              size={size}
              name={`+ ${hiddenAvatarsCount}`}
            />
          ))}
      </div>
    );
  },
);
