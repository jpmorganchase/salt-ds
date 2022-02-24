const COLLAPSIBLE = "data-collapsible";
// const COLLAPSED = "data-collapsed";

export type dataPadDirection = "data-pad-start" | "data-pad-end";

const RESPONSIVE_ATTRIBUTE: { [key: string]: boolean } = {
  // [COLLAPSED]: true,
  [COLLAPSIBLE]: true,
  "data-pad-start": true,
  "data-pad-end": true,
};

export const isResponsiveAttribute = (propName: string) =>
  RESPONSIVE_ATTRIBUTE[propName] ?? false;

const isCollapsible = (propName: string) => propName === COLLAPSIBLE;

const COLLAPSIBLE_VALUE: { [key: string]: string } = {
  dynanic: "dynamic",
  instant: "instant",
  true: "instant",
};

const collapsibleValue = (value: string) => COLLAPSIBLE_VALUE[value] ?? "none";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const extractResponsiveProps = (props: any) =>
  Object.keys(props).reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (result: [any, any], propName) => {
      const [toolbarProps, rest] = result;
      if (isResponsiveAttribute(propName)) {
        const value = isCollapsible(propName)
          ? collapsibleValue(props[propName])
          : props[propName];

        toolbarProps[propName] = value;
        rest[propName] = undefined;
      }
      return result;
    },
    [{}, {}]
  );
