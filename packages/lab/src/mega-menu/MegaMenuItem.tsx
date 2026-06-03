import {
  getRefFromChildren,
  makePrefixer,
  type RenderPropsType,
  renderProps,
  useForkRef,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type AnchorHTMLAttributes,
  Children,
  type ComponentPropsWithoutRef,
  cloneElement,
  forwardRef,
  isValidElement,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from "react";
import { useRegisterItem } from "./MegaMenuGridContext";
import megaMenuItemCss from "./MegaMenuItem.css";
import { useMegaMenu } from "./useMegaMenu";

const withBaseName = makePrefixer("saltMegaMenuItem");

// `forwardRef` so the registration ref reaches the underlying `<a>` (or the
// `render` element). Without it the ref is silently dropped and the item never
// registers — masked by the scoped column fallback.
const ItemAction = forwardRef<
  HTMLAnchorElement,
  // biome-ignore lint/suspicious/noExplicitAny: We don't know the exact type here
  ComponentPropsWithoutRef<any> & RenderPropsType
>(function ItemAction({ render, ...props }, ref) {
  // Compose our registration ref with any ref the consumer put on the `render`
  // element, so neither is dropped. `mergeProps`' ref rule (B wins) would
  // otherwise let one overwrite the other.
  const renderRef = getRefFromChildren(render as ReactNode) as
    | Ref<HTMLAnchorElement>
    | undefined;
  const composedRef = useForkRef<HTMLAnchorElement>(ref, renderRef);

  if (isValidElement(render)) {
    return renderProps("a", {
      ...props,
      render: cloneElement(render, { ref: composedRef } as never),
    });
  }
  return renderProps("a", { ...props, render, ref: composedRef });
});

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

export const MegaMenuItem = forwardRef<HTMLLIElement, MegaMenuItemProps>(
  function MegaMenuItem(
    { children, className, onClick, onKeyDown, ...rest },
    ref,
  ) {
    const targetWindow = useWindow();
    const megaMenu = useMegaMenu();
    const registerItem = useRegisterItem();

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
          ref={registerItem}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          {...rest}
        >
          {Children.map(children, (child) =>
            typeof child === "string" || typeof child === "number" ? (
              <span className={withBaseName("content")}>{child}</span>
            ) : (
              child
            ),
          )}
        </ItemAction>
      </li>
    );
  },
);
