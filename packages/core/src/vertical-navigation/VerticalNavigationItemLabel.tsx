import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef, useCallback } from "react";
import { makePrefixer, useForkRef } from "../utils";
import { useVerticalNavigationContext } from "./VerticalNavigationContext";
import { useVerticalNavigationItem } from "./VerticalNavigationItem";
import verticalNavigationItemLabelCss from "./VerticalNavigationItemLabel.css";

export interface VerticalNavigationItemLabelProps
  extends ComponentPropsWithoutRef<"span"> {}

const withBaseName = makePrefixer("saltVerticalNavigationItemLabel");

export const VerticalNavigationItemLabel = forwardRef<
  HTMLSpanElement,
  VerticalNavigationItemLabelProps
>(function VerticalNavigationItemLabel(props, ref) {
  const { children, className, ...rest } = props;
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-vertical-navigation-item-label",
    css: verticalNavigationItemLabelCss,
    window: targetWindow,
  });

  const { collapsed } = useVerticalNavigationContext();
  const { setLabelText } = useVerticalNavigationItem();

  // Ref callback rather than an effect on `children`, which would loop when
  // the label is given elements rather than a string.
  const labelRef = useCallback(
    (element: HTMLSpanElement | null) => {
      setLabelText(element?.textContent ?? undefined);
    },
    [setLabelText],
  );

  const handleRef = useForkRef(ref, labelRef);

  return (
    <span
      className={clsx(
        withBaseName(),
        { "salt-visuallyHidden": collapsed },
        className,
      )}
      ref={handleRef}
      {...rest}
    >
      {children}
    </span>
  );
});
