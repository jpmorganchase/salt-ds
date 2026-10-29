import { Button } from "@salt-ds/core";
import {
  InsertionPointProvider,
  StyleInjectionProvider,
} from "@salt-ds/styles";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";
import TestComponent from "./TestComponent";

const testComponentCss1 = `
  .TestComponent1 {
    background-color: red;
  }
`;
const testComponentCss2 = `
  .TestComponent2 {
    background-color: blue;
  }
`;
const selector = '[data-salt-style="test-component"]';
const styles = () =>
  Array.from(document.querySelectorAll<HTMLStyleElement>(selector));

function RemovableTest() {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div>
      <Button onClick={() => setIsVisible((old) => !old)}>
        Toggle Test Component
      </Button>
      {isVisible && (
        <TestComponent
          className="TestComponent1"
          injectionId="test-component"
          injectionCss={testComponentCss1}
        />
      )}
    </div>
  );
}

function SameCssRefCountTest() {
  const [isFirstVisible, setIsFirstVisible] = useState(true);
  const [isSecondVisible, setIsSecondVisible] = useState(true);
  return (
    <div>
      <Button onClick={() => setIsFirstVisible(false)}>Remove first</Button>
      <Button onClick={() => setIsSecondVisible(false)}>Remove second</Button>
      {isFirstVisible && (
        <TestComponent
          className="TestComponent1"
          injectionId="test-component"
          injectionCss={testComponentCss1}
        >
          First
        </TestComponent>
      )}
      {isSecondVisible && (
        <TestComponent
          className="TestComponent1"
          injectionId="test-component"
          injectionCss={testComponentCss1}
        >
          Second
        </TestComponent>
      )}
    </div>
  );
}

function StyleInjectionToggleTest() {
  const [enabled, setEnabled] = useState(false);
  return (
    <div>
      <Button onClick={() => setEnabled((old) => !old)}>
        Toggle style injection
      </Button>
      <StyleInjectionProvider value={enabled}>
        <TestComponent
          className="TestComponent1"
          injectionId="test-component"
          injectionCss={testComponentCss1}
        />
      </StyleInjectionProvider>
    </div>
  );
}

function InsertionPointToggleTest() {
  const [useSecondMarker, setUseSecondMarker] = useState(false);
  const insertionPoint = document.querySelector(
    useSecondMarker
      ? '[data-marker="dynamic-example-two"]'
      : '[data-marker="dynamic-example-one"]',
  );
  return (
    <div>
      <Button onClick={() => setUseSecondMarker(true)}>
        Move insertion point
      </Button>
      <InsertionPointProvider insertionPoint={insertionPoint}>
        <TestComponent
          className="TestComponent1"
          injectionId="test-component"
          injectionCss={testComponentCss1}
        />
      </InsertionPointProvider>
    </div>
  );
}

function expectTwoDifferentStyles(styleSelector: string) {
  const injected = Array.from(
    document.querySelectorAll<HTMLStyleElement>(styleSelector),
  );
  expect(injected).toHaveLength(2);
  expect(injected[0].innerHTML).not.toBe(injected[1].innerHTML);
  expect([testComponentCss1, testComponentCss2]).toContain(
    injected[0].innerHTML,
  );
  expect([testComponentCss1, testComponentCss2]).toContain(
    injected[1].innerHTML,
  );
}

describe("use style injection", () => {
  it("SHOULD inject both sets of css for the same injection ID", async () => {
    await renderWithSalt(
      <div>
        <TestComponent
          className="TestComponent1"
          injectionId="test-component"
          injectionCss={testComponentCss1}
        />
        <TestComponent
          className="TestComponent2"
          injectionId="test-component"
          injectionCss={testComponentCss2}
        />
      </div>,
    );
    await expect.poll(() => styles().length).toBe(2);
    expectTwoDifferentStyles(selector);
  });

  it("SHOULD inject both sets of css with no insertion ID", async () => {
    await renderWithSalt(
      <div>
        <TestComponent
          className="TestComponent1"
          injectionCss={testComponentCss1}
        />
        <TestComponent
          className="TestComponent2"
          injectionCss={testComponentCss2}
        />
      </div>,
    );
    await expect
      .poll(() => document.querySelectorAll('[data-salt-style=""]').length)
      .toBe(2);
    expectTwoDifferentStyles('[data-salt-style=""]');
  });

  it("SHOULD share one style element until all component instances are removed", async () => {
    await renderWithSalt(<SameCssRefCountTest />);
    await expect.poll(() => styles().length).toBe(1);
    expect(styles()[0].innerHTML).toBe(testComponentCss1);
    await page.getByRole("button", { name: "Remove first" }).click();
    expect(styles()).toHaveLength(1);
    await page.getByRole("button", { name: "Remove second" }).click();
    await expect.poll(() => styles().length).toBe(0);
  });

  it("SHOULD inject and remove styles when the provider value changes", async () => {
    await renderWithSalt(<StyleInjectionToggleTest />);
    expect(styles()).toHaveLength(0);
    const toggle = page.getByRole("button", { name: "Toggle style injection" });
    await toggle.click();
    await expect.poll(() => styles().length).toBe(1);
    expect(styles()[0].innerHTML).toBe(testComponentCss1);
    await toggle.click();
    await expect.poll(() => styles().length).toBe(0);
  });

  it("SHOULD remove injected style elements with the component", async () => {
    await renderWithSalt(<RemovableTest />);
    expect(styles()).toHaveLength(0);
    await page.getByRole("button").click();
    await expect.poll(() => styles().length).toBe(1);
    await page.getByRole("button").click();
    await expect.poll(() => styles().length).toBe(0);
  });

  it("SHOULD clean up an externally removed style and allow reinjection", async () => {
    await renderWithSalt(<RemovableTest />);
    const toggle = page.getByRole("button");
    await toggle.click();
    await expect.poll(() => styles().length).toBe(1);
    styles()[0].remove();
    expect(styles()).toHaveLength(0);
    await toggle.click();
    expect(styles()).toHaveLength(0);
    await toggle.click();
    await expect.poll(() => styles().length).toBe(1);
    expect(styles()[0].innerHTML).toBe(testComponentCss1);
  });

  it("SHOULD inject styles at the provided insertion point", async () => {
    const marker = document.createElement("meta");
    marker.dataset.marker = "example";
    document.head.append(marker);
    await renderWithSalt(
      <InsertionPointProvider insertionPoint={marker}>
        <Button>Test</Button>
      </InsertionPointProvider>,
    );
    const injected = document.querySelector('[data-salt-style="salt-button"]');
    expect(injected).toBeInTheDocument();
    expect(
      (injected as Element).compareDocumentPosition(marker) &
        Node.DOCUMENT_POSITION_PRECEDING,
    ).toBe(0);
    const firstStyle = document.querySelector("style");
    expect(
      (injected as Element).compareDocumentPosition(firstStyle as Element) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(0);
    marker.remove();
  });

  it("SHOULD move injected styles to the updated insertion point", async () => {
    for (const marker of document.querySelectorAll(
      '[data-marker^="dynamic-example"]',
    )) {
      marker.remove();
    }
    const first = document.createElement("meta");
    first.dataset.marker = "dynamic-example-one";
    document.head.append(first);
    const second = document.createElement("meta");
    second.dataset.marker = "dynamic-example-two";
    document.head.append(second);
    await renderWithSalt(<InsertionPointToggleTest />);
    await expect.poll(() => styles().length).toBe(1);
    expect(
      styles()[0].compareDocumentPosition(first) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    await page.getByRole("button", { name: "Move insertion point" }).click();
    await expect
      .poll(
        () =>
          styles()[0].compareDocumentPosition(first) &
          Node.DOCUMENT_POSITION_PRECEDING,
      )
      .toBe(Node.DOCUMENT_POSITION_PRECEDING);
    expect(
      styles()[0].compareDocumentPosition(second) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    first.remove();
    second.remove();
  });
});
