import { composeStories } from "@storybook/testing-react";
import * as comboBoxStories from "@stories/combobox-deprecated.stories";

const {
  Default,
  MultiSelectWithInitialSelection,
  WithInitialSelection,
  WithFreeText,
  MultiSelect,
  MultiSelectWithFreeTextItem,
} = composeStories(comboBoxStories);

describe("A combo box", () => {
  describe("with nothing selected", () => {
    describe("when focused", () => {
      it("should not highlight any item with a focus ring", () => {
        cy.mount(<Default />);

        cy.realPress("Tab");
        cy.findAllByRole("option").should(
          "not.have.class",
          "uitkListItemDeprecated-highlighted"
        );
      });
    });

    describe("when blurred", () => {
      it("should clear input value if nothing is selected", () => {
        cy.mount(<Default />);

        cy.realPress("Tab");
        // filter only
        cy.realType("Alaska");
        cy.realPress("ArrowDown");
        cy.findByRole("combobox").should("have.value", "Alaska");

        // filter again and blur away
        cy.realPress("Backspace");
        cy.realPress("Tab");
        cy.findByRole("combobox").should("not.have.value");
      });

      it("should reconcile input value if there is a selected item", () => {
        cy.mount(<Default />);

        cy.realPress("Tab");

        // filter and select
        cy.realType("Alaska");
        cy.realPress("ArrowDown");
        cy.realPress("Enter");

        cy.findByRole("combobox").should("have.value", "Alaska");

        // filter again and blur away without making a new selection
        cy.findByRole("combobox").realPress("Backspace");
        cy.realPress("Tab");

        cy.findByRole("combobox").should("have.value", "Alaska");
      });
    });

    describe("when focused and ArrowDown key is pressed", () => {
      it("should start highlighting from the first item", () => {
        cy.mount(<Default />);

        cy.realPress("Tab");
        cy.realPress("ArrowDown");

        cy.findByRole("listbox")
          .findByRole("option", { name: "Alabama" })
          .should("have.class", "uitkListItemDeprecated-highlighted")
          .and("have.class", "uitkListItemDeprecated-focusVisible");

        cy.realPress("ArrowDown");

        cy.findByRole("listbox")
          .findByRole("option", { name: "Alaska" })
          .should("have.class", "uitkListItemDeprecated-highlighted")
          .and("have.class", "uitkListItemDeprecated-focusVisible");
      });
    });

    describe("when the 'Enter' key is pressed", () => {
      describe("AND there is input text with no highlight", () => {
        it("should selected the first item", () => {
          const changeSpy = cy.stub().as("changeSpy");
          cy.mount(<Default onChange={changeSpy} />);

          cy.realPress("Tab");

          cy.realType("A");
          // TODO QuickSelected is not supported by the new list yet.
          // expect(getByRole(list, "option", { name: /item.+1/i })).toHaveClass(
          //   "uitkListItem-quickSelected"
          // );

          cy.realPress("Enter");

          // input value updated
          cy.findByRole("combobox").should("have.value", "Alabama");

          // list is closed
          cy.findByRole("listbox").should("not.exist");

          // change callback invoked
          cy.get("@changeSpy").should(
            "have.been.calledWith",
            Cypress.sinon.match.any,
            "Alabama"
          );
        });
      });

      it("should select the highlighted item", () => {
        const changeSpy = cy.stub().as("changeSpy");
        cy.mount(<Default onChange={changeSpy} />);

        cy.realPress("Tab");

        cy.realPress("ArrowDown");
        cy.realPress("Enter");

        // input value updated
        cy.findByRole("combobox").should(
          "have.value",
          Default.args!.source?.[0]
        );

        // list is closed
        cy.findByRole("listbox").should("not.exist");

        // change callback invoked
        cy.get("@changeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          Default.args!.source?.[0]
        );
      });
    });

    describe("when the 'Space' key is pressed", () => {
      it("should not select the highlighted item", () => {
        const changeSpy = cy.stub().as("changeSpy");
        cy.mount(<Default onChange={changeSpy} />);

        cy.realPress("Tab");

        cy.realPress("ArrowDown");
        cy.realPress("ArrowDown");
        cy.realPress(" ");

        // no list item is selected
        cy.findByRole("listbox")
          .findAllByRole("option", { selected: true })
          .should("not.exist");

        // change callback not invoked
        cy.get("@changeSpy").should("not.have.been.called");
      });
    });

    describe("when the 'Tab' key is pressed", () => {
      it("should remove highlight and focus style from the list", () => {
        cy.mount(<Default />);

        cy.realPress("Tab");

        cy.realPress("ArrowDown");
        cy.realPress("Tab");

        cy.findAllByRole("listbox").should("not.exist");
      });
    });

    describe("when the 'Escape' key is pressed", () => {
      it("should clear the input and close the list", () => {
        cy.mount(<Default />);

        cy.realPress("Tab");

        cy.realType("Alabama");
        cy.realPress("ArrowDown");
        cy.realPress("Escape");

        // input value cleared
        cy.findByRole("combobox").should("not.have.value");

        // list is closed
        cy.findByRole("listbox").should("not.exist");
      });
    });

    describe("when the 'Escape' key is pressed after selecting a new item", () => {
      it("should reconcile input value with the selected item", () => {
        cy.mount(<Default />);

        cy.realPress("Tab");

        // filter and select
        cy.realType("Alabama");
        cy.realPress("ArrowDown");
        cy.realPress("Enter");

        cy.findByRole("combobox").should("have.value", "Alabama");

        // filter again and escape from input
        cy.realPress("Backspace");
        cy.realPress("Escape");

        cy.findByRole("combobox").should("have.value", "Alabama");
      });
    });
  });

  describe("with a selected item", () => {
    describe("when focused", () => {
      it("should highlight the selected item with a focus ring", () => {
        cy.mount(<WithInitialSelection />);

        cy.realPress("Tab");

        cy.findByRole("listbox")
          .findByRole("option", {
            name: "Brown",
          })
          .should("have.class", "uitkListItemDeprecated-highlighted")
          .and("have.class", "uitkListItemDeprecated-focusVisible");
      });
    });
  });
});

describe("A combo box that allows free text", () => {
  describe("with nothing selected", () => {
    it("should not modify input value when blurred", () => {
      const changeSpy = cy.stub().as("changeSpy");
      cy.mount(<WithFreeText onChange={changeSpy} />);

      cy.realPress("Tab");

      // filter only
      cy.realType("Baby blue");
      cy.realPress("ArrowDown");

      cy.findByRole("combobox").should("have.value", "Baby blue");

      // filter again and blur
      cy.realPress("Backspace");

      cy.realPress("Tab");

      cy.findByRole("combobox").should("have.value", "Baby blu");
    });

    it("should select the input value when blurred if that value is in the list", () => {
      const changeSpy = cy.stub().as("changeSpy");
      cy.mount(<WithFreeText onChange={changeSpy} />);

      cy.realPress("Tab");

      cy.realType("Baby blue");
      cy.realPress("ArrowDown");
      cy.realPress("Tab");

      cy.findByRole("combobox").should("have.value", "Baby blue");

      // open it and double check item has been selected
      cy.findByRole("combobox").focus();

      cy.findByRole("listbox")
        .findByRole("option", { name: "Baby blue" })
        .should("have.attr", "aria-checked", "true");

      // change callback invoked
      cy.get("@changeSpy").should(
        "have.been.calledWith",
        Cypress.sinon.match.any,
        "Baby blue"
      );
    });

    it("should clear the input when pressing 'Escape'", () => {
      const changeSpy = cy.stub().as("changeSpy");
      cy.mount(<WithFreeText onChange={changeSpy} />);

      cy.realPress("Tab");

      // filter and select
      cy.realType("Alaska");
      cy.realPress("ArrowDown");
      cy.realPress("Enter");

      cy.findByRole("combobox").should("have.value", "Alaska");

      // filter again and escape input without making a new selection
      cy.realPress("Backspace");
      cy.realPress("Escape");

      cy.findByRole("combobox").should("not.have.value");
    });
  });
});

describe("A multi-select combo box", () => {
  describe("with nothing selected", () => {
    describe("when focused", () => {
      it("should not highlight any item with a focus ring", () => {
        const changeSpy = cy.stub().as("changeSpy");

        cy.mount(<MultiSelect onChange={changeSpy} />);

        cy.realPress("Tab");

        cy.findByRole("listbox")
          .findAllByRole("option")
          .should("not.have.class", "uitkListItemDeprecated-highlighted");
      });
    });

    describe("when blurred", () => {
      it("should clear input value", () => {
        cy.mount(<MultiSelect />);

        cy.realPress("Tab");

        cy.realType("Alaska");
        cy.realPress("Tab");

        cy.findByRole("textbox").should("not.have.value");
      });
    });

    describe("when using delimiter", () => {
      it("should add unique and valid items only", () => {
        const changeSpy = cy.stub().as("changeSpy");

        cy.mount(<MultiSelect onChange={changeSpy} />);

        cy.realPress("Tab");

        // type and tab out
        cy.findByRole("textbox").paste("Alaska, Alabama, Alaska, Missing Item");

        cy.findAllByTestId("pill").should("have.length", 2);
        cy.findAllByTestId("pill").eq(0).should("have.text", "Alaska");
        cy.findAllByTestId("pill").eq(1).should("have.text", "Alabama");

        // list style updated
        cy.findByRole("listbox")
          .findByRole("option", { name: "Alaska" })
          .should("have.attr", "aria-selected", "true");

        cy.findByRole("listbox")
          .findByRole("option", { name: "Alabama" })
          .should("have.attr", "aria-selected", "true");

        // change callback invoked with expected items
        cy.get("@changeSpy").should("have.been.calledWith", null, [
          "Alaska",
          "Alabama",
        ]);
      });
    });

    describe("when focused and ArrowDown key is pressed", () => {
      it("should start highlighting from the first item", () => {
        cy.mount(<MultiSelect />);

        cy.realPress("Tab");

        // make sure cursor is at the end of the textarea
        cy.realPress("End");
        cy.realPress("ArrowDown");

        cy.findByRole("listbox")
          .findByRole("option", { name: "Alabama" })
          .should("have.class", "uitkListItemDeprecated-highlighted")
          .and("have.class", "uitkListItemDeprecated-focusVisible");

        cy.realPress("ArrowDown");

        cy.findByRole("listbox")
          .findByRole("option", { name: "Alaska" })
          .should("have.class", "uitkListItemDeprecated-highlighted")
          .and("have.class", "uitkListItemDeprecated-focusVisible");
      });
    });

    describe("when the 'Enter' key is pressed", () => {
      describe("AND there is input text with no highlight", () => {
        it("should select the first item", () => {
          const changeSpy = cy.stub().as("changeSpy");

          cy.mount(<MultiSelect onChange={changeSpy} />);

          cy.realPress("Tab");

          cy.realType("A");
          // TODO uncomment when quickSelected is implemented in the list
          // expect(getByRole(list, "option", { name: /item.+1/i })).toHaveClass(
          //   "uitkListItem-quickSelected"
          // );
          cy.realPress("Enter");

          // pill group updated
          cy.findAllByTestId("pill").should("have.length", 1);
          cy.findByTestId("pill").should("have.text", "Alabama");

          // list style updated
          cy.findByRole("listbox")
            .findByRole("option", { name: "Alabama" })
            .should("have.attr", "aria-selected", "true");

          // change callback invoked
          cy.get("@changeSpy")
            .should("have.callCount", 1)
            .and("have.been.calledWith", Cypress.sinon.match.any, ["Alabama"]);
        });
      });

      it("should select the highlighted item", () => {
        const changeSpy = cy.stub().as("changeSpy");

        cy.mount(<MultiSelect onChange={changeSpy} />);

        cy.realPress("Tab");

        // make sure cursor is at the end of the textarea
        cy.realPress("End");
        cy.realPress("ArrowDown");
        cy.realPress("Enter");

        // pill group updated
        cy.findAllByTestId("pill").should("have.length", 1);
        cy.findByTestId("pill").should("have.text", "Alabama");

        cy.get("@changeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          ["Alabama"]
        );

        cy.realPress("ArrowDown");
        cy.realPress("ArrowDown");
        cy.realPress("Enter");

        // pill group updated
        cy.findAllByTestId("pill").should("have.length", 2);
        cy.findAllByTestId("pill").eq(0).should("have.text", "Alabama");
        cy.findAllByTestId("pill").eq(1).should("have.text", "Arizona");

        cy.get("@changeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          ["Alabama", "Arizona"]
        );

        // list style updated
        cy.findByRole("listbox")
          .findByRole("option", { name: "Alabama" })
          .should("have.attr", "aria-selected", "true");
        cy.findByRole("listbox")
          .findByRole("option", { name: "Arizona" })
          .should("have.attr", "aria-selected", "true")
          .and("have.class", "uitkListItemDeprecated-highlighted");
      });
    });

    describe("when the 'Space' key is pressed", () => {
      it("should not select the highlighted item", () => {
        const changeSpy = cy.stub().as("changeSpy");

        cy.mount(<MultiSelect onChange={changeSpy} />);

        cy.realPress("Tab");

        // make sure cursor is at the end of the textarea
        cy.realPress("End");
        cy.realPress("ArrowDown");
        cy.realPress("ArrowDown");
        cy.realPress(" ");

        // no list item is selected
        cy.findByRole("listbox")
          .findAllByRole("option", { selected: true })
          .should("not.exist");

        // change callback not invoked
        cy.get("@changeSpy").should("not.have.been.called");
      });
    });

    describe("when the 'Tab' key is pressed", () => {
      it("should remove highlight and focus style from the list", () => {
        const changeSpy = cy.stub().as("changeSpy");

        cy.mount(<MultiSelect onChange={changeSpy} />);

        cy.realPress("Tab");

        // make sure cursor is at the end of the textarea
        cy.realPress("End");
        cy.realPress("ArrowDown");
        cy.realPress("Tab");

        cy.findByRole("listbox").should("not.exist");
      });

      it("should add the item if it is a valid option", () => {
        cy.mount(<MultiSelect />);

        cy.realPress("Tab");

        // type and tab out
        cy.realType("Alabama");
        cy.realPress("Tab");

        cy.findAllByTestId("pill").should("have.length", 1);
        cy.findByTestId("pill").should("have.text", "Alabama");
      });

      it("should not add the item if it is an invalid option", () => {
        cy.mount(<MultiSelect />);

        cy.realPress("Tab");

        // type and tab out
        cy.realType("Non existent");
        cy.realPress("Tab");

        cy.findAllByTestId("pill").should("have.length", 0);
      });
    });

    describe("when the 'Escape' key is pressed", () => {
      it("should clear the input and remove list highlight", () => {
        cy.mount(<MultiSelect />);

        cy.realPress("Tab");

        cy.realType("Alabama");
        cy.realPress("ArrowDown");
        cy.realPress("Escape");

        // input value cleared
        cy.findByRole("textbox").should("not.have.value");

        // list will be closed
        cy.findByRole("listbox").should("not.exist");
      });
    });
  });

  describe("with selected items", () => {
    describe("when focused", () => {
      // TODO double check the behaviour of combobox in this scenario - I don't think it's correct
      it.skip("should not highlight any item with a focus ring", () => {
        cy.mount(<MultiSelectWithInitialSelection />);

        cy.findByRole("textbox").focus();

        cy.findByRole("listbox")
          .findAllByRole("option")
          .should("not.have.class", "uitkListItemDeprecated-highlighted");
      });
    });

    describe("when the 'ArrowLeft' key is pressed", () => {
      it("should put the focus ring on the pill group only", () => {
        cy.mount(<MultiSelectWithInitialSelection />);

        cy.realPress("Tab");

        cy.findAllByTestId("pill").should(
          "not.have.class",
          "uitkInputPill-pillActive"
        );

        // start navigating through pill group so the focus should be removed from list
        cy.realPress("ArrowLeft");

        cy.findAllByTestId("pill")
          .eq(-1)
          .should("have.class", "uitkInputPill-pillActive");
      });
    });

    describe("when the 'ArrowDown' key is pressed", () => {
      it("should put the focus ring on the list only", () => {
        cy.mount(<MultiSelectWithInitialSelection />);

        cy.realPress("Tab");

        cy.realPress("ArrowLeft");

        cy.findAllByTestId("pill")
          .eq(-1)
          .should("have.class", "uitkInputPill-pillActive");

        cy.findByRole("listbox")
          .findAllByRole("option")
          .should("not.have.class", "uitkListItemDeprecated-focusVisible");

        // start navigating through list so focus should be removed from pill group
        cy.realPress("ArrowDown");

        cy.findAllByTestId("pill").should(
          "not.have.class",
          "uitkInputPill-pillActive"
        );

        cy.findByRole("listbox")
          .findAllByRole("option", { name: "Alabama" })
          .should("have.class", "uitkListItemDeprecated-focusVisible");
      });
    });

    describe("when the 'Tab' key is pressed", () => {
      it("should add an item if it hasn't been selected", () => {
        cy.mount(<MultiSelectWithInitialSelection />);

        cy.realPress("Tab");

        // type and tab out
        cy.realType("Colorado");
        cy.realPress("Tab");

        cy.findAllByTestId("pill").should("have.length", 6);
        cy.findAllByTestId("pill").eq(0).should("have.text", "Alaska");
        cy.findAllByTestId("pill").eq(1).should("have.text", "Arkansas");
        cy.findAllByTestId("pill").eq(2).should("have.text", "Connecticut");
        cy.findAllByTestId("pill").eq(3).should("have.text", "Hawaii");
        cy.findAllByTestId("pill").eq(4).should("have.text", "Kansas");
        cy.findAllByTestId("pill").eq(5).should("have.text", "Colorado");
      });

      it("should not add an item if it has already been selected", () => {
        cy.mount(<MultiSelectWithInitialSelection />);

        cy.realPress("Tab");

        // type and tab out
        cy.realType("Alaska");
        cy.realPress("Tab");

        cy.findAllByTestId("pill").should("have.length", 5);
        cy.findAllByTestId("pill").eq(0).should("have.text", "Alaska");
        cy.findAllByTestId("pill").eq(1).should("have.text", "Arkansas");
        cy.findAllByTestId("pill").eq(2).should("have.text", "Connecticut");
      });
    });

    describe("when the 'Enter' key is pressed with an item in focus", () => {
      it("should de-select any selected item", () => {
        const changeSpy = cy.stub().as("changeSpy");

        cy.mount(<MultiSelectWithInitialSelection onChange={changeSpy} />);

        cy.realPress("Tab");

        // make sure cursor is at the end of the textarea
        cy.realPress("End");
        cy.realPress("ArrowDown");
        cy.realPress("ArrowDown");
        cy.realPress("Enter");

        // pill group updated
        cy.findAllByTestId("pill").should("have.length", 4);
        cy.findAllByTestId("pill").eq(0).should("have.text", "Arkansas");
        cy.findAllByTestId("pill").eq(1).should("have.text", "Connecticut");
        cy.findAllByTestId("pill").eq(2).should("have.text", "Hawaii");
        cy.findAllByTestId("pill").eq(3).should("have.text", "Kansas");

        cy.get("@changeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          ["Arkansas", "Connecticut", "Hawaii", "Kansas"]
        );

        cy.realPress("ArrowDown");
        cy.realPress("ArrowDown");
        cy.realPress("Enter");

        // pill group cleared
        cy.findAllByTestId("pill").should("have.length", 3);
        cy.findAllByTestId("pill").eq(0).should("have.text", "Connecticut");
        cy.findAllByTestId("pill").eq(1).should("have.text", "Hawaii");
        cy.findAllByTestId("pill").eq(2).should("have.text", "Kansas");

        cy.get("@changeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          ["Connecticut", "Hawaii", "Kansas"]
        );
      });
    });

    describe("when the 'Enter' key is pressed while focused on pills", () => {
      it("should de-select any selected item", () => {
        const changeSpy = cy.stub().as("changeSpy");

        cy.mount(<MultiSelectWithInitialSelection onChange={changeSpy} />);

        cy.realPress("Tab");

        cy.realPress("ArrowLeft");
        cy.realPress("Enter");

        // selection updated
        cy.findByRole("listbox")
          .findAllByRole("option", { selected: true })
          .should("have.length", 4);

        cy.get("@changeSpy").should("have.been.calledWith", null, [
          "Alaska",
          "Arkansas",
          "Connecticut",
          "Hawaii",
        ]);

        cy.realPress("ArrowLeft");
        cy.realPress("Enter");

        // selection cleared
        cy.findByRole("listbox")
          .findAllByRole("option", { selected: true })
          .should("have.length", 3);

        cy.get("@changeSpy").should("have.been.calledWith", null, [
          "Alaska",
          "Arkansas",
          "Connecticut",
        ]);
      });
    });
  });
});

describe("A multi-select combo box that allows free text item", () => {
  describe("with nothing selected", () => {
    describe("when using delimiter", () => {
      it("should add unique items only", () => {
        const changeSpy = cy.stub().as("changeSpy");

        cy.mount(<MultiSelectWithFreeTextItem onChange={changeSpy} />);

        cy.realPress("Tab");

        cy.findByRole("textbox").paste("Alaska, Alabama, Alaska, Non existent");

        cy.findAllByTestId("pill").should("have.length", 3);
        cy.findAllByTestId("pill").eq(0).should("have.text", "Alaska");
        cy.findAllByTestId("pill").eq(1).should("have.text", "Alabama");
        cy.findAllByTestId("pill").eq(2).should("have.text", "Non existent");

        cy.findByRole("listbox")
          .findByRole("option", { name: "Alaska" })
          .should("have.attr", "aria-selected", "true");
        cy.findByRole("listbox")
          .findByRole("option", { name: "Alabama" })
          .should("have.attr", "aria-selected", "true");

        cy.get("@changeSpy").should("have.been.calledWith", null, [
          "Alaska",
          "Alabama",
          "Non existent",
        ]);
      });
    });

    it("should add any free text item", () => {
      cy.mount(<MultiSelectWithFreeTextItem />);

      cy.realPress("Tab");

      // type and tab out
      cy.realType("Non existent");
      cy.realPress("Tab");

      cy.findAllByTestId("pill").should("have.length", 1);
      cy.findByTestId("pill").should("have.text", "Non existent");
    });

    it("should not add an item if it already exists", () => {
      cy.mount(<MultiSelectWithFreeTextItem />);

      cy.realPress("Tab");

      // initialized with an item
      cy.realType("Non existent");
      cy.realPress("Enter");

      // type it again and tab out
      cy.realType("Non existent");
      cy.realPress("Tab");

      cy.findAllByTestId("pill").should("have.length", 1);
      cy.findByTestId("pill").should("have.text", "Non existent");
    });
  });

  describe("with selected items", () => {
    it("should add an item if it hasn't been selected", () => {
      cy.mount(<MultiSelectWithInitialSelection allowFreeText />);

      cy.realPress("Tab");
      // type and tab out
      cy.realType("Alabama");
      cy.realPress("Tab");

      cy.findAllByTestId("pill").should("have.length", 6);
      cy.findAllByTestId("pill").eq(0).should("have.text", "Alaska");
      cy.findAllByTestId("pill").eq(1).should("have.text", "Arkansas");
      cy.findAllByTestId("pill").eq(2).should("have.text", "Connecticut");
      cy.findAllByTestId("pill").eq(3).should("have.text", "Hawaii");
      cy.findAllByTestId("pill").eq(4).should("have.text", "Kansas");
      cy.findAllByTestId("pill").eq(5).should("have.text", "Alabama");
    });

    it("should not add an item if it has already been selected", () => {
      cy.mount(<MultiSelectWithInitialSelection allowFreeText />);

      cy.realPress("Tab");
      // type and tab out
      cy.realType("Alaska");
      cy.realPress("Tab");

      cy.findAllByTestId("pill").should("have.length", 5);
      cy.findAllByTestId("pill").eq(0).should("have.text", "Alaska");
      cy.findAllByTestId("pill").eq(1).should("have.text", "Arkansas");
      cy.findAllByTestId("pill").eq(2).should("have.text", "Connecticut");
    });
  });
});
