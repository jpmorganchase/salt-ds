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
   * Where the theme classes and attributes are applied. `"root"` applies them to
   * the document's root element, `"scope"` to a `div` that wraps `children`, and
   * `"child"` to the single child element. Inside another `SaltProvider`, it
   * defaults to `"scope"`.
   * @default "root"
   */
  applyClassesTo: "root" | "scope" | "child";
  /**
   * The density, which sets how much content fits on a screen through the size
   * and spacing of components. See the
   * [density](https://www.saltdesignsystem.com/salt/foundations/density) docs for
   * more detail. Inside another `SaltProvider`, it defaults to the parent's
   * density.
   * @default "medium"
   */
  density: Density;
  /**
   * The custom theme names to apply as class names, in addition to Salt's own
   * theme class. Inside another `SaltProvider`, it defaults to the parent's
   * theme.
   */
  theme: ThemeName;
  /**
   * The mode, which switches the color palette between light and dark. See the
   * [modes](https://www.saltdesignsystem.com/salt/foundations/modes) docs for
   * more detail. Inside another `SaltProvider`, it defaults to the parent's mode.
   * @default "light"
   */
  mode: Mode;
  /**
   * The corner radius of the components that support it: `"sharp"` or
   * `"rounded"`. Inside another `SaltProvider`, it defaults to the parent's
   * `corner`.
   * @default "sharp"
   */
  corner?: Corner;
  /**
   * The font family of display and heading text: `"Open Sans"` or
   * `"Amplitude"`. Inside another `SaltProvider`, it defaults to the parent's
   * `headingFont`.
   * @default "Open Sans"
   */
  headingFont?: HeadingFont;
  /**
   * The accent color used across components, for example by accented buttons,
   * lists and calendars: `"blue"` or `"teal"`. Inside another `SaltProvider`, it
   * defaults to the parent's `accent`.
   * @default "blue"
   */
  accent?: Accent;
  /**
   * The font family of action components, mostly buttons: `"Open Sans"` or
   * `"Amplitude"`. Inside another `SaltProvider`, it defaults to the parent's
   * `actionFont`.
   * @default "Open Sans"
   */
  actionFont?: ActionFont;
  /**
   * The content that the theme applies to. When `applyClassesTo` is `"child"`, it must be a single element, which the theme classes and attributes are added to.
   */
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
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "Multiple providers targeting the same window. There can be only one level root level SaltProvider per window.",
        );
      }
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
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `\nSaltProvider can only apply CSS classes for theming to a single nested child element of the SaltProvider.
        Either wrap elements with a single container or consider removing the applyClassesToChild prop, in which case a
        div element will wrap your child elements`,
      );
    }
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
