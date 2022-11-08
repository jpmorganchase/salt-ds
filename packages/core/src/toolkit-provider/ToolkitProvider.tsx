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
import { Density, getTheme, Theme } from "../theme";
import { ViewportProvider } from "../viewport";
import { useIsomorphicLayoutEffect } from "../utils";

export const DEFAULT_DENSITY = "medium";

// TODO this forces anyone using ToolkitContext directly to deal with themes (as opposed to theme)
// needs more thought
export interface ToolkitContextProps {
  density?: Density;
  themes?: Theme[];
  breakpoints: Breakpoints;
}

const DEFAULT_THEME_NAME = "light";

export const DensityContext = createContext<Density>(DEFAULT_DENSITY);

export const ThemeContext = createContext<Theme[]>([]);

export const BreakpointContext =
  createContext<Breakpoints>(DEFAULT_BREAKPOINTS);

const createThemedChildren = (
  children: ReactNode,
  themeNames: string[],
  density: Density,
  applyClassesTo?: TargetElement
) => {
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
        className={cx(`uitk-theme`, ...themeNames, `uitk-density-${density}`)}
      >
        {children}
      </div>
    );
  }
};

type ThemeNameType = string | Array<string>;

type TargetElement = "root" | "child";

type ToolkitProviderBaseProps = {
  applyClassesTo?: TargetElement;
  density?: Density;
  theme?: ThemeNameType;
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

const getThemeName = (
  theme: ThemeNameType | undefined,
  inheritedThemes: Theme[] | undefined
): ThemeNameType => {
  if (theme) {
    return theme;
  } else if (Array.isArray(inheritedThemes) && inheritedThemes.length > 0) {
    return inheritedThemes.map((theme) => theme.name);
  } else {
    return DEFAULT_THEME_NAME;
  }
};

export function ToolkitProvider({
  applyClassesTo,
  children,
  density: densityProp,
  theme: themesProp,
  breakpoints: breakpointsProp,
}: ToolkitProviderProps) {
  const inheritedDensity = useContext(DensityContext);
  const inheritedThemes = useContext(ThemeContext);

  const isRoot =
    inheritedThemes === undefined ||
    (Array.isArray(inheritedThemes) && inheritedThemes.length === 0);
  const density = densityProp ?? inheritedDensity ?? DEFAULT_DENSITY;
  const themeName = getThemeName(themesProp, inheritedThemes);
  // We expect theme to be stable
  const themNameAsString = themeName.toString();
  const themes: Theme[] = useMemo(
    () => getTheme(themeName),
    [themNameAsString]
  );
  const breakpoints = breakpointsProp ?? DEFAULT_BREAKPOINTS;

  const themeClassnames = useMemo(
    () => themes.map((theme) => `uitk-${theme.name}`),
    [themes]
  );

  const themedChildren = createThemedChildren(
    children,
    themeClassnames,
    density,
    applyClassesTo
  );

  useIsomorphicLayoutEffect(() => {
    if (applyClassesTo === "root") {
      if (isRoot) {
        // add the styles we want to apply
        document.documentElement.classList.add(
          ...themeClassnames,
          `uitk-density-${density}`
        );
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
          ...themeClassnames,
          `uitk-density-${density}`
        );
      }
    };
  }, [applyClassesTo, density, isRoot, themeClassnames]);

  const toolkitProvider = (
    <DensityContext.Provider value={density}>
      <ThemeContext.Provider value={themes}>
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

export const useTheme = (): Theme[] => {
  return useContext(ThemeContext);
};

/**
 * `useDensity` merges density value from 'DensityContext` with the one from component's props.
 */
export function useDensity(density?: Density): Density {
  const densityFromContext = useContext(DensityContext);
  return density || densityFromContext || DEFAULT_DENSITY;
}

export const useBreakpoints = (): Breakpoints => {
  return useContext(BreakpointContext);
};
