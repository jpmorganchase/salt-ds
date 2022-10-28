import { SearchInput } from "@jpmorganchase/uitk-lab";
import { useState } from "react";

describe("GIVEN a Search", () => {
  describe("WHEN it is uncontrolled without a default value", () => {
    it("THEN should render the Search without a clear button and no value", () => {
      cy.mount(<SearchInput />);
      cy.findByRole("textbox").should("have.value", "");
      cy.findByRole("button", { name: "clear input" }).should("not.exist");
    });
  });

  describe("WHEN it is uncontrolled with a default value", () => {
    it("THEN should render the Search with a clear button", () => {
      cy.mount(<SearchInput defaultValue="default value" />);
      cy.findByRole("button", { name: "clear input" }).should("exist");
    });

    it("THEN should have the default value", () => {
      cy.mount(<SearchInput defaultValue="default value" />);
      cy.findByRole("textbox").should("have.value", "default value");
    });

    describe("AND Enter key is pressed on the input", () => {
      it("THEN should call onSubmit with the default value", () => {
        const submitSpy = cy.stub().as("submitSpy");
        cy.mount(
          <SearchInput defaultValue="default value" onSubmit={submitSpy} />
        );
        cy.findByRole("textbox").focus();
        cy.realPress("{enter}");
        cy.get("@submitSpy").should("have.been.calledWith", "default value");
      });
    });

    describe("AND the clear button is clicked", () => {
      it("THEN should hide the clear button", () => {
        cy.mount(<SearchInput defaultValue="default value" />);
        cy.findByRole("button", { name: "clear input" }).click();

        cy.findByRole("button", { name: "clear input" }).should("not.exist");
      });

      it("THEN should call onChange with an empty value", () => {
        const changeSpy = cy.stub().as("changeSpy");
        cy.mount(
          <SearchInput defaultValue="default value" onChange={changeSpy} />
        );
        cy.findByRole("button", { name: "clear input" }).click();
        cy.get("@changeSpy").should(
          "have.been.calledWith",
          Cypress.sinon.match.any,
          ""
        );
      });

      it("THEN should clear the input value", () => {
        cy.mount(<SearchInput defaultValue="default value" />);
        cy.findByRole("button", { name: "clear input" }).click();

        cy.findByRole("textbox").should("have.value", "");
      });

      it("THEN should focus the input", () => {
        cy.mount(<SearchInput defaultValue="default value" />);
        cy.findByRole("button", { name: "clear input" }).click();

        cy.findByRole("textbox").should("have.focus");
      });

      it("THEN should call onClear", () => {
        const clearSpy = cy.stub().as("clearSpy");
        cy.mount(
          <SearchInput defaultValue="default value" onClear={clearSpy} />
        );
        cy.findByRole("button", { name: "clear input" }).click();

        cy.get("@clearSpy").should("have.callCount", 1);
      });

      describe("AND the Enter key is pressed on the input", () => {
        it("THEN should not call onSubmit", () => {
          const submitSpy = cy.stub().as("submitSpy");
          cy.mount(
            <SearchInput defaultValue="default value" onSubmit={submitSpy} />
          );
          cy.findByRole("button").click();
          cy.findByRole("textbox").should("have.focus");
          cy.realPress("{enter}");
          cy.get("@submitSpy").should("have.callCount", 0);
        });
      });

      describe("AND the input is updated", () => {
        it("THEN should show the clear button", () => {
          cy.mount(<SearchInput defaultValue="default value" />);
          cy.findByRole("button", { name: "clear input" }).click();

          cy.realType("new value");
          cy.findByRole("button", { name: "clear input" }).should("exist");
        });

        it("THEN should have the new value", () => {
          cy.mount(<SearchInput defaultValue="default value" />);
          cy.findByRole("button", { name: "clear input" }).click();
          cy.realType("new value");
          cy.findByRole("textbox").should("have.value", "new value");
        });

        it("THEN should call onChange with the new value", () => {
          const changeSpy = cy.stub().as("changeSpy");
          cy.mount(
            <SearchInput defaultValue="default value" onChange={changeSpy} />
          );
          cy.findByRole("button", { name: "clear input" }).click();
          cy.findByRole("textbox").clear();

          cy.realType("new value");
          cy.get("@changeSpy").should(
            "have.been.calledWith",
            Cypress.sinon.match.any,
            "new value"
          );
        });

        describe("AND Enter key is pressed on the input", () => {
          it("THEN should call onSubmit", () => {
            const clearSpy = cy.stub().as("clearSpy");
            cy.mount(
              <SearchInput defaultValue="default value" onClear={clearSpy} />
            );
            cy.findByRole("button", { name: "clear input" }).click();
            cy.realType("new value");
            cy.realPress("{enter}");
            cy.get("@clearSpy").should("have.callCount", 1);
          });
        });
      });
    });
  });

  describe("WHEN it is uncontrolled and disabled", () => {
    it("THEN should render a disabled input", () => {
      cy.mount(<SearchInput disabled />);
      cy.findByRole("textbox").should("be.disabled");
    });
  });

  describe("WHEN it is controlled with an empty value", () => {
    it("THEN should render the Search without a clear button and no value", () => {
      cy.mount(<SearchInput value="" />);
      cy.findByRole("button", { name: "clear input" }).should("not.exist");
      cy.findByRole("textbox").should("have.value", "");
    });

    describe("AND ENTER is pressed on the input", () => {
      it("THEN should not call onSubmit", () => {
        const submitSpy = cy.stub().as("submitSpy");
        cy.mount(<SearchInput value="" onSubmit={submitSpy} />);
        cy.findByRole("textbox").click();
        cy.realPress("{enter}");
        cy.get("@submitSpy").should("have.callCount", 0);
      });
    });

    describe("WHEN the value prop has a value", () => {
      it("THEN should render the clear button", () => {
        cy.mount(<SearchInput value="value a" />);
        cy.findByRole("button", { name: "clear input" }).should("exist");
      });

      it("THEN should set the input value to the value prop", () => {
        cy.mount(<SearchInput value="value a" />);
        cy.findByRole("textbox").should("have.value", "value a");
      });

      describe("AND the Enter key is pressed on the input", () => {
        it("THEN should call onSubmit with the value prop", () => {
          const submitSpy = cy.stub().as("submitSpy");
          cy.mount(<SearchInput value="value a" onSubmit={submitSpy} />);
          cy.findByRole("textbox").click();
          cy.realPress("{enter}");
          cy.get("@submitSpy").should("have.been.calledWith", "value a");
        });
      });

      describe("AND the input is updated", () => {
        it("THEN should render the Search with a clear button", () => {
          cy.mount(<SearchInput value="value a" />);
          cy.findByRole("textbox").type("value b");

          cy.findByRole("button", { name: "clear input" }).should("exist");
        });

        it("THEN should not update the input value", () => {
          cy.mount(<SearchInput value="value a" />);
          cy.findByRole("textbox")
            .type("value b")
            .should("have.value", "value a");
        });

        it("THEN call onChange with the new value", () => {
          const changeSpy = cy.stub().as("changeSpy");
          function ControlledSearchInput() {
            const [value, setValue] = useState("value a");
            return (
              <SearchInput
                onChange={(event, value) => {
                  setValue(value);
                  changeSpy(event, value);
                }}
                value={value}
              />
            );
          }
          cy.mount(<ControlledSearchInput />);
          cy.findByRole("textbox").clear().type("value b");
          cy.get("@changeSpy").should(
            "have.been.calledWith",
            Cypress.sinon.match.any,
            "value b"
          );
        });

        describe("AND the Enter key is pressed on the input", () => {
          it("THEN should call onSubmit with the value prop", () => {
            const submitSpy = cy.stub().as("submitSpy");
            cy.mount(<SearchInput value="value a" onSubmit={submitSpy} />);
            cy.findByRole("textbox").click().type("value b");
            cy.realPress("{enter}");
            cy.get("@submitSpy").should("have.been.calledWith", "value a");
          });
        });

        describe("WHEN the value prop is changed to a new value", () => {
          it("THEN should render the Search with a clear button", () => {
            cy.mount(<SearchInput value="value a" />).then(({ rerender }) => {
              rerender(<SearchInput value="value b" />);
              cy.findByRole("textbox").should("have.value", "value b");

              cy.findByRole("button", { name: "clear input" }).should("exist");
            });
          });

          it("the input value should be the same as the new value prop", () => {
            cy.mount(<SearchInput value="value a" />).then(({ rerender }) => {
              rerender(<SearchInput value="value b" />);
              cy.findByRole("textbox").should("have.value", "value b");
            });
          });

          it("THEN should not call onChange", () => {
            const changeSpy = cy.stub().as("changeSpy");
            cy.mount(<SearchInput value="value a" onChange={changeSpy} />).then(
              ({ rerender }) => {
                rerender(<SearchInput value="value b" onChange={changeSpy} />);
                cy.get("@changeSpy").should("have.callCount", 0);
              }
            );
          });
        });
      });

      describe("AND the clear button is clicked", () => {
        it("THEN should render the clear button", () => {
          cy.mount(<SearchInput value="value a" />);
          cy.findByRole("button", { name: "clear input" })
            .click()
            .should("exist");
        });

        it("THEN should not call onChange", () => {
          const changeSpy = cy.stub().as("changeSpy");
          cy.mount(<SearchInput value="value a" onChange={changeSpy} />);
          cy.findByRole("button", { name: "clear input" }).click();
          cy.get("@changeSpy").should("have.callCount", 0);
        });

        it("the value should still be the value prop", () => {
          cy.mount(<SearchInput value="value a" />);
          cy.findByRole("button", { name: "clear input" }).click();

          cy.findByRole("textbox").should("have.value", "value a");
        });

        it("THEN should refocus the input", () => {
          cy.mount(<SearchInput value="value a" />);
          cy.findByRole("button", { name: "clear input" }).click();

          cy.findByRole("textbox").should("have.focus");
        });

        it("THEN should call onClear", () => {
          const clearSpy = cy.stub().as("clearSpy");
          cy.mount(<SearchInput value="value a" onClear={clearSpy} />);
          cy.findByRole("button", { name: "clear input" }).click();
          cy.get("@clearSpy").should("have.callCount", 1);
        });
      });
    });
  });
});
