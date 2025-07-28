import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef, useState } from "react";
import { SubMenuProvider } from "./SubMenuContext";
import verticalNavigationCss from "./VerticalNavigation.css";

export interface VerticalNavigationProps
  extends ComponentPropsWithoutRef<"ol"> {
  appearance?: "indicator" | "bordered";
}

const withBaseName = makePrefixer("saltVerticalNavigation");

export const VerticalNavigation = forwardRef<
  HTMLOListElement,
  VerticalNavigationProps
>(function VerticalNavigation(props, ref) {
  const { appearance = "indicator", className, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-vertical-navigation",
    css: verticalNavigationCss,
    window: targetWindow,
  });

  const [directIcons, setDirectIcons] = useState<string[]>([]);

  return (
    <SubMenuProvider directIcons={directIcons} setDirectIcons={setDirectIcons}>
      <ol
        ref={ref}
        className={clsx(withBaseName(), withBaseName(appearance), className)}
        data-has-direct-icons={directIcons.length > 0}
        {...rest}
      />
    </SubMenuProvider>
  );
});
