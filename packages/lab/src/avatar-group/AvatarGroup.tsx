import {
  makePrefixer,
  type RenderPropsType,
  renderProps,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";

import avatarGroupCss from "./AvatarGroup.css";

export interface AvatarGroupProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The children of the AvatarGroup. Should be `Avatar` components, optionally
   * followed by an `AvatarGroupSurplus` to represent hidden members.
   */
  children?: ReactNode;
  /**
   * Render prop to enable customization of the avatar group root element.
   */
  render?: RenderPropsType["render"];
}

const withBaseName = makePrefixer("saltAvatarGroup");

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  function AvatarGroup({ className, render, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-avatar-group",
      css: avatarGroupCss,
      window: targetWindow,
    });

    return renderProps("div", {
      ref,
      className: clsx(withBaseName(), className),
      render,
      ...rest,
    });
  },
);
