import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type SyntheticEvent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { makePrefixer, useControlled, useId } from "../utils";
import { SubMenuProvider } from "./SubMenuContext";
import verticalNavigationCss from "./VerticalNavigation.css";
import { VerticalNavigationContext } from "./VerticalNavigationContext";

export interface VerticalNavigationProps
  extends ComponentPropsWithoutRef<"nav"> {
  /**
   * The appearance of the tabs. Defaults to "bordered".
   */
  appearance?: "indicator" | "bordered";
  /**
   * Whether the navigation is collapsed to an icon rail.
   */
  collapsed?: boolean;
  /**
   * Whether the navigation is collapsed to an icon rail by default.
   */
  defaultCollapsed?: boolean;
  /**
   * Callback fired when the navigation is collapsed or expanded.
   */
  onCollapsedChange?: (event: SyntheticEvent, collapsed: boolean) => void;
}

const withBaseName = makePrefixer("saltVerticalNavigation");

export const VerticalNavigation = forwardRef<
  HTMLElement,
  VerticalNavigationProps
>(function VerticalNavigation(props, ref) {
  const {
    appearance = "bordered",
    children,
    className,
    collapsed: collapsedProp,
    defaultCollapsed,
    id: idProp,
    onCollapsedChange,
    ...rest
  } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-vertical-navigation",
    css: verticalNavigationCss,
    window: targetWindow,
  });

  const [directIcons, setDirectIcons] = useState<string[]>([]);

  const id = useId(idProp);

  const [collapsed, setCollapsedState] = useControlled({
    default: Boolean(defaultCollapsed),
    controlled: collapsedProp,
    name: "VerticalNavigation",
    state: "collapsed",
  });

  const setCollapsed = useCallback(
    (event: SyntheticEvent, newCollapsed: boolean) => {
      setCollapsedState(newCollapsed);
      onCollapsedChange?.(event, newCollapsed);
    },
    [onCollapsedChange, setCollapsedState],
  );

  const context = useMemo(
    () => ({ collapsed, setCollapsed, navId: id }),
    [collapsed, setCollapsed, id],
  );

  return (
    <VerticalNavigationContext.Provider value={context}>
      <SubMenuProvider directIcons={directIcons} setDirectIcons={setDirectIcons}>
        <nav
          ref={ref}
          id={id}
          className={clsx(
            withBaseName(),
            withBaseName(appearance),
            { [withBaseName("collapsed")]: collapsed },
            className,
          )}
          {...rest}
        >
          <ol data-has-direct-icons={directIcons.length > 0}>{children}</ol>
        </nav>
      </SubMenuProvider>
    </VerticalNavigationContext.Provider>
  );
});
