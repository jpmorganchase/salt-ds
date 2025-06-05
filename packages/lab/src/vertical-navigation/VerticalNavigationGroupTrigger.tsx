import { mergeProps } from "@salt-ds/core";
import { type ReactElement, cloneElement, isValidElement } from "react";
import { useVerticalNavigationGroup } from "./VerticalNavigationGroup";

export interface VerticalNavigationGroupTriggerProps {
  children?: ReactElement;
}

export function VerticalNavigationGroupTrigger(
  props: VerticalNavigationGroupTriggerProps,
) {
  const { children } = props;
  const { setExpanded, expanded, regionId } = useVerticalNavigationGroup();

  const handleClick = () => {
    setExpanded((old) => !old);
  };

  if (isValidElement(props.children)) {
    return (
      <>
        {cloneElement(children, {
          ...mergeProps(
            {
              onClick: handleClick,
              "aria-expanded": expanded,
              "aria-controls": regionId,
            },
            children.props,
          ),
        })}
      </>
    );
  }

  return <>children</>;
}
