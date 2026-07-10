import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  Children,
  type ComponentPropsWithoutRef,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { makePrefixer, type RenderPropsType, renderProps } from "../utils";
import { Avatar, type AvatarProps } from "./Avatar";

import avatarGroupCss from "./AvatarGroup.css";

export interface AvatarGroupSurplusProps {
  /**
   * The number of Avatars hidden by `max`.
   */
  count: number;
  /**
   * The Avatars hidden by `max`, in source order.
   */
  hiddenAvatars: ReactElement<AvatarProps>[];
}

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The maximum number of Avatars to display in the group. If not set, all Avatars are shown.
   */
  max?: number;
  /**
   * The children to be rendered inside the AvatarGroup. Should be Avatar components.
   */
  children?: ReactNode;
  /**
   * Render the surplus indicator shown when the number of children exceeds `max`.
   */
  renderSurplus?: (props: AvatarGroupSurplusProps) => ReactNode;
  /**
   * Render prop to enable customization of the avatar group root element.
   */
  render?: RenderPropsType["render"];
}

const withBaseName = makePrefixer("saltAvatarGroup");

interface AvatarGroupActionProps extends ComponentPropsWithoutRef<"div"> {
  render?: RenderPropsType["render"];
}

const AvatarGroupAction = forwardRef<HTMLDivElement, AvatarGroupActionProps>(
  function AvatarGroupAction(props, ref) {
    return renderProps("div", { ...props, ref });
  },
);

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  function AvatarGroup(
    { className, children, max, render, renderSurplus, ...rest },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-avatar-group",
      css: avatarGroupCss,
      window: targetWindow,
    });

    const items = Children.toArray(children).filter(
      isValidElement,
    ) as ReactElement<AvatarProps>[];

    // Clamp `max` to a non-negative integer; other values (negative, fractional,
    // NaN) would slice incorrectly and miscount the overflow.
    const safeMax =
      typeof max === "number" && Number.isFinite(max)
        ? Math.max(0, Math.floor(max))
        : undefined;

    const visibleItems =
      safeMax !== undefined ? items.slice(0, safeMax) : items;
    const hiddenAvatars = items.slice(visibleItems.length);
    const hiddenAvatarsCount = hiddenAvatars.length;

    return (
      <AvatarGroupAction
        render={render}
        className={clsx(withBaseName(), className)}
        ref={ref}
        {...rest}
      >
        {visibleItems}
        {hiddenAvatarsCount > 0 &&
          (renderSurplus ? (
            renderSurplus({
              count: hiddenAvatarsCount,
              hiddenAvatars,
            })
          ) : (
            <Avatar name={`${hiddenAvatarsCount} more`}>
              {`+${hiddenAvatarsCount}`}
            </Avatar>
          ))}
      </AvatarGroupAction>
    );
  },
);
