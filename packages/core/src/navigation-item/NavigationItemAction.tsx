import {
  cloneElement,
  ComponentPropsWithoutRef,
  ElementType,
  isValidElement,
  ReactElement,
} from "react";
import { mergeProps } from "../utils";

function createElement(Type: ElementType, props: any) {
  const { render, ...rest } = props;

  let element: ReactElement;
  if (isValidElement<any>(render)) {
    const renderProps = render.props;
    element = cloneElement(render, mergeProps(rest, renderProps));
  } else if (render) {
    element = render(rest) as ReactElement;
  } else {
    element = <Type {...rest} />;
  }
  return element;
}

interface NavigationItemActionProps extends ComponentPropsWithoutRef<any> {}

export function NavigationItemAction(props: NavigationItemActionProps) {
  return createElement("a", props);
}
