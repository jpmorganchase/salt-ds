import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  useContext,
} from "react";

export type WindowProps = {
  open?: boolean;
} & ComponentPropsWithoutRef<"div">;

export const Window = forwardRef<HTMLDivElement, WindowProps>(function Window(
  { children, open, ...props },
  ref,
) {
  return (
    <div {...props} ref={ref}>
      {children}
    </div>
  );
});

export const WindowContext = createContext<typeof Window>(Window);

export const useWindow = () => useContext(WindowContext);

const globalObject = typeof global === "undefined" ? window : global;
export const isDesktop: boolean = (globalObject as any).isDesktop;
