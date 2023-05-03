import React, { ReactNode } from "react";
import { useFrame } from "react-frame-component";

import { useComponentCssInjection } from "@salt-ds/styles";
import { WindowProvider } from "@salt-ds/window";
import { SaltProvider } from "@salt-ds/core";

import themeCss from "@salt-ds/theme/index.css";

type Props = {
  children: ReactNode;
};

const Root = ({ children }: Props) => {
  const { window: targetWindow } = useFrame();

  useComponentCssInjection({
    id: "theme",
    css: themeCss,
    window: targetWindow,
  });

  return targetWindow ? (
    <WindowProvider window={targetWindow}>
      <SaltProvider>{children}</SaltProvider>
    </WindowProvider>
  ) : null;
};

export default Root;
