import React, { useCallback, useMemo, useRef, useState } from "react";
import { Splitter } from "../Splitter";

import {
  findSplitterAndPlaceholderPositions,
  gatherChildMeta,
  identifyResizeParties,
  SPLITTER,
} from "./flexbox-utils.js";
var getUniqueId = () => `hw-${Math.round(Math.random() * 1e5)}`;

const originalContentOnly = (meta) => !meta.splitter && !meta.placeholder;

export const useSplitterResizing = ({
  children: childrenProp,
  onSplitterMoved,
  direction,
}) => {
  const rootRef = useRef(null);
  const metaRef = useRef(null);
  const contentRef = useRef(null);
  const assignedKeys = useRef([]);
  const [, forceUpdate] = useState({});

  const setContent = (content) => {
    contentRef.current = content;
    forceUpdate({});
  };

  const isColumn = direction === "column";
  const dimension = isColumn ? "height" : "width";
  const children = useMemo(
    () =>
      Array.isArray(childrenProp)
        ? childrenProp
        : React.isValidElement(childrenProp)
        ? [childrenProp]
        : [],
    [childrenProp]
  );

  const handleDragStart = useCallback(
    (index) => {
      const [participants, bystanders] = identifyResizeParties(
        metaRef.current,
        index
      );
      if (participants) {
        participants.forEach((index) => {
          const el = rootRef.current.childNodes[index];
          const { size, minSize } = measureElement(el, dimension);
          metaRef.current[index].currentSize = size;
          metaRef.current[index].minSize = minSize;
        });
        if (bystanders) {
          bystanders.forEach((index) => {
            const el = rootRef.current.childNodes[index];
            const { [dimension]: size } = el.getBoundingClientRect();
            metaRef.current[index].flexBasis = size;
          });
        }

        // console.log(`handleDragStart ${JSON.stringify(metaRef.current, null, 2)}`);
      }
    },
    [dimension]
  );

  const handleDrag = useCallback(
    (idx, distance) => {
      setContent(resizeContent(contentRef, metaRef, distance, dimension));
    },
    [dimension]
  );

  const handleDragEnd = useCallback(() => {
    const contentMeta = metaRef.current;
    if (onSplitterMoved) {
      onSplitterMoved(contentMeta.filter(originalContentOnly));
    }
    contentMeta.forEach((meta) => {
      meta.currentSize = undefined;
      meta.flexBasis = undefined;
      meta.flexOpen = false;
    });
  }, [onSplitterMoved]);

  const createSplitter = useCallback(
    (i) => {
      return React.createElement(Splitter, {
        column: isColumn,
        index: i,
        key: `splitter-${i}`,
        onDrag: handleDrag,
        onDragEnd: handleDragEnd,
        onDragStart: handleDragStart,
      });
    },
    [handleDrag, handleDragEnd, handleDragStart, isColumn]
  );

  useMemo(() => {
    // This will always fire when Flexbox has rendered, but nor during splitter resize
    const [content, meta] = buildContent(
      children,
      dimension,
      createSplitter,
      assignedKeys.current
    );
    metaRef.current = meta;
    contentRef.current = content;
  }, [children, createSplitter, dimension]);

  return {
    content: contentRef.current,
    rootRef,
  };
};

function buildContent(children, dimension, createSplitter, keys) {
  const childMeta = gatherChildMeta(children, dimension);
  const splitterAndPlaceholderPositions =
    findSplitterAndPlaceholderPositions(childMeta);
  const content = [];
  const meta = [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.key == null) {
      const key = keys[i] || (keys[i] = getUniqueId());
      content.push(React.cloneElement(child, { key }));
    } else {
      content.push(child);
    }
    meta.push(childMeta[i]);

    if (splitterAndPlaceholderPositions[i] && SPLITTER) {
      content.push(createSplitter(content.length));
      meta.push({ splitter: true });
    }
  }
  return [content, meta];
}

function resizeContent({ current: content }, metaRef, distance, dimension) {
  const metaUpdated = updateMeta(metaRef, distance);
  if (!metaUpdated) {
    return content;
  }
  const { current: contentMeta } = metaRef;
  return content.map((child, idx) => {
    const meta = contentMeta[idx];
    let { currentSize, flexOpen, flexBasis } = meta;
    const hasCurrentSize = currentSize !== undefined;
    if (hasCurrentSize || flexOpen) {
      const { flexBasis: actualFlexBasis } = child.props.style || {};
      const size = hasCurrentSize ? meta.currentSize : flexBasis;
      if (size !== actualFlexBasis) {
        return React.cloneElement(child, {
          style: {
            ...child.props.style,
            flexBasis: size,
            [dimension]: "auto",
          },
        });
      } else {
        return child;
      }
    } else {
      return child;
    }
  });
}

//TODO detect cursor move beyond drag limit and suspend further resize until cursoe re-engages with splitter
function updateMeta(metaRef, distance) {
  const { current: contentMeta } = metaRef;
  const resizeTargets = [];

  contentMeta.forEach((meta, idx) => {
    if (meta.currentSize !== undefined) {
      resizeTargets.push(idx);
    }
  });

  // we want the target being reduced first, this may limit the distance we can apply
  let target1 = distance < 0 ? resizeTargets[0] : resizeTargets[1];

  let meta = contentMeta[target1];
  if (meta.currentSize === meta.minSize) {
    // size is already 0, we cannot go further
    return false;
  } else if (Math.abs(distance) > meta.currentSize - meta.minSize) {
    // reduce to 0
    const multiplier = distance < 0 ? -1 : 1;
    distance = Math.max(0, meta.currentSize - meta.minSize) * multiplier;
  }

  contentMeta[resizeTargets[0]].currentSize += distance;
  contentMeta[resizeTargets[1]].currentSize -= distance;

  return true;
}

function measureElement(el, dimension) {
  const { [dimension]: size } = el.getBoundingClientRect();
  const style = getComputedStyle(el);
  const minSizeVal = style.getPropertyValue(`min-${dimension}`);
  const minSize = minSizeVal.endsWith("px") ? parseInt(minSizeVal, 10) : 0;
  return { size, minSize };
}
