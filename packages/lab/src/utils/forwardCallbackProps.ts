/*
  When we clone a React element and inject props, if any of these are
  callback props, make sure original callback props are also invoked.

 React.cloneElement(
    element,
    forwardCallbackProps(element.props, overrideProps)
  )
 */

type Props = Record<string, any>;

export const forwardCallbackProps = <P1 extends Props, P2 extends Props>(
  ownProps: P1,
  overrideProps: P2
): P1 & P2 => {
  const props = Object.keys(ownProps).reduce<Props>(
    (map, name) => {
      const ownProp = ownProps[name];
      const overrideProp = overrideProps[name];
      if (typeof ownProp === "function" && typeof overrideProp === "function") {
        map[name] = (...args: unknown[]) => {
          ownProp(...args);
          overrideProp(...args);
        };
      }
      return map;
    },
    { ...overrideProps }
  );

  return props as P1 & P2;
};
