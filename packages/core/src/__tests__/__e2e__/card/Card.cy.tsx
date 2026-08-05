import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  InteractableCard,
  LinkCard,
} from "@salt-ds/core";
import { composeStories } from "@storybook/react-vite";
import { Fragment, useState } from "react";
import * as cardStories from "~stories/card/card.stories";
import { checkAccessibility } from "~test-utils/checkAccessibility";

const composedStories = composeStories(cardStories);
const { Default, AccentVariations } = composedStories;
const transparentBorderColor = "rgba(0, 0, 0, 0)";

function DynamicCard() {
  const [showContent, setShowContent] = useState(true);

  return (
    <>
      <button type="button" onClick={() => setShowContent((value) => !value)}>
        Toggle content
      </button>
      <Card data-testid="dynamic-card">
        {showContent ? (
          <CardContent>Content</CardContent>
        ) : (
          <span>Plain child</span>
        )}
      </Card>
    </>
  );
}

function DynamicMultipleSectionsCard() {
  const [showFooter, setShowFooter] = useState(true);

  return (
    <>
      <button type="button" onClick={() => setShowFooter((value) => !value)}>
        Toggle footer
      </button>
      <Card data-testid="multiple-sections-card">
        <CardContent>Content</CardContent>
        {showFooter && <CardFooter>Footer</CardFooter>}
      </Card>
    </>
  );
}

function WrappedContent() {
  return <CardContent>Wrapped content</CardContent>;
}

describe("Given a Card", () => {
  checkAccessibility(composedStories);

  it("should render children", () => {
    cy.mount(<Default />);
    cy.findByText("Sustainable investing products").should("be.visible");
    cy.findByText(
      "We have a commitment to provide a wide range of investment solutions to enable you to align your financial goals to your values.",
    ).should("be.visible");
  });

  it("should apply hover styling if hoverable", () => {
    cy.mount(<AccentVariations />);
    cy.get(".saltCard").should("have.class", "saltCard-hoverable");
  });

  it("should apply appearance styling", () => {
    cy.mount(
      <>
        <Card data-testid="flat-card" appearance="flat">
          Flat card
        </Card>
        <Card data-testid="raised-card" appearance="raised">
          Raised card
        </Card>
      </>,
    );

    cy.findByTestId("flat-card")
      .should("have.class", "saltCard-flat")
      .and(($card) => {
        expect(getComputedStyle($card[0]).boxShadow).to.equal("none");
      });
    cy.findByTestId("raised-card").should("have.class", "saltCard-raised");
  });

  it("should apply borderColor styling for non-ghost variants", () => {
    cy.mount(
      <>
        <Card data-testid="strong-card" borderColor="strong">
          Strong border
        </Card>
        <Card data-testid="default-card" borderColor="default">
          Default border
        </Card>
        <Card data-testid="subtle-card" borderColor="subtle">
          Subtle border
        </Card>
        <Card data-testid="none-card" borderColor="none">
          No border
        </Card>
      </>,
    );

    cy.findByTestId("strong-card").should(
      "have.class",
      "saltCard-borderColorStrong",
    );
    cy.findByTestId("default-card").should(
      "have.class",
      "saltCard-borderColorDefault",
    );
    cy.findByTestId("subtle-card").should(
      "have.class",
      "saltCard-borderColorSubtle",
    );
    cy.findByTestId("none-card")
      .should("have.class", "saltCard-borderColorNone")
      .and(($card) => {
        expect(getComputedStyle($card[0]).borderColor).to.equal(
          transparentBorderColor,
        );
      });
  });

  it("should not apply borderColor styling for ghost cards", () => {
    cy.mount(
      <Card data-testid="ghost-card" variant="ghost" borderColor="none">
        Ghost card
      </Card>,
    );

    cy.findByTestId("ghost-card")
      .should("have.class", "saltCard-ghost")
      .and("not.have.class", "saltCard-borderColorNone")
      .and(($card) => {
        expect(getComputedStyle($card[0]).borderColor).not.to.equal(
          transparentBorderColor,
        );
      });
  });

  it("should apply sectioned layout for direct sections", () => {
    cy.mount(
      <Card data-testid="card">
        <CardContent>Content</CardContent>
      </Card>,
    );

    cy.findByTestId("card")
      .should("have.class", "saltCard-sectioned")
      .then(($card) => {
        // Remove the fallback class so the layout assertions exercise :has().
        $card.removeClass("saltCard-sectioned");
      })
      .and(($card) => {
        expect(getComputedStyle($card[0]).display).to.equal("flex");
        expect(getComputedStyle($card[0]).paddingTop).to.equal("0px");
      });
  });

  it("should update sectioned layout when direct sections change", () => {
    cy.mount(<DynamicCard />);

    cy.findByTestId("dynamic-card").should("have.class", "saltCard-sectioned");
    cy.findByRole("button", { name: "Toggle content" }).click();
    cy.findByTestId("dynamic-card").should(
      "not.have.class",
      "saltCard-sectioned",
    );
  });

  it("should keep sectioned layout while any direct section remains", () => {
    cy.mount(<DynamicMultipleSectionsCard />);

    cy.findByTestId("multiple-sections-card").should(
      "have.class",
      "saltCard-sectioned",
    );
    cy.findByRole("button", { name: "Toggle footer" }).click();
    cy.findByTestId("multiple-sections-card").should(
      "have.class",
      "saltCard-sectioned",
    );
  });

  it("should only detect exact direct section components", () => {
    cy.mount(
      <>
        <Card data-testid="wrapped-card">
          <WrappedContent />
        </Card>
        <Card data-testid="fragment-card">
          <Fragment key="content">
            <CardContent>Fragment content</CardContent>
          </Fragment>
        </Card>
      </>,
    );

    cy.findByTestId("wrapped-card").should(
      "not.have.class",
      "saltCard-sectioned",
    );
    cy.findByTestId("fragment-card").should(
      "not.have.class",
      "saltCard-sectioned",
    );
  });

  it("should collapse padding between adjacent sections", () => {
    cy.mount(
      <Card>
        <CardHeader data-testid="header">Header</CardHeader>
        <CardContent data-testid="content">Content</CardContent>
        <CardFooter data-testid="footer">Footer</CardFooter>
      </Card>,
    );

    cy.findByTestId("header").should(($header) => {
      expect(getComputedStyle($header[0]).paddingTop).not.to.equal("0px");
    });
    cy.findByTestId("content").should(($content) => {
      expect(getComputedStyle($content[0]).paddingTop).to.equal("0px");
    });
    cy.findByTestId("footer").should(($footer) => {
      expect(getComputedStyle($footer[0]).paddingTop).to.equal("0px");
    });
  });

  it("should keep section padding when a full-bleed child sits between sections", () => {
    cy.mount(
      <Card>
        <CardHeader>Header</CardHeader>
        <img
          alt=""
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/%3E"
        />
        <CardContent data-testid="content">Content</CardContent>
      </Card>,
    );

    cy.findByTestId("content").should(($content) => {
      expect(getComputedStyle($content[0]).paddingTop).not.to.equal("0px");
    });
  });

  it("should pin a footer when content is omitted", () => {
    cy.mount(
      <Card data-testid="card" style={{ height: 300, width: 200 }}>
        <CardHeader>Header</CardHeader>
        <CardFooter data-testid="footer">Footer</CardFooter>
      </Card>,
    );

    cy.findByTestId("card").then(($card) => {
      cy.findByTestId("footer").should(($footer) => {
        const cardBottom = $card[0].getBoundingClientRect().bottom;
        const footerBottom = $footer[0].getBoundingClientRect().bottom;
        expect(cardBottom - footerBottom).to.be.lessThan(2);
      });
    });
  });

  it("should stretch raw media to the card edges", () => {
    cy.mount(
      <Card data-testid="card" style={{ width: 260 }}>
        <img
          alt=""
          data-testid="media"
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/%3E"
        />
        <CardContent>Content</CardContent>
      </Card>,
    );

    cy.findByTestId("card").then(($card) => {
      cy.findByTestId("media").should(($media) => {
        expect($media[0].getBoundingClientRect().width).to.equal(
          $card[0].clientWidth,
        );
      });
    });
  });

  it("should support sections in link and interactable cards", () => {
    cy.mount(
      <>
        <LinkCard data-testid="link-card" href="#">
          <CardHeader>Link header</CardHeader>
          <CardContent>Link content</CardContent>
        </LinkCard>
        <InteractableCard data-testid="interactable-card">
          <CardHeader>Interactable header</CardHeader>
          <CardContent>Interactable content</CardContent>
        </InteractableCard>
      </>,
    );

    cy.findByTestId("link-card")
      .should("have.class", "saltLinkCard-sectioned")
      .then(($card) => {
        // Remove the fallback class so the layout assertion exercises :has().
        $card.removeClass("saltLinkCard-sectioned");
      })
      .and(($card) => {
        expect(getComputedStyle($card[0]).paddingTop).to.equal("0px");
      });
    cy.findByTestId("interactable-card")
      .should("have.class", "saltInteractableCard-sectioned")
      .then(($card) => {
        // Remove the fallback class so the layout assertion exercises :has().
        $card.removeClass("saltInteractableCard-sectioned");
      })
      .and(($card) => {
        expect(getComputedStyle($card[0]).paddingTop).to.equal("0px");
      });
  });
});
