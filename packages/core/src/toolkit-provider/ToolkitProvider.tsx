import cx from "classnames";
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
import { Density } from "../theme";
import { ViewportProvider } from "../viewport";
import { useIsomorphicLayoutEffect } from "../utils";

export const DEFAULT_DENSITY = "medium";

const DEFAULT_THEME_NAME = "uitk-theme";

const DEFAULT_MODE = "light";

export interface ThemeContextProps {
  theme: ThemeNameType;
  mode: ThemeMode;
}

export const DensityContext = createContext<Density>(DEFAULT_DENSITY);

export const ThemeContext = createContext<ThemeContextProps>({
  theme: "",
  mode: DEFAULT_MODE,
});

export const BreakpointContext =
  createContext<Breakpoints>(DEFAULT_BREAKPOINTS);

const createThemedChildren = (
  children: ReactNode,
  themeName: string,
  density: Density,
  mode: string,
  applyClassesTo?: TargetElement
) => {
  const themeNames =
    themeName === DEFAULT_THEME_NAME
      ? [DEFAULT_THEME_NAME]
      : [DEFAULT_THEME_NAME, themeName];
  if (applyClassesTo === "root") {
    return children;
  } else if (applyClassesTo === "child") {
    if (React.isValidElement<HTMLAttributes<HTMLElement>>(children)) {
      return React.cloneElement(children, {
        className: cx(
          children.props?.className,
          ...themeNames,
          `uitk-density-${density}`
        ),
        // @ts-ignore
        "data-mode": mode,
      });
    } else {
      console.warn(
        `\nToolkitProvider can only apply CSS classes for theming to a single nested child element of the ToolkitProvider.
        Either wrap elements with a single container or consider removing the applyClassesToChild prop, in which case a
        div element will wrap your child elements`
      );
      return children;
    }
  } else {
    return (
      <div
        className={cx(
          `uitk-provider`,
          ...themeNames,
          `uitk-density-${density}`
        )}
        data-mode={mode}
      >
        {children}
      </div>
    );
  }
};

type ThemeNameType = string;

type ThemeMode = "light" | "dark";

type TargetElement = "root" | "child";

type ToolkitProviderBaseProps = {
  applyClassesTo?: TargetElement;
  density?: Density;
  theme?: ThemeNameType;
  mode?: ThemeMode;
  breakpoints?: Breakpoints;
};

interface ToolkitProviderThatAppliesClassesToChild
  extends ToolkitProviderBaseProps {
  children: ReactElement;
  applyClassesTo: "child";
}

interface ToolkitProviderThatInjectsThemeElement
  extends ToolkitProviderBaseProps {
  children: ReactNode;
}

interface ToolkitProviderThatClassesToRoot
  extends ToolkitProviderThatInjectsThemeElement {
  applyClassesTo: "root";
}

type ToolkitProviderProps =
  | ToolkitProviderThatAppliesClassesToChild
  | ToolkitProviderThatInjectsThemeElement
  | ToolkitProviderThatClassesToRoot;

export function ToolkitProvider({
  applyClassesTo,
  children,
  density: densityProp,
  theme: themesProp,
  mode: modeProp,
  breakpoints: breakpointsProp,
}: ToolkitProviderProps) {
  const inheritedDensity = useContext(DensityContext);
  const inheritedThemes = useTheme();
  const inheritedMode = useMode();

  const isRoot = inheritedThemes === undefined || inheritedThemes === "";
  const density = densityProp ?? inheritedDensity ?? DEFAULT_DENSITY;
  const themeName =
    themesProp ??
    (inheritedThemes === "" ? DEFAULT_THEME_NAME : inheritedThemes);
  const mode = modeProp ?? inheritedMode;
  const breakpoints = breakpointsProp ?? DEFAULT_BREAKPOINTS;

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

  useIsomorphicLayoutEffect(() => {
    const themeNames =
      themeName === DEFAULT_THEME_NAME
        ? [DEFAULT_THEME_NAME]
        : [DEFAULT_THEME_NAME, themeName];
    if (applyClassesTo === "root") {
      if (isRoot) {
        // add the styles we want to apply
        document.documentElement.classList.add(
          ...themeNames,
          `uitk-density-${density}`
        );
        document.documentElement.dataset.mode = mode;
      } else {
        console.warn(
          "\nToolkitProvider can only apply CSS classes to the root if it is the root level ToolkitProvider."
        );
      }
    }
    return () => {
      if (applyClassesTo === "root") {
        // When unmounting/remounting, remove the applied styles from the root
        document.documentElement.classList.remove(
          ...themeNames,
          `uitk-density-${density}`
        );
        document.documentElement.dataset.mode = undefined;
      }
    };
  }, [applyClassesTo, density, isRoot, mode, themeName]);

  const toolkitProvider = (
    <DensityContext.Provider value={density}>
      <ThemeContext.Provider value={themeContextValue}>
        <BreakpointContext.Provider value={breakpoints}>
          <ViewportProvider>{themedChildren}</ViewportProvider>
        </BreakpointContext.Provider>
      </ThemeContext.Provider>
    </DensityContext.Provider>
  );

  if (isRoot) {
    return <AriaAnnouncerProvider>{toolkitProvider}</AriaAnnouncerProvider>;
  } else {
    return toolkitProvider;
  }
}

export const useTheme = (): ThemeNameType => {
  return useContext(ThemeContext).theme;
};

export const useMode = (): ThemeMode => {
  return useContext(ThemeContext).mode;
};

/**
 * `useDensity` merges density value from `DensityContext` with the one from component's props.
 */
export function useDensity(density?: Density): Density {
  const densityFromContext = useContext(DensityContext);
  return density || densityFromContext || DEFAULT_DENSITY;
}

export const useBreakpoints = (): Breakpoints => {
  return useContext(BreakpointContext);
};
