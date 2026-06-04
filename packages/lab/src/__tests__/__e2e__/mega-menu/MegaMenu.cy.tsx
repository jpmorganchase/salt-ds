import { NavigationItem, StackLayout } from "@salt-ds/core";
import {
  MegaMenu,
  MegaMenuHeading,
  MegaMenuLink,
  MegaMenuMain,
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
              <MegaMenuMain>
                <MegaMenuSection>
                  <MegaMenuHeading>Financial Services</MegaMenuHeading>
                  <MegaMenuLink
                    href="/digital-banking"
                    onClick={(e) => e.preventDefault()}
                  >
                    Digital Banking
                  </MegaMenuLink>
                  <MegaMenuLink
                    href="/risk-management"
                    onClick={(e) => e.preventDefault()}
                  >
                    Risk Management
                  </MegaMenuLink>
                </MegaMenuSection>
              </MegaMenuMain>
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
              <MegaMenuMain>
                <MegaMenuSection>
                  <MegaMenuHeading>Consulting</MegaMenuHeading>
                  <MegaMenuLink
                    href="/strategy"
                    onClick={(e) => e.preventDefault()}
                  >
                    Strategy
                  </MegaMenuLink>
                </MegaMenuSection>
              </MegaMenuMain>
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
    cy.findByRole("link", { name: "Digital Banking" }).should("exist");

    cy.findByRole("button", { name: "Services" }).click();
    cy.findByRole("link", { name: "Strategy" }).should("exist");
    cy.findByRole("link", { name: "Digital Banking" }).should("not.exist");
  });

  it("selects an item and closes the menu", () => {
    cy.mount(<InteractiveMegaMenu />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.findByRole("link", { name: "Digital Banking" }).click();

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
          <MegaMenuMain>
            <MegaMenuSection>
              <MegaMenuHeading>Financial Services</MegaMenuHeading>
              <MegaMenuLink
                href="/digital-banking"
                onClick={(e) => e.preventDefault()}
              >
                Digital Banking
              </MegaMenuLink>
            </MegaMenuSection>
          </MegaMenuMain>
        </MegaMenuPanel>
      </MegaMenu>,
    );

    cy.get(".saltMegaMenuPanel").should("exist");
    cy.findByRole("link", { name: "Digital Banking" }).should("exist");
  });

  it("does not persist item active state after selection", () => {
    cy.mount(<InteractiveMegaMenu />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.findByRole("link", { name: "Digital Banking" }).click();
    cy.get(".saltMegaMenuPanel").should("not.exist");

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.findByRole("link", { name: "Digital Banking" }).should(
      "not.have.attr",
      "aria-current",
    );
  });
});
