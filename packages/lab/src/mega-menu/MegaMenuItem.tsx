import { makePrefixer, type RenderPropsType, renderProps } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type AnchorHTMLAttributes,
  Children,
  forwardRef,
  type MouseEvent,
  type ReactNode,
} from "react";
import megaMenuItemCss from "./MegaMenuItem.css";
import { useMegaMenu } from "./useMegaMenu";

const withBaseName = makePrefixer("saltMegaMenuItem");

export interface MegaMenuItemProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * The content of the mega menu item.
   */
  children?: ReactNode;
  /**
   * Render prop to enable customization of the underlying action element (e.g. a router `Link`).
   */
  render?: RenderPropsType["render"];
}

export const MegaMenuItem = forwardRef<HTMLAnchorElement, MegaMenuItemProps>(
  function MegaMenuItem(
    { children, className, onClick, render, href, ...rest },
    ref,
  ) {
    const targetWindow = useWindow();
    const megaMenu = useMegaMenu();

    useComponentCssInjection({
      testId: "salt-mega-menu-item",
      css: megaMenuItemCss,
      window: targetWindow,
    });

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
      megaMenu.setOpen(false);
    };

    const isLink = href != null;

    return renderProps("a", {
      className: clsx(withBaseName(), className),
      ref,
      href,
      onClick: handleClick,
      render: render ?? (isLink ? undefined : <button type="button" />),
      ...rest,
      children: Children.map(children, (child) =>
        typeof child === "string" || typeof child === "number" ? (
          <span className={withBaseName("content")}>{child}</span>
        ) : (
          child
        ),
      ),
    });
  },
);
