import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  useContext,
} from "react";

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export type WindowProps = {
  open?: boolean;
} & ComponentPropsWithoutRef<"div">;

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
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

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const WindowContext = createContext<typeof Window>(Window);

/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const useWindow = () => useContext(WindowContext);

const globalObject = typeof global === "undefined" ? window : global;
/**
 * @deprecated since 1.0.0-alpha.110. It will be removed in a future release, with no replacement.
 */
export const isDesktop: boolean = (globalObject as any).isDesktop;
