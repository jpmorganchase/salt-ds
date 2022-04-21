import { Badge } from "@jpmorganchase/lab";

describe("GIVEN a Badge", () => {
  it("THEN can render a Badge with badge number larger than max", () => {
    cy.mount(<Badge badgeContent={100} max={99} />);
    cy.findByText("99+").should("exist");
  });

  it("THEN can render a Badge with badge number equal to max", () => {
    cy.mount(<Badge badgeContent={99} max={99} />);
    cy.findByText("99").should("exist");
  });

  it("THEN can render a Badge with badge number smaller than max", () => {
    cy.mount(<Badge badgeContent={98} max={99} />);
    cy.findByText("98").should("exist");
  });

  it("THEN can render a Badge with default icon", () => {
    cy.mount(<Badge badgeContent={98} />);
    cy.findByRole("img", { name: "message" }).should("exist");
  });

  it("THEN can render with a custom text child", () => {
    cy.mount(<Badge badgeContent={1}>Lorem Ipsum</Badge>);
    cy.findByText("Lorem Ipsum").should("exist");
  });

  it("SHOULD reference the child and badge content with aria-labelledby", () => {
    cy.mount(
      <Badge badgeContent="BADGE_CONTENT">
        <div data-testid="badgeChild" />
      </Badge>
    );

    cy.findByTestId("badgeChild").invoke("attr", "id").as("childId");
    cy.findByText("BADGE_CONTENT").invoke("attr", "id").as("contentId");

    cy.get("@childId").then((childId) => {
      cy.get("@contentId").then((contentId) => {
        cy.findByRole("img").should(
          "have.attr",
          "aria-labelledby",
          `${childId} ${contentId}`
        );
      });
    });
  });

  // TODO visual regression?
  it("THEN can render a badge with the default info variant", () => {
    cy.mount(<Badge />);
    cy.get(".uitkBadge").should("have.class", "uitkBadge-info");
  });

  it("THEN can render a badge with the success variant", () => {
    cy.mount(<Badge variant="success" />);
    cy.get(".uitkBadge").should("have.class", "uitkBadge-success");
  });

  it("THEN can render a badge with the error variant", () => {
    cy.mount(<Badge variant="error" />);
    cy.get(".uitkBadge").should("have.class", "uitkBadge-error");
  });
  it("SHOULD have no a11y violations on load", () => {
    cy.mount(<Badge />);
    cy.checkAxeComponent();
  });
});
