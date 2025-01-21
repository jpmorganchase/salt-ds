import { Slider } from "@salt-ds/lab";

describe("Given a Slider", () => {
  describe("Given a Slider with a single value", () => {
    it("THEN it should have ARIA roles and attributes", () => {
      cy.mount(
        <Slider
          style={{ width: "400px" }}
          min={5}
          max={125}
          step={5}
          defaultValue={100}
        />,
      );
      cy.findByRole("slider")
        .should("have.attr", "aria-valuemin", "5")
        .and("have.attr", "aria-valuemax", "125")
        .and("have.attr", "aria-valuenow", "100");
    });

    it("THEN onChange should fire on pointer down on slider track", () => {
      const changeSpy = cy.stub().as("changeSpy");
      cy.mount(<Slider style={{ width: "400px" }} onChange={changeSpy} />);
      cy.get(".saltSlider-track").trigger("mousedown", {
        button: 0,
        clientX: 50,
        clientY: 50,
      });
      cy.get("@changeSpy").should("have.callCount", 1);
    });

    it("THEN keyboard navigation can be used to change the slider position", () => {
      const changeSpy = cy.stub().as("changeSpy");
      cy.mount(
        <Slider
          style={{ width: "400px" }}
          min={5}
          max={125}
          step={5}
          defaultValue={100}
          onChange={changeSpy}
        />,
      );
      cy.findByRole("slider").focus().realPress("ArrowRight");
      cy.findByRole("slider").should("have.attr", "aria-valuenow", "105");
      cy.get("@changeSpy").should("have.callCount", 1);

      cy.findByRole("slider").realPress("ArrowLeft");
      cy.findByRole("slider").should("have.attr", "aria-valuenow", "100");
      cy.get("@changeSpy").should("have.callCount", 2);

      cy.findByRole("slider").realPress("End");
      cy.findByRole("slider").should("have.attr", "aria-valuenow", "125");
      cy.get("@changeSpy").should("have.callCount", 3);

      cy.findByRole("slider").realPress("Home");
      cy.findByRole("slider").should("have.attr", "aria-valuenow", "5");
      cy.get("@changeSpy").should("have.callCount", 4);
    });

    it("THEN it should display a tooltip on mouseover", () => {
      cy.mount(<Slider style={{ width: "400px" }} />);
      cy.get(".saltSliderThumb").trigger("mouseover");
      cy.get(".saltSliderTooltip").should("be.visible");
      // And hide tooltip on mouseout
      cy.get(".saltSliderThumb").trigger("mouseout");
      cy.get(".saltSliderTooltip").should("not.exist");
    });
  });
});
