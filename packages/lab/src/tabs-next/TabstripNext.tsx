import { capitalize, makePrefixer, useForkRef } from "@salt-ds/core";
import clsx from "clsx";
import {
  ComponentPropsWithoutRef,
  forwardRef,
  ReactNode,
  SyntheticEvent,
  KeyboardEvent,
  useMemo,
  useRef,
} from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import tabstripCss from "./TabstripNext.css";
import { TabsContext } from "./TabNextContext";
import { useTabstrip } from "./useTabstrip";
import { TabOverflowList } from "./TabOverflowList";
import { useOverflow } from "./useOverflow";

const withBaseName = makePrefixer("saltTabstripNext");

export interface TabstripNextProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /* Styling active color variant. Defaults to "primary". */
  activeColor?: "primary" | "secondary";
  /* Tabs alignment. Defaults to "left" */
  align?: "left" | "center" | "right";
  /* Value for the uncontrolled version. */
  value?: string;
  /* Callback for the controlled version. */
  onChange?: (event: SyntheticEvent, value: string) => void;
  /* Initial value for the uncontrolled version. */
  defaultValue?: string;
  /* The Tabs variant */
  variant?: "main" | "inline";
}

export const TabstripNext = forwardRef<HTMLDivElement, TabstripNextProps>(
  function TabstripNext(props, ref) {
    const {
      activeColor = "primary",
      align = "left",
      children,
      className,
      value,
      defaultValue,
      onChange,
      onKeyDown,
      style,
      variant = "main",
      ...rest
    } = props;
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-tabstrip-next",
      css: tabstripCss,
      window: targetWindow,
    });

    const tabstripRef = useRef<HTMLDivElement>(null);
    const handleRef = useForkRef(tabstripRef, ref);
    const {
      registerItem,
      setActive,
      setSelected,
      selected,
      active,
      handleKeyDown,
    } = useTabstrip({
      container: tabstripRef.current,
      defaultSelected: defaultValue,
      selected: value,
    });

    const [visible, hidden] = useOverflow({
      container: tabstripRef.current,
      children,
      selected,
    });

    const contextValue = useMemo(
      () => ({
        registerItem,
        variant,
        setSelected,
        selected,
        active,
      }),
      [variant, setSelected, selected, active, registerItem]
    );

    const tabstripStyle = {
      "--tabstripNext-justifyContent": align,
      ...style,
    };

    return (
      <TabsContext.Provider value={contextValue}>
        <div
          role="tablist"
          className={clsx(
            withBaseName(),
            withBaseName(variant),
            withBaseName("horizontal"),
            withBaseName(`activeColor${capitalize(activeColor)}`),
            className
          )}
          style={tabstripStyle}
          ref={handleRef}
          onKeyDown={handleKeyDown}
          {...rest}
        >
          {visible}
          <TabOverflowList>{hidden}</TabOverflowList>
        </div>
      </TabsContext.Provider>
    );
  }
);
