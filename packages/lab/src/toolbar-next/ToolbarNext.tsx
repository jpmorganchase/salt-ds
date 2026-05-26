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
import type { ToolbarContentNextPosition } from "./ToolbarContentNext";
import toolbarNextCss from "./ToolbarNext.css";
import {
  type ToolbarNextItemHostKind,
  ToolbarNextOverflowContent,
  ToolbarNextOverflowMenu,
  ToolbarNextOverflowOwners,
  ToolbarNextOverflowTriggerContent,
} from "./ToolbarNextOverflow";
import { ToolbarNextOverflowFloatingBoundaryProvider } from "./ToolbarNextOverflowFloatingBoundary";
import { TOOLBAR_NEXT_SCOPE_ROOT_ATTR } from "./toolbarNextKeyboardUtils";
import {
  normalizeToolbarChildren,
  type ToolbarNextOverflowItem,
} from "./toolbarNextUtils";
import { useToolbarNextKeyboardNavigation } from "./useToolbarNextKeyboardNavigation";
import { useToolbarNextOverflow } from "./useToolbarNextOverflow";

export interface ToolbarNextProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Visual treatment of the toolbar. Defaults to `"bordered"`.
   */
  appearance?: "bordered" | "transparent";
  /**
   * Styling variant. Defaults to `"primary"`.
   */
  variant?: "primary" | "secondary" | "tertiary";
}

const withBaseName = makePrefixer("saltToolbarNext");
const withOverflowBaseName = makePrefixer("saltToolbarNextOverflow");
const bandPositions: ToolbarContentNextPosition[] = ["start", "center", "end"];

type ToolbarNextItemHostNodes = Partial<
  Record<ToolbarNextItemHostKind, HTMLDivElement | null>
>;

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
      appearance = "bordered",
      variant = "primary",
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

    const { mode, content } = normalizeToolbarChildren(children);
    const overflowContent = useMemo(
      () => normalizeToolbarChildren(children).content,
      [children],
    );

    const allItems = useMemo(
      () => content.flatMap((contentArea) => contentArea.items),
      [content],
    );

    const {
      containerRef,
      getBandRef,
      getItemRef,
      getNamedTriggerMeasureRef,
      getNamedTriggerRef,
      getContentRef,
      getTriggerMeasureRef,
      overflowGroups,
      overflowTriggerGroups,
      overflowedIds,
    } = useToolbarNextOverflow({ content: overflowContent });

    const handleRef = useForkRef(ref, containerRef);
    const invalidCompositionWarnedRef = useRef(false);
    const itemHostRefCallbacks = useRef(
      new Map<string, (node: HTMLDivElement | null) => void>(),
    );
    const [itemHostNodes, setItemHostNodes] = useState<
      Record<string, ToolbarNextItemHostNodes>
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
        Record<ToolbarContentNextPosition, typeof content>
      >(
        (bands, position) => {
          bands[position] = content.filter(
            (contentArea) => contentArea.position === position,
          );
          return bands;
        },
        {
          start: [],
          center: [],
          end: [],
        },
      );
    }, [content]);
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

    const getItemHostRef = useCallback(
      (id: string, kind: ToolbarNextItemHostKind) => {
        const callbackKey = `${id}:${kind}`;
        const existing = itemHostRefCallbacks.current.get(callbackKey);

        if (existing) {
          return existing;
        }

        const callback = (node: HTMLDivElement | null) => {
          setItemHostNodes((previous) => {
            if (previous[id]?.[kind] === node) {
              return previous;
            }

            return {
              ...previous,
              [id]: {
                ...previous[id],
                [kind]: node,
              },
            };
          });
        };

        itemHostRefCallbacks.current.set(callbackKey, callback);
        return callback;
      },
      [],
    );

    const itemOwnerHostNodes = useMemo(() => {
      return allItems.reduce<Record<string, HTMLDivElement | null>>(
        (hosts, item) => {
          const nodes = itemHostNodes[item.id];

          hosts[item.id] =
            nodes?.overflow ?? nodes?.main ?? nodes?.measurement ?? null;
          return hosts;
        },
        {},
      );
    }, [allItems, itemHostNodes]);

    const overflowedMeasurementItems = useMemo(() => {
      return allItems.filter((item) => {
        return overflowedIds.has(item.id) && !itemHostNodes[item.id]?.overflow;
      });
    }, [allItems, itemHostNodes, overflowedIds]);

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
            "ToolbarNext children must be authored in one composition model: either TooltrayNext/Divider children directly in ToolbarNext, or ToolbarContentNext children containing TooltrayNext/Divider items.",
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
          withBaseName(appearance),
          className,
        )}
        {...rest}
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
        role="toolbar"
        aria-orientation="horizontal"
      >
        {mode === "invalid" ? (
          children
        ) : (
          <ToolbarNextOverflowFloatingBoundaryProvider>
            <ToolbarNextOverflowOwners
              hostNodes={itemOwnerHostNodes}
              items={allItems}
            />
            <div aria-hidden className={withBaseName("measurements")}>
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
              {overflowedMeasurementItems.map((item) => (
                <div
                  className={withOverflowBaseName("slot")}
                  key={`measure-item-${item.id}`}
                  ref={getItemRef(item.id)}
                >
                  {cloneMeasureDecorations(
                    item.id,
                    "leading",
                    item.leadingDecorations,
                  )}
                  <div className={withOverflowBaseName("item")}>
                    <div
                      className={withOverflowBaseName("itemHost")}
                      ref={getItemHostRef(item.id, "measurement")}
                    />
                  </div>
                  {cloneMeasureDecorations(
                    item.id,
                    "trailing",
                    item.trailingDecorations,
                  )}
                </div>
              ))}
            </div>
            {bandPositions.map((position) => {
              const bandContent = bandsByPosition[position];
              const shouldRenderBand = hasCenteredLayout
                ? true
                : position === "end"
                  ? bandContent.length > 0 || sharedOverflowGroups.length > 0
                  : bandContent.length > 0;

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
                  {bandContent.map((contentArea) => (
                    <ToolbarNextOverflowContent
                      focusMemoryRef={keyboardNavigation.rememberedFocusRef}
                      getItemHostRef={getItemHostRef}
                      getItemRef={getItemRef}
                      getNamedTriggerRef={getNamedTriggerRef}
                      getContentRef={getContentRef}
                      key={contentArea.key}
                      onItemFocus={keyboardNavigation.rememberItemFocus}
                      overflowGroups={namedOverflowGroups.filter(
                        (group) => group.contentKey === contentArea.key,
                      )}
                      overflowedIds={overflowedIds}
                      content={contentArea}
                    />
                  ))}
                  {position === "end"
                    ? sharedOverflowGroups.map((group) => (
                        <ToolbarNextOverflowMenu
                          focusMemoryRef={keyboardNavigation.rememberedFocusRef}
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
          </ToolbarNextOverflowFloatingBoundaryProvider>
        )}
      </div>
    );
  },
);
