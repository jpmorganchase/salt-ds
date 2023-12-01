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
import { Breakpoints, DEFAULT_BREAKPOINTS } from "../breakpoints";
import { Density, Mode, ThemeName } from "../theme";
import { ViewportProvider } from "../viewport";
import { useIsomorphicLayoutEffect } from "../utils";

import saltProviderCss from "./SaltProvider.css";
import { useWindow } from "@salt-ds/window";
import {
  useComponentCssInjection,
  StyleInjectionProvider,
} from "@salt-ds/styles";

export const DEFAULT_DENSITY = "medium";

const DEFAULT_THEME_NAME = "salt-theme";

const DEFAULT_MODE = "light";

export interface ThemeContextProps {
  theme: ThemeName;
  mode: Mode;
}

export const DensityContext = createContext<Density>(DEFAULT_DENSITY);

export const ThemeContext = createContext<ThemeContextProps>({
  theme: "",
  mode: DEFAULT_MODE,
});

export const BreakpointContext =
  createContext<Breakpoints>(DEFAULT_BREAKPOINTS);

const getThemeNames = (themeName: ThemeName): string[] => {
  return themeName === DEFAULT_THEME_NAME
    ? [DEFAULT_THEME_NAME]
    : typeof themeName === "string"
    ? [DEFAULT_THEME_NAME, themeName]
    : [DEFAULT_THEME_NAME, ...themeName];
};

const createThemedChildren = (
  children: ReactNode,
  themeName: ThemeName,
  density: Density,
  mode: Mode,
  applyClassesTo?: TargetElement
) => {
  const themeNames = getThemeNames(themeName);

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
}: SaltProviderProps) {
  const inheritedDensity = useContext(DensityContext);
  const { theme: inheritedThemes, mode: inheritedMode } = useTheme();

  const isRoot = inheritedThemes === undefined || inheritedThemes === "";
  const density = densityProp ?? inheritedDensity ?? DEFAULT_DENSITY;
  const themeName =
    themeProp ??
    (inheritedThemes === "" ? DEFAULT_THEME_NAME : inheritedThemes);
  const mode = modeProp ?? inheritedMode;
  const breakpoints = breakpointsProp ?? DEFAULT_BREAKPOINTS;

  const applyClassesTo = applyClassesToProp ?? (isRoot ? "root" : "scope");

  const themeContextValue = useMemo(
    () => ({ theme: themeName, mode }),
    [themeName, mode]
  );

  const themedChildren = createThemedChildren(
    children,
    themeName,
    density,
    mode,
    applyClassesTo
  );

  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-provider",
    css: saltProviderCss,
    window: targetWindow,
  });

  useIsomorphicLayoutEffect(() => {
    const themeNames = getThemeNames(themeName);
    if (applyClassesTo === "root" && targetWindow) {
      if (isRoot) {
        // add the styles we want to apply
        targetWindow.document.documentElement.classList.add(
          ...themeNames,
          `salt-density-${density}`
        );
        targetWindow.document.documentElement.dataset.mode = mode;
      } else {
        console.warn(
          "\nSaltProvider can only apply CSS classes to the root if it is the root level SaltProvider."
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
      }
    };
  }, [applyClassesTo, density, isRoot, mode, themeName, targetWindow]);

  const saltProvider = (
    <DensityContext.Provider value={density}>
      <ThemeContext.Provider value={themeContextValue}>
        <BreakpointContext.Provider value={breakpoints}>
          <ViewportProvider>{themedChildren}</ViewportProvider>
        </BreakpointContext.Provider>
      </ThemeContext.Provider>
    </DensityContext.Provider>
  );

  if (isRoot) {
    return <AriaAnnouncerProvider>{saltProvider}</AriaAnnouncerProvider>;
  } else {
    return saltProvider;
  }
}

export function SaltProvider({
  enableStyleInjection = true,
  ...restProps
}: SaltProviderProps) {
  return (
    <StyleInjectionProvider value={enableStyleInjection}>
      <InternalSaltProvider {...restProps} />
    </StyleInjectionProvider>
  );
}

export const useTheme = (): ThemeContextProps => {
  return useContext(ThemeContext);
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
