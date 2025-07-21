import { createContext, makePrefixer } from "@salt-ds/core";
import clsx from "clsx";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type Dispatch,
  forwardRef,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from "react";
import { useSubMenuContext } from "./SubMenuContext";

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

  const { depth } = useSubMenuContext();
  const [focusVisible, setFocusVisible] = useState(false);

  const context = useMemo(
    () => ({
      active,
      focusVisible,
      setFocusVisible,
    }),
    [active, focusVisible],
  );

  return (
    <VerticalNavigationItemContext.Provider value={context}>
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
