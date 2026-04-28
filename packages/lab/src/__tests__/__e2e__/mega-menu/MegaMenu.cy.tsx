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
import { useState } from "react";

const InteractiveMegaMenu = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | undefined>();

  const handleOpenChange = (menu: string) => (open: boolean) => {
    setOpenMenu(open ? menu : null);
  };

  const handleSelectedItemChange = (
    menu: string,
    value: string | undefined,
  ) => {
    const nextValue = selectedItem === value ? undefined : value;
    setSelectedItem(nextValue);
    setActiveMenu(nextValue ? menu : null);
  };

  return (
    <nav>
      <StackLayout as="ol" direction="row" gap={1}>
        <li>
          <MegaMenu
            open={openMenu === "solutions"}
            onOpenChange={handleOpenChange("solutions")}
            selectedItem={selectedItem}
            onSelectedItemChange={(value) =>
              handleSelectedItemChange("solutions", value)
            }
          >
            <MegaMenuTrigger>
              <NavigationItem
                active={activeMenu === "solutions"}
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setOpenMenu((prev) =>
                    prev === "solutions" ? null : "solutions",
                  );
                }}
              >
                Solutions
              </NavigationItem>
            </MegaMenuTrigger>
            <MegaMenuContainer>
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Financial Services</MegaMenuHeader>
                  <MegaMenuItem value="Digital Banking">
                    Digital Banking
                  </MegaMenuItem>
                  <MegaMenuItem value="Risk Management">
                    Risk Management
                  </MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
            </MegaMenuContainer>
          </MegaMenu>
        </li>

        <li>
          <MegaMenu
            open={openMenu === "services"}
            onOpenChange={handleOpenChange("services")}
            selectedItem={selectedItem}
            onSelectedItemChange={(value) =>
              handleSelectedItemChange("services", value)
            }
          >
            <MegaMenuTrigger>
              <NavigationItem
                active={activeMenu === "services"}
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setOpenMenu((prev) =>
                    prev === "services" ? null : "services",
                  );
                }}
              >
                Services
              </NavigationItem>
            </MegaMenuTrigger>
            <MegaMenuContainer>
              <MegaMenuSection>
                <MegaMenuGroup>
                  <MegaMenuHeader>Consulting</MegaMenuHeader>
                  <MegaMenuItem value="Strategy">Strategy</MegaMenuItem>
                </MegaMenuGroup>
              </MegaMenuSection>
            </MegaMenuContainer>
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
    cy.get(".saltMegaMenuContainer").should("not.exist");
  });

  it("opens and closes a menu on trigger click", () => {
    cy.mount(<InteractiveMegaMenu />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.get(".saltMegaMenuContainer").should("exist");

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.get(".saltMegaMenuContainer").should("not.exist");
  });

  it("switches open state between top-level triggers", () => {
    cy.mount(<InteractiveMegaMenu />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.get(".saltMegaMenuContainer").should("exist");
    cy.findByText("Digital Banking").should("exist");

    cy.findByRole("button", { name: "Services" }).click();
    cy.findByText("Strategy").should("exist");
    cy.findByText("Digital Banking").should("not.exist");
  });

  it("selects an item and closes the menu", () => {
    cy.mount(<InteractiveMegaMenu />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.findByText("Digital Banking").click();

    cy.get(".saltMegaMenuContainer").should("not.exist");

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.findByText("Digital Banking").should(
      "have.attr",
      "aria-current",
      "page",
    );
  });

  it("closes on outside click", () => {
    cy.mount(<InteractiveMegaMenu />);

    cy.findByRole("button", { name: "Solutions" }).click();
    cy.get(".saltMegaMenuContainer").should("exist");

    cy.findByRole("button", { name: "Outside" }).click();
    cy.get(".saltMegaMenuContainer").should("not.exist");
  });
});
