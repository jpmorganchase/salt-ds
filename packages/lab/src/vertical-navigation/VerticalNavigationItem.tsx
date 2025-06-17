import { createContext, makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  forwardRef,
  useContext,
} from "react";
import { useSubMenuContext } from "./SubMenuContext";
import verticalNavigationItemCss from "./VerticalNavigationItem.css";

export interface VerticalNavigationItemProps
  extends ComponentPropsWithoutRef<"li"> {
  active?: boolean;
}

const withBaseName = makePrefixer("saltVerticalNavigationItem");

const VerticalNavigationItemContext = createContext(
  "saltVerticalNavigationItemContext",
  {
    active: false,
  },
);

export function useVerticalNavigationItem() {
  return useContext(VerticalNavigationItemContext);
}

export const VerticalNavigationItem = forwardRef<
  HTMLLIElement,
  VerticalNavigationItemProps
>(function VerticalNavigationItem(props, ref) {
  const { children, className, active = false, style, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-vertical-navigation-item",
    css: verticalNavigationItemCss,
    window: targetWindow,
  });

  const { depth } = useSubMenuContext();

  return (
    <VerticalNavigationItemContext.Provider value={{ active }}>
      <li
        ref={ref}
        className={clsx(withBaseName(), className)}
        style={
          { "--verticalNavigationItem-depth": depth, ...style } as CSSProperties
        }
        {...rest}
      >
        {children}
      </li>
    </VerticalNavigationItemContext.Provider>
  );
});
