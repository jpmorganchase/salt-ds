import { makePrefixer, type RenderPropsType, renderProps } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  Children,
  type ComponentPropsWithoutRef,
  forwardRef,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import megaMenuListItemCss from "./MegaMenuListItem.css";
import { useMegaMenu } from "./useMegaMenu";

const withBaseName = makePrefixer("saltMegaMenuListItem");

// biome-ignore lint/suspicious/noExplicitAny: We don't know the exact type here
function MegaMenuListItemAction(props: ComponentPropsWithoutRef<any>) {
  return renderProps("a", props);
}

export interface MegaMenuListItemProps
  extends Omit<ComponentPropsWithoutRef<"li">, "onClick"> {
  /**
   * The content of the mega menu item.
   */
  children?: ReactNode;
  /**
   * Href passed to the action element. When set the action renders an `<a>`,
   * otherwise a `<button>`.
   */
  href?: string;
  /**
   * Called when the item's action is activated, before the menu closes.
   */
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  /**
   * Render prop to enable customization of the underlying action element (e.g. a router `Link`).
   */
  render?: RenderPropsType["render"];
}

export const MegaMenuListItem = forwardRef<
  HTMLLIElement,
  MegaMenuListItemProps
>(function MegaMenuListItem(
  { children, className, onClick, render, href, ...rest },
  ref,
) {
  const targetWindow = useWindow();
  const megaMenu = useMegaMenu();

  useComponentCssInjection({
    testId: "salt-mega-menu-list-item",
    css: megaMenuListItemCss,
    window: targetWindow,
  });

  const handleClick: MouseEventHandler<
    HTMLAnchorElement | HTMLButtonElement
  > = (event) => {
    onClick?.(event);
    megaMenu.setOpen(false);
  };

  const isLink = href != null;

  return (
    <li ref={ref} className={clsx(withBaseName(), className)} {...rest}>
      <MegaMenuListItemAction
        className={withBaseName("wrapper")}
        href={href}
        onClick={handleClick}
        render={render ?? (isLink ? undefined : <button type="button" />)}
      >
        {Children.map(children, (child) =>
          typeof child === "string" || typeof child === "number" ? (
            <span className={withBaseName("content")}>{child}</span>
          ) : (
            child
          ),
        )}
      </MegaMenuListItemAction>
    </li>
  );
});
