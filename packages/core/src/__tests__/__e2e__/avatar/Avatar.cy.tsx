import { UserGroupSolidIcon } from "@salt-ds/icons";
import { composeStories } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import * as avatarStories from "~stories/avatar/avatar.stories";
import { checkAccessibility } from "~test-utils/checkAccessibility";

const composedStories = composeStories(avatarStories);
const { Default } = composedStories;
const directSizeStyle = {
  "--saltAvatar-size": "18px",
} as CSSProperties;

describe("Given an Avatar", () => {
  checkAccessibility(composedStories);

  it("should preserve the default size and font size", () => {
    cy.mount(<Default name="Juanito Jones" />);

    cy.get(".saltAvatar")
      .should("have.css", "width", "56px")
      .and("have.css", "height", "56px")
      .and("have.css", "font-size", "20px");
  });

  it("should size initials from a direct size", () => {
    cy.mount(<Default name="Juanito Jones" style={directSizeStyle} />);

    cy.get(".saltAvatar")
      .should("have.css", "width", "18px")
      .and("have.css", "height", "18px")
      .then(($avatar) => {
        expect(Number.parseFloat($avatar.css("font-size"))).to.be.closeTo(
          6.426,
          0.01,
        );
      });
  });

  it("should cancel the multiplier when directly sizing initials", () => {
    cy.mount(<Default name="Juanito Jones" size={4} style={directSizeStyle} />);

    cy.get(".saltAvatar")
      .should("have.css", "width", "18px")
      .then(($avatar) => {
        expect(Number.parseFloat($avatar.css("font-size"))).to.be.closeTo(
          6.426,
          0.01,
        );
      });
  });

  it("should directly size fallback icons to half the Avatar", () => {
    cy.mount(<Default style={directSizeStyle} />);

    cy.get(".saltAvatar")
      .should("have.css", "width", "18px")
      .find(".saltIcon")
      .should("have.css", "width", "9px")
      .and("have.css", "height", "9px");
  });

  it("should directly size images and custom SVGs to fill the Avatar", () => {
    cy.mount(
      <>
        <Default
          src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><circle cx='20' cy='20' r='18' fill='blue'/></svg>"
          style={directSizeStyle}
        />
        <Default style={directSizeStyle}>
          <svg data-testid="custom-svg" viewBox="0 0 12 12" />
        </Default>
      </>,
    );

    cy.get(".saltAvatar")
      .should("have.length", 2)
      .each(($avatar) => {
        cy.wrap($avatar)
          .should("have.css", "width", "18px")
          .and("have.css", "height", "18px");
      });
    cy.get("img")
      .should("have.css", "width", "18px")
      .and("have.css", "height", "18px");
    cy.findByTestId("custom-svg")
      .should("have.css", "width", "18px")
      .and("have.css", "height", "18px");
  });

  it("should preserve the font size override multiplier semantics", () => {
    cy.mount(
      <Default
        name="Juanito Jones"
        style={
          {
            "--saltAvatar-size": "18px",
            "--saltAvatar-fontSize": "7px",
          } as CSSProperties
        }
      />,
    );

    cy.get(".saltAvatar").should("have.css", "font-size", "14px");
  });

  it("should allow a style multiplier to override the size prop", () => {
    cy.mount(
      <Default
        name="Juanito Jones"
        size={4}
        style={{ "--saltAvatar-size-multiplier": "1" } as CSSProperties}
      />,
    );

    cy.get(".saltAvatar")
      .should("have.css", "width", "28px")
      .and("have.css", "font-size", "10px");
  });

  it("should show the default fallback icon when nothing is provided", () => {
    cy.mount(<Default />);
    cy.findByTestId("UserIcon").should("exist");
  });

  it("should show initials if only a name is provided", () => {
    cy.mount(<Default name="Juanito Jones" />);
    cy.findByRole("img").should("exist");
    cy.findByRole("img").should("have.attr", "aria-label", "Juanito Jones");
    cy.findByText("JJ").should("exist");
  });

  it("should show initials if an image is provided and fails to load and name is provided", () => {
    cy.mount(<Default src="bad_url.png" name="Juanito Jones" />);
    cy.findByRole("img").should("exist");
    cy.findByRole("img").should("have.accessibleName", "Juanito Jones");
  });

  it("should show a fallback icon if an image is provided and fails to load and name is not provided", () => {
    cy.mount(<Default src="bad_url.png" />);
    cy.findByTestId("UserIcon").should("exist");
    cy.findByRole("img").should("not.exist");
  });

  it("should show an image if a valid image url is provided", () => {
    cy.mount(
      <Default
        src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><circle cx='20' cy='20' r='18' fill='blue'/></svg>"
        name="Juanito Jones"
      />,
    );
    cy.get("img").should("exist");
    cy.findByRole("img", { name: "Juanito Jones" }).should("exist");
  });

  it("should show an image if an img element is provided via children", () => {
    cy.mount(
      <Default>
        <img src="blah.png" alt="" />
      </Default>,
    );
    cy.findAllByRole("img").should("exist");
    cy.findAllByRole("img").eq(0).should("have.attr", "src", "blah.png");
  });

  it("should support a custom fallback icon", () => {
    const fallbackIcon = <UserGroupSolidIcon />;
    cy.mount(<Default fallbackIcon={fallbackIcon} />);
    cy.findByTestId("UserGroupSolidIcon").should("exist");
  });

  it("should default to representing a person with a circular shape and person fallback icon", () => {
    cy.mount(<Default />);
    cy.findByTestId("UserIcon").should("exist");
    cy.get(".saltAvatar").should("not.have.class", "saltAvatar-entity");
  });

  it("should render a square shape and business fallback icon when representing a business", () => {
    cy.mount(<Default kind="entity" />);
    cy.findByTestId("BankIcon").should("exist");
    cy.get(".saltAvatar").should("have.class", "saltAvatar-entity");
  });

  it("should support a custom fallback icon when representing a business", () => {
    const fallbackIcon = <UserGroupSolidIcon />;
    cy.mount(<Default kind="entity" fallbackIcon={fallbackIcon} />);
    cy.findByTestId("UserGroupSolidIcon").should("exist");
    cy.findByTestId("BankIcon").should("not.exist");
  });

  it("should preserve native button semantics when rendered as a button", () => {
    cy.mount(
      <Default name="Juanito Jones" render={<button type="button" />} />,
    );

    cy.findByRole("button", { name: "Juanito Jones" }).should(
      "have.class",
      "saltAvatar",
    );
    cy.findByRole("img").should("not.exist");
  });

  it("WHEN `render` is passed a render function, THEN should call `render` to create the element", () => {
    const testId = "avatar-testid";
    const mockRender = cy
      .stub()
      .as("render")
      .returns(
        <button type="button" data-testid={testId}>
          JJ
        </button>,
      );

    cy.mount(<Default name="Juanito Jones" render={mockRender} />);

    cy.findByTestId(testId).should("exist");
    cy.get("@render").should("have.been.calledWithMatch", {
      className: Cypress.sinon.match.string,
      children: Cypress.sinon.match.any,
      style: Cypress.sinon.match.object,
      "aria-label": "Juanito Jones",
    });
  });

  it("WHEN `render` is given a JSX element, THEN should merge the props and render the JSX element", () => {
    const testId = "avatar-testid";

    cy.mount(
      <Default
        name="Juanito Jones"
        render={<button type="button" data-testid={testId} />}
      />,
    );

    cy.findByRole("button", { name: "Juanito Jones" }).should(
      "have.attr",
      "data-testid",
      testId,
    );
  });

  it("should not have a role or aria-label if name is not provided", () => {
    cy.mount(<Default />);
    cy.findByRole("img").should("not.exist");
    cy.get("[aria-label]").should("not.exist");
  });
});
