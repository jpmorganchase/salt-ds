import { Swatch, SwatchesPicker, Color } from "../../../color-chooser";

const colorResult = Color.makeColorFromHex("#333333");
describe("SwatchesPicker", () => {
  it("SwatchesPicker renders correctly", () => {
    cy.mount(
      <SwatchesPicker
        color={colorResult}
        allColors={[["#ffffff"], ["#333333"]]}
        onChange={() => {}}
        onDialogClosed={() => {}}
      />
    );
    cy.findByTestId("swatches-picker").should("exist");
  });

  it("SwatchesPicker renders Swatches with correct alpha channel if alpha is not 1", () => {
    cy.mount(
      <SwatchesPicker
        color={colorResult}
        allColors={[["#ffffff"], ["#333333"]]}
        onChange={() => {}}
        alpha={0.1}
        onDialogClosed={() => {}}
      />
    );
    cy.findByTestId("swatch-#333333").should(
      "have.css",
      "background-color",
      "rgba(51, 51, 51, 0.1)"
    );
  });

  it("SwatchesPicker reacts to onChange events correctly", () => {
    const changeSpy = cy.stub().as("changeSpy");
    cy.mount(
      <SwatchesPicker
        color={colorResult}
        allColors={[["#ffffff"], ["#333333"]]}
        onChange={changeSpy}
        onDialogClosed={() => {}}
      />
    );
    cy.get("@changeSpy").should("not.have.been.called");
    cy.findByTestId("swatch-#333333").realClick();
    cy.get("@changeSpy").should(
      "have.been.calledWithMatch",
      {
        color: {
          _a: 1,
          _b: 51,
          _g: 51,
          _r: 51,
        },
      },
      true
    );
  });

  describe("Swatch", () => {
    it("Should render a div with a coloured background and an alpha channel if alpha is not 1", () => {
      const clickSpy = cy.stub().as("clickSpy");
      cy.mount(
        <Swatch
          color="#333"
          onClick={clickSpy}
          active={false}
          alpha={0.1}
          onDialogClosed={() => {}}
        />
      );
      cy.findByTestId("swatch-#333").should(
        "have.css",
        "background-color",
        "rgba(51, 51, 51, 0.1)"
      );
    });
    it("Should render a div with a coloured background", () => {
      cy.mount(
        <Swatch
          color="#333"
          onClick={() => {}}
          active={false}
          alpha={1}
          onDialogClosed={() => {}}
        />
      );
      cy.findByTestId("swatch-#333").should(
        "have.css",
        "background-color",
        "rgb(51, 51, 51)"
      );
    });
    it("Should call onClick callback if selected", () => {
      const clickSpy = cy.stub().as("clickSpy");
      cy.mount(
        <Swatch
          color="#333"
          onClick={clickSpy}
          active={false}
          alpha={0.1}
          onDialogClosed={() => {}}
        />
      );
      cy.findByTestId("swatch-#333").realClick();
      cy.get("@clickSpy").should("have.been.called");
    });
    it("Should call onDialogClosed callback if selected", () => {
      const dialogClosedSpy = cy.stub().as("dialogClosedSpy");
      cy.mount(
        <Swatch
          color="#333"
          onClick={() => {}}
          active={false}
          alpha={0.1}
          onDialogClosed={dialogClosedSpy}
        />
      );
      cy.findByTestId("swatch-#333").realClick();
      cy.get("@dialogClosedSpy").should("have.been.called");
    });
    it("If swatch is active it should have a specific style with a border", () => {
      cy.mount(
        <Swatch
          color="#333"
          onClick={() => {}}
          active={true}
          alpha={0.1}
          onDialogClosed={() => {}}
        />
      );
      cy.findByTestId("swatch-#333").should(
        "have.class",
        "saltColorChooserSwatch-active"
      );
    });
  });
});
