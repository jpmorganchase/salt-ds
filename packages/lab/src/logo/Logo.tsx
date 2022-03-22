import { ComponentType, forwardRef, ComponentPropsWithoutRef } from "react";
import cx from "classnames";
import { makePrefixer } from "@brandname/core";

import { LogoTitle, LogoTitleProps } from "./internal/LogoTitle";
import "./Logo.css";

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

const withBaseName = makePrefixer("uitkLogo");

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

  // TODO check if we need ImageProps and TitleProps classNames interface.
  return (
    <span
      className={cx(withBaseName(), className, {
        [withBaseName("compact")]: compact,
      })}
      ref={ref}
      {...rest}
    >
      <span className={withBaseName("wrapper")}>
        <LogoImageComponent
          {...ImageProps}
          className={cx(withBaseName("logo"), ImageProps?.className)}
          src={src}
          alt={ImageProps?.alt || "Logo"}
        />
      </span>
      <LogoTitle
        {...TitleProps}
        className={cx(withBaseName("appTitle"), TitleProps?.className)}
        label={appTitle}
        separatorClassname={cx(
          withBaseName("titlePipe"),
          TitleProps?.separatorClassname
        )}
      />
    </span>
  );
});
