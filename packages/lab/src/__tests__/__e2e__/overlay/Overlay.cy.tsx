import { Overlay, OverlayProps } from "@brandname/lab";
import { useCallback, useState } from "react";

export const FeatureOverlay = (props: OverlayProps) => {
  const [node, setNode] = useState();
  const setRef = useCallback((node) => {
    if (node) {
      setNode(node);
    }
  }, []);

  return (
    <div
      style={{
        width: 500,
        height: 500,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div ref={setRef}>Overlay Anchor</div>

      <Overlay anchorEl={node} {...props}>
        <div>
          <h3 className="content-heading">Title</h3>
        </div>
      </Overlay>
    </div>
  );
};

describe("GIVEN an Overlay", () => {
  describe("WHEN cy.mounted top", () => {
    it("THEN it should appear on top of anchor element", () => {
      cy.mount(<FeatureOverlay open={true} placement="top" />);

      cy.findByText("Title").then(($el) => {
        const textPosition = $el[0].getBoundingClientRect().y;
        cy.findByText("Overlay Anchor").should(($el) => {
          expect($el[0].getBoundingClientRect().y).greaterThan(textPosition);
        });
      });
    });
  });
  describe("WHEN cy.mounted right", () => {
    it("THEN it should appear on right of anchor element", () => {
      cy.mount(<FeatureOverlay open={true} placement="right" />);

      cy.findByText("Title").then(($el) => {
        const textPosition = $el[0].getBoundingClientRect().x;
        cy.findByText("Overlay Anchor").should(($el) => {
          expect($el[0].getBoundingClientRect().x).lessThan(textPosition);
        });
      });
    });
  });
  describe("WHEN cy.mounted bottom", () => {
    it("THEN it should appear on bottom of anchor element", () => {
      cy.mount(<FeatureOverlay open={true} placement="bottom" />);

      cy.findByText("Title").then(($el) => {
        const textPosition = $el[0].getBoundingClientRect().y;
        cy.findByText("Overlay Anchor").should(($el) => {
          expect($el[0].getBoundingClientRect().y).lessThan(textPosition);
        });
      });
    });
  });
  describe("WHEN cy.mounted left", () => {
    it("THEN it should appear on left of anchor element", () => {
      cy.mount(<FeatureOverlay open={true} placement="left" />);

      cy.findByText("Title").then(($el) => {
        const textPosition = $el[0].getBoundingClientRect().x;
        cy.findByText("Overlay Anchor").should(($el) => {
          expect($el[0].getBoundingClientRect().x).greaterThan(textPosition);
        });
      });
    });
  });
});
