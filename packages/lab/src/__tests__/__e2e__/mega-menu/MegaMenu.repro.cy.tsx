import { NavigationItem, StackLayout } from "@salt-ds/core";
import {
  MegaMenu,
  MegaMenuGroup,
  MegaMenuGroups,
  MegaMenuHeader,
  MegaMenuItem,
  MegaMenuPanel,
  MegaMenuTrigger,
} from "@salt-ds/lab";

const Fixture = () => (
  <nav>
    <StackLayout as="ol" direction="row" gap={1}>
      <li>
        <MegaMenu>
          <MegaMenuTrigger>
            <NavigationItem>Solutions</NavigationItem>
          </MegaMenuTrigger>
          <MegaMenuPanel>
            <MegaMenuGroups>
              <MegaMenuGroup>
                <MegaMenuHeader>Financial Services</MegaMenuHeader>
                <MegaMenuItem href="/a" onClick={(e) => e.preventDefault()}>Digital Banking</MegaMenuItem>
                <MegaMenuItem href="/b" onClick={(e) => e.preventDefault()}>Risk Management</MegaMenuItem>
              </MegaMenuGroup>
              <MegaMenuGroup>
                <MegaMenuHeader>Healthcare</MegaMenuHeader>
                <MegaMenuItem href="/c" onClick={(e) => e.preventDefault()}>Patient Management</MegaMenuItem>
              </MegaMenuGroup>
            </MegaMenuGroups>
          </MegaMenuPanel>
        </MegaMenu>
      </li>
    </StackLayout>
  </nav>
);

const logFocus = () =>
  cy.focused().then(($el) => cy.log(`FOCUSED tag=${$el.prop("tagName")} class=${$el.attr("class") || ""} text=${$el.text().slice(0,25)}`));

describe("repro", () => {
  it("A: open via ArrowDown, up to trigger, down again", () => {
    cy.mount(<Fixture />);
    cy.findByRole("button", { name: "Solutions" }).focus();
    cy.realPress("ArrowDown"); // opens + focuses Digital Banking
    cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");
    cy.realPress("ArrowUp"); // to trigger
    cy.findByRole("button", { name: "Solutions" }).should("be.focused");
    cy.realPress("ArrowDown"); // re-enter
    logFocus();
    cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");
  });

  it("B: open click, tab in, up to trigger, down again", () => {
    cy.mount(<Fixture />);
    cy.findByRole("button", { name: "Solutions" }).click();
    cy.realPress("Tab");
    cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");
    cy.realPress("ArrowUp");
    cy.findByRole("button", { name: "Solutions" }).should("be.focused");
    cy.realPress("ArrowDown");
    logFocus();
    cy.findByRole("link", { name: "Digital Banking" }).should("be.focused");
  });
});
