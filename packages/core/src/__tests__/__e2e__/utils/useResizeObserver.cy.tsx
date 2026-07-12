import { useResizeObserver } from "@salt-ds/core";
import { mount } from "cypress/react";
import { useRef, useState } from "react";
import { SecondaryWindow } from "../../../../../../cypress/support/SecondaryWindow";

function ResizeObserverHarness({ onResize }: { onResize: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useResizeObserver({ ref, onResize });

  return <div data-testid="resize-target" ref={ref} />;
}

function ResizeObserverLifecycleHarness({
  onResize,
  prepareWindow,
}: {
  onResize: () => void;
  prepareWindow: (targetWindow: Window) => void;
}) {
  const [mounted, setMounted] = useState(true);

  return (
    <>
      <button data-testid="unmount" onClick={() => setMounted(false)}>
        Unmount
      </button>
      {mounted && (
        <SecondaryWindow prepareWindow={prepareWindow}>
          <ResizeObserverHarness onResize={onResize} />
        </SecondaryWindow>
      )}
    </>
  );
}

describe("useResizeObserver", () => {
  it("uses and cleans up ResizeObserver and animation frames from the owner window", () => {
    let observerCallback: ResizeObserverCallback | undefined;
    const observe = Cypress.sinon.stub();
    const disconnect = Cypress.sinon.stub();
    const childResizeObserver = Cypress.sinon
      .stub()
      .callsFake((callback: ResizeObserverCallback) => {
        observerCallback = callback;
        return { disconnect, observe };
      });
    const frameCallbacks: FrameRequestCallback[] = [];
    const requestAnimationFrame = Cypress.sinon
      .stub()
      .callsFake((callback: FrameRequestCallback) => {
        frameCallbacks.push(callback);
        return 40 + frameCallbacks.length;
      });
    const cancelAnimationFrame = Cypress.sinon.stub();
    const onResize = Cypress.sinon.stub();

    mount(
      <ResizeObserverLifecycleHarness
        onResize={onResize}
        prepareWindow={(targetWindow) => {
          Object.defineProperties(targetWindow, {
            ResizeObserver: {
              configurable: true,
              value: childResizeObserver,
            },
            requestAnimationFrame: {
              configurable: true,
              value: requestAnimationFrame,
            },
            cancelAnimationFrame: {
              configurable: true,
              value: cancelAnimationFrame,
            },
          });
        }}
      />,
    );

    cy.get("iframe")
      .its("0.contentDocument.body")
      .find('[data-testid="resize-target"]')
      .should("exist");
    cy.then(() => {
      observerCallback?.([], {} as ResizeObserver);
      expect(requestAnimationFrame).not.to.have.been.called;

      observerCallback?.([{} as ResizeObserverEntry], {} as ResizeObserver);
      expect(requestAnimationFrame).to.have.been.calledOnce;
      frameCallbacks[0](0);
      expect(onResize).to.have.been.calledOnce;

      observerCallback?.([{} as ResizeObserverEntry], {} as ResizeObserver);
      expect(requestAnimationFrame).to.have.been.calledTwice;
    });
    cy.findByTestId("unmount").click();
    cy.then(() => {
      expect(cancelAnimationFrame).to.have.been.calledOnceWith(42);
      expect(disconnect).to.have.been.calledOnce;
    });
  });

  it("does not create an observer for a closed secondary window", () => {
    const childResizeObserver = Cypress.sinon.stub();

    mount(
      <SecondaryWindow
        prepareWindow={(targetWindow) => {
          Object.defineProperties(targetWindow, {
            closed: { configurable: true, value: true },
            ResizeObserver: {
              configurable: true,
              value: childResizeObserver,
            },
          });
        }}
      >
        <ResizeObserverHarness onResize={Cypress.sinon.stub()} />
      </SecondaryWindow>,
    );

    cy.get("iframe")
      .its("0.contentDocument.body")
      .find('[data-testid="resize-target"]')
      .should("exist");
    cy.wrap(childResizeObserver).should("not.have.been.called");
  });
});
