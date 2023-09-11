import { composeStories } from "@storybook/testing-react";
import * as dropdownNextStories from "@stories/dropdown-next/dropdown-next.stories";
import { SyntheticEvent } from "react";

const { Default, WithDefaultSelected, Readonly, Disabled } =
  composeStories(dropdownNextStories);

describe("GIVEN an active Dropdown component", () => {
  describe("WHEN the Dropdown is rendered", () => {
    it("THEN it should open source list", () => {
      cy.mount(<Default />);
      cy.findByRole("combobox").focus().realPress("Enter");

      cy.findByRole("combobox").should("have.attr", "aria-expanded", "true");
      cy.get('[data-testid="ChevronUpIcon"]').should("exist");
    });

    it("THEN it should move and highlight list items on keyboard arrow up or arrow down", () => {
      cy.mount(<Default />);
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
      cy.mount(<Default />);
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
      cy.mount(<Default />);
      cy.findByRole("combobox").realClick();

      cy.findByRole("option", { name: "Georgia" })
        .trigger("mousemove")
        .should("have.class", "saltListItemNext-highlighted");
    });

    it("THEN it should select list items on mouse click", () => {
      cy.mount(<Default />);
      cy.findByRole("combobox").realClick();
      cy.findByRole("option", { name: "Florida" }).trigger("mousemove").click();

      cy.findByRole("combobox")
        .should("have.value", "Florida")
        .should("have.attr", "aria-expanded", "false");
    });

    // TODO: update once KeyNav fixed in List
    it("THEN it should update value on different list item selection using keyboard", () => {
      cy.mount(<Default />);
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
      cy.mount(<Default />);
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
      const onSelect = (
        event: SyntheticEvent<Element, Event>,
        data: { value: string }
      ) => {
        // React 16 backwards compatibility
        event.persist();
        onSelectSpy(data);
      };

      cy.mount(<Default onSelect={onSelect} />);

      cy.findByRole("combobox").focus().realPress("Enter");
      cy.realPress("ArrowDown");
      cy.realPress("ArrowDown");
      cy.findByRole("option", { name: "Alaska" })
        .should("have.class", "saltListItemNext-highlighted")
        .realPress("Enter");

      cy.get("@onSelectSpy").should("be.calledWithMatch", { value: "Alaska" });
    });
  });

  describe("WHEN the Dropdown is rendered with defaultSelected prop", () => {
    it("THEN it should show default selected value on first render", () => {
      cy.mount(<WithDefaultSelected />);

      cy.findByRole("combobox").should("have.value", "California");
    });

    // TODO: update once KeyNav fixed in List
    it("THEN it should update value on different list item selection", () => {
      cy.mount(<WithDefaultSelected />);
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
    cy.mount(<Disabled />);

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
    cy.mount(<Readonly />);

    cy.findByRole("combobox").focus().should("have.focus");

    cy.findByRole("combobox")
      .should("have.attr", "aria-expanded", "false")
      .should("not.have.attr", "aria-disabled");
    cy.get(".saltDropdownNext-icon").should("not.exist");
    cy.findByRole("combobox").should("not.have.attr", "aria-activedescendant");
  });
});
