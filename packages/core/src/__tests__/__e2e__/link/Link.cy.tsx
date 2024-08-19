import { Link } from "@salt-ds/core";
import { composeStories } from "@storybook/react";

import * as linkStories from "@stories/link/link.stories";

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

  it('WHEN target is "_blank" AND IconComponent is provided, THEN should render the provided IconComponent', () => {
    const CustomIcon = () => <div data-testid="CustomIcon">Custom Icon</div>;

    cy.mount(
      <Link href="#root" target="_blank" IconComponent={CustomIcon}>
        Action
      </Link>,
    );

    cy.findByTestId(/CustomIcon/i).should("exist");
    cy.findByTestId(/TearOutIcon/i).should("not.exist");
  });
});
