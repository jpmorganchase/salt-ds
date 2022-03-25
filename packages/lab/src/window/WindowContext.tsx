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
