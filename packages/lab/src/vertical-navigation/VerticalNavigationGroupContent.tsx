import { makePrefixer, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef, useEffect } from "react";
import { useVerticalNavigationGroup } from "./VerticalNavigationGroup";
import verticalNavigationGroupContentCss from "./VerticalNavigationGroupContent.css";

export interface VerticalNavigationGroupContentProps
  extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltVerticalNavigationGroupContent");

export const VerticalNavigationGroupContent = forwardRef<
  HTMLDivElement,
  VerticalNavigationGroupContentProps
>(function VerticalNavigationGroupContent(props, ref) {
  const { children, className, id: idProp, ...rest } = props;

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-vertical-navigation-group-content",
    css: verticalNavigationGroupContentCss,
    window: targetWindow,
  });

  const { expanded, setRegionId } = useVerticalNavigationGroup();
  const id = useId(idProp);

  useEffect(() => {
    if (id) {
      setRegionId(id);
    }
  }, [id]);

  return (
    <div
      {...rest}
      className={clsx(withBaseName(), className)}
      aria-hidden={!expanded ? "true" : undefined}
      hidden={!expanded}
      ref={ref}
    >
      <ul id={id} className={withBaseName("inner")}>
        {children}
      </ul>
    </div>
  );
});
