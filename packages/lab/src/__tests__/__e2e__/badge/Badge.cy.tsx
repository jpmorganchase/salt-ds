import { Badge } from "@salt-ds/lab";

describe("GIVEN a Badge", () => {
  it("THEN can render a Badge with badge number larger than max", () => {
    cy.mount(<Badge value={100} max={99} />);
    cy.findByText("99+").should("exist");
  });

  it("THEN can render a Badge with badge number equal to max", () => {
    cy.mount(<Badge value={99} max={99} />);
    cy.findByText("99").should("exist");
  });

  it("THEN can render a Badge with badge number smaller than max", () => {
    cy.mount(<Badge value={98} max={99} />);
    cy.findByText("98").should("exist");
  });

  it("THEN cannot render a Badge with value greater than 999 ", () => {
    cy.mount(<Badge value={1000} />);
    cy.findByText("999+").should("exist");
  });

  it("THEN can render a string", () => {
    cy.mount(<Badge value={"lots"} />);
    cy.findByText("lots").should("exist");
  });

  it("THEN can render with a custom text child", () => {
    cy.mount(<Badge value={1}>Lorem Ipsum</Badge>);
    cy.findByText("Lorem Ipsum").should("exist");
  });
});
