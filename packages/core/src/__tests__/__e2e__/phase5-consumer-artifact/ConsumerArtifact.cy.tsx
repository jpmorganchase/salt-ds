import { AppButton } from "../../../../../../workflow-examples/consumer-repo/src/components/AppButton";

describe("Phase 5 consumer UI artifact", () => {
  it("renders, responds to keyboard interaction, and passes accessibility checks", () => {
    const onClick = cy.stub().as("consumerArtifactClick");

    cy.mount(<AppButton onClick={onClick}>Save</AppButton>);
    cy.findByRole("button", { name: "Save" }).should("be.visible");
    cy.realPress("Tab");
    cy.findByRole("button", { name: "Save" }).should("have.focus");
    cy.realPress("Enter");
    cy.get("@consumerArtifactClick").should("have.been.calledOnce");
    cy.checkAxeComponent({}, true);
  });
});
