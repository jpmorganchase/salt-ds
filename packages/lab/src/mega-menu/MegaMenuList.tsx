import {
  makePrefixer,
  type PolymorphicComponentPropWithRef,
  type PolymorphicRef,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ElementType,
  type ForwardedRef,
  type FunctionComponent,
  forwardRef,
  type ReactNode,
} from "react";
import { useMegaMenuGroup } from "./MegaMenuGroupContext";
import megaMenuListCss from "./MegaMenuList.css";

const withBaseName = makePrefixer("saltMegaMenuList");

export type MegaMenuListProps<T extends ElementType = "ul"> =
  PolymorphicComponentPropWithRef<
    T,
    {
      /**
       * The items of the group, typically `MegaMenuListItem` components. Each
       * `MegaMenuListItem` renders its own `<li>`.
       */
      children?: ReactNode;
    }
  >;

type MegaMenuListComponent = <T extends ElementType = "ul">(
  props: MegaMenuListProps<T>,
) => ReturnType<FunctionComponent>;

/**
 * The list of a group's `MegaMenuListItem`s. Renders a `<ul>` by default; pass
 * `as="ol"` for an ordered list.
 */
export const MegaMenuList: MegaMenuListComponent = forwardRef(
  function MegaMenuList<T extends ElementType = "ul">(
    {
      as,
      children,
      className,
      "aria-labelledby": ariaLabelledBy,
      ...rest
    }: MegaMenuListProps<T>,
    ref?: ForwardedRef<unknown>,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-list",
      css: megaMenuListCss,
      window: targetWindow,
    });

    const { headingId } = useMegaMenuGroup();

    const Component = as || "ul";

    return (
      <Component
        ref={ref as PolymorphicRef<T>}
        className={clsx(withBaseName(), className)}
        aria-labelledby={clsx(headingId, ariaLabelledBy) || undefined}
        {...rest}
      >
        {children}
      </Component>
    );
  },
);
