import { platform } from "@floating-ui/dom";
import type { Platform } from "@floating-ui/react";
import {
  Button,
  FloatingPlatformProvider,
  StackLayout,
  Tooltip,
} from "@salt-ds/core";
import { useState } from "react";

import { CustomFloatingComponentProvider, FLOATING_TEST_ID } from "../common";

const TOOLTIP_TEXT = "I am a tooltip";

describe("Given a floating component in a CustomFloatingComponentProvider", () => {
  const TestComponent = () => {
    return (
      <CustomFloatingComponentProvider>
        <Tooltip content={TOOLTIP_TEXT} open>
          <Button>I am a button</Button>
        </Tooltip>
      </CustomFloatingComponentProvider>
    );
  };

  it("should render the Floating Component as the root", () => {
    cy.mount(<TestComponent />);
    cy.findByTestId(FLOATING_TEST_ID).should("exist");
  });

  it("should be passed the top and left props", () => {
    cy.mount(<TestComponent />);

    cy.findByTestId(FLOATING_TEST_ID).should("have.attr", "data-top");
    cy.findByTestId(FLOATING_TEST_ID).should("have.attr", "data-left");
  });

  it("should be passed the position prop", () => {
    cy.mount(<TestComponent />);

    cy.findByTestId(FLOATING_TEST_ID).should("have.attr", "data-position");
  });

  it("should be passed the width and height props", () => {
    const TEST_SIZE = 200;

    const TestSizeComponent = () => {
      return (
        <CustomFloatingComponentProvider>
          <Tooltip
            content={
              <div style={{ minWidth: TEST_SIZE, minHeight: TEST_SIZE }}>
                {TOOLTIP_TEXT}
              </div>
            }
            open
          >
            <Button>I am a button</Button>
          </Tooltip>
        </CustomFloatingComponentProvider>
      );
    };

    cy.mount(<TestSizeComponent />);

    cy.findByTestId(FLOATING_TEST_ID)
      .should("have.attr", "data-width")
      .should((widthAttr) => {
        expect(Number(widthAttr)).gte(TEST_SIZE);
      });
    cy.findByTestId(FLOATING_TEST_ID)
      .should("have.attr", "data-height")
      .should((heightAttr) => {
        expect(Number(heightAttr)).gte(TEST_SIZE);
      });
  });
});

describe("Given a floating component in a FloatingPlaformProvider with potential middleware", () => {
  const POSITION = 10;
  const TestComponent = ({ hasMiddleware }: { hasMiddleware: boolean }) => {
    return (
      <FloatingPlatformProvider
        middleware={
          hasMiddleware
            ? (existingMiddleware) => [
                ...existingMiddleware,
                {
                  name: "placeAtPosition",
                  fn: () => ({ x: POSITION, y: POSITION }),
                },
              ]
            : undefined
        }
      >
        <CustomFloatingComponentProvider>
          <Tooltip content={TOOLTIP_TEXT} open>
            <Button>I am a button</Button>
          </Tooltip>
        </CustomFloatingComponentProvider>
      </FloatingPlatformProvider>
    );
  };

  it("shouldn't add middleware if they are not provided", () => {
    cy.mount(<TestComponent hasMiddleware={false} />);
    cy.findByTestId(FLOATING_TEST_ID)
      .should("have.attr", "data-top")
      .should((topAttr) => {
        expect(Number(topAttr)).not.eq(POSITION);
      });
    cy.findByTestId(FLOATING_TEST_ID)
      .should("have.attr", "data-left")
      .should((leftAttr) => {
        expect(Number(leftAttr)).not.eq(POSITION);
      });
  });

  it("should add middleware if they are provided", () => {
    cy.mount(<TestComponent hasMiddleware />);
    cy.findByTestId(FLOATING_TEST_ID)
      .should("have.attr", "data-top")
      .should((topAttr) => {
        expect(Number(topAttr)).eq(POSITION);
      });
    cy.findByTestId(FLOATING_TEST_ID)
      .should("have.attr", "data-left")
      .should((leftAttr) => {
        expect(Number(leftAttr)).eq(POSITION);
      });
  });
});

describe("Given a floating component in a FloatingPlaformProvider with animationFrame updates", () => {
  const TestComponent = ({ animationFrame }: { animationFrame: boolean }) => {
    const [isMoved, setIsMoved] = useState(false);

    return (
      <FloatingPlatformProvider animationFrame={animationFrame}>
        <CustomFloatingComponentProvider>
          {isMoved && <h1>Some other content</h1>}
          <Tooltip content={TOOLTIP_TEXT} open>
            <Button onClick={() => setIsMoved(true)}>Add More Content</Button>
          </Tooltip>
        </CustomFloatingComponentProvider>
      </FloatingPlatformProvider>
    );
  };

  it("should update on animationFrame when animationFrame is true", () => {
    let top: number;
    let left: number;

    cy.mount(<TestComponent animationFrame={true} />);
    cy.findByTestId(FLOATING_TEST_ID)
      .invoke("attr", "data-top")
      .then((topAttr) => {
        top = Number(topAttr);
      });
    cy.findByTestId(FLOATING_TEST_ID)
      .invoke("attr", "data-left")
      .then((leftAttr) => {
        left = Number(leftAttr);
      });

    cy.findByRole("button").realClick();

    cy.findByTestId(FLOATING_TEST_ID)
      .invoke("attr", "data-top")
      .should((topAttr) => {
        expect(Number(topAttr)).not.eq(top);
      });
    cy.findByTestId(FLOATING_TEST_ID)
      .invoke("attr", "data-left")
      .should((leftAttr) => {
        expect(Number(leftAttr)).not.eq(left);
      });
  });
});

describe("Given a floating component in a FloatingPlaformProvider", () => {
  const ADD_CONTENT_TEXT = "Add More Content";
  const TOGGLE_TOOLTIP_TEXT = "Toggle Tooltip";
  const TestComponent = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [isMoved, setIsMoved] = useState(false);

    return (
      <StackLayout>
        <Button onClick={() => setIsMoved(true)}>{ADD_CONTENT_TEXT}</Button>
        <Button onClick={() => setIsOpen((old) => !old)}>
          {TOGGLE_TOOLTIP_TEXT}
        </Button>
        <FloatingPlatformProvider>
          <CustomFloatingComponentProvider>
            {isMoved && <h1>Some other content</h1>}
            <Tooltip content={TOOLTIP_TEXT} open={isOpen}>
              <Button>I am a button</Button>
            </Tooltip>
          </CustomFloatingComponentProvider>
        </FloatingPlatformProvider>
      </StackLayout>
    );
  };

  it("should update position when opened", () => {
    let top: number;
    let left: number;

    cy.mount(<TestComponent />);

    cy.findByTestId(FLOATING_TEST_ID)
      .invoke("attr", "data-top")
      .then((topAttr) => {
        top = Number(topAttr);
      });
    cy.findByTestId(FLOATING_TEST_ID)
      .invoke("attr", "data-left")
      .then((leftAttr) => {
        left = Number(leftAttr);
      });

    cy.findByText(ADD_CONTENT_TEXT).realClick();

    cy.findByText(TOGGLE_TOOLTIP_TEXT).realClick();

    cy.findByTestId(FLOATING_TEST_ID).should("not.exist");

    cy.findByText(TOGGLE_TOOLTIP_TEXT).realClick();

    cy.findByTestId(FLOATING_TEST_ID)
      .invoke("attr", "data-top")
      .should((topAttr) => {
        expect(Number(topAttr)).not.eq(top);
      });
    cy.findByTestId(FLOATING_TEST_ID)
      .invoke("attr", "data-left")
      .should((leftAttr) => {
        expect(Number(leftAttr)).not.eq(left);
      });
  });
});

describe("Given a floating component with a FloatingPlatformProvider and custom floating platform", () => {
  const customPlatform: Platform = {
    ...platform,
    async getElementRects({ ...data }) {
      const result = await platform.getElementRects({
        ...data,
      });

      return {
        ...result,
        reference: {
          ...result.reference,
          y: 0,
          height: 0,
        },
        floating: {
          ...result.floating,
          x: 0,
          y: 0,
        },
      };
    },
    getDimensions: platform.getDimensions,
    getClippingRect: platform.getClippingRect,
  };

  const TestComponent = () => {
    return (
      <FloatingPlatformProvider platform={customPlatform}>
        <CustomFloatingComponentProvider>
          <Tooltip content={TOOLTIP_TEXT} open>
            <Button>I am a button</Button>
          </Tooltip>
        </CustomFloatingComponentProvider>
      </FloatingPlatformProvider>
    );
  };

  it("should use the custom floating platform", () => {
    cy.mount(<TestComponent />);

    cy.findByTestId(FLOATING_TEST_ID)
      .should("have.attr", "data-top")
      .should((topAttr) => {
        expect(Number(topAttr)).eq(0);
      });
  });
});
