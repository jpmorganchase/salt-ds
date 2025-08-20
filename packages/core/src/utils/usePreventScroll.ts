/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/**
 * Taken from https://github.com/adobe/react-spectrum/blob/cc08a8dbc95d3648eee47bc9b8e0ed48448e0da2/packages/%40react-aria/overlays/src/usePreventScroll.ts#L44 but refactored.
 * This hook currently doesn't use `useWindow` because in a desktop environment the main window is only the window they typically want locked.
 * If we need to in the future we can add an option to specify which window should be affected.
 */

import { createChainedFunction } from "./createChainedFunction";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

interface PreventScrollOptions {
  /** Whether the scroll lock is disabled. */
  isDisabled?: boolean;
}

const visualViewport = typeof document !== "undefined" && window.visualViewport;

// HTML input types that do not cause the software keyboard to appear.
const nonTextInputTypes = new Set([
  "checkbox",
  "radio",
  "range",
  "color",
  "file",
  "image",
  "button",
  "submit",
  "reset",
]);

// The number of active usePreventScroll calls. Used to determine whether to revert back to the original page style/scroll position
let preventScrollCount = 0;
let restore: () => void;

/**
 * Prevents scrolling on the document body on mount, and
 * restores it on unmount. Also ensures that content does not
 * shift due to the scrollbars disappearing.
 */
export function usePreventScroll(options: PreventScrollOptions = {}) {
  const { isDisabled } = options;

  useIsomorphicLayoutEffect(() => {
    if (isDisabled) {
      return;
    }

    preventScrollCount++;
    if (preventScrollCount === 1) {
      if (isIOS()) {
        restore = preventScrollMobileSafari();
      } else {
        restore = preventScrollStandard();
      }
    }

    return () => {
      preventScrollCount--;
      if (preventScrollCount === 0) {
        restore();
      }
    };
  }, [isDisabled]);
}

// For most browsers, all we need to do is set `overflow: hidden` on the root element, and
// add some padding to prevent the page from shifting when the scrollbar is hidden.
function preventScrollStandard() {
  return createChainedFunction(
    setStyle(
      document.documentElement,
      "paddingRight",
      `${window.innerWidth - document.documentElement.clientWidth}px`,
    ),
    setStyle(document.documentElement, "overflow", "hidden"),
  );
}

// Mobile Safari is a whole different beast. Even with overflow: hidden,
// it still scrolls the page in many situations:
//
// 1. When the bottom toolbar and address bar are collapsed, page scrolling is always allowed.
// 2. When the keyboard is visible, the viewport does not resize. Instead, the keyboard covers part of
//    it, so it becomes scrollable.
// 3. When tapping on an input, the page always scrolls so that the input is centered in the visual viewport.
//    This may cause even fixed position elements to scroll off the screen.
// 4. When using the next/previous buttons in the keyboard to navigate between inputs, the whole page always
//    scrolls, even if the input is inside a nested scrollable element that could be scrolled instead.
//
// In order to work around these cases, and prevent scrolling without jankiness, we do a few things:
//
// 1. Prevent default on `touchmove` events that are not in a scrollable element. This prevents touch scrolling
//    on the window.
// 2. Set `overscroll-behavior: contain` on nested scrollable regions so they do not scroll the page when at
//    the top or bottom. Work around a bug where this does not work when the element does not actually overflow
//    by preventing default in a `touchmove` event.
// 3. Prevent default on `touchend` events on input elements and handle focusing the element ourselves.
// 4. When focusing an input, apply a transform to trick Safari into thinking the input is at the top
//    of the page, which prevents it from scrolling the page. After the input is focused, scroll the element
//    into view ourselves, without scrolling the whole page.
// 5. Offset the body by the scroll position using a negative margin and scroll to the top. This should appear the
//    same visually, but makes the actual scroll position always zero. This is required to make all of the
//    above work or Safari will still try to scroll the page when focusing an input.
// 6. As a last resort, handle window scroll events, and scroll back to the top. This can happen when attempting
//    to navigate to an input with the next/previous buttons that's outside a modal.
function preventScrollMobileSafari() {
  let scrollable: Element;
  let restoreScrollableStyles: () => void;
  const onTouchStart = (e: TouchEvent) => {
    // Store the nearest scrollable parent element from the element that the user touched.
    scrollable = getScrollParent(e.target as Element, true);
    if (
      scrollable === document.documentElement &&
      scrollable === document.body
    ) {
      return;
    }

    // Prevent scrolling up when at the top and scrolling down when at the bottom
    // of a nested scrollable area, otherwise mobile Safari will start scrolling
    // the window instead.
    if (
      scrollable instanceof HTMLElement &&
      window.getComputedStyle(scrollable).overscrollBehavior === "auto"
    ) {
      restoreScrollableStyles = setStyle(
        scrollable,
        "overscrollBehavior",
        "contain",
      );
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    // Prevent scrolling the window.
    if (
      !scrollable ||
      scrollable === document.documentElement ||
      scrollable === document.body
    ) {
      e.preventDefault();
      return;
    }

    // overscroll-behavior should prevent scroll chaining, but currently does not
    // if the element doesn't actually overflow. https://bugs.webkit.org/show_bug.cgi?id=243452
    // This checks that both the width and height do not overflow, otherwise we might
    // block horizontal scrolling too. In that case, adding `touch-action: pan-x` to
    // the element will prevent vertical page scrolling. We can't add that automatically
    // because it must be set before the touchstart event.
    if (
      scrollable.scrollHeight === scrollable.clientHeight &&
      scrollable.scrollWidth === scrollable.clientWidth
    ) {
      e.preventDefault();
    }
  };

  const onTouchEnd = () => {
    if (restoreScrollableStyles) {
      restoreScrollableStyles();
    }
  };

  const onFocus = (e: FocusEvent) => {
    const target = e.target as HTMLElement;
    if (willOpenKeyboard(target)) {
      setupStyles();

      // Apply a transform to trick Safari into thinking the input is at the top of the page
      // so it doesn't try to scroll it into view.
      target.style.transform = "translateY(-2000px)";
      requestAnimationFrame(() => {
        target.style.transform = "";

        // This will have prevented the browser from scrolling the focused element into view,
        // so we need to do this ourselves in a way that doesn't cause the whole page to scroll.
        if (visualViewport) {
          if (visualViewport.height < window.innerHeight) {
            // If the keyboard is already visible, do this after one additional frame
            // to wait for the transform to be removed.
            requestAnimationFrame(() => {
              scrollIntoView(target);
            });
          } else {
            // Otherwise, wait for the visual viewport to resize before scrolling so we can
            // measure the correct position to scroll to.
            visualViewport.addEventListener(
              "resize",
              () => scrollIntoView(target),
              { once: true },
            );
          }
        }
      });
    }
  };

  let restoreStyles: null | (() => void) = null;
  const setupStyles = () => {
    if (restoreStyles) {
      return;
    }

    const onWindowScroll = () => {
      // Last resort. If the window scrolled, scroll it back to the top.
      // It should always be at the top because the body will have a negative margin (see below).
      window.scrollTo(0, 0);
    };

    // Record the original scroll position so we can restore it.
    // Then apply a negative margin to the body to offset it by the scroll position. This will
    // enable us to scroll the window to the top, which is required for the rest of this to work.
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;

    restoreStyles = createChainedFunction(
      addEvent(window, "scroll", onWindowScroll),
      setStyle(
        document.documentElement,
        "paddingRight",
        `${window.innerWidth - document.documentElement.clientWidth}px`,
      ),
      setStyle(document.documentElement, "overflow", "hidden"),
      setStyle(document.body, "marginTop", `-${scrollY}px`),
      () => {
        window.scrollTo(scrollX, scrollY);
      },
    );

    // Scroll to the top. The negative margin on the body will make this appear the same.
    window.scrollTo(0, 0);
  };

  const removeEvents = createChainedFunction(
    addEvent(document, "touchstart", onTouchStart, {
      passive: false,
      capture: true,
    }),
    addEvent(document, "touchmove", onTouchMove, {
      passive: false,
      capture: true,
    }),
    addEvent(document, "touchend", onTouchEnd, {
      passive: false,
      capture: true,
    }),
    addEvent(document, "focus", onFocus, true),
  );

  return () => {
    // Restore styles and scroll the page back to where it was.
    restoreScrollableStyles?.();
    restoreStyles?.();
    removeEvents();
  };
}

// Sets a CSS property on an element, and returns a function to revert it to the previous value.
function setStyle(element: HTMLElement, style: string, value: string) {
  const cur = element.style[style as any];
  element.style[style as any] = value;

  return () => {
    element.style[style as any] = cur;
  };
}

// Adds an event listener to an element, and returns a function to remove it.
function addEvent<K extends keyof GlobalEventHandlersEventMap>(
  target: Document | Window,
  event: K,
  handler: (this: Document | Window, ev: GlobalEventHandlersEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
) {
  // internal function, so it's ok to ignore the difficult to fix type error
  // @ts-expect-error
  target.addEventListener(event, handler, options);
  return () => {
    // @ts-expect-error
    target.removeEventListener(event, handler, options);
  };
}

function scrollIntoView(target: Element) {
  const root = document.scrollingElement || document.documentElement;
  let nextTarget: Element | null = target;
  while (nextTarget && nextTarget !== root) {
    // Find the parent scrollable element and adjust the scroll position if the target is not already in view.
    const scrollable = getScrollParent(nextTarget);
    if (
      scrollable !== document.documentElement &&
      scrollable !== document.body &&
      scrollable !== nextTarget
    ) {
      const scrollableTop = scrollable.getBoundingClientRect().top;
      const targetTop = nextTarget.getBoundingClientRect().top;
      if (targetTop > scrollableTop + nextTarget.clientHeight) {
        scrollable.scrollTop += targetTop - scrollableTop;
      }
    }

    nextTarget = scrollable.parentElement;
  }
}

function willOpenKeyboard(target: Element) {
  return (
    (target instanceof HTMLInputElement &&
      !nonTextInputTypes.has(target.type)) ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

function isScrollable(
  node: Element | null,
  checkForOverflow?: boolean,
): boolean {
  if (!node) {
    return false;
  }
  const style = window.getComputedStyle(node);
  let isScrollable = /(auto|scroll)/.test(
    style.overflow + style.overflowX + style.overflowY,
  );

  if (isScrollable && checkForOverflow) {
    isScrollable =
      node.scrollHeight !== node.clientHeight ||
      node.scrollWidth !== node.clientWidth;
  }

  return isScrollable;
}

function getScrollParent(node: Element, checkForOverflow?: boolean): Element {
  let scrollableNode: Element | null = node;
  if (isScrollable(scrollableNode, checkForOverflow)) {
    scrollableNode = scrollableNode.parentElement;
  }

  while (scrollableNode && !isScrollable(scrollableNode, checkForOverflow)) {
    scrollableNode = scrollableNode.parentElement;
  }

  return (
    scrollableNode || document.scrollingElement || document.documentElement
  );
}

function testPlatform(re: RegExp) {
  return typeof window !== "undefined" && window.navigator != null
    ? re.test(
        // @ts-expect-error userAgentData is only supported in Chrome 90+
        window.navigator.userAgentData?.platform || window.navigator.platform,
      )
    : false;
}

function cached(fn: () => boolean) {
  if (process.env.NODE_ENV === "test") {
    return fn;
  }

  let res: boolean | null = null;
  return () => {
    if (res == null) {
      res = fn();
    }
    return res;
  };
}

const isMac = cached(() => testPlatform(/^Mac/i));

const isIPhone = cached(() => testPlatform(/^iPhone/i));

const isIPad = cached(
  () =>
    testPlatform(/^iPad/i) ||
    // iPadOS 13 lies and says it's a Mac, but we can distinguish by detecting touch support.
    (isMac() && navigator.maxTouchPoints > 1),
);

const isIOS = cached(() => isIPhone() || isIPad());
