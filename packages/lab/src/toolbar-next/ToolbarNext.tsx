import {
  Button,
  makePrefixer,
  useForkRef,
  useIsomorphicLayoutEffect,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  cloneElement,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import toolbarNextCss from "./ToolbarNext.css";
import {
  ToolbarNextOverflowMenu,
  ToolbarNextOverflowOwners,
  ToolbarNextOverflowRegion,
  ToolbarNextOverflowTriggerContent,
} from "./ToolbarNextOverflow";
import type { ToolbarRegionPosition } from "./ToolbarRegion";
import { TOOLBAR_NEXT_SCOPE_ROOT_ATTR } from "./toolbarNextKeyboardUtils";
import {
  normalizeToolbarChildren,
  type ToolbarNextOverflowItem,
} from "./toolbarNextUtils";
import { useToolbarNextKeyboardNavigation } from "./useToolbarNextKeyboardNavigation";
import { useToolbarNextOverflow } from "./useToolbarNextOverflow";

export interface ToolbarNextProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Defaults to `"bordered"`.
   */
  variant?: "bordered" | "transparent";
}

const withBaseName = makePrefixer("saltToolbarNext");
const withOverflowBaseName = makePrefixer("saltToolbarNextOverflow");
const bandPositions: ToolbarRegionPosition[] = ["start", "center", "end"];

function cloneMeasureDecorations(
  itemId: string,
  slot: "leading" | "trailing",
  decorations: ToolbarNextOverflowItem["leadingDecorations"],
) {
  return decorations.map((decoration, index) => {
    return cloneElement(decoration, {
      key: `${itemId}-${slot}-measurement-${String(decoration.key ?? index)}`,
    });
  });
}

export const ToolbarNext = forwardRef<HTMLDivElement, ToolbarNextProps>(
  function ToolbarNext(
    {
      children,
      className,
      onBlurCapture,
      onFocusCapture,
      onKeyDownCapture,
      onPointerDownCapture,
      variant = "bordered",
      ...rest
    },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-toolbar-next",
      css: toolbarNextCss,
      window: targetWindow,
    });

    const { mode, regions } = normalizeToolbarChildren(children);

    const allItems = useMemo(
      () => regions.flatMap((region) => region.items),
      [regions],
    );

    const {
      containerRef,
      getBandRef,
      getItemRef,
      getNamedTriggerMeasureRef,
      getNamedTriggerRef,
      getRegionRef,
      getTriggerMeasureRef,
      overflowGroups,
      overflowTriggerGroups,
      overflowedIds,
    } = useToolbarNextOverflow({ regions });

    const handleRef = useForkRef(ref, containerRef);
    const invalidCompositionWarnedRef = useRef(false);
    const itemHostRefCallbacks = useRef(
      new Map<string, (node: HTMLDivElement | null) => void>(),
    );
    const [itemHostNodes, setItemHostNodes] = useState<
      Record<string, HTMLDivElement | null>
    >({});

    const sharedOverflowGroups = useMemo(
      () => overflowGroups.filter((group) => !group.named),
      [overflowGroups],
    );

    const namedOverflowGroups = useMemo(
      () => overflowGroups.filter((group) => group.named),
      [overflowGroups],
    );

    const overflowTriggerGroupByKey = useMemo(
      () =>
        new Map(
          overflowTriggerGroups.map((group) => [group.key, group] as const),
        ),
      [overflowTriggerGroups],
    );

    const namedTriggerMeasureItems = useMemo(
      () =>
        allItems.filter((item) => {
          return (
            item.overflowMode !== "none" && item.overflowGroup !== "shared"
          );
        }),
      [allItems],
    );

    const bandsByPosition = useMemo(() => {
      return bandPositions.reduce<
        Record<ToolbarRegionPosition, typeof regions>
      >(
        (bands, position) => {
          bands[position] = regions.filter(
            (region) => region.position === position,
          );
          return bands;
        },
        {
          start: [],
          center: [],
          end: [],
        },
      );
    }, [regions]);
    const hasCenteredLayout = bandsByPosition.center.length > 0;
    const keyboardNavigation = useToolbarNextKeyboardNavigation({
      items: allItems,
      overflowedIds,
      scopeRef: containerRef,
    });
    const overflowedIdsKey = useMemo(
      () => Array.from(overflowedIds).sort().join("\0"),
      [overflowedIds],
    );
    const previousOverflowedIdsKeyRef = useRef(overflowedIdsKey);

    const getItemHostRef = useCallback((id: string) => {
      const existing = itemHostRefCallbacks.current.get(id);

      if (existing) {
        return existing;
      }

      const callback = (node: HTMLDivElement | null) => {
        setItemHostNodes((previous) => {
          if (previous[id] === node) {
            return previous;
          }

          return {
            ...previous,
            [id]: node,
          };
        });
      };

      itemHostRefCallbacks.current.set(id, callback);
      return callback;
    }, []);

    useIsomorphicLayoutEffect(() => {
      const overflowChanged =
        previousOverflowedIdsKeyRef.current !== overflowedIdsKey;
      previousOverflowedIdsKeyRef.current = overflowedIdsKey;

      if (!overflowChanged) {
        return;
      }

      const doc = targetWindow?.document;
      const rememberedFocus = keyboardNavigation.rememberedFocusRef.current;

      if (!doc || !rememberedFocus) {
        return;
      }

      const activeElement = doc.activeElement;
      const focusWasLost =
        !activeElement ||
        activeElement === doc.body ||
        activeElement === doc.documentElement ||
        !activeElement.isConnected;
      const target = keyboardNavigation.getEntryFocusable();

      if (!focusWasLost) {
        return;
      }

      if (!target) {
        return;
      }

      const focusTarget = () => {
        if (target.isConnected) {
          target.focus({ preventScroll: true });
        }
      };

      if (targetWindow?.requestAnimationFrame) {
        const frame = targetWindow.requestAnimationFrame(focusTarget);

        return () => {
          targetWindow.cancelAnimationFrame(frame);
        };
      }

      queueMicrotask(focusTarget);
    }, [
      keyboardNavigation.getEntryFocusable,
      keyboardNavigation.rememberedFocusRef,
      overflowedIdsKey,
      targetWindow,
    ]);

    useEffect(() => {
      if (process.env.NODE_ENV !== "production") {
        if (mode === "invalid" && !invalidCompositionWarnedRef.current) {
          console.warn(
            "ToolbarNext children must be authored in one composition model: either TooltrayNext/Divider children directly in ToolbarNext, or ToolbarRegion children containing TooltrayNext/Divider items.",
          );
          invalidCompositionWarnedRef.current = true;
        }

        if (mode !== "invalid") {
          invalidCompositionWarnedRef.current = false;
        }
      }
    }, [mode]);

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
        data-centered={mode !== "invalid" && hasCenteredLayout ? "" : undefined}
        data-mode={mode}
        {...{ [TOOLBAR_NEXT_SCOPE_ROOT_ATTR]: "main" }}
        ref={handleRef}
        onBlurCapture={(event) => {
          keyboardNavigation.handleBlurCapture(event);
          onBlurCapture?.(event);
        }}
        onFocusCapture={(event) => {
          keyboardNavigation.handleFocusCapture(event);
          onFocusCapture?.(event);
        }}
        onKeyDownCapture={(event) => {
          keyboardNavigation.handleKeyDownCapture(event);
          onKeyDownCapture?.(event);
        }}
        onPointerDownCapture={(event) => {
          keyboardNavigation.handlePointerDownCapture(event);
          onPointerDownCapture?.(event);
        }}
        {...rest}
        role="toolbar"
        aria-orientation="horizontal"
      >
        {mode === "invalid" ? (
          children
        ) : (
          <>
            <ToolbarNextOverflowOwners
              hostNodes={itemHostNodes}
              items={allItems}
            />
            <div aria-hidden className={clsx(withBaseName("measurements"))}>
              {overflowTriggerGroups
                .filter((group) => !group.named)
                .map((group) => (
                  <Button
                    appearance="transparent"
                    className={withBaseName("measureTrigger")}
                    key={group.id}
                    ref={getTriggerMeasureRef(group.key)}
                    sentiment="neutral"
                    tabIndex={-1}
                  >
                    <ToolbarNextOverflowTriggerContent
                      label={group.label}
                      named={group.named}
                    />
                  </Button>
                ))}
              {namedTriggerMeasureItems.map((item) => {
                const group = overflowTriggerGroupByKey.get(
                  item.overflowGroupKey,
                );

                if (!group) {
                  return null;
                }

                return (
                  <div
                    className={withOverflowBaseName("slot")}
                    key={`measure-${item.id}`}
                    ref={getNamedTriggerMeasureRef(item.id)}
                  >
                    {cloneMeasureDecorations(
                      item.id,
                      "leading",
                      item.leadingDecorations,
                    )}
                    <div className={withOverflowBaseName("item")}>
                      <Button
                        appearance="transparent"
                        className={withOverflowBaseName("trigger")}
                        sentiment="neutral"
                        tabIndex={-1}
                      >
                        <ToolbarNextOverflowTriggerContent
                          label={group.label}
                          named={group.named}
                        />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            {bandPositions.map((position) => {
              const bandRegions = bandsByPosition[position];
              const shouldRenderBand = hasCenteredLayout
                ? true
                : position === "end"
                  ? bandRegions.length > 0 || sharedOverflowGroups.length > 0
                  : bandRegions.length > 0;

              if (!shouldRenderBand) {
                return null;
              }

              return (
                <div
                  className={withBaseName("band")}
                  data-band-position={position}
                  key={position}
                  ref={getBandRef(position)}
                >
                  {bandRegions.map((region) => (
                    <ToolbarNextOverflowRegion
                      getItemHostRef={getItemHostRef}
                      getItemRef={getItemRef}
                      getNamedTriggerRef={getNamedTriggerRef}
                      getRegionRef={getRegionRef}
                      key={region.key}
                      onItemFocus={keyboardNavigation.rememberItemFocus}
                      overflowGroups={namedOverflowGroups.filter(
                        (group) => group.regionKey === region.key,
                      )}
                      overflowedIds={overflowedIds}
                      region={region}
                    />
                  ))}
                  {position === "end"
                    ? sharedOverflowGroups.map((group) => (
                        <ToolbarNextOverflowMenu
                          getItemHostRef={getItemHostRef}
                          group={group}
                          key={group.id}
                          onItemFocus={keyboardNavigation.rememberItemFocus}
                        />
                      ))
                    : null}
                </div>
              );
            })}
          </>
        )}
      </div>
    );
  },
);
