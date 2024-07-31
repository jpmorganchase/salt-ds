import { Button, capitalize, makePrefixer, useForkRef } from "@salt-ds/core";
import { AddIcon } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import {
  type ComponentPropsWithoutRef,
  type SyntheticEvent,
  forwardRef,
  useMemo,
  useRef,
  useState,
} from "react";

import { TabsContext } from "./TabNextContext";
import { TabOverflowList } from "./TabOverflowList";
import tabstripCss from "./TabstripNext.css";
import { useOverflow } from "./useOverflow";
import { useTabstrip } from "./useTabstrip";

const withBaseName = makePrefixer("saltTabstripNext");

export interface TabstripNextProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /* Styling active color variant. Defaults to "primary". */
  activeColor?: "primary" | "secondary";
  /* Tabs alignment. Defaults to "left" */
  align?: "left" | "center" | "right";
  /* Value for the controlled version. */
  value?: string;
  /* Callback for the controlled version. */
  onChange?: (event: SyntheticEvent, value: string) => void;
  /* Initial value for the uncontrolled version. */
  defaultValue?: string;
  /* The Tabs variant */
  variant?: "main" | "inline";
  onAdd?: () => void;
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
      onAdd,
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
    const { registerItem, setSelected, selected, handleKeyDown } = useTabstrip({
      defaultSelected: defaultValue,
      selected: value,
    });

    const [visible, hidden] = useOverflow({
      container: tabstripRef,
      children,
      selected,
    });

    const [focusInside, setFocusInside] = useState(false);

    const handleFocus = () => {
      setFocusInside(true);
    };

    const handleBlur = () => {
      setFocusInside(false);
    };

    const contextValue = useMemo(
      () => ({
        registerItem,
        variant,
        setSelected,
        selected,
        focusInside,
      }),
      [variant, setSelected, selected, registerItem, focusInside],
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
            className,
          )}
          style={tabstripStyle}
          ref={handleRef}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        >
          {visible}
          {onAdd && (
            <Button aria-label="Add Tab" variant="secondary" onClick={onAdd}>
              <AddIcon aria-hidden />
            </Button>
          )}
          <TabOverflowList>{hidden}</TabOverflowList>
        </div>
      </TabsContext.Provider>
    );
  },
);
