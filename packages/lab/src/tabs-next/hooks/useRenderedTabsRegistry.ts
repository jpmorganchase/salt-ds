import { useIsomorphicLayoutEffect } from "@salt-ds/core";
import { useCallback, useMemo, useState } from "react";
import type { RenderedTab, TabsNextRenderMode } from "../TabsNextContext";
import { getMeasuredWidth } from "../widthMeasurement";

function sortRenderedTabs(tabs: RenderedTab[]) {
  return [...tabs].sort((tabA, tabB) => {
    if (tabA.marker === tabB.marker) {
      return 0;
    }
    if (!tabA.marker || !tabB.marker) {
      return 0;
    }

    const position = tabA.marker.compareDocumentPosition(tabB.marker);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
      return -1;
    }
    if (position & Node.DOCUMENT_POSITION_PRECEDING) {
      return 1;
    }
    return 0;
  });
}

export function useRenderedTabsRegistry() {
  const [renderedTabMap, setRenderedTabMap] = useState(
    () => new Map<string, RenderedTab>(),
  );
  const [renderMode, setRenderMode] = useState<TabsNextRenderMode>("inline");
  const [bootstrapTabs, setBootstrapTabs] = useState(() => new Set<string>());
  const [readyBootstrapTabs, setReadyBootstrapTabs] = useState(
    () => new Set<string>(),
  );
  const [bootstrapOverflowReady, setBootstrapOverflowReadyState] =
    useState(false);

  const registerBootstrapTab = useCallback((tabValue: string) => {
    setBootstrapTabs((currentTabs) => {
      if (currentTabs.has(tabValue)) {
        return currentTabs;
      }

      const nextTabs = new Set(currentTabs);
      nextTabs.add(tabValue);
      return nextTabs;
    });

    return () => {
      setBootstrapTabs((currentTabs) => {
        if (!currentTabs.has(tabValue)) {
          return currentTabs;
        }

        const nextTabs = new Set(currentTabs);
        nextTabs.delete(tabValue);
        return nextTabs;
      });
      setReadyBootstrapTabs((currentTabs) => {
        if (!currentTabs.has(tabValue)) {
          return currentTabs;
        }

        const nextTabs = new Set(currentTabs);
        nextTabs.delete(tabValue);
        return nextTabs;
      });
    };
  }, []);

  const setBootstrapTabReady = useCallback(
    (tabValue: string, ready: boolean) => {
      setReadyBootstrapTabs((currentTabs) => {
        const hasTab = currentTabs.has(tabValue);
        if (ready === hasTab) {
          return currentTabs;
        }

        const nextTabs = new Set(currentTabs);
        if (ready) {
          nextTabs.add(tabValue);
        } else {
          nextTabs.delete(tabValue);
        }
        return nextTabs;
      });
    },
    [],
  );

  const setBootstrapOverflowReady = useCallback((ready: boolean) => {
    setBootstrapOverflowReadyState((currentReady) => {
      if (currentReady === ready) {
        return currentReady;
      }

      return ready;
    });
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (renderMode === "portal" || bootstrapTabs.size < 1) {
      return;
    }

    if (!bootstrapOverflowReady) {
      return;
    }

    for (const tabValue of bootstrapTabs) {
      if (!readyBootstrapTabs.has(tabValue)) {
        return;
      }

      const renderedTab = renderedTabMap.get(tabValue);
      if (!renderedTab || getMeasuredWidth(renderedTab.root) <= 0) {
        return;
      }
    }

    setRenderMode("portal");
  }, [
    bootstrapOverflowReady,
    bootstrapTabs,
    readyBootstrapTabs,
    renderMode,
    renderedTabMap,
  ]);

  const registerRenderedTab = useCallback((tab: RenderedTab) => {
    setRenderedTabMap((map) => {
      const existing = map.get(tab.value);
      if (
        process.env.NODE_ENV !== "production" &&
        existing &&
        existing.id !== tab.id
      ) {
        console.warn(
          `TabsNext received duplicate tab value "${tab.value}". Tab values must be unique within a TabsNext instance.`,
        );
      }

      if (existing === tab) {
        return map;
      }

      const next = new Map(map);
      next.set(tab.value, tab);
      return next;
    });

    return () => {
      setRenderedTabMap((map) => {
        const existing = map.get(tab.value);
        if (!existing || existing.id !== tab.id) {
          return map;
        }

        const next = new Map(map);
        next.delete(tab.value);
        return next;
      });
    };
  }, []);

  const updateRenderedTab = useCallback(
    (value: string, updates: Partial<Omit<RenderedTab, "value">>) => {
      setRenderedTabMap((map) => {
        const existing = map.get(value);
        if (!existing) {
          return map;
        }

        let changed = false;
        const nextRecord = { ...existing };
        for (const [key, nextValue] of Object.entries(updates)) {
          const typedKey = key as keyof Omit<RenderedTab, "value">;
          if (nextRecord[typedKey] !== nextValue) {
            changed = true;
            nextRecord[typedKey] = nextValue as never;
          }
        }

        if (!changed) {
          return map;
        }

        const next = new Map(map);
        next.set(value, nextRecord);
        return next;
      });
    },
    [],
  );

  const getRenderedTab = useCallback(
    (value: string) => {
      return renderedTabMap.get(value);
    },
    [renderedTabMap],
  );

  const renderedTabs = useMemo(() => {
    return sortRenderedTabs(Array.from(renderedTabMap.values()));
  }, [renderedTabMap]);

  const renderedTabOrderMap = useMemo(() => {
    return new Map(
      renderedTabs.map((tab, index) => [tab.value, index] as const),
    );
  }, [renderedTabs]);

  const getRenderedTabOrder = useCallback(
    (value: string) => {
      return renderedTabOrderMap.get(value) ?? -1;
    },
    [renderedTabOrderMap],
  );

  return {
    renderMode,
    registerBootstrapTab,
    setBootstrapTabReady,
    setBootstrapOverflowReady,
    registerRenderedTab,
    updateRenderedTab,
    getRenderedTab,
    getRenderedTabOrder,
    renderedTabs,
  };
}
