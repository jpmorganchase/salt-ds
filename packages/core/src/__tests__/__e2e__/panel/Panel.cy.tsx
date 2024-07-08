import { Panel } from "../../../panel";

describe("GIVEN a Panel", () => {
  it("SHOULD have no a11y violations on load", () => {
    cy.mount(<Panel>Content</Panel>);
    cy.checkAxeComponent();
  });

  describe("children prop", () => {
    describe("AND a string is passed as a child", () => {
      it("THEN should display children", () => {
        const text = "Lorem Ipsum";
        cy.mount(<Panel>{text}</Panel>);
        cy.findByText(text).should("exist");
      });
    });

    describe("AND a node is passed as a child", () => {
      it("THEN should display children", () => {
        cy.mount(
          <Panel>
            <div data-testid="test" />
          </Panel>,
        );
        cy.findByTestId("test").should("exist");
      });
    });
  });

  describe("variant prop", () => {
    describe('WHEN the "secondary" variant is input', () => {
      it('THEN should display "secondary" variant', () => {
        cy.mount(<Panel variant="secondary">Content</Panel>);
        cy.get("div").should("have.class", "saltPanel-secondary");
      });
    });
  });
});
