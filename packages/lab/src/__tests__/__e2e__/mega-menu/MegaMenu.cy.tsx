import { NavigationItem, StackLayout } from "@salt-ds/core";
import {
  MegaMenu,
  MegaMenuGroup,
  MegaMenuHeader,
  MegaMenuItem,
  MegaMenuPanel,
  MegaMenuSection,
  MegaMenuTrigger,
} from "@salt-ds/lab";
import { useState } from "react";

const InteractiveMegaMenu = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleOpenChange = (menu: string) => (open: boolean) => {
    setOpenMenu(open ? menu : null);
  };

  return (
    <nav>
      <StackLayout as="ol" direction="row" gap={1}>
        <li>
          <MegaMenu
            open={openMenu === "solutions"}
            onOpenChange={handleOpenChange("solutions")}
          >
            <MegaMenuTrigger>
              <NavigationItem>Solutions</NavigationItem>
            </MegaMenuTrigger>
            <MegaMenuPanel>
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial Services</MegaMenuHeader>
                  <MegaMenuItem>Digital Banking</MegaMenuItem>
                  <MegaMenuItem>Risk Management</MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
            </MegaMenuPanel>
          </MegaMenu>
        </li>

        <li>
          <MegaMenu
            open={openMenu === "services"}
            onOpenChange={handleOpenChange("services")}
          >
            <MegaMenuTrigger>
              <NavigationItem>Services</NavigationItem>
            </MegaMenuTrigger>
            <MegaMenuPanel>
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Consulting</MegaMenuHeader>
                  <MegaMenuItem>Strategy</MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
            </MegaMenuPanel>
          </MegaMenu>
        </li>
      </StackLayout>

      <button type="button">Outside</button>
    </nav>
  );
};

describe("Given a MegaMenu", () => {
  it("renders triggers and keeps menu closed initially", () => {
    cy.mount(<InteractiveMegaMenu />);

    cy.findByRole("button", { name: "Solutions" }).should("exist");
    cy.findByRole("button", { name: "Services" }).should("exist");
    cy.get(".saltMegaMenuPanel").should("not.exist");
  });

  it("opens and closes a menu on trigger click", () => {
    cy.mount(<InteractiveMegaMenu />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.get(".saltMegaMenuPanel").should("exist");

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.get(".saltMegaMenuPanel").should("not.exist");
  });

  it("switches open state between top-level triggers", () => {
    cy.mount(<InteractiveMegaMenu />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.get(".saltMegaMenuPanel").should("exist");
    cy.findByText("Digital Banking").should("exist");

    cy.findByRole("button", { name: "Services" }).click();
    cy.findByText("Strategy").should("exist");
    cy.findByText("Digital Banking").should("not.exist");
  });

  it("selects an item and closes the menu", () => {
    cy.mount(<InteractiveMegaMenu />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.findByText("Digital Banking").click();

    cy.get(".saltMegaMenuPanel").should("not.exist");
  });

  it("closes on outside click", () => {
    cy.mount(<InteractiveMegaMenu />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.get(".saltMegaMenuPanel").should("exist");

    cy.get("body").click(0, 0);
    cy.get(".saltMegaMenuPanel").should("not.exist");
  });

  it("opens initially when defaultOpen is true", () => {
    cy.mount(
      <MegaMenu defaultOpen>
        <MegaMenuTrigger>
          <NavigationItem>Solutions</NavigationItem>
        </MegaMenuTrigger>
        <MegaMenuPanel>
          <MegaMenuSection>
            <MegaMenuGroup>
              <MegaMenuHeader>Financial Services</MegaMenuHeader>
              <MegaMenuItem>Digital Banking</MegaMenuItem>
            </MegaMenuGroup>
          </MegaMenuSection>
        </MegaMenuPanel>
      </MegaMenu>,
    );

    cy.get(".saltMegaMenuPanel").should("exist");
    cy.findByText("Digital Banking").should("exist");
  });

  it("does not persist item active state after selection", () => {
    cy.mount(<InteractiveMegaMenu />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.findByText("Digital Banking").click();
    cy.get(".saltMegaMenuPanel").should("not.exist");

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.findByText("Digital Banking").should("not.have.attr", "aria-current");
  });
});
