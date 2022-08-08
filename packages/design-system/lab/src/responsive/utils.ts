const COLLAPSIBLE = "data-collapsible";

export type dataPadDirection = "data-pad-start" | "data-pad-end";

const RESPONSIVE_ATTRIBUTE: { [key: string]: boolean } = {
  [COLLAPSIBLE]: true,
  "data-pad-start": true,
  "data-pad-end": true,
};

export const isResponsiveAttribute = (propName: string): boolean =>
  RESPONSIVE_ATTRIBUTE[propName] ?? false;

const isCollapsible = (propName: string) => propName === COLLAPSIBLE;

const COLLAPSIBLE_VALUE: { [key: string]: string } = {
  dynamic: "dynamic",
  instant: "instant",
  true: "instant",
};

const collapsibleValue = (value: string) => COLLAPSIBLE_VALUE[value] ?? "none";

type AnyProps = Record<string, unknown>;
type ResponsivePropsTuple = [AnyProps, AnyProps];
/**
 * data- attributes can be used to manage item overflow behaviour. Users may
 * speficy these attributes directly on a Toolbar component, which ultimately
 * gets wrapped by a FormField. We need to 'lift' these attributes to the form
 * field and remove them from the props of the nested component.
 * @param props
 * @returns
 */
export const liftResponsivePropsToFormField = (
  props: AnyProps
): ResponsivePropsTuple => {
  const propNames = Object.keys(props);
  if (propNames.some(isResponsiveAttribute)) {
    return propNames.reduce<ResponsivePropsTuple>(
      (tuple, propName): ResponsivePropsTuple => {
        const [toolbarProps, rest] = tuple;
        const propValue = props[propName];
        if (isResponsiveAttribute(propName)) {
          const value = isCollapsible(propName)
            ? collapsibleValue(propValue as string)
            : propValue;

          toolbarProps[propName] = value;
          rest[propName] = undefined;
        }
        return tuple;
      },
      [{}, {}]
    );
  } else {
    return [{}, props];
  }
};
