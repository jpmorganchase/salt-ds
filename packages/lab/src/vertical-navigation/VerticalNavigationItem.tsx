import { createContext, makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type Dispatch,
  forwardRef,
  type SetStateAction,
  useContext,
  useState,
} from "react";
import { useSubMenuContext } from "./SubMenuContext";
import verticalNavigationItemCss from "./VerticalNavigationItem.css";

export interface VerticalNavigationItemProps
  extends ComponentPropsWithoutRef<"li"> {
  active?: boolean;
}

const withBaseName = makePrefixer("saltVerticalNavigationItem");

type VerticalNavigationItemContextType = {
  active: boolean;
  focusVisible: boolean;
  setFocusVisible: Dispatch<SetStateAction<boolean>>;
};

const VerticalNavigationItemContext =
  createContext<VerticalNavigationItemContextType>(
    "saltVerticalNavigationItemContext",
    {
      active: false,
      focusVisible: false,
      setFocusVisible: () => {},
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
  const [focusVisible, setFocusVisible] = useState(false);

  return (
    <VerticalNavigationItemContext.Provider
      value={{ active, focusVisible, setFocusVisible }}
    >
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
