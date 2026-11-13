import {
  useComponentCssInjection,
  useComponentDefaults,
} from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef, useState } from "react";
import { makePrefixer } from "../utils";
import { SubMenuProvider } from "./SubMenuContext";
import verticalNavigationCss from "./VerticalNavigation.css";

export interface VerticalNavigationProps
  extends ComponentPropsWithoutRef<"nav"> {
  /**
   * The appearance of the tabs. Defaults to "bordered".
   */
  appearance?: "indicator" | "bordered";
}

const withBaseName = makePrefixer("saltVerticalNavigation");

export const VerticalNavigation = forwardRef<
  HTMLElement,
  VerticalNavigationProps
>(function VerticalNavigation(props, ref) {
  const { props: propsWithDefaults, rootDataAttributes } = useComponentDefaults(
    "saltVerticalNavigation",
    props,
  );
  const {
    appearance = "bordered",
    children,
    className,
    ...rest
  } = propsWithDefaults;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-vertical-navigation",
    css: verticalNavigationCss,
    window: targetWindow,
  });

  const [directIcons, setDirectIcons] = useState<string[]>([]);

  return (
    <SubMenuProvider directIcons={directIcons} setDirectIcons={setDirectIcons}>
      <nav
        ref={ref}
        className={clsx(withBaseName(), withBaseName(appearance), className)}
        {...rest}
        {...rootDataAttributes}
      >
        <ol data-has-direct-icons={directIcons.length > 0}>{children}</ol>
      </nav>
    </SubMenuProvider>
  );
});
