import { composeStories } from "@storybook/react";
import * as fileDropZoneStories from "@stories/file-drop-zone/file-drop-zone.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(fileDropZoneStories);
const { Default } = composedStories;

describe("Given a file drop zone", () => {
  checkAccessibility(composedStories);

  it("should render an input that accepts one file", () => {
    cy.mount(<Default />);
    cy.get("input").should("have.attr", "type", "file");
  });
  it("should accept files on drop", () => {
    cy.mount(<Default />);
    cy.findByTestId("file-drop-zone-example").selectFile(
      {
        contents: Cypress.Buffer.from("file"),
        fileName: "image",
        mimeType: "image/jpg",
      },
      {
        action: "drag-drop",
      }
    );
    cy.findByTestId("file-drop-zone-example").should(
      "have.class",
      "saltFileDropZone-success"
    );
  });
  it("should be able to accept multiple files", () => {
    const dropSpy = cy.stub().as("dropSpy");
    cy.mount(<Default multiple onDrop={dropSpy} />);
    const files = [
      {
        contents: Cypress.Buffer.from("image1"),
        fileName: "image1",
        mimeType: "image/jpg",
      },
      {
        contents: Cypress.Buffer.from("image2"),
        fileName: "image2",
        mimeType: "image/jpg",
      },
    ];
    cy.findByTestId("file-drop-zone-example").selectFile(files, {
      action: "drag-drop",
    });
    cy.get("@dropSpy").should("have.been.calledOnce");
    cy.findByTestId("file-drop-zone-example").should(
      "have.class",
      "saltFileDropZone-success"
    );
  });
  it("should trigger onDrop when files are dropped", () => {
    const dropSpy = cy.stub().as("dropSpy");
    cy.mount(<Default onDrop={dropSpy} />);
    const file = [
      {
        contents: Cypress.Buffer.from("image1"),
        fileName: "image1",
        mimeType: "image/jpg",
      },
    ];
    cy.findByTestId("file-drop-zone-example").selectFile(file, {
      action: "drag-drop",
    });
    cy.get("@dropSpy").should("have.been.calledOnce");
  });
  it("should be disabled if disabled prop is passed", () => {
    cy.mount(<Default disabled />);
    cy.get("input").should("be.disabled");
    cy.findByTestId("file-input-trigger").should("be.disabled");
  });
  it("should focus on the button on initial focus", () => {
    cy.mount(<Default />);
    // tab into reset button
    cy.realPress("Tab");
    // tab into the component
    cy.realPress("Tab");
    cy.findByTestId("file-input-trigger").should("be.focused");
  });
});
