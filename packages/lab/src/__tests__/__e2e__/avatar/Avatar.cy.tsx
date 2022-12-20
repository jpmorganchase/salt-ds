import { Avatar } from "@salt-ds/lab";

describe("Given a Avatar", () => {
  it("has an aria-labelledby applied to the svg referencing the title", () => {
    cy.mount(<Avatar id="bar" />);
    cy.findByRole("img").should("have.attr", "aria-labelledby", "bar");
    cy.findByRole("img").find("title").should("have.attr", "id", "bar");
  });
  describe("WHEN a child is provided", () => {
    it("should show the child", () => {
      cy.mount(<Avatar id="bar">SB</Avatar>);
      cy.findByText("SB").should("be.visible");
    });
  });

  describe("WHEN a src is provided", () => {
    it("should show an image with the src", () => {
      cy.mount(<Avatar id="bar" src="blah.png" />);
      cy.findByRole("img").should("have.attr", "src", "blah.png");
    });
  });

  describe("WHEN a child and a src are provided", () => {
    it("should show an image with the src", () => {
      cy.mount(
        <Avatar id="bar" src="blah.png">
          SB
        </Avatar>
      );
      cy.findByRole("img").should("have.attr", "src", "blah.png");
      cy.findByText("SB").should("not.exist");
    });
  });
});
