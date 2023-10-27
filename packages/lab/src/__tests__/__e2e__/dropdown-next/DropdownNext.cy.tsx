import { SyntheticEvent } from "react";
import { DropdownNext } from "@salt-ds/lab";
const ListExample = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
];
import { CustomFloatingComponentProvider, FLOATING_TEST_ID } from "../common";

describe("GIVEN an active Dropdown component", () => {
  describe("WHEN the Dropdown is rendered", () => {
    it("THEN it should open source list", () => {
      cy.mount(<DropdownNext source={ListExample} />);
      cy.findByRole("combobox").focus().realPress("Enter");

      cy.findByRole("combobox").should("have.attr", "aria-expanded", "true");
      cy.get('[data-testid="ChevronUpIcon"]').should("exist");
    });

    it("THEN it should move and highlight list items on keyboard arrow up or arrow down", () => {
      cy.mount(<DropdownNext source={ListExample} />);
      cy.findByRole("combobox").focus().realPress("Enter");
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");
      cy.realPress("ArrowUp");

      cy.findByRole("option", { name: "Alaska" }).should(
        "have.class",
        "saltListItemNext-highlighted"
      );
      cy.findByRole("combobox").should("have.attr", "aria-activedescendant");
    });

    it("THEN it should select list items on keyboard enter", () => {
      cy.mount(<DropdownNext source={ListExample} />);
      cy.findByRole("combobox").focus().realPress("Enter");
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");

      cy.findByRole("option", { name: "Alaska" })
        .should("have.class", "saltListItemNext-highlighted")
        .realPress("Enter");
      cy.findByRole("combobox")
        .should("have.value", "Alaska")
        .should("have.attr", "aria-expanded", "false");
    });

    it("THEN it should highlight list items on mouse move", () => {
      cy.mount(<DropdownNext source={ListExample} />);
      cy.findByRole("combobox").realClick();

      cy.findByRole("option", { name: "Georgia" })
        .trigger("mousemove")
        .should("have.class", "saltListItemNext-highlighted");
    });

    it("THEN it should select list items on mouse click", () => {
      cy.mount(<DropdownNext source={ListExample} />);
      cy.findByRole("combobox").realClick();
      cy.findByRole("option", { name: "Florida" }).trigger("mousemove").click();

      cy.findByRole("combobox")
        .should("have.value", "Florida")
        .should("have.attr", "aria-expanded", "false");
    });

    it("THEN it should return focus to Dropdown onBlur", () => {
      cy.mount(<DropdownNext source={ListExample} />);
      cy.findByRole("combobox").realClick();
      cy.findByRole("option", { name: "Florida" }).trigger("mousemove").click();
      cy.findByRole("combobox").should("have.focus");
    });

    // TODO: When a List Item can be disabled and the List Container can be mouse clicked without selecting a List Item update to
    // cy.findByRole("combobox").should("have.attr", "aria-expanded", "true");

    it("THEN it should not blur on List Container mouse click", () => {
      cy.mount(<DropdownNext source={ListExample} />);
      cy.findByRole("combobox").realClick();
      cy.get('[data-test-id="list-container"]').realClick();
      cy.findByRole("combobox").should("have.attr", "aria-expanded", "false");
    });

    // TODO: update once KeyNav fixed in List
    it("THEN it should update value on different list item selection using keyboard", () => {
      cy.mount(<DropdownNext source={ListExample} />);
      cy.findByRole("combobox").focus().realPress("Enter");
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");

      cy.findByRole("option", { name: "Alaska" }).realPress("Enter");
      cy.findByRole("combobox").should("have.value", "Alaska");

      cy.findByRole("combobox").focus().realPress("Enter");
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");

      cy.findByRole("option", { name: "Georgia" }).realPress("Enter");
      cy.findByRole("combobox").should("have.value", "Georgia");
    });

    it("THEN it should update value on different list item selection using mouse", () => {
      cy.mount(<DropdownNext source={ListExample} />);
      cy.findByRole("combobox").realClick();

      cy.findByRole("option", { name: "Florida" }).trigger("mousemove").click();
      cy.findByRole("combobox").should("have.value", "Florida");

      cy.findByRole("combobox").realClick();

      cy.findByRole("option", { name: "Arkansas" })
        .trigger("mousemove")
        .click();
      cy.findByRole("combobox").should("have.value", "Arkansas");
    });
  });

  describe("WHEN the Dropdown is rendered with an onSelect prop", () => {
    it("SHOULD call the onSelect prop when an item is selected and confirm the selected value", () => {
      const onSelectSpy = cy.stub().as("onSelectSpy");
      const handleSelect = (
        event: SyntheticEvent<Element, Event>,
        data: { value: string }
      ) => {
        // React 16 backwards compatibility
        event.persist();
        onSelectSpy(data);
      };

      cy.mount(<DropdownNext onSelect={handleSelect} source={ListExample} />);

      cy.findByRole("combobox").focus().realPress("Enter");
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");
      cy.findByRole("option", { name: "Alaska" }).realClick();

      cy.get("@onSelectSpy").should("be.calledWithMatch", { value: "Alaska" });
    });
  });

  describe("WHEN the Dropdown is rendered with defaultSelected prop", () => {
    it("THEN it should show default selected value on first render", () => {
      cy.mount(
        <DropdownNext source={ListExample} defaultSelected="California" />
      );

      cy.findByRole("combobox").should("have.value", "California");
    });

    // TODO: update once KeyNav fixed in List
    it("THEN it should update value on different list item selection", () => {
      cy.mount(
        <DropdownNext source={ListExample} defaultSelected="California" />
      );
      cy.findByRole("combobox").focus().realPress("Enter");
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");
      cy.realPress("Enter");

      cy.findByRole("combobox").should("have.value", "Alaska");
    });
  });
});

describe("GIVEN a disabled Dropdown component", () => {
  it("THEN it should be disabled and not focusable", () => {
    cy.mount(
      <DropdownNext
        source={ListExample}
        defaultSelected="California"
        disabled
      />
    );

    // not focusable
    cy.findByRole("combobox").focus().should("not.have.focus");

    cy.findByRole("combobox")
      .should("have.attr", "aria-expanded", "false")
      .should("have.attr", "aria-disabled", "true");
    cy.get('[data-testid="ChevronDownIcon"]').should("exist");
    cy.findByRole("combobox").should("not.have.attr", "aria-activedescendant");
  });
});

describe("GIVEN a readonly Dropdown component", () => {
  it("THEN it should not show icon and be focusable", () => {
    cy.mount(
      <DropdownNext
        source={ListExample}
        defaultSelected="California"
        readOnly
      />
    );
    cy.findByRole("combobox").focus().should("have.focus");

    cy.findByRole("combobox")
      .should("have.attr", "aria-expanded", "false")
      .should("not.have.attr", "aria-disabled");
    cy.get(".saltDropdownNext-icon").should("not.exist");
    cy.findByRole("combobox").should("not.have.attr", "aria-activedescendant");
  });
});

describe("GIVEN a Dropdown component in a FloatingComponentProvider", () => {
  it("should render the custom floating component", () => {
    cy.mount(
      <CustomFloatingComponentProvider>
        <DropdownNext
          source={ListExample}
          defaultSelected="California"
          readOnly
          open
        />
      </CustomFloatingComponentProvider>
    );

    cy.findByTestId(FLOATING_TEST_ID).should("exist");
  });
});
