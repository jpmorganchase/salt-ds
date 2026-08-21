import { LinkButton } from "@salt-ds/core";
import { StackoverflowIcon } from "@salt-ds/icons";

describe("GIVEN a LinkButton", () => {
  it('WHEN passed target="_blank", THEN should render the LinkButton with the tear out icon', () => {
    cy.mount(
      <LinkButton href="#root" target="_blank">
        Action
      </LinkButton>,
    );

    cy.findByTestId(/TearOutIcon/i).should("exist");
    cy.findByRole("link").should(
      "have.accessibleName",
      "Action Opens in a new tab",
    );
  });

  it('WHEN passed target="_blank", THEN the "Opens in a new tab" ADA text should NOT be included when the link button is copied', () => {
    cy.mount(
      <LinkButton href="#root" target="_blank">
        Action
      </LinkButton>,
    );

    cy.findByRole("link").then(($linkButton) => {
      const doc = $linkButton[0].ownerDocument;
      const range = doc.createRange();
      range.selectNodeContents($linkButton[0]);
      const selection = doc.defaultView?.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      expect(selection?.toString()).to.equal("ACTION");
    });
  });

  it('WHEN passed target="_blank" AND passed IconComponent, THEN should render the LinkButton with the custom icon', () => {
    cy.mount(
      <LinkButton
        href="#root"
        target="_blank"
        IconComponent={StackoverflowIcon}
      >
        Action
      </LinkButton>,
    );

    cy.findByTestId(/StackOverflowIcon/i).should("exist");
  });

  it('WHEN passed target="_blank" AND passed IconComponent as null, THEN should render the accessible text without the icon', () => {
    cy.mount(
      <LinkButton href="#root" target="_blank" IconComponent={null}>
        Action
      </LinkButton>,
    );

    cy.findByTestId(/TearOutIcon/i).should("not.exist");
    cy.findByRole("link").should(
      "have.accessibleName",
      "Action Opens in a new tab",
    );
  });

  it('WHEN passed target != "_blank", THEN should NOT render the tear out icon', () => {
    cy.mount(
      <LinkButton href="#root" target="blank">
        Action
      </LinkButton>,
    );

    cy.findByTestId(/TearOutIcon/i).should("not.exist");
  });

  it('WHEN render is given a JSX element with target="_blank", THEN should render the tear out icon', () => {
    cy.mount(
      <LinkButton
        href="#root"
        render={
          <a
            href="https://www.saltdesignsystem.com"
            rel="noopener"
            target="_blank"
          />
        }
      >
        Action
      </LinkButton>,
    );

    cy.findByTestId(/TearOutIcon/i).should("exist");
    cy.findByRole("link").should(
      "have.accessibleName",
      "Action Opens in a new tab",
    );
  });

  it('WHEN render is given a JSX element with target!="_blank", THEN should NOT render the tear out icon', () => {
    cy.mount(
      <LinkButton
        href="#root"
        target="_blank"
        render={<a href="https://www.saltdesignsystem.com" target="_self" />}
      >
        Action
      </LinkButton>,
    );

    cy.findByTestId(/TearOutIcon/i).should("not.exist");
    cy.findByRole("link").should("have.accessibleName", "Action");
  });
});
