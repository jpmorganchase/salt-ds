import { NavigationItem, StackLayout } from "@salt-ds/core";
import {
  MegaMenu,
  MegaMenuContainer,
  MegaMenuGroup,
  MegaMenuHeader,
  MegaMenuItem,
  MegaMenuSection,
  MegaMenuTrigger,
} from "@salt-ds/lab";

const KeyboardMegaMenu = () => (
  <nav>
    <StackLayout as="ol" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem
              href="#"
              onClick={(event) => {
                event.preventDefault();
              }}
            >
              Solutions
            </NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuContainer>
            <MegaMenuSection>
              <MegaMenuGroup>
                <MegaMenuHeader>Financial Services</MegaMenuHeader>
                <MegaMenuItem>Digital Banking</MegaMenuItem>
                <MegaMenuItem>Risk Management</MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Healthcare</MegaMenuHeader>
                <MegaMenuItem>Patient Management</MegaMenuItem>
                <MegaMenuItem>Telemedicine</MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuSection>
          </MegaMenuContainer>
        </MegaMenu>
      </li>

      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem
              href="#"
              onClick={(event) => {
                event.preventDefault();
              }}
            >
              Services
            </NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuContainer>
            <MegaMenuSection>
              <MegaMenuGroup>
                <MegaMenuHeader>Consulting</MegaMenuHeader>
                <MegaMenuItem>Strategy</MegaMenuItem>
                <MegaMenuItem>Operations</MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuSection>
          </MegaMenuContainer>
        </MegaMenu>
      </li>
    </StackLayout>

    <button type="button">After Nav</button>
  </nav>
);

const focusSolutionsTrigger = () => {
  cy.findByRole("link", { name: "Solutions" }).focus().should("be.focused");
};

const openSolutionsWithEnter = () => {
  focusSolutionsTrigger();
  cy.realPress("Enter");
  cy.get(".saltMegaMenuContainer").should("exist");
};

describe("Given a MegaMenu", () => {
  describe("when focus is on the trigger and menu is closed", () => {
    (["Enter", " ", "ArrowDown"] as const).forEach((key) => {
      it(`opens on ${key}`, () => {
        cy.mount(<KeyboardMegaMenu />);
        focusSolutionsTrigger();
        cy.realPress(key);
        cy.get(".saltMegaMenuContainer").should("exist");
      });
    });

    it("does not open on Tab", () => {
      cy.mount(<KeyboardMegaMenu />);
      focusSolutionsTrigger();
      cy.realPress("Tab");
      cy.get(".saltMegaMenuContainer").should("not.exist");
    });

    it("moves focus to next trigger on ArrowRight", () => {
      cy.mount(<KeyboardMegaMenu />);
      focusSolutionsTrigger();

      cy.realPress("ArrowRight");
      cy.findByRole("link", { name: "Services" }).should("be.focused");
      cy.get(".saltMegaMenuContainer").should("not.exist");
    });

    it("moves focus to previous trigger on ArrowLeft", () => {
      cy.mount(<KeyboardMegaMenu />);
      cy.findByRole("link", { name: "Services" }).focus().should("be.focused");

      cy.realPress("ArrowLeft");
      cy.findByRole("link", { name: "Solutions" }).should("be.focused");
      cy.get(".saltMegaMenuContainer").should("not.exist");
    });
  });

  describe("when menu is open", () => {
    it("moves focus to first item on Tab from trigger", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByText("Digital Banking").should("be.focused");
    });

    it("moves focus to first item on ArrowDown from trigger", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("ArrowDown");
      cy.findByText("Digital Banking").should("be.focused");
    });

    it("supports ArrowDown and ArrowUp between items and trigger", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByText("Digital Banking").should("be.focused");

      cy.realPress("ArrowDown");
      cy.findByText("Risk Management").should("be.focused");

      cy.realPress("ArrowUp");
      cy.findByText("Digital Banking").should("be.focused");

      cy.realPress("ArrowUp");
      cy.findByRole("link", { name: "Solutions" }).should("be.focused");
    });

    it("supports ArrowDown and ArrowUp within and across groups", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByText("Digital Banking").should("be.focused");

      // Within the first group
      cy.realPress("ArrowDown");
      cy.findByText("Risk Management").should("be.focused");

      // Last item of first group -> first item of next group
      cy.realPress("ArrowDown");
      cy.findByText("Patient Management").should("be.focused");

      // First item of second group -> last item of previous group
      cy.realPress("ArrowUp");
      cy.findByText("Risk Management").should("be.focused");
    });

    it("supports ArrowRight and ArrowLeft across groups", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByText("Digital Banking").should("be.focused");

      cy.realPress("ArrowRight");
      cy.findByText("Patient Management").should("be.focused");

      cy.realPress("ArrowLeft");
      cy.findByText("Digital Banking").should("be.focused");
    });

    it("has no effect on ArrowRight or ArrowDown from last item", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("Tab"); // Risk Management
      cy.realPress("Tab"); // Patient Management
      cy.realPress("Tab"); // Telemedicine
      cy.findByText("Telemedicine").should("be.focused");

      cy.realPress("ArrowRight");
      cy.findByText("Telemedicine").should("be.focused");
      cy.get(".saltMegaMenuContainer").should("exist");

      cy.realPress("ArrowDown");
      cy.findByText("Telemedicine").should("be.focused");
      cy.get(".saltMegaMenuContainer").should("exist");
    });

    it("supports Tab and Shift+Tab inside menu", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByText("Digital Banking").should("be.focused");

      cy.realPress("Tab");
      cy.findByText("Risk Management").should("be.focused");

      cy.realPress(["Shift", "Tab"]);
      cy.findByText("Digital Banking").should("be.focused");
    });

    it("returns focus to trigger on Shift+Tab from first item and Tab re-enters first item", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByText("Digital Banking").should("be.focused");

      cy.realPress(["Shift", "Tab"]);
      cy.findByRole("link", { name: "Solutions" }).should("be.focused");

      cy.realPress("Tab");
      cy.findByText("Digital Banking").should("be.focused");
    });

    it("closes on Escape", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByText("Digital Banking").should("be.focused");

      cy.realPress("Escape");
      cy.get(".saltMegaMenuContainer").should("not.exist");
    });

    it("activates item on Enter and closes menu", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab");
      cy.findByText("Digital Banking").should("be.focused");

      cy.realPress("Enter");
      cy.get(".saltMegaMenuContainer").should("not.exist");
    });

    it("tabs from the last item to the next trigger", () => {
      cy.mount(<KeyboardMegaMenu />);
      openSolutionsWithEnter();

      cy.realPress("Tab"); // Digital Banking
      cy.realPress("Tab"); // Risk Management
      cy.realPress("Tab"); // Patient Management
      cy.realPress("Tab"); // Telemedicine
      cy.findByText("Telemedicine").should("be.focused");

      cy.realPress("Tab");
      cy.findByRole("link", { name: "Services" }).should("be.focused");
    });
  });
});
