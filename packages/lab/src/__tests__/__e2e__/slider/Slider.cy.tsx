import { Slider } from "@salt-ds/lab";

describe("Given a Slider", () => {
  describe("WHEN rendered", () => {
    it("THEN it should show Overlay on trigger element press", () => {
      cy.mount(<Slider />);
      cy.findByRole("slider").should("be.visible");
    });
  });
});
