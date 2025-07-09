import { Link } from "@salt-ds/core";
import * as linkStories from "@stories/link/link.stories";
import { composeStories } from "@storybook/react-vite";

const composedStories = composeStories(linkStories);
const { TargetBlankCustomIcon } = composedStories;

describe("GIVEN a link", () => {
  it("WHEN passed children node, THEN children should be rendered", () => {
    const testId = "children-testid";
    cy.mount(
      <Link href="#root" data-testid={testId}>
        hello world
      </Link>,
    );
    cy.findByTestId(testId).should("exist");
  });

  it('WHEN passed target="_blank", THEN should render the Link with the tear out icon', () => {
    cy.mount(
      <Link href="#root" target="_blank">
        Action
      </Link>,
    );

    cy.findByTestId(/TearOutIcon/i).should("exist");
  });

  it('WHEN passed target="_blank" AND passed IconComponent, THEN should render the Link with the tear out icon', () => {
    cy.mount(<TargetBlankCustomIcon />);

    cy.findByTestId(/StackOverflowIcon/i).should("exist");
  });

  it('WHEN passed target != "_blank", THEN should NOT render the tear out icon', () => {
    cy.mount(
      <Link href="#root" target="blank">
        Action
      </Link>,
    );

    cy.findByTestId(/TearOutIcon/i).should("not.exist");
  });

  it("WHEN `render` is passed a render function, THEN should call `render` to create the element", () => {
    const testId = "link-testid";

    const mockRender = cy
      .stub()
      .as("render")
      .returns(
        <a href="#root" data-testid={testId}>
          Action
        </a>,
      );

    cy.mount(<Link href="#root" render={mockRender} />);

    cy.findByTestId(testId).should("exist");

    cy.get("@render").should("have.been.calledWithMatch", {
      className: Cypress.sinon.match.string,
      children: Cypress.sinon.match.any,
    });
  });

  it("WHEN `render` is given a JSX element, THEN should merge the props and render the JSX element", () => {
    const testId = "link-testid";

    const mockRender = (
      <a href="#root" data-testid={testId}>
        Action
      </a>
    );

    cy.mount(<Link href="#root" render={mockRender} />);

    cy.findByTestId(testId).should("exist");
  });
});
