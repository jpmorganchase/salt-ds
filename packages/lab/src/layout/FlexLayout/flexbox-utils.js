export const getProp = (component, propName) => {
  const props = getProps(component);
  return props[propName] ?? props[`data-${propName}`];
};

export const getProps = (component) => component?.props || component || {};

export function getIntrinsicSize(component) {
  const { style: { width = "auto", height = "auto" } = {} } = component.props;

  // Eliminate 'auto' and percentage sizes
  const numHeight = typeof height === "number";
  const numWidth = typeof width === "number";

  if (numHeight && numWidth) {
    return { height, width };
  } else if (numHeight) {
    return { height };
  } else if (numWidth) {
    return { width };
  }
}

//TODO this is not comprehensive
export function hasUnboundedFlexStyle(component) {
  const { style: { flex, flexGrow, flexShrink, flexBasis } = {} } =
    component.props;
  if (typeof flex === "number") {
    return true;
  } else if (flexBasis === 0 && flexGrow === 1 && flexShrink === 1) {
    return true;
  } else if (typeof flexBasis === "number") {
    return false;
  } else {
    return true;
  }
}

const EMPTY_OBJECT = {};

export const SPLITTER = 1;
export const PLACEHOLDER = 2;

const isIntrinsicallySized = (item) => typeof item.intrinsicSize === "number";

const getBreakPointValues = (breakPoints, component) => {
  const values = {};
  breakPoints.forEach((breakPoint) => {
    values[breakPoint] = getProp(component, breakPoint);
  });
  return values;
};

export const gatherChildMeta = (children, dimension, breakPoints) => {
  return children.map((child, index) => {
    const resizeable = getProp(child, "resizeable");
    const { [dimension]: intrinsicSize } =
      getIntrinsicSize(child) ?? EMPTY_OBJECT;
    const flexOpen = hasUnboundedFlexStyle(child);
    if (breakPoints) {
      return {
        index,
        flexOpen,
        intrinsicSize,
        resizeable,
        ...getBreakPointValues(breakPoints, child),
      };
    } else {
      return { index, flexOpen, intrinsicSize, resizeable };
    }
  });
};

// Splitters are inserted AFTER the associated index, so
// never a splitter in last position.
// Placeholder goes before (first) OR after(last) index
export const findSplitterAndPlaceholderPositions = (childMeta) => {
  const count = childMeta.length;
  const allIntrinsic = childMeta.every(isIntrinsicallySized);
  const splitterPositions = Array(count).fill(0);
  if (allIntrinsic) {
    splitterPositions[0] = PLACEHOLDER;
    splitterPositions[count - 1] = PLACEHOLDER;
  }
  if (count < 2) {
    return splitterPositions;
  } else {
    // 1) From the left, check each item.
    // Once we hit a resizeable item, set this index and all subsequent indices,
    // except for last, to SPLITTER
    for (let i = 0, resizeablesLeft = 0; i < count - 1; i++) {
      if (childMeta[i].resizeable && !resizeablesLeft) {
        resizeablesLeft = SPLITTER;
      }
      splitterPositions[i] += resizeablesLeft;
    }
    // 2) Now check from the right. Undo splitter insertion until we reach a point
    // where there is a resizeable to our right.
    for (let i = count - 1; i > 0; i--) {
      if (splitterPositions[i] & SPLITTER) {
        splitterPositions[i] -= SPLITTER;
      }
      if (childMeta[i].resizeable) {
        break;
      }
    }
    return splitterPositions;
  }
};

export const identifyResizeParties = (contentMeta, idx) => {
  const idx1 = getLeadingResizeablePos(contentMeta, idx);
  const idx2 = getTrailingResizeablePos(contentMeta, idx);
  const participants = idx1 !== -1 && idx2 !== -1 ? [idx1, idx2] : undefined;
  const bystanders = identifyResizeBystanders(contentMeta, participants);
  return [participants, bystanders];
};

function identifyResizeBystanders(contentMeta, participants) {
  if (participants) {
    let bystanders = [];
    for (let i = 0; i < contentMeta.length; i++) {
      if (contentMeta[i].flexOpen && !participants.includes(i)) {
        bystanders.push(i);
      }
    }
    return bystanders;
  }
}

function getLeadingResizeablePos(contentMeta, idx) {
  let pos = idx,
    resizeable = false;
  while (pos >= 0 && !resizeable) {
    pos = pos - 1;
    resizeable = isResizeable(contentMeta, pos);
  }
  return pos;
}

function getTrailingResizeablePos(contentMeta, idx) {
  let pos = idx,
    resizeable = false,
    count = contentMeta.length;
  while (pos < count && !resizeable) {
    pos = pos + 1;
    resizeable = isResizeable(contentMeta, pos);
  }
  return pos === count ? -1 : pos;
}

function isResizeable(contentMeta, idx) {
  const { placeholder, splitter, resizeable, intrinsicSize } = contentMeta[idx];
  return !splitter && !intrinsicSize && (placeholder || resizeable);
}
