import { FloatingPortal } from "@floating-ui/react";
import {
  type FloatingComponentProps,
  FloatingComponentProvider,
  SaltProvider,
} from "@salt-ds/core";
import { type CSSProperties, forwardRef, type ReactNode } from "react";

export const FLOATING_TEST_ID = "FLOATING_TEST_ID";

const TestCustomFloatingComponent = forwardRef<
  HTMLDivElement,
  FloatingComponentProps
>(function TestCustomFloatingComponent(props, ref) {
  const { open, top, left, width, height, position, ...rest } = props;
  const style = {
    top,
    left,
    position,
  };

  return open ? (
    <FloatingPortal>
      <SaltProvider>
        <div
          data-testid={FLOATING_TEST_ID}
          data-top={typeof top === "number" ? Math.floor(top) : undefined}
          data-left={typeof left === "number" ? Math.floor(left) : undefined}
          data-width={typeof width === "number" ? Math.floor(width) : undefined}
          data-height={
            typeof height === "number" ? Math.floor(height) : undefined
          }
          data-position={position}
          {...rest}
          style={style as CSSProperties}
          ref={ref}
        />
      </SaltProvider>
    </FloatingPortal>
  ) : null;
});

export const CustomFloatingComponentProvider = ({
  children,
}: {
  children?: ReactNode;
}) => {
  return (
    <FloatingComponentProvider Component={TestCustomFloatingComponent}>
      {children}
    </FloatingComponentProvider>
  );
};
