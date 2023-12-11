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
  it("should trigger onFilesAccepted on successful drop", () => {
    const acceptFilesSpy = cy.stub().as("acceptFilesSpy");
    cy.mount(<Default onFilesAccepted={acceptFilesSpy} />);
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
    cy.get("@acceptFilesSpy").should("have.been.called");
  });
  it("should trigger onFilesRejected on invalid files drop", () => {
    const rejectFilesSpy = cy.stub().as("rejectFilesSpy");
    cy.mount(
      <Default
        onFilesRejected={rejectFilesSpy}
        accept={".xls"}
        validate={[createFileTypeValidator({ accept: ".xls" })]}
      />
    );
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
    cy.get("@rejectFilesSpy").should("have.been.called");
    cy.findByTestId("file-drop-zone-example").should(
      "have.class",
      "saltFileDropZone-error"
    );
  });
  it("should accept the right files when validate prop is passed", () => {
    const acceptFilesSpy = cy.stub().as("acceptFilesSpy");
    cy.mount(
      <Default
        onFilesAccepted={acceptFilesSpy}
        accept={"image/jpg"}
        validate={[createFileTypeValidator({ accept: "image/jpg" })]}
      />
    );
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
    cy.get("@acceptFilesSpy").should("have.been.called");
    cy.findByTestId("file-drop-zone-example").should(
      "have.class",
      "saltFileDropZone-success"
    );
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
});
