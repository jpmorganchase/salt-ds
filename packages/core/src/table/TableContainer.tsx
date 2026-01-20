import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, useRef } from "react";
import { useElementScrollable, useForkRef } from "../utils";
import { withTableBaseName } from "./Table";
import tableCss from "./Table.css";

export const TableContainer = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function TableContainer(props, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-table-container",
    css: tableCss,
    window: targetWindow,
  });

  const {
    children,
    className,
    role,
    tabIndex,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    ...rest
  } = props;

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useForkRef<HTMLDivElement>(ref, scrollRef);

  const { isScrollable } = useElementScrollable(scrollRef, {
    targetWindow,
  });

  return (
    <div
      ref={handleRef}
      className={clsx(withTableBaseName("tableContainer"), className)}
      role={role ?? (isScrollable ? "region" : undefined)}
      tabIndex={tabIndex ?? (isScrollable ? 0 : undefined)}
      {...(ariaLabelledby && isScrollable
        ? { "aria-labelledby": ariaLabelledby }
        : {})}
      {...(ariaLabel && isScrollable ? { "aria-label": ariaLabel } : {})}
      {...rest}
    >
      {children}
    </div>
  );
});
