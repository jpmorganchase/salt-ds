import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSearchNavigation } from "./searchNavigation";

const SOURCE = "/salt/components/combo-box/examples";
const DESTINATION = "/salt/components/button/examples";
const ORIGIN = "https://salt.example";

type FocusTarget = EventTarget & {
  tabIndex: number;
  hasAttribute: (name: string) => boolean;
  removeAttribute: (name: string) => void;
  focus: ReturnType<typeof vi.fn<(options?: FocusOptions) => void>>;
};

type Heading = FocusTarget & {
  documentTop: number;
  margin: number;
  getBoundingClientRect: () => { top: number };
  scrollIntoView: ReturnType<typeof vi.fn>;
};

/** Model document geometry while keeping navigation and event delivery real. */
function createDocument() {
  const frames = new Map<number, FrameRequestCallback>();
  let frameId = 0;
  let padding = 72;
  let headings = new Map<string, Heading>();
  let activeElement: FocusTarget | undefined;

  const createFocusTarget = (): FocusTarget => {
    const attributes = new Map<string, string>();
    const element: FocusTarget = Object.assign(new EventTarget(), {
      tabIndex: -1,
      hasAttribute: (name: string) => attributes.has(name),
      removeAttribute: (name: string) => attributes.delete(name),
      focus: vi.fn(() => {
        if (activeElement !== element) {
          activeElement?.dispatchEvent(new Event("blur"));
          activeElement = element;
          const event = new Event("focusin");
          Object.defineProperty(event, "target", { value: element });
          browser.dispatchEvent(event);
        }
      }),
    });
    return Object.defineProperty(element, "tabIndex", {
      get: () => Number(attributes.get("tabindex") ?? -1),
      set: (value: number) => attributes.set("tabindex", String(value)),
    });
  };

  const createMain = () => {
    const pageHeadings = headings;
    return Object.assign(createFocusTarget(), {
      contains: (element: Heading) =>
        [...pageHeadings.values()].includes(element),
      querySelector: () => pageHeadings.get("page-title"),
    });
  };
  let main = createMain();
  const root = { clientHeight: 800, scrollHeight: 4000 };
  const browser = Object.assign(new EventTarget(), {
    location: new URL(SOURCE, ORIGIN),
    scrollY: 0,
    requestAnimationFrame(callback: FrameRequestCallback) {
      frames.set(++frameId, callback);
      return frameId;
    },
    cancelAnimationFrame(id: number) {
      frames.delete(id);
    },
    getComputedStyle(element: Heading | typeof root) {
      return {
        scrollPaddingTop: `${padding}px`,
        scrollMarginTop: `${"margin" in element ? element.margin : 0}px`,
      };
    },
  });
  const observers: ResizeObserverMock[] = [];

  class ResizeObserverMock {
    observed = false;
    constructor(readonly callback: ResizeObserverCallback) {
      observers.push(this);
    }
    observe() {
      this.observed = true;
    }
    disconnect() {
      this.observed = false;
    }
    deliver() {
      this.callback([], this as unknown as ResizeObserver);
    }
  }

  vi.stubGlobal("window", browser);
  vi.stubGlobal("document", {
    documentElement: root,
    scrollingElement: root,
    querySelector: () => main,
    getElementById: (id: string) => headings.get(id),
  });
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);

  const addHeading = (id: string, documentTop: number) => {
    const heading: Heading = Object.assign(createFocusTarget(), {
      documentTop,
      margin: 0,
      getBoundingClientRect: () => ({
        top: heading.documentTop - browser.scrollY,
      }),
      scrollIntoView: vi.fn(() => {
        browser.scrollY = Math.max(
          0,
          Math.min(
            heading.documentTop - padding - heading.margin,
            root.scrollHeight - root.clientHeight,
          ),
        );
      }),
    });
    headings.set(id, heading);
    return heading;
  };

  return {
    browser,
    root,
    observers,
    addHeading,
    createFocusTarget,
    get main() {
      return main;
    },
    get activeElement() {
      return activeElement;
    },
    mountPage() {
      headings = new Map();
      main = createMain();
    },
    setUrl(href: string) {
      browser.location = new URL(href, ORIGIN);
    },
    setPadding(value: number) {
      padding = value;
    },
    flushFrames() {
      const pending = [...frames.values()];
      frames.clear();
      for (const callback of pending) callback(0);
    },
    resizeContent() {
      for (const observer of observers) {
        if (observer.observed) observer.deliver();
      }
    },
    event(type: string) {
      browser.dispatchEvent(new Event(type));
    },
  };
}

describe("search navigation", () => {
  let page: ReturnType<typeof createDocument>;
  let navigation: ReturnType<typeof createSearchNavigation>;

  beforeEach(() => {
    page = createDocument();
    navigation = createSearchNavigation();
    navigation.commitRoute(SOURCE);
  });

  afterEach(() => {
    navigation.cancel();
    vi.unstubAllGlobals();
  });

  function arrive(id = "disabled", documentTop = 1500) {
    navigation.request(`${DESTINATION}#${id}`);
    page.setUrl(`${DESTINATION}#${id}`);
    page.mountPage();
    const heading = page.addHeading(id, documentTop);
    navigation.commitRoute(DESTINATION);
    page.flushFrames();
    return heading;
  }

  it("waits for the destination commit even when the old page has the same ID", () => {
    const previous = page.addHeading("disabled", 1000);
    expect(navigation.request(`${DESTINATION}#disabled`)).toBe(true);
    page.setUrl(`${DESTINATION}#disabled`);
    navigation.commitRoute(SOURCE);
    page.flushFrames();
    expect(previous.scrollIntoView).not.toHaveBeenCalled();
    expect(previous.focus).not.toHaveBeenCalled();

    page.mountPage();
    const destination = page.addHeading("disabled", 1500);
    navigation.commitRoute(DESTINATION);
    page.flushFrames();
    expect(destination.getBoundingClientRect().top).toBe(72);
    expect(previous.scrollIntoView).not.toHaveBeenCalled();
    expect(destination.focus).toHaveBeenCalledExactlyOnceWith({
      preventScroll: true,
    });
    expect(page.activeElement).toBe(destination);
  });

  it("corrects late layout growth and does no work when geometry is unchanged", () => {
    const heading = arrive();
    expect(heading.getBoundingClientRect().top).toBe(72);
    heading.documentTop += 342;
    page.root.scrollHeight += 342;
    expect(heading.getBoundingClientRect().top).toBe(414);
    page.resizeContent();
    page.flushFrames();
    expect(heading.getBoundingClientRect().top).toBe(72);
    expect(heading.scrollIntoView).toHaveBeenCalledTimes(2);
    expect(heading.focus).toHaveBeenCalledTimes(1);
    expect(heading.scrollIntoView).toHaveBeenLastCalledWith({
      behavior: "instant",
      block: "start",
      inline: "nearest",
    });

    page.event("scroll");
    page.resizeContent();
    page.flushFrames();
    expect(heading.scrollIntoView).toHaveBeenCalledTimes(2);
  });

  it("finds a heading introduced by a later content commit", () => {
    navigation.request(`${DESTINATION}#disabled`);
    page.setUrl(`${DESTINATION}#disabled`);
    page.mountPage();
    navigation.commitRoute(DESTINATION);
    page.flushFrames();
    const heading = page.addHeading("disabled", 1600);
    page.resizeContent();
    page.flushFrames();
    expect(heading.getBoundingClientRect().top).toBe(72);
    expect(heading.focus).toHaveBeenCalledTimes(1);
  });

  it("restarts an identical URL selection without another route commit", () => {
    const heading = arrive();
    page.event("wheel");
    page.browser.scrollY = 0;

    expect(navigation.request(`${DESTINATION}#disabled`)).toBe(true);
    page.flushFrames();
    expect(heading.getBoundingClientRect().top).toBe(72);
    expect(heading.scrollIntoView).toHaveBeenCalledTimes(2);
    expect(heading.focus).toHaveBeenCalledTimes(2);
  });

  it("handles a different hash on the current page before Next updates history", () => {
    arrive();
    const next = page.addHeading("full-width", 2500);
    navigation.request(`${DESTINATION}#full-width`);
    page.flushFrames();
    expect(next.getBoundingClientRect().top).toBe(72);
    page.setUrl(`${DESTINATION}#full-width`);
    next.documentTop += 120;
    page.resizeContent();
    page.flushFrames();
    expect(next.getBoundingClientRect().top).toBe(72);
  });

  it.each([
    "wheel",
    "touchstart",
    "pointerdown",
    "keydown",
    "popstate",
    "hashchange",
    "pagehide",
  ])(
    "relinquishes scroll ownership on %s, including queued corrections",
    (event) => {
      const heading = arrive();
      heading.documentTop += 342;
      page.resizeContent();
      page.event(event);
      page.flushFrames();
      for (const observer of page.observers) observer.deliver();
      page.flushFrames();
      expect(heading.scrollIntoView).toHaveBeenCalledTimes(1);
      expect(page.observers.every((observer) => !observer.observed)).toBe(true);
    },
  );

  it("allows automatic viewport resizing while waiting for the destination", () => {
    navigation.request(`${DESTINATION}#disabled`);
    page.event("resize");
    page.flushFrames();
    page.setUrl(`${DESTINATION}#disabled`);
    page.mountPage();
    const heading = page.addHeading("disabled", 1500);
    navigation.commitRoute(DESTINATION);
    page.flushFrames();
    expect(heading.getBoundingClientRect().top).toBe(72);

    page.setPadding(96);
    heading.margin = 8;
    page.event("resize");
    page.flushFrames();
    expect(heading.getBoundingClientRect().top).toBe(104);
  });

  it("cancels unowned scrolling but preserves browser layout anchoring", () => {
    const heading = arrive();
    heading.documentTop += 342;
    page.browser.scrollY += 100;
    page.event("scroll");
    page.flushFrames();
    expect(heading.getBoundingClientRect().top).toBe(72);

    page.browser.scrollY -= 500;
    page.event("scroll");
    heading.documentTop += 200;
    page.resizeContent();
    page.flushFrames();
    expect(heading.scrollIntoView).toHaveBeenCalledTimes(2);
  });

  it("replaces an old intent and ignores its already queued observer callback", () => {
    const previous = arrive();
    const oldObserver = page.observers[0];
    const next = page.addHeading("full-width", 2500);
    previous.documentTop += 342;
    page.resizeContent();
    navigation.request(`${DESTINATION}#full-width`);
    page.setUrl(`${DESTINATION}#full-width`);
    oldObserver.deliver();
    page.flushFrames();
    expect(previous.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(next.getBoundingClientRect().top).toBe(72);
    expect(page.observers.filter((observer) => observer.observed)).toHaveLength(
      1,
    );
  });

  it("does not keep scrolling a heading that is already at the page bottom", () => {
    page.root.scrollHeight = 3000;
    const heading = arrive("last-section", 2900);
    expect(page.browser.scrollY).toBe(2200);
    page.resizeContent();
    page.flushFrames();
    expect(heading.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("stops after a different page commits", () => {
    const heading = arrive();
    page.setUrl("/salt/about/index");
    navigation.commitRoute("/salt/about/index");
    heading.documentTop += 342;
    page.resizeContent();
    page.flushFrames();
    expect(heading.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it.each(["keydown", "pointerdown", "popstate"])(
    "does not steal focus if %s cancels a pending navigation",
    (event) => {
      navigation.request(`${DESTINATION}#disabled`);
      page.event(event);
      page.setUrl(`${DESTINATION}#disabled`);
      page.mountPage();
      const heading = page.addHeading("disabled", 1500);
      navigation.commitRoute(DESTINATION);
      page.flushFrames();
      expect(heading.focus).not.toHaveBeenCalled();
      expect(heading.scrollIntoView).not.toHaveBeenCalled();
    },
  );

  it.each(["blur", "pagehide"])(
    "removes temporary heading focusability on %s",
    (event) => {
      const heading = arrive();
      expect(heading.hasAttribute("tabindex")).toBe(true);
      expect(heading.tabIndex).toBe(-1);
      if (event === "blur") {
        heading.dispatchEvent(new Event(event));
      } else {
        page.event(event);
      }
      expect(heading.hasAttribute("tabindex")).toBe(false);
    },
  );

  it.each([-1, 0])("preserves an author's tabindex of %s", (tabIndex) => {
    const heading = page.addHeading("disabled", 1000);
    heading.tabIndex = tabIndex;
    navigation.request(`${SOURCE}#disabled`);
    page.flushFrames();
    heading.dispatchEvent(new Event("blur"));
    expect(heading.hasAttribute("tabindex")).toBe(true);
    expect(heading.tabIndex).toBe(tabIndex);
  });

  it("focuses the page heading once while leaving page scrolling to Next", () => {
    const previous = page.addHeading("page-title", 1000);
    expect(navigation.request(DESTINATION)).toBe(false);
    page.flushFrames();
    expect(previous.focus).not.toHaveBeenCalled();

    page.setUrl(DESTINATION);
    page.mountPage();
    const heading = page.addHeading("page-title", 120);
    page.browser.scrollY = 60;
    navigation.commitRoute(DESTINATION);
    page.flushFrames();
    expect(heading.focus).toHaveBeenCalledExactlyOnceWith({
      preventScroll: true,
    });
    expect(heading.scrollIntoView).not.toHaveBeenCalled();
    expect(page.browser.scrollY).toBe(60);
    page.resizeContent();
    navigation.commitRoute(DESTINATION);
    page.flushFrames();
    expect(heading.focus).toHaveBeenCalledTimes(1);
  });

  it("focuses main when a page result has no heading", () => {
    expect(navigation.request(DESTINATION)).toBe(false);
    page.setUrl(DESTINATION);
    page.mountPage();
    navigation.commitRoute(DESTINATION);
    page.flushFrames();
    expect(page.activeElement).toBe(page.main);
    expect(page.main.focus).toHaveBeenCalledExactlyOnceWith({
      preventScroll: true,
    });
    page.event("pagehide");
    expect(page.main.hasAttribute("tabindex")).toBe(false);
  });

  it("restores a detached target when another page commits without a blur", () => {
    const heading = arrive();
    page.mountPage();
    navigation.commitRoute("/salt/about/index");
    expect(heading.hasAttribute("tabindex")).toBe(false);
  });

  it("restores temporary focusability when the controller is disposed", () => {
    const heading = arrive();
    navigation.cancel();
    expect(heading.hasAttribute("tabindex")).toBe(false);
  });

  it("allows ComboBox to restore input focus after pointer selection", () => {
    const input = page.createFocusTarget();
    navigation.request(
      `${DESTINATION}#disabled`,
      input as unknown as HTMLElement,
    );
    input.focus();
    page.setUrl(`${DESTINATION}#disabled`);
    page.mountPage();
    const heading = page.addHeading("disabled", 1500);
    navigation.commitRoute(DESTINATION);
    page.flushFrames();
    expect(heading.focus).toHaveBeenCalledTimes(1);
  });

  it("cancels pending focus when focus moves to another control without keyboard input", () => {
    navigation.request(`${DESTINATION}#disabled`);
    const other = page.createFocusTarget();
    other.focus();
    page.setUrl(`${DESTINATION}#disabled`);
    page.mountPage();
    const heading = page.addHeading("disabled", 1500);
    navigation.commitRoute(DESTINATION);
    page.flushFrames();
    expect(heading.focus).not.toHaveBeenCalled();
    expect(page.activeElement).toBe(other);
  });

  it("stops resize corrections when focus moves away from the destination", () => {
    const heading = arrive();
    const other = page.createFocusTarget();
    other.focus();
    heading.documentTop += 342;
    page.resizeContent();
    page.flushFrames();
    expect(heading.focus).toHaveBeenCalledTimes(1);
    expect(heading.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(page.activeElement).toBe(other);
  });

  it("cancels old anchors when page results or unsupported destinations are requested", () => {
    const heading = arrive();
    expect(navigation.request("/salt/about/index")).toBe(false);
    heading.documentTop += 342;
    page.resizeContent();
    page.flushFrames();
    expect(heading.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(navigation.request("https://other.example/#heading")).toBe(false);
    expect(navigation.request(`${DESTINATION}#%invalid`)).toBe(false);
  });
});
