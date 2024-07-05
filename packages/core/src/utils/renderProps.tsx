import { cloneElement, ElementType, isValidElement, ReactElement } from "react";
import { mergeProps } from "./mergeProps";

export interface RenderPropsType {
  render?: ReactElement | ((props: any) => ReactElement);
}

export function renderProps<Type extends ElementType>(
  Type: Type,
  props: RenderPropsType & React.ComponentProps<Type>
): ReactElement {
  const { render, ...rest } = props;
  // Case 1: If render is a valid React element, clone it with merged props
  if (isValidElement(render)) {
    const renderProps = render.props as React.ComponentProps<Type>;
    return cloneElement(render, mergeProps(rest, renderProps));
  }

  const restProps = rest as React.ComponentProps<Type>;

  // Case 2: If render is a function, call it with the rest of the props
  if (typeof render === "function") {
    const renderedElement = render(restProps);
    if (isValidElement(renderedElement)) {
      return renderedElement;
    }
    throw new Error("Render function did not return a valid React element");
  }

  // Case 3: If render is not provided, render the Type component with the rest of the props
  return <Type {...restProps} />;
}
