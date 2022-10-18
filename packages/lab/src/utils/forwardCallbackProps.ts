/* 
  When we clone a React element and inject props, if any of these are
  callback props, make sure original callback props are also invoked. 
  
 React.cloneElement(
    element,
    forwardCallbackProps(element.props, overrideProps)
  )
 */

type Props = Record<string, unknown>;

export const forwardCallbackProps = (
  ownProps: Props,
  overrideProps: Props
): Props => {
  const props = {
    ...overrideProps,
    ...Object.keys(ownProps).reduce<Props>((map, name) => {
      const ownProp = ownProps[name];
      const overrideProp = overrideProps[name];
      if (typeof ownProp === "function" && typeof overrideProp === "function") {
        map[name] = (...args: unknown[]) => {
          ownProp(...args);
          overrideProp(...args);
        };
      }
      return map;
    }, {}),
  };

  return props;
};
