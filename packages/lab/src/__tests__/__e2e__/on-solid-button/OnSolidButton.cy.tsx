import { OnSolidButton } from "@salt-ds/lab";
import { composeStories } from "@storybook/react-vite";
import * as onSolidButtonStories from "~stories/on-solid-button/on-solid-button.stories";
import { checkAccessibility } from "~test-utils/checkAccessibility";

const composedStories = composeStories(onSolidButtonStories);

describe("GIVEN an OnSolidButton", () => {
  checkAccessibility(composedStories);

  it("should render as a contextual variant of Button", () => {
    cy.mount(<OnSolidButton>Dismiss</OnSolidButton>);
    cy.findByRole("button", { name: "Dismiss" })
      .should("have.class", "saltButton")
      .and("have.class", "saltOnSolidButton");
  });

  it("should apply the onSolid actionable tokens", () => {
    cy.mount(
      <>
        <OnSolidButton>Dismiss</OnSolidButton>
        <span
          data-testid="on-solid-tokens"
          style={{
            background: "var(--salt-actionable-onSolid-subtle-background)",
            color: "var(--salt-actionable-onSolid-subtle-foreground)",
          }}
        />
      </>,
    );

    cy.findByTestId("on-solid-tokens").then(($tokens) => {
      const expected = getComputedStyle($tokens[0]);
      const backgroundColor = expected.backgroundColor;
      const color = expected.color;

      cy.findByRole("button", { name: "Dismiss" }).should(($button) => {
        const styles = getComputedStyle($button[0]);

        expect(styles.backgroundColor).to.equal(backgroundColor);
        expect(styles.color).to.equal(color);
      });
    });
  });

  it("should merge a custom className with its own base class", () => {
    cy.mount(<OnSolidButton className="custom-class">Dismiss</OnSolidButton>);
    cy.findByRole("button")
      .should("have.class", "saltOnSolidButton")
      .and("have.class", "custom-class");
  });
});
