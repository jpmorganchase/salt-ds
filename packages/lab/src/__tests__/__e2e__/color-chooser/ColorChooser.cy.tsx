import { composeStories } from "@storybook/testing-react";
import * as colorChooserStories from "@stories/color-chooser.stories";

const {
  DefaultColorChooser,
  ColorPickerAsDefaultTabIfSelectedColorIsNotInTheSwatchesLibrary,
  ColorChooserWithNullDefaultColor,
  ColorChooserWithAlphaDisabled,
} = composeStories(colorChooserStories);

describe("ColorChooser", () => {
  it("Renders an overlay", () => {
    cy.mount(<DefaultColorChooser />);
    cy.findByRole("button", { name: "Orange700" }).should("be.visible");
  });

  it("Renders the SwatchesPicker upon clicking on the Swatches tab", () => {
    cy.mount(<DefaultColorChooser />);
    cy.findByRole("button", { name: "Orange700" }).realClick();
    cy.findByText("Swatches").realClick();
    cy.findByTestId("swatches-picker").should("be.visible");
  });

  it("Selects the Swatches tab as default if no color is selected", () => {
    cy.mount(<ColorChooserWithNullDefaultColor />);
    cy.findByRole("button", { name: "No color selected" }).realClick();
    cy.findByRole("tab", { name: "Swatches" }).should(
      "have.attr",
      "aria-selected",
      "true"
    );
    cy.findByTestId("swatches").should("be.visible");
  });

  it("Renders the Swatches tab first if a UITK color is selected", () => {
    cy.mount(<DefaultColorChooser />);
    cy.findByRole("button", { name: "Orange700" }).realClick();
    cy.findByRole("tab", { name: "Swatches" }).should(
      "have.attr",
      "aria-selected",
      "true"
    );
    cy.findByTestId("swatches-picker").should("be.visible");
  });

  it("Renders the Color Picker tab first if a non UITK color is selected", () => {
    cy.mount(
      <ColorPickerAsDefaultTabIfSelectedColorIsNotInTheSwatchesLibrary />
    );
    cy.findByRole("button", { name: "#8644b1" }).realClick();
    cy.findByRole("tab", { name: "Color Picker" }).should(
      "have.attr",
      "aria-selected",
      "true"
    );
    cy.findByTestId("color-picker").should("be.visible");
  });
  it("Sets hex inputs and rgb value inputs as undefined if rendered with undefined value", () => {
    cy.mount(<ColorChooserWithNullDefaultColor />);
    cy.findByRole("button", { name: "No color selected" }).realClick();
    cy.findByRole("tab", { name: "Color Picker" }).realClick();
    cy.findByRole("textbox", { name: "Hex" }).should("have.value", "");
    cy.findByRole("textbox", { name: "Red" }).should("have.value", "0");
    cy.findByRole("textbox", { name: "Green" }).should("have.value", "0");
    cy.findByRole("textbox", { name: "Blue" }).should("have.value", "0");
  });
  it("Dismisses the overlay if Swatches tab is selected and Default is pressed", () => {
    cy.mount(<DefaultColorChooser />);
    cy.findByRole("button", { name: "Orange700" }).realClick();
    cy.findByRole("tab", { name: "Swatches" }).realClick();
    cy.findByRole("button", { name: "Default" }).realClick();
    cy.findByTestId("swatches-picker").should("not.exist");
  });

  it("ColorPicker should default to 0 if users leave alpha value empty", () => {
    cy.mount(<DefaultColorChooser />);
    cy.findByRole("button", { name: "Orange700" }).realClick();
    cy.findByRole("tab", { name: "Color Picker" }).realClick();

    cy.findByRole("textbox", { name: "Alpha" }).realClick().clear();
    cy.findByRole("textbox", { name: "Alpha" })
      .blur()
      .should("have.value", "0");
  });
  it("ColorPicker should default to 0 if users leave r/g/b value empty", () => {
    cy.mount(<DefaultColorChooser />);
    cy.findByRole("button", { name: "Orange700" }).realClick();
    cy.findByRole("tab", { name: "Color Picker" }).realClick();

    cy.findByRole("textbox", { name: "Red" }).realClick().clear();
    cy.findByRole("textbox", { name: "Red" }).blur().should("have.value", "0");

    cy.findByRole("textbox", { name: "Blue" }).realClick().clear();
    cy.findByRole("textbox", { name: "Blue" }).blur().should("have.value", "0");

    cy.findByRole("textbox", { name: "Green" }).realClick().clear();
    cy.findByRole("textbox", { name: "Green" })
      .blur()
      .should("have.value", "0");
  });
  it("Sets hex inputs and rgb value inputs correctly on the color picker panel after Default button is pressed with specific color value", () => {
    cy.mount(<ColorChooserWithAlphaDisabled />);
    cy.findByRole("button", { name: "Green10" }).realClick();
    cy.findByRole("tab", { name: "Swatches" }).realClick();
    cy.findByTestId("swatch-#cbe7f9").realClick();
    cy.findByRole("button", { name: "Blue10" }).realClick();
    cy.findByRole("tab", { name: "Swatches" }).realClick();
    cy.findByRole("button", { name: "Default" }).realClick();
    cy.findByRole("button", { name: "Green10" }).realClick();
    cy.findByRole("tab", { name: "Color Picker" }).realClick();
    cy.findByRole("textbox", { name: "Hex" }).should("have.value", "D1F4C9");
    cy.findByRole("textbox", { name: "Red" }).should("have.value", "209");
    cy.findByRole("textbox", { name: "Green" }).should("have.value", "244");
    cy.findByRole("textbox", { name: "Blue" }).should("have.value", "201");
  });
});
