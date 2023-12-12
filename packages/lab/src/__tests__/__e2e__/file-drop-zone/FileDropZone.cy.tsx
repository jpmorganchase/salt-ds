import { composeStories } from "@storybook/react";
import * as fileDropZoneStories from "@stories/file-drop-zone/file-drop-zone.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";
import { createFileTypeValidator } from "../../../file-drop-zone";

const composedStories = composeStories(fileDropZoneStories);
const { Default } = composedStories;

describe("Given a file drop zone", () => {
  checkAccessibility(composedStories);

  it("should render an input that accepts multiple files", () => {
    cy.mount(<Default />);
    cy.findByTestId("file-input").should("have.attr", "type", "file");
    cy.findByTestId("file-input").should("have.attr", "multiple");
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
  it("should trigger onDrop when files are dropped", () => {
    const dropFilesSpy = cy.stub().as("dropFilesSpy");
    cy.mount(<Default onDrop={dropFilesSpy} />);
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
    cy.get("@dropFilesSpy").should("have.been.called");
  });
  it("should be disabled if disabled prop is passed", () => {
    cy.mount(<Default disabled />);
    cy.findByTestId("file-input").should("be.disabled");
    cy.findByTestId("file-input-button").should("be.disabled");
  });
  it("should focus on the button when input is focused", () => {
    cy.mount(<Default />);
    // tab into the component
    cy.realPress("Tab");
    cy.findByTestId("file-input-button").should("be.focused");
  });

    // TODO: test enter and space open the dropzone
});
