import { UserGroupSolidIcon } from "@salt-ds/icons";
import * as avatarStories from "@stories/avatar/avatar.stories";
import { composeStories } from "@storybook/react-vite";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(avatarStories);
const { Default } = composedStories;
describe("Given an Avatar", () => {
  checkAccessibility(composedStories);

  it("should show the default fallback icon when nothing is provided", () => {
    cy.mount(<Default />);
    cy.findByTestId("UserSolidIcon").should("exist");
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
    cy.findByTestId("UserSolidIcon").should("exist");
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
