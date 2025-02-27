import { FlexItem, StackLayout, useTheme } from "@salt-ds/core";
import { ComponentPropsWithoutRef } from "react";
import logo from "../../assets/logo.svg";

import "./Logo.css";

export const Logo = ({
                       children,
                       ...restProps
                     }: ComponentPropsWithoutRef<"div">) => {
  const { mode } = useTheme();

  const logoImg = (
    <img className="logo-img" src={logo} alt="Your logo" />
  );

  if (children) {
    return (
      <StackLayout direction="row" gap={2} align="center">
        {logoImg}
        <div className="logo-separator" />
        {children}
      </StackLayout>
    );
  } else {
    return (
      <StackLayout direction="row" gap={0} align="center" {...restProps}>
        {logoImg}
      </StackLayout>
    );
  }
};
