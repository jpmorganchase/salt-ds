import {
  StyleInjectionProvider,
  useComponentCssInjection,
} from "@salt-ds/styles";
import { useWindow, type WindowContextType } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  cloneElement,
  createContext,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useContext,
  useMemo,
} from "react";
import { AriaAnnouncerProvider } from "../aria-announcer";
import {
  BreakpointProvider,
  type Breakpoints,
  DEFAULT_BREAKPOINTS,
  useMatchedBreakpoints,
} from "../breakpoints";
import type {
  Accent,
  ActionFont,
  BrandName,
  Corner,
  Density,
  HeadingFont,
  Mode,
  ThemeName,
} from "../theme";
import { useIsomorphicLayoutEffect } from "../utils/useIsomorphicLayoutEffect";
import { ViewportProvider } from "../viewport";
import saltProviderCss from "./SaltProvider.css";

export const DEFAULT_DENSITY = "medium";

const DEFAULT_THEME_NAME = "salt-theme";
const DEFAULT_THEME_NAME_NEXT = "salt-theme-next";

const DEFAULT_MODE = "light";
const DEFAULT_BRAND = "legacy";
const DEFAULT_CORNER: Corner = "sharp";
const DEFAULT_HEADING_FONT: HeadingFont = "Open Sans";
const DEFAULT_ACCENT: Accent = "blue";
const DEFAULT_ACTION_FONT: ActionFont = "Open Sans";
export interface ThemeContextProps {
  brand?: BrandName;
  theme: ThemeName;
  mode: Mode;
  window?: WindowContextType;
  /** Only available when using SaltProviderNext. */
  /** @deprecated use `brand` for desired styling */
  themeNext: boolean;
  /** @deprecated use `brand` for desired styling */
  corner?: Corner;
  /** @deprecated use `corner`*/
  UNSTABLE_corner?: Corner;
  /** @deprecated use `brand` for desired styling */
  headingFont?: HeadingFont;
  /** @deprecated use `headingFont` */
  UNSTABLE_headingFont?: HeadingFont;
  /** @deprecated use `brand` for desired styling */
  accent?: Accent;
  /** @deprecated use `accent` */
  UNSTABLE_accent?: Accent;
  /** @deprecated use `brand` for desired styling */
  actionFont?: ActionFont;
  /** @deprecated use `actionFont` */
  UNSTABLE_actionFont?: ActionFont;
}

export const DensityContext = createContext<Density>(DEFAULT_DENSITY);

export const ThemeContext = createContext<ThemeContextProps>({
  theme: "",
  brand: DEFAULT_BRAND,
  mode: DEFAULT_MODE,
  themeNext: false,
  corner: DEFAULT_CORNER,
  UNSTABLE_corner: DEFAULT_CORNER,
  headingFont: DEFAULT_HEADING_FONT,
  UNSTABLE_headingFont: DEFAULT_HEADING_FONT,
  accent: DEFAULT_ACCENT,
  UNSTABLE_accent: DEFAULT_ACCENT,
  actionFont: DEFAULT_ACTION_FONT,
  UNSTABLE_actionFont: DEFAULT_ACTION_FONT,
});

export const BreakpointContext =
  createContext<Breakpoints>(DEFAULT_BREAKPOINTS);

/**
 * We're relying `DEFAULT_THEME_NAME` to determine whether the provider is a root.
 */
const getThemeNames = (
  themeName: ThemeName,
  themeNext?: boolean,
): ThemeName => {
  if (themeNext) {
    /* We still apply salt-theme-next for backwards compatibility for accent, heading/action font, and corner data attributes */
    return themeName === DEFAULT_THEME_NAME
      ? clsx(DEFAULT_THEME_NAME, DEFAULT_THEME_NAME_NEXT)
      : clsx(DEFAULT_THEME_NAME, DEFAULT_THEME_NAME_NEXT, themeName);
  }
  return themeName === DEFAULT_THEME_NAME
    ? themeName
    : clsx(DEFAULT_THEME_NAME, themeName);
};

interface ThemeNextProps {
  themeNext?: boolean;
}

const createThemedChildren = ({
  brand,
  children,
  themeName,
  density,
  mode,
  applyClassesTo,
  themeNext,
  corner,
  headingFont,
  accent,
  actionFont,
  applyThemeNextProps,
}: {
  brand?: BrandName;
  children: ReactNode;
  themeName: ThemeName;
  density: Density;
  mode: Mode;
  applyClassesTo?: TargetElement;
  applyThemeNextProps?: boolean;
} & ThemeNextProps &
  SaltProviderNextAdditionalProps) => {
  const themeNamesString = getThemeNames(themeName, themeNext);
  const themeNextProps = {
    "data-corner": corner,
    "data-heading-font": headingFont,
    "data-accent": accent,
    "data-action-font": actionFont,
  };

  if (applyClassesTo === "root") {
    return children;
  }
  if (applyClassesTo === "child") {
    if (isValidElement<HTMLAttributes<HTMLElement>>(children)) {
      return cloneElement(children, {
        className: clsx(
          children.props?.className,
          themeNamesString,
          `salt-density-${density}`,
        ),
        // @ts-ignore
        "data-brand": brand,
        "data-mode": mode,
        ...(applyThemeNextProps ? themeNextProps : {}),
      });
    }
    console.warn(
      `\nSaltProvider can only apply CSS classes for theming to a single nested child element of the SaltProvider.
        Either wrap elements with a single container or consider removing the applyClassesToChild prop, in which case a
        div element will wrap your child elements`,
    );
    return children;
  }
  return (
    <div
      className={clsx(
        "salt-provider",
        themeNamesString,
        `salt-density-${density}`,
      )}
      data-brand={brand}
      data-mode={mode}
      {...(applyThemeNextProps ? themeNextProps : {})}
    >
      {children}
    </div>
  );
};

type TargetElement = "root" | "scope" | "child";

interface SaltProviderBaseProps {
  /**
   * Either "root", "scope" or "child".
   * Specifies the location of salt theme class and attributes should be applied to.
   *
   * Defaults to "root" for a root provider, otherwise "scope".
   */
  applyClassesTo?: TargetElement;
  /**
   * Either "high", "medium", "low" or "touch".
   * Determines the amount of content that can fit on a screen based on the size and spacing of components.
   * Refer to [density](https://www.saltdesignsystem.com/salt/foundations/density) doc for more detail.
   *
   * @default "medium"
   */
  density?: Density;
  /**
   * A string. Specifies custom theme name(s) you want to apply, similar to `className`.
   */
  theme?: ThemeName;
  /**
   * Either "legacy", "commercial", or "consumer".
   * Specifies branding to be used for the theme.
   */
  brand?: BrandName;
  /**
   * Either "light" or "dark". Enable the color palette to change from light to dark.
   * Refer to [modes](https://www.saltdesignsystem.com/salt/foundations/modes) doc for more detail.
   *
   * @default "light"
   */
  mode?: Mode;
  /**
   * Shape of `{ xs: number; sm: number; md: number; lg: number; xl: number; }`.
   * Determines breakpoints used in responsive calculation for layout components.
   */
  breakpoints?: Breakpoints;
  /**
   * A boolean. Enables dynamic style injection for each component.
   *
   * If `false`, you'll need to include component CSS yourself.
   *
   * @default true
   */
  enableStyleInjection?: boolean;
}

interface SaltProviderThatAppliesClassesToChild extends SaltProviderBaseProps {
  children: ReactElement;
  applyClassesTo: "child";
}

interface SaltProviderThatInjectsThemeElement extends SaltProviderBaseProps {
  children: ReactNode;
}

interface SaltProviderThatClassesToRoot
  extends SaltProviderThatInjectsThemeElement {
  applyClassesTo: "root";
}

type SaltProviderProps =
  | SaltProviderThatAppliesClassesToChild
  | SaltProviderThatInjectsThemeElement
  | SaltProviderThatClassesToRoot;

function InternalSaltProvider({
  applyClassesTo: applyClassesToProp,
  children,
  density: densityProp,
  theme: themeProp,
  mode: modeProp,
  breakpoints: breakpointsProp,
  themeNext,
  corner: cornerProp,
  headingFont: headingFontProp,
  accent: accentProp,
  actionFont: actionFontProp,
  brand: brandProp,
}: Omit<
  SaltProviderProps & ThemeNextProps & SaltProviderNextProps,
  "enableStyleInjection"
>) {
  const inheritedDensity = useContext(DensityContext);
  const {
    brand: inheritedBrand,
    theme: inheritedTheme,
    mode: inheritedMode,
    window: inheritedWindow,
    corner: inheritedCorner,
    headingFont: inheritedHeadingFont,
    accent: inheritedAccent,
    actionFont: inheritedActionFont,
  } = useContext(ThemeContext);

  const isRootProvider = inheritedTheme === undefined || inheritedTheme === "";
  const density = densityProp ?? inheritedDensity ?? DEFAULT_DENSITY;
  const themeName =
    themeProp ?? (inheritedTheme === "" ? DEFAULT_THEME_NAME : inheritedTheme);
  const brand = brandProp ?? inheritedBrand ?? DEFAULT_BRAND;
  const mode = modeProp ?? inheritedMode;
  const breakpoints = breakpointsProp ?? DEFAULT_BREAKPOINTS;

  const corner = cornerProp ?? inheritedCorner ?? DEFAULT_CORNER;
  const headingFont =
    headingFontProp ?? inheritedHeadingFont ?? DEFAULT_HEADING_FONT;
  const accent = accentProp ?? inheritedAccent ?? DEFAULT_ACCENT;
  const actionFont =
    actionFontProp ?? inheritedActionFont ?? DEFAULT_ACTION_FONT;

  const applyClassesTo =
    applyClassesToProp ?? (isRootProvider ? "root" : "scope");

  /* If brand prop is provided as something other than legacy (default), don't apply the deprecated themeNextProps */
  const applyThemeNextProps = themeNext && brand === "legacy";

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-provider",
    css: saltProviderCss,
    window: targetWindow,
  });

  const themeContextValue = useMemo(
    () => ({
      brand,
      theme: themeName,
      mode,
      window: targetWindow,
      // Backwards compatibility
      accent: accent,
      actionFont: actionFont,
      corner: corner,
      headingFont: headingFont,
      themeNext: Boolean(themeNext),
      UNSTABLE_corner: corner,
      UNSTABLE_headingFont: headingFont,
      UNSTABLE_accent: accent,
      UNSTABLE_actionFont: actionFont,
    }),
    [
      brand,
      themeName,
      mode,
      targetWindow,
      accent,
      actionFont,
      corner,
      headingFont,
      themeNext,
    ],
  );

  const themedChildren = createThemedChildren({
    brand,
    children,
    themeName,
    density,
    mode,
    applyClassesTo,
    themeNext,
    corner,
    headingFont,
    accent,
    actionFont,
    applyThemeNextProps,
  });

  useIsomorphicLayoutEffect(() => {
    const themeNamesString = getThemeNames(themeName, themeNext);
    const themeNames = themeNamesString.split(" ");

    if (applyClassesTo === "root" && targetWindow) {
      if (inheritedWindow !== targetWindow) {
        // add the styles we want to apply
        targetWindow.document.documentElement.classList.add(
          ...themeNames,
          `salt-density-${density}`,
        );
        targetWindow.document.documentElement.dataset.brand = brand;
        targetWindow.document.documentElement.dataset.mode = mode;
        if (themeNext && applyThemeNextProps) {
          targetWindow.document.documentElement.dataset.corner = corner;
          targetWindow.document.documentElement.dataset.headingFont =
            headingFont;
          targetWindow.document.documentElement.dataset.accent = accent;
          targetWindow.document.documentElement.dataset.actionFont = actionFont;
        }
      } else {
        console.warn(
          "SaltProvider can only apply CSS classes to the root if it is the root level SaltProvider.",
        );
      }
    }
    return () => {
      if (applyClassesTo === "root" && targetWindow) {
        // When unmounting/remounting, remove the applied styles from the root
        targetWindow.document.documentElement.classList.remove(
          ...themeNames,
          `salt-density-${density}`,
        );
        targetWindow.document.documentElement.dataset.mode = undefined;
        targetWindow.document.documentElement.dataset.brand = undefined;
        if (themeNext && applyThemeNextProps) {
          delete targetWindow.document.documentElement.dataset.corner;
          delete targetWindow.document.documentElement.dataset.headingFont;
          delete targetWindow.document.documentElement.dataset.accent;
          delete targetWindow.document.documentElement.dataset.actionFont;
        }
      }
    };
  }, [
    applyClassesTo,
    brand,
    density,
    mode,
    themeName,
    targetWindow,
    inheritedWindow,
    themeNext,
    corner,
    headingFont,
    accent,
    actionFont,
    applyThemeNextProps,
  ]);

  const matchedBreakpoints = useMatchedBreakpoints(breakpoints);

  const saltProvider = (
    <DensityContext.Provider value={density}>
      <ThemeContext.Provider value={themeContextValue}>
        <BreakpointProvider matchedBreakpoints={matchedBreakpoints}>
          <BreakpointContext.Provider value={breakpoints}>
            <ViewportProvider>{themedChildren}</ViewportProvider>
          </BreakpointContext.Provider>
        </BreakpointProvider>
      </ThemeContext.Provider>
    </DensityContext.Provider>
  );

  if (isRootProvider) {
    return <AriaAnnouncerProvider>{saltProvider}</AriaAnnouncerProvider>;
  }
  return saltProvider;
}

export function SaltProvider({
  enableStyleInjection,
  ...restProps
}: SaltProviderProps) {
  return (
    <StyleInjectionProvider value={enableStyleInjection}>
      <InternalSaltProvider {...restProps} />
    </StyleInjectionProvider>
  );
}

interface SaltProviderNextAdditionalProps {
  /**
   * Either "blue" or "teal".
   * Determines accent color used across components, e.g. Accent Button, List, Calendar.
   * Will not take effect if `brand` prop is provided
   * @default "blue"
   */
  accent?: Accent;
  /**
   * Either "Open Sans" or "Amplitude".
   * Determines font family of action components, mostly Buttons.
   * Will not take effect if `brand` prop is provided
   * @default "Open Sans"
   */
  actionFont?: ActionFont;
  /**
   * Either "sharp" or "rounded".
   * Determines selected components corner radius.
   * Will not take effect if `brand` prop is provided
   * @default "sharp"
   */
  corner?: Corner;
  /**
   * Either "Open Sans" or "Amplitude".
   * Determines font family of display and heading text.
   * Will not take effect if `brand` prop is provided
   * @default "Open Sans"
   */
  headingFont?: HeadingFont;
}

export type SaltProviderNextProps = SaltProviderProps &
  SaltProviderNextAdditionalProps;
/** @deprecated use `SaltProviderNextProps` */
export type UNSTABLE_SaltProviderNextProps = SaltProviderNextProps;

export function SaltProviderNext({
  enableStyleInjection,
  ...restProps
}: SaltProviderNextProps) {
  return (
    <StyleInjectionProvider value={enableStyleInjection}>
      {/* Leveraging InternalSaltProvider being not exported, so we can pass more props than previously supported */}
      <InternalSaltProvider {...restProps} themeNext={true} />
    </StyleInjectionProvider>
  );
}
/** @deprecated use `SaltProvider` with appropriate `brand` prop */
export const UNSTABLE_SaltProviderNext = SaltProviderNext;

export const useTheme = (): ThemeContextProps => {
  const { window, ...contextWithoutWindow } = useContext(ThemeContext);

  return contextWithoutWindow;
};

/**
 * `useDensity` merges density value from `DensityContext` with the one from component's props.
 */
export function useDensity(density?: Density): Density {
  const densityFromContext = useContext(DensityContext);
  return density ?? densityFromContext ?? DEFAULT_DENSITY;
}

export const useBreakpoints = (): Breakpoints => {
  return useContext(BreakpointContext);
};
