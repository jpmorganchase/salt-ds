import cx from "classnames";
import React, {
  createContext,
  DetailedHTMLProps,
  DOMAttributes,
  FC,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  RefObject,
  useContext,
  useState,
} from "react";
import { AriaAnnouncerProvider } from "../aria-announcer";
import { Breakpoints, DEFAULT_BREAKPOINTS } from "../breakpoints";
import {
  characteristic,
  DEFAULT_THEME,
  Density,
  getTheme,
  Theme,
} from "../theme";
import { useIsomorphicLayoutEffect } from "../utils/useIsomorphicLayoutEffect";
import { ViewportProvider } from "../viewport";

export const DEFAULT_DENSITY = "medium";

// TODDO this forces anyone using ToolkitContext directly to deal with themes (as opposed to theme)
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
  breakpoints: {} as Breakpoints,
});

const createThemedChildren = (
  children: ReactNode,
  themeNames: string[],
  density: Density,
  applyClassesToChild: boolean
) => {
  if (applyClassesToChild) {
    if (React.isValidElement<HTMLAttributes<HTMLElement>>(children)) {
      return React.cloneElement(children, {
        className: cx(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          children.props?.className,
          ...themeNames.map((themeName) => `uitk-${themeName}`),
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
      <uitk-theme
        class={cx(
          ...themeNames.map((themeName) => `uitk-${themeName}`),
          `uitk-density-${density}`
        )}
      >
        {children}
      </uitk-theme>
    );
  }
};

interface ToolkitProviderThatAppliesClassesToChild {
  children: ReactElement;
  density?: Density;
  theme?: ThemeNameType;
  applyClassesToChild?: true;
  breakpoints?: Breakpoints;
}

type ThemeNameType = string | Array<string>;
interface ToolkitProviderThatInjectsThemeElement {
  children: ReactNode;
  density?: Density;
  theme?: ThemeNameType;
  applyClassesToChild?: false;
  breakpoints?: Breakpoints;
}

type toolkitProvider =
  | ToolkitProviderThatAppliesClassesToChild
  | ToolkitProviderThatInjectsThemeElement;

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

export const ToolkitProvider: FC<toolkitProvider> = ({
  applyClassesToChild = false,
  children,
  density: densityProp,
  theme: themesProp,
  breakpoints: breakpointsProp,
}) => {
  const { themes: inheritedThemes, density: inheritedDensity } =
    useContext(ToolkitContext);

  const isRoot =
    inheritedThemes === undefined ||
    (Array.isArray(inheritedThemes) && inheritedThemes.length === 0);
  const density = densityProp ?? inheritedDensity ?? DEFAULT_DENSITY;
  const themeName = getThemeName(themesProp, inheritedThemes);
  const themes: Theme[] = getTheme(themeName);
  const breakpoints = breakpointsProp ?? DEFAULT_BREAKPOINTS;

  const themedChildren = createThemedChildren(
    children,
    themes.map((theme) => theme.name),
    density,
    applyClassesToChild
  );

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
};

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

export const useBreakpoints = () => {
  const { breakpoints } = useContext(ToolkitContext);
  return breakpoints;
};

type HTMLElementRef = RefObject<HTMLElement>;
// We might want to cache values in a local WeakMap ?
export const useCharacteristic = (
  characteristicName: characteristic,
  variant: string,
  ref: HTMLElementRef | HTMLElement | null = null
): string | null => {
  // TODO what do we do with multiple themes
  const [theme] = useTheme();
  const [value, setValue] = useState<string | null>(null);
  const target =
    (ref as HTMLElementRef)?.current !== undefined
      ? (ref as HTMLElementRef).current
      : (ref as HTMLElement);

  useIsomorphicLayoutEffect(() => {
    if (theme) {
      const value = theme.getCharacteristicValue(
        characteristicName,
        variant,
        target || undefined
      );
      setValue(value);
    }
  }, [characteristicName, target, theme, variant]);

  return value;
};
