import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  InteractableCard,
  LinkCard,
} from "@salt-ds/core";
import * as cardStories from "@stories/card/card.stories";
import { composeStories } from "@storybook/react-vite";
import { Fragment, useState } from "react";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(cardStories);
const { Default, AccentVariations } = composedStories;

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

  it("should apply sectioned layout for direct sections", () => {
    cy.mount(
      <Card data-testid="card">
        <CardContent>Content</CardContent>
      </Card>,
    );

    cy.findByTestId("card").should("have.class", "saltCard-sectioned");
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

    cy.findByTestId("link-card").should("have.class", "saltLinkCard-sectioned");
    cy.findByTestId("interactable-card").should(
      "have.class",
      "saltInteractableCard-sectioned",
    );
  });
});
