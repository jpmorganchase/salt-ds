import cx from "classnames";
import React, {
  createContext,
  DetailedHTMLProps,
  DOMAttributes,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useContext,
} from "react";
import { AriaAnnouncerProvider } from "../aria-announcer";
import { Breakpoints, DEFAULT_BREAKPOINTS } from "../breakpoints";
import { DEFAULT_THEME, Density, getTheme, Theme } from "../theme";
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

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "uitk-theme": DetailedHTMLProps<
        DOMAttributes<HTMLDivElement> & { class: string },
        HTMLDivElement
      >;
    }
  }
}

export const ToolkitContext = createContext<ToolkitContextProps>({
  density: undefined,
  themes: [],
  breakpoints: DEFAULT_BREAKPOINTS,
});

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
        uitk-theme element will wrap your child elements`
      );
      return children;
    }
  } else {
    return (
      <uitk-theme class={cx(...themeNames, `uitk-density-${density}`)}>
        {children}
      </uitk-theme>
    );
  }
};

type ThemeNameType = string | Array<string>;

type TargetElement = "root" | "child";

type ToolkitProviderProps = {
  children: ReactElement;
  density?: Density;
  theme?: ThemeNameType;
  applyClassesTo?: TargetElement;
  breakpoints?: Breakpoints;
};

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
  const { themes: inheritedThemes, density: inheritedDensity } =
    useContext(ToolkitContext);

  const isRoot =
    inheritedThemes === undefined ||
    (Array.isArray(inheritedThemes) && inheritedThemes.length === 0);
  const density = densityProp ?? inheritedDensity ?? DEFAULT_DENSITY;
  const themeName = getThemeName(themesProp, inheritedThemes);
  const themes: Theme[] = getTheme(themeName);
  const breakpoints = breakpointsProp ?? DEFAULT_BREAKPOINTS;

  const themeClassnames = themes.map((theme) => `uitk-${theme.name}`);

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
        document.body.classList.add(
          ...themeClassnames,
          `uitk-density-${density}`
        );
      } else {
        console.warn(
          "\nToolkitProvider can only apply CSS classes to the body if it is the root level ToolkitProvider."
        );
      }
    }
    return () => {
      if (applyClassesTo === "root") {
        // When unmounting/remounting, remove the applied styles from the body
        document.body.classList.remove(
          ...themeClassnames,
          `uitk-density-${density}`
        );
      }
    };
  }, [applyClassesTo, density, isRoot, themeClassnames, themes]);

  const toolkitProvider = (
    <ToolkitContext.Provider value={{ density, themes, breakpoints }}>
      <ViewportProvider>{themedChildren}</ViewportProvider>
    </ToolkitContext.Provider>
  );

  if (isRoot) {
    return <AriaAnnouncerProvider>{toolkitProvider}</AriaAnnouncerProvider>;
  } else {
    return toolkitProvider;
  }
}

export const useTheme = (): Theme[] => {
  const { themes = [DEFAULT_THEME] } = useContext(ToolkitContext);
  return themes;
};

/**
 * `useDensity` merges density value from 'DensityContext` with the one from component's props.
 */
export function useDensity(density?: Density): Density {
  const { density: densityFromContext } = useContext(ToolkitContext);
  return density || densityFromContext || DEFAULT_DENSITY;
}

export const useBreakpoints = (): Breakpoints => {
  const { breakpoints } = useContext(ToolkitContext);
  return breakpoints;
};
