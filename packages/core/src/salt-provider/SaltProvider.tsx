import {
  StyleInjectionProvider,
  useComponentCssInjection,
} from "@salt-ds/styles";
import { useWindow, type WindowContextType } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  createContext,
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
  Corner,
  Density,
  HeadingFont,
  Mode,
  ThemeName,
} from "../theme";
import { ViewportProvider } from "../viewport";
import { ProviderContext } from "./ProviderContext";
import saltProviderCss from "./SaltProvider.css";
import { ThemeApplicator, type ThemeApplicatorProps } from "./ThemeApplicator";

export const DEFAULT_DENSITY = "medium";

const DEFAULT_THEME_NAME = "salt-theme";
const DEFAULT_THEME_NAME_NEXT = "salt-theme-next";

const DEFAULT_MODE = "light";
const DEFAULT_CORNER: Corner = "sharp";
const DEFAULT_HEADING_FONT: HeadingFont = "Open Sans";
const DEFAULT_ACCENT: Accent = "blue";
const DEFAULT_ACTION_FONT: ActionFont = "Open Sans";
export interface ThemeContextProps {
  theme: ThemeName;
  mode: Mode;
  window?: WindowContextType;
  /** Only available when using SaltProviderNext. */
  themeNext: boolean;
  corner: Corner;
  /** @deprecated use `corner`*/
  UNSTABLE_corner: Corner;
  headingFont: HeadingFont;
  /** @deprecated use `headingFont` */
  UNSTABLE_headingFont: HeadingFont;
  accent: Accent;
  /** @deprecated use `accent` */
  UNSTABLE_accent: Accent;
  actionFont: ActionFont;
  /** @deprecated use `actionFont` */
  UNSTABLE_actionFont: ActionFont;
}

export const DensityContext = createContext<Density>(DEFAULT_DENSITY);

export const ThemeContext = createContext<ThemeContextProps>({
  theme: "",
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

type ThemeNextOnlyAttributes =
  | "accent"
  | "corner"
  | "actionFont"
  | "headingFont";

interface SaltProviderBaseProps
  extends Partial<
    Omit<ThemeApplicatorProps, "children" | ThemeNextOnlyAttributes>
  > {
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
}: Omit<
  SaltProviderProps & {
    themeNext?: boolean;
  } & SaltProviderNextProps,
  "enableStyleInjection"
>) {
  const prevProvider = useContext(ProviderContext);
  const inheritedDensity = useContext(DensityContext);
  const {
    theme: inheritedTheme,
    mode: inheritedMode,
    corner: inheritedCorner,
    headingFont: inheritedHeadingFont,
    accent: inheritedAccent,
    actionFont: inheritedActionFont,
  } = useContext(ThemeContext);

  const isRootProvider = prevProvider === null;

  const density = densityProp ?? inheritedDensity ?? DEFAULT_DENSITY;
  const inheritedThemeName =
    inheritedTheme === "" ? DEFAULT_THEME_NAME : inheritedTheme;
  const themeName = themeProp ?? inheritedThemeName;
  const mode = modeProp ?? inheritedMode;
  const breakpoints = breakpointsProp ?? DEFAULT_BREAKPOINTS;

  const corner = cornerProp ?? inheritedCorner ?? DEFAULT_CORNER;
  const headingFont =
    headingFontProp ?? inheritedHeadingFont ?? DEFAULT_HEADING_FONT;
  const accent = accentProp ?? inheritedAccent ?? DEFAULT_ACCENT;
  const actionFont =
    actionFontProp ?? inheritedActionFont ?? DEFAULT_ACTION_FONT;

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
      corner: corner,
      headingFont: headingFont,
      accent: accent,
      actionFont: actionFont,
      // Backward compatibility
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
    ],
  );

  const matchedBreakpoints = useMatchedBreakpoints(breakpoints);

  const saltProvider = (
    <ProviderContext.Provider value={{ targetWindow }}>
      <DensityContext.Provider value={density}>
        <ThemeContext.Provider value={themeContextValue}>
          <BreakpointProvider matchedBreakpoints={matchedBreakpoints}>
            <BreakpointContext.Provider value={breakpoints}>
              <ViewportProvider>
                <ThemeApplicator
                  applyClassesTo={
                    applyClassesToProp ?? (isRootProvider ? "root" : "scope")
                  }
                  density={density}
                  theme={clsx(
                    DEFAULT_THEME_NAME,
                    { [DEFAULT_THEME_NAME_NEXT]: themeNext },
                    themeProp,
                  )}
                  mode={mode}
                  accent={themeNext ? accent : undefined}
                  actionFont={themeNext ? actionFont : undefined}
                  headingFont={themeNext ? headingFont : undefined}
                  corner={themeNext ? corner : undefined}
                >
                  {children}
                </ThemeApplicator>
              </ViewportProvider>
            </BreakpointContext.Provider>
          </BreakpointProvider>
        </ThemeContext.Provider>
      </DensityContext.Provider>
    </ProviderContext.Provider>
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

export type SaltProviderNextProps = SaltProviderProps &
  Pick<ThemeApplicatorProps, ThemeNextOnlyAttributes>;
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

/** @deprecated use `SaltProviderNextProps` */
export type UNSTABLE_SaltProviderNextProps = SaltProviderNextProps;

/** @deprecated use `SaltProviderNext` */
export const UNSTABLE_SaltProviderNext = SaltProviderNext;

export const useTheme = (): ThemeContextProps => {
  const { window: _window, ...contextWithoutWindow } = useContext(ThemeContext);

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
