import {
  ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  PropsWithChildren,
  useContext,
} from "react";

export type WindowProps = PropsWithChildren<
  {
    open?: boolean;
  } & ComponentPropsWithoutRef<"div">
>;

export const Window = forwardRef<HTMLDivElement, WindowProps>(function Window(
  { children, open, ...props },
  ref
) {
  return (
    <div {...props} ref={ref}>
      {children}
    </div>
  );
});

export type windowType = typeof Window;

export const WindowContext = createContext<windowType>(Window);

export const useWindow = () => useContext(WindowContext);

const globalObject = typeof global === "undefined" ? window : global;
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
export const isDesktop: boolean = (globalObject as any).isDesktop;
