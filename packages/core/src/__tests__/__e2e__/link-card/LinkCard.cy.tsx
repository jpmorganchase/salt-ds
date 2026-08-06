import { LinkCard } from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import * as linkCardStories from "~stories/link-card/link-card.stories";
import { checkAccessibility } from "~test-utils/checkAccessibility";

const composedStories = composeStories(linkCardStories);
const { Default } = composedStories;
const transparentBorderColor = "rgba(0, 0, 0, 0)";

describe("Given a Link Card", () => {
  checkAccessibility(composedStories);

  it("should render children", () => {
    cy.mount(<Default />);
    cy.findByText("Sustainable investing products").should("be.visible");
    cy.findByText(
      "We have a commitment to provide a wide range of investment solutions to enable you to align your financial goals to your values.",
    ).should("be.visible");
  });

  it("should apply the correct href", () => {
    cy.mount(<Default />);
    cy.get("a").should("have.attr", "href", "#");
  });

  it("should apply appearance styling", () => {
    cy.mount(
      <>
        <LinkCard data-testid="flat-card" href="#" appearance="flat">
          Flat card
        </LinkCard>
        <LinkCard data-testid="raised-card" href="#" appearance="raised">
          Raised card
        </LinkCard>
      </>,
    );

    cy.findByTestId("flat-card")
      .should("have.class", "saltLinkCard-flat")
      .and(($card) => {
        expect(getComputedStyle($card[0]).boxShadow).to.equal("none");
      });
    cy.findByTestId("raised-card").should("have.class", "saltLinkCard-raised");
  });

  it("should apply borderColor styling to the default state", () => {
    cy.mount(
      <>
        <LinkCard data-testid="strong-card" href="#" borderColor="strong">
          Strong border
        </LinkCard>
        <LinkCard data-testid="default-card" href="#" borderColor="default">
          Default border
        </LinkCard>
        <LinkCard data-testid="subtle-card" href="#" borderColor="subtle">
          Subtle border
        </LinkCard>
        <LinkCard data-testid="none-card" href="#" borderColor="none">
          No border
        </LinkCard>
      </>,
    );

    cy.findByTestId("strong-card").should(
      "have.class",
      "saltLinkCard-borderColorStrong",
    );
    cy.findByTestId("default-card").should(
      "have.class",
      "saltLinkCard-borderColorDefault",
    );
    cy.findByTestId("subtle-card").should(
      "have.class",
      "saltLinkCard-borderColorSubtle",
    );
    cy.findByTestId("none-card")
      .should("have.class", "saltLinkCard-borderColorNone")
      .and(($card) => {
        expect(getComputedStyle($card[0]).borderColor).to.equal(
          transparentBorderColor,
        );
      });
  });
});
