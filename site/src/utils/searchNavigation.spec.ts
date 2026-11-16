import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSearchNavigation } from "./searchNavigation";

const SOURCE = "/salt/components/combo-box/examples";
const DESTINATION = "/salt/components/button/examples";
const ORIGIN = "https://salt.example";

type Heading = {
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
  let main = {
    contains: (element: Heading) => [...headings.values()].includes(element),
  };
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
    const heading: Heading = {
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
    };
    headings.set(id, heading);
    return heading;
  };

  return {
    browser,
    root,
    observers,
    addHeading,
    mountPage() {
      headings = new Map();
      const pageHeadings = headings;
      main = {
        contains: (element) => [...pageHeadings.values()].includes(element),
      };
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

describe("search anchor navigation", () => {
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
    navigation.requestAnchor(`${DESTINATION}#${id}`);
    page.setUrl(`${DESTINATION}#${id}`);
    page.mountPage();
    const heading = page.addHeading(id, documentTop);
    navigation.commitRoute(DESTINATION);
    page.flushFrames();
    return heading;
  }

  it("waits for the destination commit even when the old page has the same ID", () => {
    const previous = page.addHeading("disabled", 1000);
    expect(navigation.requestAnchor(`${DESTINATION}#disabled`)).toBe(true);
    page.setUrl(`${DESTINATION}#disabled`);
    navigation.commitRoute(SOURCE);
    page.flushFrames();
    expect(previous.scrollIntoView).not.toHaveBeenCalled();

    page.mountPage();
    const destination = page.addHeading("disabled", 1500);
    navigation.commitRoute(DESTINATION);
    page.flushFrames();
    expect(destination.getBoundingClientRect().top).toBe(72);
    expect(previous.scrollIntoView).not.toHaveBeenCalled();
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
    navigation.requestAnchor(`${DESTINATION}#disabled`);
    page.setUrl(`${DESTINATION}#disabled`);
    page.mountPage();
    navigation.commitRoute(DESTINATION);
    page.flushFrames();
    const heading = page.addHeading("disabled", 1600);
    page.resizeContent();
    page.flushFrames();
    expect(heading.getBoundingClientRect().top).toBe(72);
  });

  it("restarts an identical URL selection without another route commit", () => {
    const heading = arrive();
    page.event("wheel");
    page.browser.scrollY = 0;

    expect(navigation.requestAnchor(`${DESTINATION}#disabled`)).toBe(true);
    page.flushFrames();
    expect(heading.getBoundingClientRect().top).toBe(72);
    expect(heading.scrollIntoView).toHaveBeenCalledTimes(2);
  });

  it("handles a different hash on the current page before Next updates history", () => {
    arrive();
    const next = page.addHeading("full-width", 2500);
    navigation.requestAnchor(`${DESTINATION}#full-width`);
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
    navigation.requestAnchor(`${DESTINATION}#disabled`);
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
    navigation.requestAnchor(`${DESTINATION}#full-width`);
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

  it("leaves non-anchor navigation to Next and cancels the old anchor", () => {
    const heading = arrive();
    expect(navigation.requestAnchor("/salt/about/index")).toBe(false);
    heading.documentTop += 342;
    page.resizeContent();
    page.flushFrames();
    expect(heading.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(navigation.requestAnchor("https://other.example/#heading")).toBe(
      false,
    );
    expect(navigation.requestAnchor(`${DESTINATION}#%invalid`)).toBe(false);
  });
});
