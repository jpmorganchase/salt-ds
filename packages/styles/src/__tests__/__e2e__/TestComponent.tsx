import React, { ComponentPropsWithoutRef } from "react";

import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

type Props = ComponentPropsWithoutRef<"div"> & {
  children?: string;
  injectionId?: string;
  injectionCss: string;
};

const TestComponent = ({
  children = "Test",
  injectionId,
  injectionCss,
  ...rest
}: Props) => {
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: injectionId,
    css: injectionCss,
    window: targetWindow,
  });

  return <div {...rest}>{children}</div>;
};

export default TestComponent;
