import { clsx } from "clsx";
import React, {
  createContext,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
} from "react";
import { AriaAnnouncerProvider } from "../aria-announcer";
import {
  Breakpoints,
  DEFAULT_BREAKPOINTS,
  BreakpointProvider,
  useMatchedBreakpoints,
} from "../breakpoints";
import { Density, Mode, ThemeName, UNSTABLE_ActionFont } from "../theme";
import { ViewportProvider } from "../viewport";
import { useIsomorphicLayoutEffect } from "../utils";

import saltProviderCss from "./SaltProvider.css";
import { useWindow, WindowContextType } from "@salt-ds/window";
import {
  useComponentCssInjection,
  StyleInjectionProvider,
} from "@salt-ds/styles";
import { UNSTABLE_Corner } from "../theme/Corner";
import { UNSTABLE_HeadingFont } from "../theme/HeadingFont";
import { UNSTABLE_Accent } from "../theme/Accent";

export const DEFAULT_DENSITY = "medium";

const DEFAULT_THEME_NAME = "salt-theme";
const UNSTABLE_ADDITIONAL_THEME_NAME = "salt-theme-next";

const DEFAULT_MODE = "light";
const DEFAULT_CORNER: UNSTABLE_Corner = "sharp";
const DEFAULT_HEADING_FONT: UNSTABLE_HeadingFont = "Open Sans";
const DEFAULT_ACCENT: UNSTABLE_Accent = "blue";
const DEFAULT_ACTION_FONT: UNSTABLE_ActionFont = "Open Sans";
export interface ThemeContextProps {
  theme: ThemeName;
  mode: Mode;
  window?: WindowContextType;
  /** Only available when using SaltProviderNext. */
  themeNext: boolean;
  UNSTABLE_corner: UNSTABLE_Corner;
  UNSTABLE_headingFont: UNSTABLE_HeadingFont;
  UNSTABLE_accent: UNSTABLE_Accent;
  UNSTABLE_actionFont: UNSTABLE_ActionFont;
}

export const DensityContext = createContext<Density>(DEFAULT_DENSITY);

export const ThemeContext = createContext<ThemeContextProps>({
  theme: "",
  mode: DEFAULT_MODE,
  themeNext: false,
  UNSTABLE_corner: DEFAULT_CORNER,
  UNSTABLE_headingFont: DEFAULT_HEADING_FONT,
  UNSTABLE_accent: DEFAULT_ACCENT,
  UNSTABLE_actionFont: DEFAULT_ACTION_FONT,
});

export const BreakpointContext =
  createContext<Breakpoints>(DEFAULT_BREAKPOINTS);

/**
 * We're relying `DEFAULT_THEME_NAME` to determine whether the provider is a root.
 */
const getThemeNames = (themeName: ThemeName, themeNext?: boolean) => {
  if (themeNext) {
    return themeName === DEFAULT_THEME_NAME
      ? [DEFAULT_THEME_NAME, UNSTABLE_ADDITIONAL_THEME_NAME]
      : [DEFAULT_THEME_NAME, UNSTABLE_ADDITIONAL_THEME_NAME, themeName];
  } else {
    {
      return themeName === DEFAULT_THEME_NAME
        ? [DEFAULT_THEME_NAME]
        : [DEFAULT_THEME_NAME, themeName];
    }
  }
};

interface ThemeNextProps {
  themeNext?: boolean;
}

const createThemedChildren = ({
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
}: {
  children: ReactNode;
  themeName: ThemeName;
  density: Density;
  mode: Mode;
  applyClassesTo?: TargetElement;
} & ThemeNextProps &
  UNSTABLE_SaltProviderNextAdditionalProps) => {
  const themeNames = getThemeNames(themeName, themeNext);
  const themeNextProps = {
    "data-corner": corner,
    "data-heading-font": headingFont,
    "data-accent": accent,
    "data-action-font": actionFont,
  };
  if (applyClassesTo === "root") {
    return children;
  } else if (applyClassesTo === "child") {
    if (React.isValidElement<HTMLAttributes<HTMLElement>>(children)) {
      return React.cloneElement(children, {
        className: clsx(
          children.props?.className,
          ...themeNames,
          `salt-density-${density}`
        ),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "data-mode": mode,
        ...(themeNext ? themeNextProps : {}),
      });
    } else {
      console.warn(
        `\nSaltProvider can only apply CSS classes for theming to a single nested child element of the SaltProvider.
        Either wrap elements with a single container or consider removing the applyClassesToChild prop, in which case a
        div element will wrap your child elements`
      );
      return children;
    }
  } else {
    return (
      <div
        className={clsx(
          `salt-provider`,
          ...themeNames,
          `salt-density-${density}`
        )}
        data-mode={mode}
        {...(themeNext ? themeNextProps : {})}
      >
        {children}
      </div>
    );
  }
};

type TargetElement = "root" | "scope" | "child";

interface SaltProviderBaseProps {
  applyClassesTo?: TargetElement;
  density?: Density;
  theme?: ThemeName;
  mode?: Mode;
  breakpoints?: Breakpoints;
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
}: Omit<
  SaltProviderProps & ThemeNextProps & UNSTABLE_SaltProviderNextProps,
  "enableStyleInjection"
>) {
  const inheritedDensity = useContext(DensityContext);
  const {
    theme: inheritedTheme,
    mode: inheritedMode,
    window: inheritedWindow,
    UNSTABLE_corner: inheritedCorner,
    UNSTABLE_headingFont: inheritedHeadingFont,
    UNSTABLE_accent: inheritedAccent,
    UNSTABLE_actionFont: inheritedActionFont,
  } = useContext(ThemeContext);

  const isRootProvider = inheritedTheme === undefined || inheritedTheme === "";
  const density = densityProp ?? inheritedDensity ?? DEFAULT_DENSITY;
  const themeName =
    themeProp ?? (inheritedTheme === "" ? DEFAULT_THEME_NAME : inheritedTheme);
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

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-provider",
    css: saltProviderCss,
    window: targetWindow,
  });

  const themeContextValue = useMemo(
    () => ({
      theme: themeName,
      mode,
      window: targetWindow,
      themeNext: Boolean(themeNext),
      UNSTABLE_corner: corner,
      UNSTABLE_headingFont: headingFont,
      UNSTABLE_accent: accent,
      UNSTABLE_actionFont: actionFont,
    }),
    [
      themeName,
      mode,
      targetWindow,
      themeNext,
      corner,
      headingFont,
      accent,
      actionFont,
    ]
  );

  const themedChildren = createThemedChildren({
    children,
    themeName,
    density,
    mode,
    applyClassesTo,
    themeNext,
    corner: corner,
    headingFont,
    accent,
    actionFont,
  });

  useIsomorphicLayoutEffect(() => {
    const themeNames = getThemeNames(themeName, themeNext);

    if (applyClassesTo === "root" && targetWindow) {
      if (inheritedWindow != targetWindow) {
        // add the styles we want to apply
        targetWindow.document.documentElement.classList.add(
          ...themeNames,
          `salt-density-${density}`
        );
        targetWindow.document.documentElement.dataset.mode = mode;
        if (themeNext) {
          targetWindow.document.documentElement.dataset.corner = corner;
          targetWindow.document.documentElement.dataset.headingFont =
            headingFont;
          targetWindow.document.documentElement.dataset.accent = accent;
          targetWindow.document.documentElement.dataset.actionFont = actionFont;
        }
      } else {
        console.warn(
          "SaltProvider can only apply CSS classes to the root if it is the root level SaltProvider."
        );
      }
    }
    return () => {
      if (applyClassesTo === "root" && targetWindow) {
        // When unmounting/remounting, remove the applied styles from the root
        targetWindow.document.documentElement.classList.remove(
          ...themeNames,
          `salt-density-${density}`
        );
        targetWindow.document.documentElement.dataset.mode = undefined;
        if (themeNext) {
          delete targetWindow.document.documentElement.dataset.corner;
          delete targetWindow.document.documentElement.dataset.headingFont;
          delete targetWindow.document.documentElement.dataset.accent;
          delete targetWindow.document.documentElement.dataset.actionFont;
        }
      }
    };
  }, [
    applyClassesTo,
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
  } else {
    return saltProvider;
  }
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

interface UNSTABLE_SaltProviderNextAdditionalProps {
  corner?: UNSTABLE_Corner;
  headingFont?: UNSTABLE_HeadingFont;
  accent?: UNSTABLE_Accent;
  actionFont?: UNSTABLE_ActionFont;
}

export type UNSTABLE_SaltProviderNextProps = SaltProviderProps &
  UNSTABLE_SaltProviderNextAdditionalProps;

export function UNSTABLE_SaltProviderNext({
  enableStyleInjection,
  ...restProps
}: UNSTABLE_SaltProviderNextProps) {
  return (
    <StyleInjectionProvider value={enableStyleInjection}>
      {/* Leveraging InternalSaltProvider being not exported, so we can pass more props than previously supported */}
      <InternalSaltProvider {...restProps} themeNext={true} />
    </StyleInjectionProvider>
  );
}

export const useTheme = (): ThemeContextProps => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
