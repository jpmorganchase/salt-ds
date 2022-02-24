import React, { useRef, ReactElement } from "react";
import deepEqual from "fast-deep-equal";

type buttonDescriptor = {
  id: string;
  index: number;
  disabled: boolean;
};

function getToolbarButtonDescriptors(
  children: ReactElement[],
  isToolbarDisabled: boolean
): buttonDescriptor[] {
  const toolbarItems = React.Children.toArray(children);

  return toolbarItems.reduce(
    (itemDescriptors: buttonDescriptor[], child, index) =>
      itemDescriptors.concat({
        id: React.isValidElement(child) ? child.props.itemId : "",
        index,
        disabled:
          isToolbarDisabled ||
          (React.isValidElement(child) && !!child.props.disabled),
      }),
    []
  );
}

export default function useToolbarButtonDescriptors(
  children: ReactElement[],
  isToolbarDisabled: boolean
) {
  const prevDescriptors = useRef<buttonDescriptor[]>();
  const newDescriptors = getToolbarButtonDescriptors(
    children,
    isToolbarDisabled
  );

  // compare new and old object because children of a React component will always be
  // different (unless they are memoised) so we can't use it in our dependency array
  if (!deepEqual(newDescriptors, prevDescriptors.current)) {
    prevDescriptors.current = newDescriptors;
  }

  return prevDescriptors.current;
}
