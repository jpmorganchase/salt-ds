import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  cloneElement,
  type HTMLAttributes,
  isValidElement,
  type ReactNode,
} from "react";
import type {
  Accent,
  ActionFont,
  Corner,
  Density,
  HeadingFont,
  Mode,
  ThemeName,
} from "../theme/index";
import { useId } from "../utils/useId";
import { useIsomorphicLayoutEffect } from "../utils/useIsomorphicLayoutEffect";

export interface ThemeApplicatorProps {
  /**
   * Either "root", "scope" or "child".
   * Specifies the location of salt theme class and attributes should be applied to.
   *
   * Defaults to "root" for a root provider, otherwise "scope".
   */
  applyClassesTo: "root" | "scope" | "child";
  /**
   * Either "high", "medium", "low", "touch" or "mobile".
   * Determines the amount of content that can fit on a screen based on the size and spacing of components.
   * Refer to [density](https://www.saltdesignsystem.com/salt/foundations/density) doc for more detail.
   *
   * @default "medium"
   */
  density: Density;
  /**
   * A string. Specifies custom theme name(s) you want to apply, similar to `className`.
   */
  theme: ThemeName;
  /**
   * Either "light" or "dark". Enable the color palette to change from light to dark.
   * Refer to [modes](https://www.saltdesignsystem.com/salt/foundations/modes) doc for more detail.
   *
   * @default "light"
   */
  mode: Mode;
  /**
   * Either "sharp" or "rounded".
   * Determines selected components corner radius.
   * @default "sharp"
   */
  corner?: Corner;
  /**
   * Either "Open Sans" or "Amplitude".
   * Determines font family of display and heading text.
   * @default "Open Sans"
   */
  headingFont?: HeadingFont;
  /**
   * Either "blue" or "teal".
   * Determines accent color used across components, e.g. Accent Button, List, Calendar.
   * @default "blue"
   */
  accent?: Accent;
  /**
   * Either "Open Sans" or "Amplitude".
   * Determines font family of action components, mostly Buttons.
   * @default "Open Sans"
   */
  actionFont?: ActionFont;
  children?: ReactNode;
}

const providerSymbol = Symbol.for("salt-provider");

export function ThemeApplicator({
  applyClassesTo,
  children,
  density,
  mode,
  theme,
  corner,
  headingFont,
  accent,
  actionFont,
}: ThemeApplicatorProps) {
  const targetWindow = useWindow();

  const providerId = useId();

  useIsomorphicLayoutEffect(() => {
    if (applyClassesTo !== "root" || !targetWindow || !providerId) return;

    const targetDocument: Document & { [providerSymbol]?: string } =
      targetWindow.document;

    // Claim the document if no other provider has already. The symbol is used so the lock isn't enumerable and guarantees it won't clash with anything else.
    if (!targetDocument[providerSymbol]) {
      targetDocument[providerSymbol] = providerId;
    }

    if (providerId !== targetDocument[providerSymbol]) {
      console.warn(
        "Multiple providers targeting the same window. There can be only one level root level SaltProvider per window.",
      );
      return;
    }

    const themeNames = theme.split(" ");

    // add the styles we want to apply
    targetDocument.documentElement.classList.add(
      ...themeNames,
      `salt-density-${density}`,
    );
    targetDocument.documentElement.dataset.mode = mode;

    // Theme Next
    if (corner) targetDocument.documentElement.dataset.corner = corner;
    if (headingFont)
      targetDocument.documentElement.dataset.headingFont = headingFont;
    if (accent) targetDocument.documentElement.dataset.accent = accent;
    if (actionFont)
      targetDocument.documentElement.dataset.actionFont = actionFont;

    return () => {
      // Delete lock
      delete targetDocument[providerSymbol];

      // When unmounting/remounting, remove the applied styles from the root
      targetDocument.documentElement.classList.remove(
        ...themeNames,
        `salt-density-${density}`,
      );
      targetDocument.documentElement.dataset.mode = undefined;

      // Theme Next
      delete targetDocument.documentElement.dataset.corner;
      delete targetDocument.documentElement.dataset.headingFont;
      delete targetDocument.documentElement.dataset.accent;
      delete targetDocument.documentElement.dataset.actionFont;
    };
  }, [
    providerId,
    applyClassesTo,
    density,
    mode,
    theme,
    targetWindow,
    corner,
    headingFont,
    accent,
    actionFont,
  ]);

  const themeNextProps = {
    "data-corner": corner,
    "data-heading-font": headingFont,
    "data-accent": accent,
    "data-action-font": actionFont,
  };

  if (applyClassesTo === "child") {
    if (isValidElement<HTMLAttributes<HTMLElement>>(children)) {
      return cloneElement(children, {
        className: clsx(
          children.props?.className,
          theme,
          `salt-density-${density}`,
        ),
        // @ts-expect-error
        "data-mode": mode,
        ...themeNextProps,
      });
    }
    console.warn(
      `\nSaltProvider can only apply CSS classes for theming to a single nested child element of the SaltProvider.
        Either wrap elements with a single container or consider removing the applyClassesToChild prop, in which case a
        div element will wrap your child elements`,
    );
    return children;
  }

  if (applyClassesTo === "scope") {
    return (
      <div
        className={clsx("salt-provider", theme, `salt-density-${density}`)}
        data-mode={mode}
        {...themeNextProps}
      >
        {children}
      </div>
    );
  }

  return children;
}
