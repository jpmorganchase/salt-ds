import { composeStories } from "@storybook/testing-react";
import * as avatarStories from "@stories/avatar.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";
import { UserGroupIcon } from "@salt-ds/icons";

const composedStories = composeStories(avatarStories);
const { Default } = composedStories;
describe("Given an Avatar", () => {
  checkAccessibility(composedStories);
  describe("WHEN the default is left without children", () => {
    it("should show the default fallback icon", () => {
      cy.mount(<Default />);
      cy.get('[data-testid="UserIcon"]').should("have.length", 4);
    });
  });
  describe("WHEN Initials are provided as child", () => {
    it("should show the child", () => {
      cy.mount(<Default>JJ</Default>);
      cy.findAllByText("JJ").should("have.length", 4);
    });
  });

  describe("WHEN an image is provided", () => {
    it("should show an image with the src", () => {
      cy.mount(
        <Default>
          <img src={"blah.png"} alt="profile" />
        </Default>
      );
      cy.findAllByRole("img").should("have.length", 4);
      cy.findAllByRole("img").eq(0).should("have.attr", "src", "blah.png");
    });
  });

  describe("WHEN a fallback icon is provided", () => {
    it("should show the fallback icon when no children are provided", () => {
      const fallbackIcon = <UserGroupIcon />;
      cy.mount(<Default fallbackIcon={fallbackIcon} />);
      cy.get('[data-testid="UserGroupIcon"]').should("have.length", 4);
    });
  });
});
