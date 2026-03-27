import { Divider, makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  Children,
  type ComponentPropsWithoutRef,
  Fragment,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

import toolbarNextCss from "./ToolbarNext.css";
import { ToolbarRegion, type ToolbarRegionPosition } from "./ToolbarRegion";
import { TooltrayNext, type TooltrayNextProps } from "./Tooltray";

export interface ToolbarNextProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Defaults to `"bordered"`.
   */
  variant?: "bordered" | "transparent";
}

const withBaseName = makePrefixer("saltToolbarNext");

type ToolbarNextChild = Exclude<ReactNode, boolean | null | undefined>;

function flattenToolbarChildren(children: ReactNode): ToolbarNextChild[] {
  const flattened: ToolbarNextChild[] = [];

  Children.forEach(children, (child) => {
    if (child == null || typeof child === "boolean") {
      return;
    }

    if (isValidElement(child) && child.type === Fragment) {
      flattened.push(...flattenToolbarChildren(child.props.children));
      return;
    }

    flattened.push(child);
  });

  return flattened;
}

function isToolbarRegionElement(
  child: ToolbarNextChild,
): child is ReactElement<ComponentPropsWithoutRef<typeof ToolbarRegion>> {
  return isValidElement(child) && child.type === ToolbarRegion;
}

function isTooltrayElement(
  child: ToolbarNextChild,
): child is ReactElement<TooltrayNextProps> {
  return isValidElement(child) && child.type === TooltrayNext;
}

function isDividerElement(child: ToolbarNextChild): child is ReactElement {
  return isValidElement(child) && child.type === Divider;
}

function getTooltrayAlign(child: ReactElement<TooltrayNextProps>) {
  return child.props.align ?? "start";
}

function buildImplicitRegions(children: ToolbarNextChild[]) {
  const buckets: Record<ToolbarRegionPosition, ToolbarNextChild[]> = {
    start: [],
    center: [],
    end: [],
  };
  let currentPosition: ToolbarRegionPosition = "start";

  for (const child of children) {
    if (isTooltrayElement(child)) {
      currentPosition = getTooltrayAlign(child);
      buckets[currentPosition].push(child);
      continue;
    }

    if (isDividerElement(child)) {
      buckets[currentPosition].push(child);
    }
  }

  return (Object.keys(buckets) as ToolbarRegionPosition[]).map((position) => {
    const regionChildren = buckets[position];

    if (regionChildren.length === 0) {
      return null;
    }

    return (
      <ToolbarRegion data-implicit position={position} key={position}>
        {regionChildren}
      </ToolbarRegion>
    );
  });
}

export const ToolbarNext = forwardRef<HTMLDivElement, ToolbarNextProps>(
  function ToolbarNext(
    { children, className, variant = "bordered", ...rest },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-toolbar-next",
      css: toolbarNextCss,
      window: targetWindow,
    });

    const flattenedChildren = flattenToolbarChildren(children);
    const hasRegionChildren = flattenedChildren.some(isToolbarRegionElement);
    const hasOnlyRegions =
      hasRegionChildren && flattenedChildren.every(isToolbarRegionElement);
    const hasOnlyFlatChildren = flattenedChildren.every(
      (child) => isTooltrayElement(child) || isDividerElement(child),
    );

    const mode = hasOnlyRegions
      ? "explicit"
      : hasOnlyFlatChildren
        ? "flat"
        : "invalid";

    return (
      <div
        className={clsx(
          withBaseName(),
          {
            [withBaseName("fallback")]: mode === "invalid",
            [withBaseName("layout")]: mode !== "invalid",
          },
          withBaseName(variant),
          className,
        )}
        data-mode={mode}
        ref={ref}
        {...rest}
        role="toolbar"
        aria-orientation="horizontal"
      >
        {mode === "flat" ? buildImplicitRegions(flattenedChildren) : children}
      </div>
    );
  },
);
