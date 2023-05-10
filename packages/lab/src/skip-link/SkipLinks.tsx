import { forwardRef, HTMLAttributes } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";

import skipLinksCss from "./SkipLinks.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

const withBaseName = makePrefixer("saltSkipLinks");

export const SkipLinks = forwardRef<
  HTMLUListElement,
  HTMLAttributes<HTMLUListElement>
>(function SkipLinks(props, ref) {
  const { className, children, ...restProps } = props;
  const { window: targetWindow } = useWindow();
  useComponentCssInjection({
    id: "salt-skip-links",
    css: skipLinksCss,
    window: targetWindow,
  });

  return (
    <ul {...restProps} className={clsx(withBaseName(), className)} ref={ref}>
      {children}
    </ul>
  );
});
