import { FormattedInput } from "@brandname/lab";
import { useState } from "react";

describe("GIVEN FormattedInput", () => {
  it("SHOULD have no a11y violations on load", () => {
    cy.mount(<FormattedInput defaultValue="The default value" />);
    cy.checkAxeComponent();
  });

  describe("When cy.mounted as an uncontrolled component", () => {
    it("THEN should render with the specified defaultValue", () => {
      cy.mount(<FormattedInput defaultValue="The default value" />);
      cy.findByRole("textbox").should("have.value", "The default value");
    });

    describe("WHEN the input is updated", () => {
      it("THEN calls onChange", () => {
        const changeSpy = cy.stub().as("changeSpy");
        cy.mount(
          <FormattedInput
            defaultValue="The default value"
            onChange={changeSpy}
          />
        );

        cy.findByRole("textbox").click().clear().type("new value");
        cy.get("@changeSpy").should("have.been.calledWith", "new value");
      });
    });

    describe("When FormattedInput is disabled", () => {
      it("THEN should render disabled", () => {
        cy.mount(<FormattedInput defaultValue="The default value" disabled />);
        cy.findByRole("textbox").should("be.disabled");
      });
      it("SHOULD have no a11y violations on load", () => {
        cy.mount(<FormattedInput defaultValue="The default value" disabled />);
        cy.checkAxeComponent();
      });
    });

    describe("When FormattedInput is readOnly", () => {
      it("THEN should render readOnly", () => {
        cy.mount(<FormattedInput defaultValue="The default value" readOnly />);
        cy.findByRole("textbox").should("have.attr", "readOnly");
      });
      it("SHOULD have no a11y violations on load", () => {
        cy.mount(<FormattedInput defaultValue="The default value" readOnly />);
        cy.checkAxeComponent();
      });
    });
  });

  describe("When cy.mounted as a controlled component", () => {
    it("THEN should render with the specified value", () => {
      cy.mount(<FormattedInput value="text value" />);
      cy.findByRole("textbox").should("have.value", "text value");
    });

    describe("WHEN the input is updated", () => {
      it("THEN calls onChange", () => {
        const changeSpy = cy.stub().as("changeSpy");

        function ControlledFormattedInput() {
          const [value, setValue] = useState("text value");
          const onChange = (value: string) => {
            setValue(value);
            changeSpy(value);
          };

          return <FormattedInput value={value} onChange={onChange} />;
        }
        cy.mount(<ControlledFormattedInput />);

        cy.findByRole("textbox").click().clear().type("new value");

        cy.get("@changeSpy").should("have.been.calledWith", "new value");
      });
    });
  });

  describe("WHEN a mask is supplied", () => {
    it("THEN should render the mask text", () => {
      cy.mount(<FormattedInput mask="XX-XX-XX" />);
      cy.get("span").should("have.text", "XX-XX-XX");
    });

    it("THEN should add the mask as an aria-label on the input", () => {
      cy.mount(<FormattedInput mask="XX-XX-XX" />);
      cy.findByRole("textbox").should("have.attr", "aria-label", "XX-XX-XX");
    });

    describe("AND a value is supplied", () => {
      it("THEN should display part of the mask", () => {
        cy.mount(<FormattedInput mask="XX-XX-XX" value="12" />);
        cy.get("span").should("have.text", "12-XX-XX");
      });
    });

    it("SHOULD have no a11y violations on load", () => {
      cy.mount(<FormattedInput mask="XX-XX-XX" />);
      cy.checkAxeComponent();
    });
  });

  describe("WHEN an id is not supplied", () => {
    it("THEN should self reference a generated id", () => {
      cy.mount(<FormattedInput mask="XX-XX-XX" />);
      cy.findByRole("textbox").then((input) => {
        expect(input).to.have.attr("aria-labelledby", input.attr("id"));
      });
    });
  });

  describe("WHEN an id is supplied", () => {
    it("THEN should self reference the id", () => {
      cy.mount(<FormattedInput mask="XX-XX-XX" id="staticId" />);
      cy.findByRole("textbox")
        .should("have.attr", "aria-labelledby", "staticId")
        .and("have.attr", "id", "staticId");
    });
  });

  describe("WHEN an aria-label is supplied", () => {
    it("THEN should be ignored", () => {
      cy.mount(
        <FormattedInput
          mask="XX-XX-XX"
          inputProps={{ "aria-label": "fakelabel" }}
        />
      );
      cy.findByRole("textbox").should(
        "not.have.attr",
        "aria-label",
        "fakelabel"
      );
    });
  });

  describe("WHEN an aria-labelledby is supplied", () => {
    it("THEN should still self reference the id", () => {
      cy.mount(
        <FormattedInput
          mask="XX-XX-XX"
          id="staticId"
          inputProps={{ "aria-labelledby": "fakeId" }}
        />
      );
      cy.findByRole("textbox")
        .should("have.attr", "aria-labelledby", "fakeId staticId")
        .and("have.attr", "id", "staticId");
    });
  });

  describe("WHEN rifmOptions are supplied", () => {
    it("THEN should pass it to rifm", () => {
      cy.mount(
        <FormattedInput
          rifmOptions={{ replace: (string) => string.toUpperCase() }}
        />
      );
      cy.findByRole("textbox")
        .click()
        .clear()
        .type("lowercase")
        .should("have.value", "LOWERCASE");
    });
  });

  // TODO investigate how to test refs in CCT
  // describe("WHEN inputRef is supplied", () => {
  //   it("THEN should resolve to the input element", () => {
  //     const inputRef = createRef<HTMLInputElement>();
  //     cy.mount(<FormattedInput ref={inputRef} />);
  //
  //     cy.findByRole("textbox").should("equal", inputRef.current);
  //   });
  // });

  describe("WHEN the input is passed a classname", () => {
    it("THEN should be applied to the mask too", () => {
      cy.mount(<FormattedInput inputProps={{ className: "inputClassName" }} />);
      cy.findByRole("textbox").should("have.class", "inputClassName");
      cy.get("span").should("have.class", "inputClassName");
    });
  });
});
