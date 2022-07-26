import { Dropdown } from "@jpmorganchase/uitk-lab";

const longSource = new Array(5000)
  .fill(null)
  .map((value, index) => `Item ${index + 1}`);

describe("Dropdown - Performance Testing", () => {
  specify("Opening a large list without virtualization", () => {
    cy.mountPerformance(<Dropdown id="test" source={longSource} />);

    cy.get("#test").click();

    cy.getRenderCount().then((renderCount) => {
      cy.log(`Render count: ${renderCount}`);
    });
    cy.getRenderTime().then((renderTime) => {
      cy.log(`Render time: ${renderTime}`);
    });
  });
});
