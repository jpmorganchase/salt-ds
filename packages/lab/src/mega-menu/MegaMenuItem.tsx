import { makePrefixer, renderProps } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type AnchorHTMLAttributes,
  type ComponentPropsWithoutRef,
  forwardRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import megaMenuItemCss from "./MegaMenuItem.css";
import { useMegaMenu } from "./useMegaMenu";

const withBaseName = makePrefixer("saltMegaMenuItem");

// biome-ignore lint/suspicious/noExplicitAny: We don't know the exact type here
function ItemAction(props: ComponentPropsWithoutRef<any>) {
  return renderProps("a", props);
}

export interface MegaMenuItemProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * The content of the mega menu item.
   */
  children?: ReactNode;
  /**
   * Href to be passed to the Link element.
   */
  href?: string;
}

export const MegaMenuItem = forwardRef<HTMLLIElement, MegaMenuItemProps>(
  function MegaMenuItem(
    { children, className, href = "#", onClick, onKeyDown, ...rest },
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

    // Native `<a>` activates on Enter but not Space — handle Space here for parity.
    const handleKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
      onKeyDown?.(event);
      if (!event.defaultPrevented && event.key === " ") {
        event.preventDefault();
        event.currentTarget.click();
      }
    };

    return (
      <li className={clsx(withBaseName(), className)} ref={ref}>
        <ItemAction
          data-mega-menu-item=""
          href={href}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          {...rest}
        >
          {children}
        </ItemAction>
      </li>
    );
  },
);
