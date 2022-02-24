import { Dropdown } from "@brandname/lab";

const longSource = new Array(5000)
  .fill(null)
  .map((value, index) => `Item ${index + 1}`);

describe("Dropdown - Performance Testing", () => {
  specify("Opening a large list without virtualization", () => {
    cy.mountPerformance(<Dropdown source={longSource} />);

    cy.findByTestId("dropdown-button").click();

    cy.getRenderCount().then((renderCount) => {
      cy.log(`Render count: ${renderCount}`);
    });
    cy.getRenderTime().then((renderTime) => {
      cy.log(`Render time: ${renderTime}`);
    });
  });
});
