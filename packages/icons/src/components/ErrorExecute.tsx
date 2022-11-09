import { forwardRef } from "react";

import { Icon, IconProps } from "../icon";

export type ErrorExecuteIconProps = IconProps;

export const ErrorExecuteIcon = forwardRef<
  SVGSVGElement,
  ErrorExecuteIconProps
>(function ErrorExecuteIcon(props: ErrorExecuteIconProps, ref) {
  return (
    <Icon
      data-testid="ErrorExecuteIcon"
      aria-label="error execute"
      viewBox="0 0 12 12"
      ref={ref}
      {...props}
    >
      <path d="M12 6A6 6 0 1 0 0 6a6 6 0 0 0 12 0zM8.607 9.668a4.5 4.5 0 0 1-6.275-6.275l6.275 6.275zm1.061-1.061L3.393 2.332a4.5 4.5 0 0 1 6.275 6.275z" />
    </Icon>
  );
});
