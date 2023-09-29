import { ComponentPropsWithoutRef, forwardRef, ReactNode, Ref } from "react";
import {
  FloatingComponentProps,
  SaltProvider,
  FloatingComponentProvider,
} from "@salt-ds/core";
import { FloatingPortal } from "@floating-ui/react";

type RootComponentProps = FloatingComponentProps &
  ComponentPropsWithoutRef<"div">;

export const FLOATING_TEST_ID = "FLOATING_TEST_ID";

const TestCustomFloatingComponent = forwardRef<HTMLElement, RootComponentProps>(
  (props, ref) => {
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
            data-width={
              typeof width === "number" ? Math.floor(width) : undefined
            }
            data-height={
              typeof height === "number" ? Math.floor(height) : undefined
            }
            data-position={position}
            {...rest}
            style={style}
            ref={ref as Ref<HTMLDivElement>}
          />
        </SaltProvider>
      </FloatingPortal>
    ) : null;
  }
);

type Props = {
  children: ReactNode;
};

export const CustomFloatingComponentProvider = ({ children }: Props) => {
  return (
    <FloatingComponentProvider Component={TestCustomFloatingComponent}>
      {children}
    </FloatingComponentProvider>
  );
};
