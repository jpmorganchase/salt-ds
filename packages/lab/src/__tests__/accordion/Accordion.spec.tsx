import {
  Accordion,
  AccordionDetails,
  AccordionProps,
  AccordionSection,
  AccordionSummary,
} from "../../accordion";
import {
  fireEvent,
  render,
  RenderResult,
  screen,
} from "@testing-library/react";

const sectionCount = 3;

const renderSections = (count: number) =>
  [...Array(count).keys()].map((i) => (
    <AccordionSection id={`section-${i}`} key={`AccordionSection${i}`}>
      <AccordionSummary>{`AccordionSummary${i}`}</AccordionSummary>
      <AccordionDetails>{`AccordionDetails${i}`}</AccordionDetails>
    </AccordionSection>
  ));

const renderControlledSections = (count: number, expandedIndices: number[]) =>
  [...Array(count).keys()].map((i) => (
    <AccordionSection
      id={`section-${i}`}
      key={`AccordionSection${i}`}
      expanded={expandedIndices.includes(i)}
    >
      <AccordionSummary>{`AccordionSummary${i}`}</AccordionSummary>
      <AccordionDetails>{`AccordionDetails${i}`}</AccordionDetails>
    </AccordionSection>
  ));

const AccordionExample = (props: AccordionProps) => {
  return <Accordion {...props}>{renderSections(sectionCount)}</Accordion>;
};

describe("GIVEN an Accordion", () => {
  const onChangeSpy = jest.fn();
  let renderResult: RenderResult;

  const expectExpandedSections = (expected: number[]) => {
    const s = new Set(expected);
    for (let i of Array(sectionCount).keys()) {
      const summary = screen.getByText(`AccordionSummary${i}`);
      expect(summary).toHaveAttribute(
        "aria-expanded",
        s.has(i) ? "true" : "false"
      );
    }
  };

  const expectOnChangeLastCalled = (expected: number[]) => {
    expect(onChangeSpy).toHaveBeenLastCalledWith(
      expected.map((index) => `section-${index}`)
    );
  };

  const getSummary = (i: number) => screen.getByText(`AccordionSummary${i}`);

  const clickSummary = (i: number) => fireEvent.click(getSummary(i));

  describe("WHEN it is used in uncontrolled mode", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      renderResult = render(
        <AccordionExample onChange={onChangeSpy} maxExpandedItems={2} />
      );
    });

    describe("WHEN user expands up to maxExpandedItems sections", () => {
      beforeEach(() => {
        clickSummary(0);
        clickSummary(1);
      });

      it("THEN sections should expand", () => {
        expect(onChangeSpy).toHaveBeenCalledTimes(2);
        expectExpandedSections([0, 1]);
        expectOnChangeLastCalled([0, 1]);
      });

      describe("AND WHEN user keeps opening more sections", () => {
        beforeEach(() => {
          clickSummary(2);
        });

        it("THEN panels should begin collapsing starting from the ones opened first", () => {
          expectExpandedSections([1, 2]);
          expectOnChangeLastCalled([1, 2]);
        });
      });

      describe("AND WHEN user changes maxExpandedItems to a lower number", () => {
        beforeEach(() => {
          renderResult.rerender(
            <AccordionExample onChange={onChangeSpy} maxExpandedItems={1} />
          );
        });

        it("THEN oldest panels should close", () => {
          expectExpandedSections([1]);
          expectOnChangeLastCalled([1]);
        });
      });
    });
  });

  describe("WHEN it is used in controlled mode", () => {
    const expandedSectionIds = ["section-0", "section-2"];

    beforeEach(() => {
      jest.resetAllMocks();
      renderResult = render(
        <AccordionExample
          expandedSectionIds={expandedSectionIds}
          onChange={onChangeSpy}
        />
      );
    });

    it("THEN sections with specified IDs should be expanded", () => {
      expectExpandedSections([0, 2]);
      expect(onChangeSpy).toHaveBeenCalledTimes(0);
    });

    describe("THEN user expands sections", () => {
      beforeEach(() => {
        clickSummary(1);
      });

      it("THEN onChange event should be raised but expanded actions remain the same", () => {
        expect(onChangeSpy).toHaveBeenCalledTimes(1);
        expectExpandedSections([0, 2]);
      });

      describe("AND WHEN expandedSectionIds prop changes", () => {
        beforeEach(() => {
          const newExpandedSectionIds = ["section-1"];
          renderResult.rerender(
            <AccordionExample
              expandedSectionIds={newExpandedSectionIds}
              onChange={onChangeSpy}
            />
          );
        });

        it("THEN expanded sections should change", () => {
          expectExpandedSections([1]);
        });
      });
    });
  });

  describe("WHEN expanded prop is set directly on accordion sections", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      renderResult = render(
        <Accordion onChange={onChangeSpy}>
          {renderControlledSections(3, [1])}
        </Accordion>
      );
    });

    it("THEN sections with expanded property set to true should be expanded", () => {
      expectExpandedSections([1]);
    });

    it("THEN expanded property set on sections should have priority over accordion's properties", () => {
      renderResult.rerender(
        <Accordion expandedSectionIds={["section-0", "section-1"]}>
          {renderControlledSections(3, [2])}
        </Accordion>
      );

      expectExpandedSections([2]);
    });
  });
});
