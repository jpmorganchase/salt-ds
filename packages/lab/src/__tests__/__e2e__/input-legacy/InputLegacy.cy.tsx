import { ChangeEvent, useState } from "react";
import { InputLegacy as Input } from "../../../input-legacy";

describe("GIVEN an Input", () => {
  it("SHOULD have no a11y violations on load", () => {
    cy.mount(<Input defaultValue="The default value" />);
    cy.checkAxeComponent();
  });

  describe("WHEN cy.mounted as an uncontrolled component", () => {
    it("THEN it should cy.mount with the specified defaultValue", () => {
      cy.mount(<Input defaultValue="The default value" />);
      cy.findByRole("textbox").should("have.value", "The default value");
    });

    describe("WHEN the input is updated", () => {
      it("THEN should call onChange with the new value", () => {
        const changeSpy = cy.stub().as("changeSpy");
        const onChange = (event: ChangeEvent<HTMLInputElement>) => {
          // React 16 backwards compatibility
          event.persist();
          changeSpy(event);
        };
        cy.mount(
          <Input defaultValue="The default value" onChange={onChange} />
        );
        cy.findByRole("textbox").click().clear().type("new value");
        cy.get("@changeSpy").should("have.been.calledWithMatch", {
          target: { value: "new value" },
        });
      });
    });
  });

  describe("WHEN cy.mounted as an controlled component", () => {
    it("THEN it should cy.mount with the specified value", () => {
      cy.mount(<Input value="text value" />);
      cy.findByRole("textbox").should("have.value", "text value");
    });

    describe("WHEN the input is updated", () => {
      it("THEN should call onChange with the new value", () => {
        const changeSpy = cy.stub().as("changeSpy");

        function ControlledInput() {
          const [value, setValue] = useState("text value");
          const onChange = (event: ChangeEvent<HTMLInputElement>) => {
            // React 16 backwards compatibility
            event.persist();
            setValue(event.target.value);
            changeSpy(event);
          };

          return <Input value={value} onChange={onChange} />;
        }

        cy.mount(<ControlledInput />);
        cy.findByRole("textbox").click().clear().type("new value");
        cy.get("@changeSpy").should("have.been.calledWithMatch", {
          target: { value: "new value" },
        });
      });
    });
  });

  //TODO these should be tested visually rather than unit tested
  describe("WHEN the Input has Text Alignment", () => {
    describe("WHEN textAlign = `left`", () => {
      it("SHOULD cy.mount left aligned", () => {
        cy.mount(
          <Input
            data-testid="parent"
            defaultValue="The default value"
            textAlign="left"
          />
        );
        cy.findByTestId("parent").should(
          "have.class",
          "saltInputLegacy-leftTextAlign"
        );
      });
    });

    describe("WHEN textAlign = `right`", () => {
      it("SHOULD cy.mount right aligned", () => {
        cy.mount(
          <Input
            data-testid="parent"
            defaultValue="The default value"
            textAlign="right"
          />
        );
        cy.findByTestId("parent").should(
          "have.class",
          "saltInputLegacy-rightTextAlign"
        );
      });
    });
  });

  describe("WHEN the Input is disabled", () => {
    it("THEN should cy.mount disabled", () => {
      cy.mount(<Input defaultValue="The default value" disabled />);
      cy.findByRole("textbox").should("be.disabled");
    });
    it("SHOULD have no a11y violations on load", () => {
      cy.mount(<Input defaultValue="The default value" disabled />);
      cy.checkAxeComponent();
    });
  });

  describe("WHEN the Input is read only", () => {
    it("THEN should cy.mount read only", () => {
      cy.mount(<Input defaultValue="The default value" readOnly />);
      cy.findByRole("textbox").should("have.attr", "readonly");
    });

    it("SHOULD have no a11y violations on load", () => {
      cy.mount(<Input defaultValue="The default value" readOnly />);
      cy.checkAxeComponent();
    });

    describe("AND empty", () => {
      it("THEN should cy.mount an emdash by default", () => {
        cy.mount(<Input readOnly />);
        cy.findByRole("textbox").should("have.value", "—");
      });

      it("THEN should cy.mount an custom marker", () => {
        cy.mount(<Input emptyReadOnlyMarker="#" readOnly />);
        cy.findByRole("textbox").should("have.value", "#");
      });
    });
  });

  describe('WHEN cursorPositionOnFocus is "start"', () => {
    it("THEN should move the cursor to the start on click", () => {
      cy.mount(
        <Input cursorPositionOnFocus="start" defaultValue="The default value" />
      );

      cy.findByRole("textbox").click();

      cy.findByRole("textbox")
        .should("have.prop", "selectionStart", 0)
        .and("have.prop", "selectionEnd", 0);
    });

    it("THEN should move the cursor to the start on focus", () => {
      cy.mount(
        <Input cursorPositionOnFocus="start" defaultValue="The default value" />
      );

      cy.findByRole("textbox").focus();

      cy.findByRole("textbox")
        .should("have.prop", "selectionStart", 0)
        .and("have.prop", "selectionEnd", 0);
    });
  });

  describe('WHEN cursorPositionOnFocus is "end"', () => {
    it("THEN should move the cursor to the end on click", () => {
      cy.mount(
        <Input cursorPositionOnFocus="end" defaultValue="The default value" />
      );

      cy.findByRole("textbox").click();

      cy.findByRole("textbox")
        .should("have.prop", "selectionStart", 17)
        .and("have.prop", "selectionEnd", 17);
    });

    it("THEN should move the cursor to the end on focus", () => {
      cy.mount(
        <Input cursorPositionOnFocus="end" defaultValue="The default value" />
      );

      cy.findByRole("textbox").focus();

      cy.findByRole("textbox")
        .should("have.prop", "selectionStart", 17)
        .and("have.prop", "selectionEnd", 17);
    });
  });

  describe("WHEN cursorPositionOnFocus is a number", () => {
    it("THEN should move the cursor that index on click", () => {
      cy.mount(
        <Input cursorPositionOnFocus={2} defaultValue="The default value" />
      );

      cy.findByRole("textbox").click();

      cy.findByRole("textbox")
        .should("have.prop", "selectionStart", 2)
        .and("have.prop", "selectionEnd", 2);
    });

    it("THEN should move the cursor to that index on focus", () => {
      cy.mount(
        <Input cursorPositionOnFocus={2} defaultValue="The default value" />
      );

      cy.findByRole("textbox").focus();

      cy.findByRole("textbox")
        .should("have.prop", "selectionStart", 2)
        .and("have.prop", "selectionEnd", 2);
    });
  });

  describe("WHEN highlightOnFocus is `true`", () => {
    it("THEN should highlight all text on click", () => {
      cy.mount(<Input highlightOnFocus defaultValue="The default value" />);

      cy.findByRole("textbox").click();

      cy.findByRole("textbox")
        .should("have.prop", "selectionStart", 0)
        .and("have.prop", "selectionEnd", 17);
    });

    it("THEN should highlight all text on focus", () => {
      cy.mount(<Input highlightOnFocus defaultValue="The default value" />);

      cy.findByRole("textbox").focus();

      cy.findByRole("textbox")
        .should("have.prop", "selectionStart", 0)
        .and("have.prop", "selectionEnd", 17);
    });
  });

  describe("WHEN highlightOnFocus is an array of two numbers", () => {
    it("THEN should highlight all indexes on click", () => {
      cy.mount(
        <Input highlightOnFocus={[4, 11]} defaultValue="The default value" />
      );

      cy.findByRole("textbox").click();

      cy.findByRole("textbox")
        .should("have.prop", "selectionStart", 4)
        .and("have.prop", "selectionEnd", 11);
    });

    it("THEN should highlight all text on focus", () => {
      cy.mount(
        <Input highlightOnFocus={[4, 11]} defaultValue="The default value" />
      );

      cy.findByRole("textbox").focus();

      cy.findByRole("textbox")
        .should("have.prop", "selectionStart", 4)
        .and("have.prop", "selectionEnd", 11);
    });
  });

  // TODO Revisit when FormField is added
  // describe("WHEN used in Formfield", () => {
  //   test("and is disabled Then input within should be disabled", () => {
  //     render(
  //       <FormField label="Disabled form field" disabled>
  //         <Input defaultValue="Value" />
  //       </FormField>
  //     );
  //     expect(screen.getByLabelText(/Disabled form field/i)).toHaveAttribute(
  //       "disabled"
  //     );
  //   });
  // });
  // test("and is readonly Then input within should be readonly", () => {
  //   render(
  //     <FormField label="Readonly form field" readOnly>
  //       <Input defaultValue="Value" />
  //     </FormField>
  //   );
  //   expect(screen.getByLabelText(/Readonly form field/i)).toHaveAttribute(
  //     "readonly"
  //   );
  // });
});
