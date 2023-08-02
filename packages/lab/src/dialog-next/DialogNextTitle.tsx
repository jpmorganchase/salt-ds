import { ComponentPropsWithoutRef } from "react";
import clsx from "clsx";
import { H1, makePrefixer } from "@salt-ds/core";
import { useDialogNextContext } from "./DialogNext";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import dialogNextTitleCss from "./DialogNextTitle.css";

const withBaseName = makePrefixer("saltDialogNextTitle");

export const DialogNextTitle = ({
  children,
  className,
  ...rest
}: ComponentPropsWithoutRef<"h1">) => {
  const { headingRef, headingId } = useDialogNextContext();
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-dialog-next-title",
    css: dialogNextTitleCss,
    window: targetWindow,
  });

  return (
    <H1
      id={headingId}
      className={clsx(withBaseName(), className)}
      ref={headingRef}
      {...rest}
    >
      {children}
    </H1>
  );
};
