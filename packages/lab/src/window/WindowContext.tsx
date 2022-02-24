import {
  createContext,
  forwardRef,
  PropsWithChildren,
  useContext,
} from "react";

export type WindowProps = PropsWithChildren<{
  className?: string;
  id?: string;
  open?: boolean;
  style?: any;
}>;

export const Window = forwardRef<HTMLDivElement, WindowProps>(function Window(
  { children, className, ...props }: WindowProps,
  ref
) {
  if (className) {
    return (
      <div {...props} className={className} ref={ref}>
        {children}
      </div>
    );
  } else {
    return children as JSX.Element | null;
  }
});

export type windowType = typeof Window;

export const WindowContext = createContext<windowType>(Window);

export const useWindow = () => useContext(WindowContext);
