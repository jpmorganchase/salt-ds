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

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The maximum number of Avatars to display in the group. If the number of children exceeds this value, a hidden Avatar will be displayed with the count of hidden Avatars.
   */
  max?: number;
  /**
   * Multiplier for the base avatar.
   */
  size?: number;
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

    const childrenArray = Children.toArray(children).filter(isValidElement);
    const visibleChildren = childrenArray.slice(0, max).map((child) =>
      cloneElement(child as ReactElement<AvatarProps>, {
        size: (child.props as AvatarProps).size ?? size,
      }),
    );
    const hiddenChildrenCount = childrenArray.length - visibleChildren.length;

    return (
      <div
        className={clsx(withBaseName(), className)}
        ref={ref}
        style={style}
        {...rest}
      >
        {visibleChildren}
        {hiddenChildrenCount > 0 && (
          <Avatar
            className={withBaseName("hiddenAvatar")}
            size={size}
            name={`+ ${hiddenChildrenCount}`}
          />
        )}
      </div>
    );
  },
);
