import { useRef, useState } from "react";
import { composeStories } from "@storybook/react";
import * as scrimStories from "@stories/scrim/scrim.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";
import { Scrim } from "../../../scrim";

const composedStories = composeStories(scrimStories);
const { WithContentStatus } = composedStories;

describe("Given a Scrim", () => {
  checkAccessibility({ WithContentStatus });

  describe("WHEN autoFocusRef is set", () => {
    it("THEN it should autofocus that element after mount", () => {
      function TestComponent() {
        const ref = useRef<HTMLButtonElement>(null);
        return (
          <div>
            <Scrim autoFocusRef={ref} open closeWithEscape>
              <button>Other Button</button>
              <button ref={ref}>Autofocus Button</button>
            </Scrim>
          </div>
        );
      }

      cy.mount(<TestComponent />);

      cy.findByRole("button", { name: "Autofocus Button" }).should(
        "have.focus"
      );
    });
  });

  describe("WHEN closeWithEscape is `true`", () => {
    it("THEN should call onClose when Escape is pressed and return focus", () => {
      const closeSpy = cy.stub().as("closeSpy");

      function TestComponent() {
        const [open, setOpen] = useState(false);
        return (
          <div>
            <Scrim
              open={open}
              onClose={() => {
                setOpen(false);
                closeSpy();
              }}
              closeWithEscape
            />
            <button onClick={() => setOpen((old) => !old)}>OPEN SCRIM</button>
          </div>
        );
      }

      cy.mount(<TestComponent />);
      cy.findByRole("button").click();
      cy.realPress("Escape");
      cy.get("@closeSpy").should("have.callCount", 1);

      cy.findByRole("button").should("have.focus");
    });
  });

  describe("WHEN open", () => {
    it("THEN it should autofocus the first element after mount", () => {
      function TestComponent() {
        return (
          <div>
            <Scrim open closeWithEscape>
              <button>First Button</button>
            </Scrim>
          </div>
        );
      }

      cy.mount(<TestComponent />);

      cy.findByRole("button", { name: "First Button" }).should("have.focus");
    });

    it("THEN it should prevent tabbing out of the scrim boundary", () => {
      function TestComponent() {
        return (
          <div>
            <Scrim open closeWithEscape>
              <button>First Button</button>
            </Scrim>
          </div>
        );
      }

      cy.mount(<TestComponent />);

      cy.findByRole("button", { name: "First Button" })
        .should("have.focus")
        .realPress(["Shift", "Tab"]);
      cy.findByRole("button", { name: "First Button" }).should("have.focus");

      cy.findByRole("button", { name: "First Button" })
        .should("have.focus")
        .realPress("Tab");
      cy.findByRole("button", { name: "First Button" }).should("have.focus");
    });

    it("THEN should apply aria-hidden to siblings", () => {
      cy.mount(
        <div>
          <div data-testid="siblingWithChild">
            <span />
          </div>
          <Scrim open />
          <div data-testid="siblingNoChild" />
        </div>
      );

      cy.findByTestId("siblingWithChild").should(
        "have.attr",
        "aria-hidden",
        "true"
      );
      cy.findByTestId("siblingNoChild").should(
        "have.attr",
        "aria-hidden",
        "true"
      );
    });
    it("THEN should apply tabindex=-1 to siblings and niblings", () => {
      function TestComponent() {
        const parentRef = useRef<HTMLDivElement>(null);
        const [open, setOpen] = useState(false);
        return (
          <div ref={parentRef}>
            <Scrim open={open} enableContainerMode containerRef={parentRef}>
              <button onClick={() => setOpen((old) => !old)}>
                CLOSE SCRIM
              </button>
            </Scrim>
            <button
              data-testid="openScrim"
              onClick={() => setOpen((old) => !old)}
            >
              OPEN SCRIM
            </button>
            <input tabIndex={-1} type="text" />
          </div>
        );
      }

      cy.mount(<TestComponent />);

      cy.findByRole("button", { name: "OPEN SCRIM" }).click();

      cy.findByTestId("openScrim").should("have.attr", "tabindex", "-1");
      cy.findByRole("textbox", { hidden: true }).should(
        "have.attr",
        "tabindex",
        "-1"
      );

      cy.findByRole("button", { name: "CLOSE SCRIM" }).click();

      cy.findByRole("button", { name: "OPEN SCRIM" }).should(
        "not.have.attr",
        "tabindex"
      );
      cy.findByRole("textbox").should("have.attr", "tabindex", "-1");
    });
  });

  describe("WHEN disableFocusTrap is true", () => {
    it("THEN should allow focus to leave the focus trap", () => {
      function TestComponent() {
        const [open, setOpen] = useState(false);
        return (
          <>
            <Scrim open={open} disableFocusTrap>
              <button onClick={() => setOpen((old) => !old)}>
                CLOSE SCRIM
              </button>
            </Scrim>
            <button onClick={() => setOpen((old) => !old)}>OPEN SCRIM</button>
          </>
        );
      }
      cy.mount(<TestComponent />);

      cy.findByRole("button", { name: "OPEN SCRIM" }).click();
      cy.findByRole("button", { name: "CLOSE SCRIM" }).should("have.focus");
      cy.findByRole("button", { name: "CLOSE SCRIM" }).realPress("Tab");
      // findByRole doesn't work here because FocusManager puts aria-hidden on all the elements outside its scope
      cy.contains("button", "OPEN SCRIM").should("have.focus");
    });
  });

  describe("WHEN disableReturnFocus is true", () => {
    it("THEN should NOT return focus to the last focused element before", () => {
      function TestComponent() {
        const [open, setOpen] = useState(false);
        return (
          <>
            <Scrim open={open} disableReturnFocus>
              <button onClick={() => setOpen((old) => !old)}>
                CLOSE SCRIM
              </button>
            </Scrim>
            <button onClick={() => setOpen((old) => !old)}>OPEN SCRIM</button>
          </>
        );
      }
      cy.mount(<TestComponent />);

      cy.findByRole("button", { name: "OPEN SCRIM" }).click();
      cy.findByRole("button", { name: "CLOSE SCRIM" })
        .should("have.focus")
        .realClick();
      cy.wait(50);
      cy.findByRole("button", { name: "OPEN SCRIM" }).should("not.have.focus");
    });
  });

  describe("WHEN in a container state", () => {
    it("THEN should prevent selection to siblings and niblings", () => {
      function TestComponent() {
        const parentRef = useRef<HTMLDivElement>(null);
        const [open, setOpen] = useState(false);
        return (
          <div data-testid="parent" ref={parentRef}>
            <Scrim open={open} enableContainerMode containerRef={parentRef}>
              <button onClick={() => setOpen((old) => !old)}>
                CLOSE SCRIM
              </button>
            </Scrim>
            <button onClick={() => setOpen((old) => !old)}>OPEN SCRIM</button>
          </div>
        );
      }
      cy.mount(<TestComponent />);

      cy.findByRole("button", { name: "OPEN SCRIM" }).click();
      cy.findByTestId("parent").should("have.css", "userSelect", "none");
      cy.findByRole("button", { name: "CLOSE SCRIM" }).click();
      cy.findByTestId("parent").should("have.css", "userSelect", "auto");
    });

    it("THEN should have `aria-modal=false` and `role=dialog`", () => {
      function TestComponent() {
        const parentRef = useRef<HTMLDivElement>(null);
        return (
          <div data-testid="parent" ref={parentRef}>
            <Scrim open enableContainerMode containerRef={parentRef}>
              <button>button</button>
            </Scrim>
          </div>
        );
      }
      cy.mount(<TestComponent />);
      cy.findByRole("dialog")
        .should("exist")
        .and("have.attr", "aria-modal", "false")
        .and("have.attr", "role", "dialog");
    });
  });

  describe("Test Scrim interactions", () => {
    it("should render children when open", () => {
      cy.mount(<Scrim open>Click to close Scrim</Scrim>);
      cy.findByText("Click to close Scrim").should("exist");
    });

    it("should call `onClick` handler if set", () => {
      const clickSpy = cy.stub().as("clickSpy");
      cy.mount(<Scrim onBackDropClick={clickSpy} open />);
      cy.findByRole("dialog").click();
      cy.get("@clickSpy").should("have.callCount", 1);
    });
  });
});
