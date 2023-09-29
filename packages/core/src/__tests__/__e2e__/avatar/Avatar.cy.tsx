import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";
import { UserGroupSolidIcon } from "@salt-ds/icons";
import { composeStories } from "@storybook/react";
import * as avatarStories from "@stories/avatar/avatar.stories";

const composedStories = composeStories(avatarStories);
const { Default } = composedStories;
describe("Given an Avatar", () => {
  checkAccessibility(composedStories);
  describe("WHEN the default is left without children", () => {
    it("should show the default fallback icon", () => {
      cy.mount(<Default />);
      cy.findByTestId("UserSolidIcon").should("exist");
    });
  });
  describe("WHEN only a name is provided", () => {
    it("should show the initials", () => {
      cy.mount(<Default name="Juanito Jones" />);
      cy.findByRole("img").should("exist");
      cy.findByRole("img").should("have.attr", "aria-label", "Juanito Jones");
      cy.findByText("JJ").should("exist");
    });
  });
  describe("WHEN a src image fails to load or is provided empty", () => {
    it("should show the initials", () => {
      cy.mount(<Default src={"bad_url"} name="Juanito Jones" />);
      cy.findByRole("img").should("exist");
      cy.findByRole("img").should("have.attr", "aria-label", "Juanito Jones");
    });
    it("should show the default if there are no initials", () => {
      cy.mount(<Default src={"bad_url"} />);
      cy.findByTestId("UserSolidIcon").should("exist");
      cy.findByRole("img").should("have.attr", "aria-label", "User Avatar");
    });
  });
  describe("WHEN an image is provided", () => {
    it("should show an image with the src", () => {
      cy.mount(
        <Default>
          <img src={"blah.png"} alt="" />
        </Default>
      );
      cy.findAllByRole("img").should("exist");
      cy.findAllByRole("img").eq(0).should("have.attr", "src", "blah.png");
    });
  });

  describe("WHEN a fallback icon is provided", () => {
    it("should show the fallback icon when no children are provided", () => {
      const fallbackIcon = <UserGroupSolidIcon />;
      cy.mount(<Default fallbackIcon={fallbackIcon} />);
      cy.findByTestId("UserGroupSolidIcon").should("exist");
    });
  });
});
