import { ComponentPropsWithoutRef, ComponentType, forwardRef } from "react";
import { clsx } from "clsx";
import { makePrefixer } from "@salt-ds/core";

import { LogoTitle, LogoTitleProps } from "./internal/LogoTitle";

import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

import logoCss from "./Logo.css";

export interface LogoProps extends ComponentPropsWithoutRef<"span"> {
  /**
   * Used to provide application title
   */
  appTitle?: string;
  /**
   * If `true`, the logo will be compact;
   */
  compact?: boolean;
  /**
   * Props passed to the Logo.
   */
  ImageProps?: Partial<ComponentPropsWithoutRef<"img">>;
  /**
   * Custom Component to render the logo image.
   * e.g. if a custom renderer instead of static image using `src` prop.
   */
  LogoImageComponent?: ComponentType<Partial<ComponentPropsWithoutRef<"img">>>;
  /**
   * Image src for logo.
   */
  src?: string;
  /**
   * Props passed to the Application Title if used.
   * If using a custom image then ImageProps.alt should be set to include a screen reader alternative text.
   */
  TitleProps?: Omit<Partial<LogoTitleProps>, "label">;
}

const withBaseName = makePrefixer("saltLogo");

export const Logo = forwardRef<HTMLSpanElement, LogoProps>(function Logo(
  props,
  ref
) {
  const {
    appTitle,
    className,
    compact,
    src,
    ImageProps,
    LogoImageComponent = "img",
    TitleProps,
    ...rest
  } = props;
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-logo",
    css: logoCss,
    window: targetWindow,
  });

  // TODO check if we need ImageProps and TitleProps classNames interface.
  return (
    <span
      className={clsx(withBaseName(), className, {
        [withBaseName("compact")]: compact,
      })}
      ref={ref}
      {...rest}
    >
      <span className={withBaseName("wrapper")}>
        <LogoImageComponent
          {...ImageProps}
          className={clsx(withBaseName("logo"), ImageProps?.className)}
          src={src}
          alt={ImageProps?.alt || "Logo"}
        />
      </span>
      <LogoTitle
        {...TitleProps}
        className={clsx(withBaseName("appTitle"), TitleProps?.className)}
        label={appTitle}
        separatorClassname={clsx(
          withBaseName("titlePipe"),
          TitleProps?.separatorClassname
        )}
      />
    </span>
  );
});
