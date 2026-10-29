import type { JSXElementConstructor, ReactElement, ReactNode } from "react";
import * as ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import { beforeEach } from "vitest";
import { page } from "vitest/browser";

interface RenderOptions {
  baseElement?: HTMLElement;
  container?: HTMLElement;
  wrapper?: JSXElementConstructor<{ children: ReactNode }>;
}

interface LegacyRoot {
  render: (ui: ReactNode) => void;
  unmount: () => void;
}

// The legacy root API was removed in React 19, so it isn't in every version of
// the React DOM types. This renderer is only used for React 16 and 17.
const legacyReactDOM = ReactDOM as unknown as {
  render: (element: ReactElement, container: HTMLElement) => void;
  unmountComponentAtNode: (container: HTMLElement) => boolean;
};

const mountedRoots = new Map<HTMLElement, LegacyRoot>();

function wrapUi(
  ui: ReactNode,
  WrapperComponent?: JSXElementConstructor<{ children: ReactNode }>,
) {
  return WrapperComponent ? <WrapperComponent>{ui}</WrapperComponent> : ui;
}

function createLegacyRoot(container: HTMLElement): LegacyRoot {
  return {
    render(ui) {
      legacyReactDOM.render(ui as ReactElement, container);
    },
    unmount() {
      legacyReactDOM.unmountComponentAtNode(container);
    },
  };
}

export async function cleanup() {
  for (const [container, root] of mountedRoots) {
    await act(async () => root.unmount());
    if (container.parentNode === document.body) {
      document.body.removeChild(container);
    }
  }
  mountedRoots.clear();
}

export async function render(
  ui: ReactNode,
  {
    baseElement = document.body,
    container = baseElement.appendChild(document.createElement("div")),
    wrapper: WrapperComponent,
  }: RenderOptions = {},
) {
  let root = mountedRoots.get(container);
  if (!root) {
    root = createLegacyRoot(container);
    mountedRoots.set(container, root);
  }

  await act(async () => root.render(wrapUi(ui, WrapperComponent)));
  const locator = page.elementLocator(container);

  return {
    container,
    baseElement,
    locator,
    async unmount() {
      const mountedRoot = mountedRoots.get(container);
      if (!mountedRoot) return;
      await act(async () => mountedRoot.unmount());
      mountedRoots.delete(container);
      if (container.parentNode === document.body) {
        document.body.removeChild(container);
      }
    },
    async rerender(newUi: ReactNode) {
      const mountedRoot = mountedRoots.get(container);
      if (!mountedRoot) {
        throw new Error("Cannot rerender an unmounted React tree");
      }
      await act(async () =>
        mountedRoot.render(wrapUi(newUi, WrapperComponent)),
      );
    },
    asFragment() {
      return document
        .createRange()
        .createContextualFragment(container.innerHTML);
    },
  };
}

beforeEach(cleanup);
