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
        />
      );
      cy.findByRole("slider")
        .should("have.attr", "aria-valuemin", "5")
        .and("have.attr", "aria-valuemax", "125")
        .and("have.attr", "aria-valuenow", "100");
    });

    it("THEN onChange should fire on pointer down on slider track", () => {
      const changeSpy = cy.stub().as("changeSpy");
      cy.mount(<Slider style={{ width: "400px" }} onChange={changeSpy} />);
      cy.get(".saltSliderTrack").trigger("pointerdown", {
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
        />
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

    // it("THEN it should display a tooltip on pointerover", () => {
    //   cy.mount(<Slider style={{ width: "400px" }} />);
    //   cy.get(".saltSliderThumb-container").trigger("pointerover");
    //   cy.get(".saltSliderThumb-tooltip").should("be.visible");

    //   cy.get(".saltSliderThumb-container").trigger("pointerout");
    //   cy.get(".saltSliderThumb-tooltip").should("not.be.visible");
    // });
  });

  describe("Given a Slider with a range value", () => {
    it("THEN it should have ARIA roles and attributes", () => {
      cy.mount(
        <Slider
          style={{ width: "400px" }}
          min={-100}
          max={100}
          step={10}
          defaultValue={[20, 40]}
        />
      );

      cy.findAllByRole("slider").should("have.length", 2);

      cy.findAllByRole("slider")
        .eq(0)
        .should("have.attr", "aria-valuenow", "20");

      cy.findAllByRole("slider")
        .eq(1)
        .should("have.attr", "aria-valuenow", "40");
    });

    it("THEN the nearest slider thumb should move on pointer down track", () => {
      const changeSpy = cy.stub().as("changeSpy");
      cy.mount(
        <Slider
          style={{ width: "400px" }}
          min={0}
          max={10}
          step={1}
          defaultValue={[2, 8]}
          onChange={changeSpy}
        />
      );

      cy.get(".saltSliderTrack").trigger("pointerdown", {
        clientX: 0,
        clientY: 0,
      });
      cy.get("@changeSpy").should("have.callCount", 1);
      cy.findAllByRole("slider")
        .eq(0)
        .should("have.attr", "aria-valuenow", "0");
      cy.findAllByRole("slider")
        .eq(1)
        .should("have.attr", "aria-valuenow", "8");
    });

    it("THEN slider thumbs should not cross and maintain a gap of 1 step when using keyboard nav", () => {
      cy.mount(
        <Slider
          style={{ width: "400px" }}
          min={0}
          max={10}
          step={1}
          defaultValue={[5, 8]}
        />
      );

      cy.findAllByRole("slider")
        .eq(0)
        .focus()
        .realPress("ArrowRight")
        .realPress("ArrowRight")
        .realPress("ArrowRight");
      cy.findAllByRole("slider")
        .eq(0)
        .should("have.attr", "aria-valuenow", "7");
    });

    it("THEN slider thumbs should not cross and maintain a gap of 1 step when using keyboard nav", () => {
      cy.mount(
        <Slider
          style={{ width: "400px" }}
          min={0}
          max={10}
          step={1}
          defaultValue={[2, 5]}
        />
      );

      cy.findAllByRole("slider")
        .eq(0)
        .trigger("pointerdown")
        .trigger("pointermove", {
          clientX: 1000,
          clientY: 1000,
        });

      cy.findAllByRole("slider")
        .eq(0)
        .should("have.attr", "aria-valuenow", "4");
    });
  });
});
