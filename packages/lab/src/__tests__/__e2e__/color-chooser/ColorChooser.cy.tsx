import { ColorChooser, Color } from "@jpmorganchase/uitk-lab";

const uitkColor = Color.makeColorFromHex("#D1F4C9");
const customColor = Color.makeColorFromHex("#30BC67");

describe("ColorChooser", () => {
  it("Renders an overlay", () => {
    cy.mount(
      <ColorChooser color={uitkColor} onSelect={() => {}} onClear={() => {}} />
    );
    cy.findByRole("button", { name: "Green10" }).should("be.visible");
  });

  it("Renders the SwatchesPicker upon clicking on the Swatches tab", () => {
    cy.mount(
      <ColorChooser color={uitkColor} onSelect={() => {}} onClear={() => {}} />
    );
    cy.findByRole("button", { name: "Green10" }).realClick();
    cy.findByText("Swatches").realClick();
    cy.findByTestId("swatches-picker").should("be.visible");
  });

  it("Selects the Swatches tab as default if no color is selected", () => {
    cy.mount(
      <ColorChooser color={undefined} onSelect={() => {}} onClear={() => {}} />
    );
    cy.findByRole("button", { name: "No color selected" }).realClick();
    cy.findByRole("tab", { name: "Swatches" }).should(
      "have.attr",
      "aria-selected",
      "true"
    );
    cy.findByTestId("swatches").should("be.visible");
  });

  it("Renders the Swatches tab first if a UITK color is selected", () => {
    cy.mount(
      <ColorChooser color={uitkColor} onSelect={() => {}} onClear={() => {}} />
    );
    cy.findByRole("button", { name: "Green10" }).realClick();
    cy.findByRole("tab", { name: "Swatches" }).should(
      "have.attr",
      "aria-selected",
      "true"
    );
    cy.findByTestId("swatches-picker").should("be.visible");
  });

  it("Renders the Color Picker tab first if a non UITK color is selected", () => {
    cy.mount(
      <ColorChooser
        color={customColor}
        onSelect={() => {}}
        onClear={() => {}}
      />
    );
    cy.findByRole("button", { name: "#30bc67" }).realClick();
    cy.findByRole("tab", { name: "Color Picker" }).should(
      "have.attr",
      "aria-selected",
      "true"
    );
    cy.findByTestId("color-picker").should("be.visible");
  });
  it("Sets hex inputs and rgb value inputs as undefined if rendered with undefined value", async () => {
    cy.mount(
      <ColorChooser
        color={undefined}
        disableAlphaChooser={true}
        onSelect={() => {}}
        onClear={() => {}}
      />
    );
    cy.findByRole("button", { name: "No color selected" }).realClick();
    cy.findByRole("tab", { name: "Color Picker" }).realClick();
    cy.findByTestId("hex-input").should("have.value", undefined);
    cy.findAllByRole("r-input").should("have.value", undefined);
    cy.findAllByRole("g-input").should("have.value", undefined);
    cy.findAllByRole("b-input").should("have.value", undefined);
  });
  it("Dismisses the overlay if Swatches tab is selected and Default is pressed", async () => {
    cy.mount(
      <ColorChooser
        color={uitkColor}
        onSelect={() => {}}
        disableAlphaChooser={false}
        onClear={() => {}}
      />
    );
    cy.findByRole("button", { name: "Green10" }).realClick();
    cy.findByRole("tab", { name: "Swatches" }).realClick();
    cy.findByRole("button", { name: "Default" }).realClick();
    cy.findByTestId("swatches-picker").should("be.visible");
  });

  it("ColorPicker should default to 0 if users leave alpha value empty", async () => {
    cy.mount(
      <ColorChooser
        color={uitkColor}
        onSelect={() => {}}
        disableAlphaChooser={false}
        onClear={() => {}}
      />
    );
    cy.findByRole("button", { name: "Green10" }).realClick();
    cy.findByRole("tab", { name: "Color Picker" }).realClick();
    cy.findAllByRole("a-input").realType(" ");
    cy.findByRole("a-input").blur().should("have.value", "0");
  });
  it("ColorPicker should default to 0 if users leave r/g/b value empty", async () => {
    cy.mount(
      <ColorChooser
        color={uitkColor}
        onSelect={() => {}}
        disableAlphaChooser={false}
        onClear={() => {}}
      />
    );
    cy.findByRole("button", { name: "Green10" }).realClick();
    cy.findByRole("tab", { name: "Color Picker" }).realClick();
    cy.findByDisplayValue("209").realType(" ");
    cy.findByDisplayValue("209").blur().should("have.value", "0");
  });
  it("Sets hex inputs and rgb value inputs correctly on the color picker panel after Default button is pressed with specific color value", async () => {
    cy.mount(
      <ColorChooser
        color={uitkColor}
        disableAlphaChooser={true}
        onSelect={() => {}}
        onClear={() => {}}
      />
    );
    cy.findByRole("button", { name: "Green10" }).realClick();
    cy.findByRole("tab", { name: "Swatches" }).realClick();
    cy.findByRole("button", { name: "Default" }).realClick();
    cy.findByRole("button", { name: "Purple" }).realClick();
    cy.findByRole("tab", { name: "Color Picker" }).realClick();
    cy.findByTestId("hex-input").should("have.value", "964EA2");
    cy.findByTestId("r-input").should("have.value", "150");
    cy.findByTestId("b-input").should("have.value", "78");
    cy.findByTestId("g-input").should("have.value", "162");
  });
});
