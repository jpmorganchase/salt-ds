import { clsx } from "clsx";
import {
    ForwardedRef,
    forwardRef,
    ReactNode
} from "react";
import { FloatingPortal, UseFloatingProps } from "@floating-ui/react";
import { Banner, BannerProps, makePrefixer } from '@salt-ds/core'
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import toastCss from "./Toast.css";

const withBaseName = makePrefixer("saltToast");

// Generic checks makes sure that incompatiable props like `onChange` can be inferred correctly when using different variants
export interface ToastProps extends UseFloatingProps {
    children: ReactNode
    status?: BannerProps["status"]
    /**
 * Determines the variant of pill
 */
    variant?: "primary" | "secondary";
}

export const Toast = forwardRef(function Toast(
    { variant, children, status = "info", ...restProps }: ToastProps,
    ref: ForwardedRef<HTMLDivElement>
) {
    const targetWindow = useWindow();
    useComponentCssInjection({
        testId: "salt-toast",
        css: toastCss,
        window: targetWindow,
    });

    return (
        <div
            className={clsx(
                withBaseName()
            )}
            ref={ref}
        >
            <Banner status={status}>
                {children}
            </Banner>
        </div>
    );

}) 
