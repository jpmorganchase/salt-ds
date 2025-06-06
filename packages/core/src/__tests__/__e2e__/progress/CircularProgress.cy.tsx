import * as circularProgressStories from "@stories/progress/circular-progress.stories";
import { composeStories } from "@storybook/react-vite";

const composedStories = composeStories(circularProgressStories);
const { Default } = composedStories;

describe("GIVEN a CircularProgress", () => {
  it("SHOULD render progress circle with correct value and percentage", () => {
    cy.mount(<Default value={50} />);
    cy.findByRole("progressbar").should("have.attr", "aria-valuemax", "100");
    cy.findByRole("progressbar").should("have.attr", "aria-valuemin", "0");
    cy.findByRole("progressbar").should("have.attr", "aria-valuenow", "50");
  });

  it("SHOULD render progress circle with correct min-max values", () => {
    cy.mount(<Default min={20} max={40} value={35} />);
    cy.findByRole("progressbar").should("have.attr", "aria-valuemax", "40");
    cy.findByRole("progressbar").should("have.attr", "aria-valuemin", "20");
    cy.findByRole("progressbar").contains("75 %");
    cy.findByRole("progressbar").should("not.contain.text", "0"); // test regression #3202
  });
});
