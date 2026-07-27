import { clsx } from "clsx";
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
import { createContext, makePrefixer } from "../utils";
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
  /**
   * Text of the item's label, used as tooltip content when the navigation is
   * collapsed and the label itself is hidden.
   */
  labelText?: string;
  setLabelText: Dispatch<SetStateAction<string | undefined>>;
};

const VerticalNavigationItemContext =
  createContext<VerticalNavigationItemContextType>(
    "saltVerticalNavigationItemContext",
    {
      active: false,
      focusVisible: false,
      setFocusVisible: () => {},
      setLabelText: () => {},
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
  const [labelText, setLabelText] = useState<string | undefined>(undefined);

  const context = useMemo(
    () => ({
      active,
      focusVisible,
      setFocusVisible,
      labelText,
      setLabelText,
    }),
    [active, focusVisible, labelText],
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
