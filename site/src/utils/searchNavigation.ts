type ActiveNavigation = {
  cancel: () => void;
  commitRoute: (route: string) => void;
};

/** Keep a search heading in place while examples load, until the reader acts. */
export function createSearchNavigation() {
  let committedRoute: string | undefined;
  let active: ActiveNavigation | undefined;

  const cancel = () => active?.cancel();

  return {
    cancel,
    commitRoute(route: string) {
      committedRoute = route;
      active?.commitRoute(route);
    },
    requestAnchor(href: string) {
      cancel();
      const source = new URL(window.location.href);
      const sourceRoute = committedRoute;
      const destination = new URL(href, source);
      if (!destination.hash || destination.origin !== source.origin)
        return false;

      let id: string;
      try {
        id = decodeURIComponent(destination.hash.slice(1));
      } catch {
        return false;
      }

      let disposed = false;
      let arrived = false;
      let destinationCommitted = false;
      let main: HTMLElement | null = null;
      let observer: ResizeObserver | undefined;
      let frame: number | undefined;
      let lastDocumentTop: number | undefined;
      let ownedScrollY: number | undefined;

      // Capture runs before React's result-selection handler, so its initiating
      // Enter or pointer event cannot cancel the newly requested navigation.
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
        if (disposed) return;
        disposed = true;
        observer?.disconnect();
        if (frame !== undefined) window.cancelAnimationFrame(frame);
        for (const event of cancelEvents) {
          window.removeEventListener(event, finish, true);
        }
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", schedule);
        if (active === navigation) active = undefined;
      };

      const current = () => {
        if (disposed) return false;
        const href = window.location.href;
        if (href === destination.href) arrived = true;
        if (href !== destination.href && (arrived || href !== source.href)) {
          finish();
          return false;
        }
        return true;
      };

      const target = () => {
        const element = document.getElementById(id);
        return element && main?.contains(element) ? element : undefined;
      };

      const align = () => {
        if (!current()) return;
        const element = target();
        if (!element) return;

        const root = document.documentElement;
        const scrollRoot = document.scrollingElement ?? root;
        const padding =
          Number.parseFloat(window.getComputedStyle(root).scrollPaddingTop) ||
          0;
        const margin =
          Number.parseFloat(window.getComputedStyle(element).scrollMarginTop) ||
          0;
        const documentTop =
          element.getBoundingClientRect().top + window.scrollY;
        const desired = Math.max(
          0,
          Math.min(
            documentTop - padding - margin,
            scrollRoot.scrollHeight - root.clientHeight,
          ),
        );

        if (Math.abs(window.scrollY - desired) > 1) {
          // Instant corrections also respect reduced motion and do not queue
          // competing smooth-scroll animations as individual previews arrive.
          element.scrollIntoView({
            behavior: "instant",
            block: "start",
            inline: "nearest",
          });
        }
        lastDocumentTop = documentTop;
        ownedScrollY = window.scrollY;
      };

      const schedule = () => {
        if (disposed || frame !== undefined) return;
        frame = window.requestAnimationFrame(() => {
          frame = undefined;
          align();
        });
      };

      function handleScroll() {
        if (!current() || lastDocumentTop === undefined) return;
        const element = target();
        if (!element) return;
        const documentTop =
          element.getBoundingClientRect().top + window.scrollY;

        // Scrollbar dragging and assistive navigation need not emit pointer or
        // keyboard events. Distinguish them from layout-induced scroll anchoring.
        if (
          ownedScrollY !== undefined &&
          Math.abs(window.scrollY - ownedScrollY) > 1 &&
          Math.abs(documentTop - lastDocumentTop) <= 1
        ) {
          finish();
        } else if (Math.abs(documentTop - lastDocumentTop) > 1) {
          schedule();
        }
      }

      const navigation: ActiveNavigation = {
        cancel: finish,
        commitRoute(route) {
          if (!current()) return;
          if (route !== destination.pathname) {
            if (destinationCommitted || route !== sourceRoute) finish();
            return;
          }
          destinationCommitted = true;

          // FrameSync runs after the destination DOM commits. A matching ID on
          // the previous page must never satisfy a pending cross-page search.
          const nextMain = document.querySelector("main");
          if (main !== nextMain) {
            observer?.disconnect();
            main = nextMain;
            observer ??= new ResizeObserver(schedule);
            if (main) observer.observe(main);
          }
          schedule();
        },
      };
      active = navigation;
      for (const event of cancelEvents) {
        window.addEventListener(event, finish, {
          capture: true,
          passive: true,
        });
      }
      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", schedule, { passive: true });
      if (committedRoute) navigation.commitRoute(committedRoute);
      return true;
    },
  };
}
