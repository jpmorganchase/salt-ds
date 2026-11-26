type TabBar = { route: string; element: HTMLElement };
type PendingNavigation = {
  cancel: () => void;
  commitRoute: (route: string) => void;
  updateTabBar: () => void;
};

/** Preserve tab focus when the App Router replaces a document's page layout. */
export function createTabNavigation() {
  let tabBar: TabBar | undefined;
  let pending: PendingNavigation | undefined;

  const cancel = () => pending?.cancel();

  return {
    cancel,
    registerTabBar(route: string, element: HTMLElement | null) {
      if (element) tabBar = { route, element };
      else if (tabBar?.route === route) tabBar = undefined;
      pending?.updateTabBar();
    },
    commitRoute(route: string) {
      pending?.commitRoute(route);
    },
    requestFocus(route: string, value: string, source: Element) {
      cancel();
      const sourceBar = tabBar;
      const document = source.ownerDocument;
      const targetWindow = document.defaultView;
      if (
        !sourceBar ||
        sourceBar.route === route ||
        !targetWindow ||
        sourceBar.element.ownerDocument !== document ||
        (document.activeElement !== source &&
          document.activeElement !== document.body) ||
        source.getAttribute("role") !== "tab" ||
        source.getAttribute("data-value") !== value
      ) {
        return;
      }

      // An overflow tab lives in a portal. Closing that menu can remove its
      // focus before onChange runs, so retain the actual initiating trigger.
      let committed = false;
      let disposed = false;
      let frame: number | undefined;
      let observedBar: HTMLElement | undefined;
      const cancelEvents = [
        "keydown",
        "pointerdown",
        "wheel",
        "touchstart",
        "popstate",
        "hashchange",
        "pagehide",
      ];

      const finish = () => {
        disposed = true;
        observer.disconnect();
        if (frame !== undefined) targetWindow.cancelAnimationFrame(frame);
        for (const event of cancelEvents) {
          targetWindow.removeEventListener(event, finish, true);
        }
        document.removeEventListener("focusin", handleFocus, true);
        if (pending === navigation) pending = undefined;
      };
      const handleFocus = (event: FocusEvent) => {
        if (event.target !== source) finish();
      };
      const schedule = () => {
        if (disposed || !committed || frame !== undefined) return;
        frame = targetWindow.requestAnimationFrame(() => {
          frame = undefined;
          if (disposed || tabBar?.route !== route) return;
          const target = Array.from(
            tabBar.element.querySelectorAll<HTMLElement>(
              '[role="tab"][aria-selected="true"]',
            ),
          ).find((element) => element.getAttribute("data-value") === value);
          if (
            !target?.isConnected ||
            !target.getClientRects().length ||
            targetWindow.getComputedStyle(target).visibility !== "visible"
          ) {
            return;
          }

          // Wait for the mounted tablist, including its portal bootstrap. A
          // search field or other control focused in the meantime keeps focus.
          if (
            document.activeElement !== document.body &&
            document.activeElement !== source
          ) {
            finish();
            return;
          }
          finish();
          target.focus({ preventScroll: true });
        });
      };
      const observer = new MutationObserver(schedule);
      const navigation: PendingNavigation = {
        cancel: finish,
        commitRoute(nextRoute) {
          if (nextRoute === route) committed = true;
          else if (committed || nextRoute !== sourceBar.route) finish();
          schedule();
        },
        updateTabBar() {
          const element = tabBar?.route === route ? tabBar.element : undefined;
          if (observedBar !== element) {
            observer.disconnect();
            observedBar = element;
            if (element) {
              observer.observe(element, {
                childList: true,
                subtree: true,
                attributes: true,
              });
            }
          }
          schedule();
        },
      };
      pending = navigation;
      // Capture precedes the initiating React handler, so its Enter/click does
      // not cancel the intent. Further reader input relinquishes ownership.
      for (const event of cancelEvents) {
        targetWindow.addEventListener(event, finish, {
          capture: true,
          passive: true,
        });
      }
      document.addEventListener("focusin", handleFocus, true);
    },
  };
}
