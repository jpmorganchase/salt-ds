import { Children, type ReactNode, isValidElement } from "react";

import { TrackerStepProvider } from "./SteppedTrackerContext";
import { TrackerStepWrapper } from "./TrackerStepWrapper";

type DepthMap = {
  i: number;
  children: DepthMap[];
  depth?: number;
};

export const getDepthMap = (children: ReactNode): DepthMap[] => {
  const depths = getDepthsFromChildren(children);

  const validDepths =
    depths && depths.length > 0
      ? depths.filter((depth) => typeof depth === "number")
      : [];

  const noramlisedDepths = normalizeDepthValues(validDepths);

  const depthMap = convertDepthsToDepthMap(noramlisedDepths);

  return depthMap;
};

export const normalizeDepthValues = (depths: number[]) => {
  const minDepth = Math.min(...depths);
  return depths.map((depth) => depth - minDepth);
};

export const getDepthsFromChildren = (children: ReactNode) =>
  Children.map(children, (child) => {
    if (isValidElement(child)) {
      const depthProp = child.props.depth;
      return Number.parseInt(depthProp, 10) || 0;
    }
  });

export const convertDepthsToDepthMap = (depths: number[]) => {
  const depthsObjects = depths.map(
    (depth: number, i: number): DepthMap => ({ i, depth, children: [] }),
  );

  const depthMap = depthsObjects.reduce((acc: DepthMap[], item: DepthMap) => {
    if (item.depth === 0) {
      acc.push(item);
      return acc;
    }
    if (item.depth === 1) {
      acc[acc.length - 1].children.push(item);
      return acc;
    }
    if (item.depth === 2) {
      const last0 = acc.length - 1;
      const last1 = acc[last0].children.length - 1;
      acc[last0].children[last1].children.push(item);
      return acc;
    }
    return acc;
  }, []);

  return depthMap;
};

export const renderNestedSteps = (
  childrenArray: ReactNode[],
  depthMap: DepthMap[],
) =>
  depthMap.map((depthItem) => {
    const child = childrenArray[depthItem.i];

    if (depthItem.children.length > 0) {
      return (
        <TrackerStepWrapper
          key={`step-${depthItem.i}`}
          child={child}
          stepNumber={depthItem.i}
        >
          {renderNestedSteps(childrenArray, depthItem.children)}
        </TrackerStepWrapper>
      );
    }

    return (
      <TrackerStepProvider key={`step-${depthItem.i}`} stepNumber={depthItem.i}>
        {child}
      </TrackerStepProvider>
    );
  });
