import { clsx } from "clsx";
import {
  createContext,
  forwardRef,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  type FloatingComponentProps,
  FloatingComponentProvider,
  type FloatingComponentProviderProps,
  makePrefixer,
  useFloatingComponent,
  useForkRef,
} from "../utils";

import { TOOLBAR_SCOPE_ROOT_ATTR } from "./toolbarKeyboardUtils";

const withBaseName = makePrefixer("saltToolbarOverflow");

interface ToolbarOverflowFloatingBoundaryContextValue {
  isTargetInsideBoundary: (
    boundaryKey: string,
    target: EventTarget | null,
  ) => boolean;
  registerFloatingRoot: (boundaryKey: string, root: HTMLElement) => () => void;
}

const ToolbarOverflowFloatingBoundaryContext =
  createContext<ToolbarOverflowFloatingBoundaryContextValue | null>(null);

interface ToolbarOverflowFloatingComponentContextValue {
  boundaryKey: string | null;
  floatingBoundary: ToolbarOverflowFloatingBoundaryContextValue | null;
  ParentFloatingComponent: FloatingComponentProviderProps["Component"];
}

const ToolbarOverflowFloatingComponentContext =
  createContext<ToolbarOverflowFloatingComponentContextValue | null>(null);

function isNodeTarget(target: EventTarget | null): target is Node {
  return target != null && "nodeType" in target;
}

function containsTarget(
  element: HTMLElement | null,
  target: EventTarget | null,
) {
  if (!element || !isNodeTarget(target)) {
    return false;
  }

  return element === target || element.contains(target);
}

export function ToolbarOverflowFloatingBoundaryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const floatingRootsRef = useRef(new Map<string, Set<HTMLElement>>());

  const registerFloatingRoot = useCallback(
    (boundaryKey: string, root: HTMLElement) => {
      let floatingRoots = floatingRootsRef.current.get(boundaryKey);

      if (!floatingRoots) {
        floatingRoots = new Set<HTMLElement>();
        floatingRootsRef.current.set(boundaryKey, floatingRoots);
      }

      floatingRoots.add(root);

      return () => {
        const currentFloatingRoots = floatingRootsRef.current.get(boundaryKey);

        currentFloatingRoots?.delete(root);

        if (currentFloatingRoots?.size === 0) {
          floatingRootsRef.current.delete(boundaryKey);
        }
      };
    },
    [],
  );

  const isTargetInsideBoundary = useCallback(
    (boundaryKey: string, target: EventTarget | null) => {
      if (!isNodeTarget(target)) {
        return false;
      }

      const floatingRoots = floatingRootsRef.current.get(boundaryKey);

      if (!floatingRoots) {
        return false;
      }

      for (const floatingRoot of floatingRoots) {
        if (!floatingRoot.isConnected) {
          floatingRoots.delete(floatingRoot);
          continue;
        }

        if (floatingRoot === target || floatingRoot.contains(target)) {
          return true;
        }
      }

      if (floatingRoots.size === 0) {
        floatingRootsRef.current.delete(boundaryKey);
      }

      return false;
    },
    [],
  );

  const value = useMemo(
    () => ({
      isTargetInsideBoundary,
      registerFloatingRoot,
    }),
    [isTargetInsideBoundary, registerFloatingRoot],
  );

  return (
    <ToolbarOverflowFloatingBoundaryContext.Provider value={value}>
      {children}
    </ToolbarOverflowFloatingBoundaryContext.Provider>
  );
}

export function useToolbarOverflowFloatingBoundary() {
  return useContext(ToolbarOverflowFloatingBoundaryContext);
}

export function isTargetInsideOverflowBoundary(
  panelContent: HTMLElement | null,
  floatingBoundary: ToolbarOverflowFloatingBoundaryContextValue | null,
  boundaryKey: string,
  target: EventTarget | null,
) {
  if (containsTarget(panelContent, target)) {
    return true;
  }

  return floatingBoundary?.isTargetInsideBoundary(boundaryKey, target) ?? false;
}

export function getToolbarOverflowBoundaryKey(host: HTMLElement | null) {
  const scopeRoot = host?.closest<HTMLElement>(`[${TOOLBAR_SCOPE_ROOT_ATTR}]`);
  const boundaryKey = scopeRoot?.getAttribute(TOOLBAR_SCOPE_ROOT_ATTR);

  return boundaryKey && boundaryKey !== "main" ? boundaryKey : null;
}

const ToolbarOverflowFloatingComponent = forwardRef<
  HTMLDivElement,
  FloatingComponentProps
>(function ToolbarOverflowFloatingComponent(
  { className, open, ...props },
  ref,
) {
  const componentContext = useContext(ToolbarOverflowFloatingComponentContext);
  const unregisterRef = useRef<(() => void) | null>(null);
  const registerRef = useCallback(
    (node: HTMLDivElement | null) => {
      unregisterRef.current?.();
      unregisterRef.current = null;

      if (node && open) {
        unregisterRef.current =
          componentContext?.boundaryKey != null
            ? (componentContext.floatingBoundary?.registerFloatingRoot(
                componentContext.boundaryKey,
                node,
              ) ?? null)
            : null;
      }
    },
    [componentContext, open],
  );
  const handleRef = useForkRef<HTMLDivElement>(ref, registerRef);

  useEffect(() => {
    return () => {
      unregisterRef.current?.();
      unregisterRef.current = null;
    };
  }, []);

  if (!componentContext) {
    return null;
  }

  const { ParentFloatingComponent } = componentContext;

  return (
    <ParentFloatingComponent
      className={clsx(
        className,
        componentContext.boundaryKey != null &&
          withBaseName("floatingDescendant"),
      )}
      open={open}
      {...props}
      ref={handleRef}
    />
  );
});

export function ToolbarOverflowFloatingComponentProvider({
  boundaryKey,
  children,
}: {
  boundaryKey: string | null;
  children: ReactNode;
}) {
  const { Component: ParentFloatingComponent } = useFloatingComponent();
  const floatingBoundary = useToolbarOverflowFloatingBoundary();
  const value = useMemo(
    () => ({
      boundaryKey,
      floatingBoundary,
      ParentFloatingComponent,
    }),
    [boundaryKey, floatingBoundary, ParentFloatingComponent],
  );

  return (
    <ToolbarOverflowFloatingComponentContext.Provider value={value}>
      <FloatingComponentProvider Component={ToolbarOverflowFloatingComponent}>
        {children}
      </FloatingComponentProvider>
    </ToolbarOverflowFloatingComponentContext.Provider>
  );
}
