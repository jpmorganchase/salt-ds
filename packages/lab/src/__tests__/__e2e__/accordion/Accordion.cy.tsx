import {
  Accordion,
  AccordionDetails,
  AccordionProps,
  AccordionSection,
  AccordionSummary,
} from "@salt-ds/lab";
import { useReducer, useState } from "react";

const AccordionExample = (props: AccordionProps) => {
  return (
    <Accordion {...props}>
      <AccordionSection id="section-0" key="AccordionSection0">
        <AccordionSummary>AccordionSummary0</AccordionSummary>
        <AccordionDetails>AccordionDetails0</AccordionDetails>
      </AccordionSection>
      <AccordionSection id="section-1" key="AccordionSection1">
        <AccordionSummary>AccordionSummary1</AccordionSummary>
        <AccordionDetails>AccordionDetails1</AccordionDetails>
      </AccordionSection>
      <AccordionSection id="section-2" key="AccordionSection2">
        <AccordionSummary>AccordionSummary2</AccordionSummary>
        <AccordionDetails>AccordionDetails2</AccordionDetails>
      </AccordionSection>
    </Accordion>
  );
};

const ControlledAccordionExample = (props: AccordionProps) => {
  const { expandedSectionIds, onChange, ...rest } = props;
  const [expanded, setExpanded] = useState(expandedSectionIds);

  const handleChange = (ids: string[] | null) => {
    setExpanded(ids ?? []);
    onChange?.(ids);
  };

  return (
    <Accordion expandedSectionIds={expanded} onChange={handleChange} {...rest}>
      <AccordionSection id="section-0" key="AccordionSection0">
        <AccordionSummary>AccordionSummary0</AccordionSummary>
        <AccordionDetails>AccordionDetails0</AccordionDetails>
      </AccordionSection>
      <AccordionSection id="section-1" key="AccordionSection1">
        <AccordionSummary>AccordionSummary1</AccordionSummary>
        <AccordionDetails>AccordionDetails1</AccordionDetails>
      </AccordionSection>
      <AccordionSection id="section-2" key="AccordionSection2">
        <AccordionSummary>AccordionSummary2</AccordionSummary>
        <AccordionDetails>AccordionDetails2</AccordionDetails>
      </AccordionSection>
    </Accordion>
  );
};

const expectExpandedSections = (expected: number[]) => {
  const s = new Set(expected);
  for (let i of Array(3).keys()) {
    cy.findByRole("button", { name: `AccordionSummary${i}` }).should(
      "have.attr",
      "aria-expanded",
      s.has(i) ? "true" : "false"
    );
  }
};

const expectOnChangeLastCalled = (expected: number[]) => {
  cy.get("@changeSpy").should(
    "have.been.calledWith",
    expected.map((index) => `section-${index}`)
  );
};

describe("GIVEN an Accordion", () => {
  describe("WHEN it is used in uncontrolled mode", () => {
    describe("WHEN user expands up to maxExpandedItems sections", () => {
      it("THEN sections should expand", () => {
        const changeSpy = cy.stub().as("changeSpy");
        cy.mount(
          <AccordionExample onChange={changeSpy} maxExpandedItems={2} />
        );
        cy.findByRole("button", { name: "AccordionSummary0" }).realClick();
        cy.findByRole("button", { name: "AccordionSummary1" }).realClick();

        cy.get("@changeSpy").should("have.been.calledTwice");

        expectExpandedSections([0, 1]);

        expectOnChangeLastCalled([0, 1]);
      });

      describe("AND WHEN user keeps opening more sections", () => {
        it("THEN panels should begin collapsing starting from the ones opened first", () => {
          const changeSpy = cy.stub().as("changeSpy");
          cy.mount(
            <AccordionExample onChange={changeSpy} maxExpandedItems={2} />
          );
          cy.findByRole("button", { name: "AccordionSummary0" }).realClick();
          cy.findByRole("button", { name: "AccordionSummary1" }).realClick();
          cy.findByRole("button", { name: "AccordionSummary2" }).realClick();

          expectExpandedSections([1, 2]);
          expectOnChangeLastCalled([1, 2]);
        });
      });

      describe("AND WHEN user changes maxExpandedItems to a lower number", () => {
        function DynamicMaxExpandedItemsExample(props: AccordionProps) {
          const [isToggled, toggle] = useReducer((state) => {
            return !state;
          }, false);
          return (
            <>
              <button onClick={toggle}>Toggle Max Expanded Items</button>
              <Accordion {...props} maxExpandedItems={isToggled ? 1 : 2}>
                <AccordionSection id="section-0" key="AccordionSection0">
                  <AccordionSummary>AccordionSummary0</AccordionSummary>
                  <AccordionDetails>AccordionDetails0</AccordionDetails>
                </AccordionSection>
                <AccordionSection id="section-1" key="AccordionSection1">
                  <AccordionSummary>AccordionSummary1</AccordionSummary>
                  <AccordionDetails>AccordionDetails1</AccordionDetails>
                </AccordionSection>
                <AccordionSection id="section-2" key="AccordionSection2">
                  <AccordionSummary>AccordionSummary2</AccordionSummary>
                  <AccordionDetails>AccordionDetails2</AccordionDetails>
                </AccordionSection>
              </Accordion>
            </>
          );
        }
        it("THEN oldest panels should close", () => {
          const changeSpy = cy.stub().as("changeSpy");
          cy.mount(<DynamicMaxExpandedItemsExample onChange={changeSpy} />);
          cy.findByRole("button", { name: "AccordionSummary0" }).realClick();
          cy.findByRole("button", { name: "AccordionSummary1" }).realClick();

          cy.findByRole("button", {
            name: "Toggle Max Expanded Items",
          }).realClick();

          expectExpandedSections([1]);
          expectOnChangeLastCalled([1]);
        });
      });
    });
  });

  describe("WHEN it is used in controlled mode", () => {
    it("THEN sections with specified IDs should be expanded", () => {
      const changeSpy = cy.stub().as("changeSpy");
      cy.mount(
        <ControlledAccordionExample
          expandedSectionIds={["section-0", "section-2"]}
          onChange={changeSpy}
        />
      );
      expectExpandedSections([0, 2]);
      cy.get("@changeSpy").should("not.have.been.called");
    });

    describe("THEN user expands sections", () => {
      it("THEN onChange event should be raised but expanded actions remain the same", () => {
        const changeSpy = cy.stub().as("changeSpy");
        cy.mount(
          <AccordionExample
            expandedSectionIds={["section-0", "section-2"]}
            onChange={changeSpy}
          />
        );
        cy.findByRole("button", { name: "AccordionSummary1" }).realClick();
        cy.get("@changeSpy").should("have.been.calledOnce");
        expectExpandedSections([0, 2]);
      });

      describe("AND WHEN expandedSectionIds prop changes", () => {
        it("THEN expanded sections should change", () => {
          cy.mount(
            <ControlledAccordionExample
              expandedSectionIds={["section-0", "section-2"]}
            />
          );
          cy.findByRole("button", { name: "AccordionSummary1" }).realClick();

          expectExpandedSections([0, 1, 2]);
        });
      });
    });
  });

  describe("WHEN expanded prop is set directly on accordion sections", () => {
    it("THEN sections with expanded property set to true should be expanded", () => {
      cy.mount(
        <Accordion>
          <AccordionSection id="section-0" key="AccordionSection0">
            <AccordionSummary>AccordionSummary0</AccordionSummary>
            <AccordionDetails>AccordionDetails0</AccordionDetails>
          </AccordionSection>
          <AccordionSection id="section-1" key="AccordionSection1" expanded>
            <AccordionSummary>AccordionSummary1</AccordionSummary>
            <AccordionDetails>AccordionDetails1</AccordionDetails>
          </AccordionSection>
          <AccordionSection id="section-2" key="AccordionSection2">
            <AccordionSummary>AccordionSummary2</AccordionSummary>
            <AccordionDetails>AccordionDetails2</AccordionDetails>
          </AccordionSection>
        </Accordion>
      );
      expectExpandedSections([1]);
    });

    // TODO Should this work?
    it.skip("THEN expanded property set on sections should have priority over accordion's properties", () => {
      cy.mount(
        <Accordion expandedSectionIds={["section-0", "section-1"]}>
          <AccordionSection id="section-0" key="AccordionSection0">
            <AccordionSummary>AccordionSummary0</AccordionSummary>
            <AccordionDetails>AccordionDetails0</AccordionDetails>
          </AccordionSection>
          <AccordionSection id="section-1" key="AccordionSection1">
            <AccordionSummary>AccordionSummary1</AccordionSummary>
            <AccordionDetails>AccordionDetails1</AccordionDetails>
          </AccordionSection>
          <AccordionSection id="section-2" key="AccordionSection2" expanded>
            <AccordionSummary>AccordionSummary2</AccordionSummary>
            <AccordionDetails>AccordionDetails2</AccordionDetails>
          </AccordionSection>
        </Accordion>
      );

      expectExpandedSections([2]);
    });
  });
});
