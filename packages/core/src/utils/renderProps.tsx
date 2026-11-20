import {
  type ComponentProps,
  cloneElement,
  type ElementType,
  isValidElement,
  type ReactElement,
  type Ref,
  type RefCallback,
} from "react";
import { forkRef } from "./forkRef";
import { getRefFromChildren } from "./getRefFromChildren";
import { mergeProps } from "./mergeProps";

// Keeps the merged ref stable for the same pair of refs, so React doesn't
// detach and reattach it on every render. Components that are given the same
// pair of refs share one merged ref, as they would share each ref.
const forkedRefs = new WeakMap<object, WeakMap<object, RefCallback<unknown>>>();

function getForkedRef(
  componentRef: Ref<unknown>,
  renderRef: Ref<unknown>,
): Ref<unknown> {
  if (typeof componentRef !== "object" && typeof componentRef !== "function") {
    return renderRef;
  }
  if (typeof renderRef !== "object" && typeof renderRef !== "function") {
    return componentRef;
  }
  if (componentRef === null || renderRef === null) {
    return componentRef ?? renderRef;
  }
  let refsForComponentRef = forkedRefs.get(componentRef);
  if (!refsForComponentRef) {
    refsForComponentRef = new WeakMap();
    forkedRefs.set(componentRef, refsForComponentRef);
  }
  let forkedRef = refsForComponentRef.get(renderRef);
  if (!forkedRef) {
    forkedRef = forkRef(componentRef, renderRef);
    refsForComponentRef.set(renderRef, forkedRef);
  }
  return forkedRef;
}

export interface RenderPropsType {
  render?: ReactElement | ((props: any) => ReactElement);
}

export function renderProps<Type extends ElementType>(
  Type: Type | null,
  props: RenderPropsType & ComponentProps<Type>,
): ReactElement {
  const { render, ...rest } = props;
  // Case 1: If render is a valid React element, clone it with merged props
  if (isValidElement(render)) {
    const renderProps = render.props as ComponentProps<Type>;
    const mergedProps = mergeProps(rest, renderProps);
    // Keep both the component's ref and the render element's own ref.
    const componentRef = (rest as { ref?: Ref<unknown> }).ref;
    const renderRef = getRefFromChildren(render) as Ref<unknown> | null;
    if (componentRef && renderRef && componentRef !== renderRef) {
      mergedProps.ref = getForkedRef(componentRef, renderRef);
    }
    return cloneElement(render, mergedProps);
  }

  const restProps = rest as ComponentProps<Type>;

  // Case 2: If render is a function, call it with the rest of the props
  if (typeof render === "function") {
    const renderedElement = render(restProps);
    if (isValidElement(renderedElement)) {
      return renderedElement;
    }
    throw new Error("Render function did not return a valid React element");
  }

  if (Type) {
    // Case 3: If render is not provided, render the Type component with the rest of the props
    return <Type {...restProps} />;
  }

  throw new Error("Type or render should be provided");
}
