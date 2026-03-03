import * as multilineInputStories from "@stories/multiline-input/multiline-input.stories";
import { composeStories } from "@storybook/react-vite";
import type { ChangeEvent } from "react";

const {
  Default,
  Controlled,
  ControlledWithAdornment,
  Readonly,
  WithFormField,
} = composeStories(multilineInputStories);

describe("GIVEN an MultilineInput", () => {
  it("SHOULD support data attribute on textAreaProps", () => {
    cy.mount(
      <Default
        textAreaProps={{ "data-testId": "customInput" }}
        value="value"
      />,
    );
    cy.findByTestId("customInput").should("have.value", "value");
  });

  it("should allow a default value to be set", () => {
    const changeSpy = cy.stub().as("changeSpy");
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      // React 16 backwards compatibility
      event.persist();
      changeSpy(event);
    };
    cy.mount(<Default onChange={handleChange} />);
    cy.findByRole("textbox").should("have.value", "Value");
    cy.findByRole("textbox").clear();
    cy.findByRole("textbox").realClick();
    cy.realType("New Value");
    cy.get("@changeSpy").should("have.been.calledWithMatch", {
      target: { value: "New Value" },
    });
    cy.findByRole("textbox").should("have.value", "New Value");
  });

  it("should support a controlled value", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(<Controlled onChange={changeSpy} />);
    cy.findByRole("textbox").should("have.value", "Value");
    cy.findByRole("textbox").clear();
    cy.findByRole("textbox").realClick();
    cy.realType("New Value");
    cy.get("@changeSpy").should("have.been.calledWithMatch", {
      target: { value: "New Value" },
    });
    cy.findByRole("textbox").should("have.value", "New Value");
  });

  it("should allow the value to be set as required", () => {
    cy.mount(<Default textAreaProps={{ required: true }} />);
    cy.findByRole("textbox").should("have.attr", "required");
  });

  it("should not receive focus when disabled", () => {
    cy.mount(
      <div>
        <button>start</button>
        <Default disabled />
        <button>end</button>
      </div>,
    );
    cy.findByRole("textbox").should("be.disabled");
    cy.realPress("Tab");
    cy.findByRole("button", { name: "start" }).should("be.focused");
    cy.realPress("Tab");
    cy.findByRole("textbox").should("not.be.focused");
    cy.findByRole("button", { name: "end" }).should("be.focused");
  });

  it("should not allow the value to be changed when it is read-only", () => {
    cy.mount(<Readonly />);
    cy.findAllByRole("textbox").eq(0).should("have.attr", "readonly");
    cy.findAllByRole("textbox").eq(0).should("have.value", "Value");
    cy.findAllByRole("textbox").eq(0).realClick();
    cy.findAllByRole("textbox").eq(0).should("be.focused");
    cy.realType("Update");
    cy.findAllByRole("textbox").eq(0).should("have.value", "Value");
  });

  it("should have form field support", () => {
    cy.mount(<WithFormField />);
    cy.findByRole("textbox").should("have.accessibleName", "Comments");
    cy.findByRole("textbox").should(
      "have.accessibleDescription",
      "Please leave feedback about your experience.",
    );

    cy.findByText("Comments").realClick();
    cy.findByRole("textbox").should("be.focused");
  });

  it("should be disabled when it's FormField is disabled", () => {
    cy.mount(<WithFormField disabled />);
    cy.findByRole("textbox").should("be.disabled");
  });

  it("should be required when it's FormField is required", () => {
    cy.mount(<WithFormField necessity="required" />);
    cy.findByLabelText("Comments (Required)").should("have.attr", "required");
  });

  it("should be required when it's FormField is required with an asterisk", () => {
    cy.mount(<WithFormField necessity="asterisk" />);
    cy.findByLabelText("Comments *").should("have.attr", "required");
  });

  it("should not be required when it's FormField is optional", () => {
    cy.mount(<WithFormField necessity="optional" />);
    cy.findByLabelText("Comments (Optional)").should(
      "not.have.attr",
      "required",
    );
  });

  it("should be read-only when it's FormField is read-only", () => {
    cy.mount(<WithFormField readOnly />);
    cy.findByLabelText("Comments").should("have.attr", "readonly");
  });

  it("should expand to fit its content", () => {
    cy.mount(<Default />);
    cy.findByRole("textbox")
      .invoke("height")
      .then((defaultHeight) => {
        cy.findByRole("textbox").realClick();
        cy.realPress("Enter");
        cy.realPress("Enter");
        cy.realPress("Enter");
        cy.findByRole("textbox")
          .invoke("height")
          .then((newHeight) => {
            expect(newHeight ?? 0).to.be.greaterThan(defaultHeight ?? 0);
          });
      });
  });

  it("should collapse back to fit content when content is reduced", () => {
    cy.mount(<Default rows={1} />);
    cy.findByRole("textbox")
      .invoke("height")
      .then((defaultHeight) => {
        cy.findByRole("textbox").realClick();
        cy.realPress("Enter");
        cy.realPress("Enter");
        cy.realPress("Enter");
        cy.realPress("Backspace");
        cy.realPress("Backspace");
        cy.realPress("Backspace");
        cy.findByRole("textbox")
          .invoke("height")
          .then((newHeight) => {
            expect(newHeight ?? 0).to.eq(defaultHeight);
          });
      });
  });

  it("should collapse back to fit content when value is reset", () => {
    cy.mount(<ControlledWithAdornment rows={1} />);
    cy.findByRole("textbox")
      .invoke("height")
      .then((defaultHeight) => {
        cy.findByRole("textbox").realClick();
        cy.realPress("Enter");
        cy.realPress("Enter");
        cy.realPress("Enter");
        cy.findByRole("button").realClick();
        cy.findByRole("textbox")
          .invoke("height")
          .then((newHeight) => {
            expect(newHeight ?? 0).to.eq(defaultHeight);
          });
      });
  });

  it("should not have empty aria-describedby or aria-labelledby attributes if used outside a formfield", () => {
    cy.mount(<Default />);

    cy.findByRole("textbox").should("not.have.attr", "aria-describedby");
    cy.findByRole("textbox").should("not.have.attr", "aria-labelledby");
  });
});
