import { FC, ReactNode } from "react";

import {
  Accordion,
  AccordionSection,
  AccordionSummary,
  AccordionDetails,
  AccordionProps,
  AccordionDetailsProps,
  AccordionSectionProps,
} from "@jpmorganchase/uitk-lab";
import { panelsData } from "./AccordionData";

const DetailsSpy = (props: { children: ReactNode }) => <>{props.children}</>;
const AccordionExample: FC<
  Pick<AccordionProps, "bordered"> &
    Pick<AccordionSectionProps, "onChange"> &
    Pick<AccordionDetailsProps, "preventUnmountOnCollapse">
> = (props) => {
  const { bordered, onChange, preventUnmountOnCollapse, ...restProps } = props;
  return (
    <Accordion bordered={bordered}>
      {panelsData.map((panel, i) => {
        const { content, summary, disabled, defaultExpanded, expanded } = panel;
        return (
          <AccordionSection
            disabled={disabled}
            defaultExpanded={defaultExpanded}
            expanded={expanded}
            onChange={onChange}
            key={i}
          >
            <AccordionSummary>{summary}</AccordionSummary>
            <AccordionDetails
              preventUnmountOnCollapse={preventUnmountOnCollapse}
            >
              <DetailsSpy {...restProps}>{content}</DetailsSpy>
            </AccordionDetails>
          </AccordionSection>
        );
      })}
    </Accordion>
  );
};

describe("GIVEN an Accordion", () => {
  describe("by default", () => {
    beforeEach(() => {
      cy.mount(<AccordionExample />);
    });
    it("section is collapsed", () => {
      cy.get(".uitkAccordionSection")
        .first()
        .should("not.have.class", "uitkAccordionSection-expanded")
        .and("not.have.class", "uitkAccordionSection-disabled");

      cy.get(".uitkAccordionSection .uitkAccordionDetails").should(
        "have.css",
        "height",
        "0px"
      );
    });
    it("should not display border", () => {
      cy.get(".uitkAccordionSection")
        .first()
        .should("have.css", "border-width", "0px");
    });
  });

  describe("when passing bordered", () => {
    it("should display border bottom on accordion sections", () => {
      cy.mount(<AccordionExample bordered={true} />);

      cy.get(".uitkAccordionSection")
        .first()
        .should("have.css", "border-width", "0px 0px 1px");
    });
  });
});
describe("GIVEN Accordion Section", () => {
  it("should be expanded when passing defaultExpanded and then collapse on click or key press", () => {
    cy.mount(<AccordionExample />);

    cy.get(".uitkAccordionSection")
      .eq(1)
      .should("have.class", "uitkAccordionSection-expanded");

    cy.get(".uitkAccordionSection .uitkAccordionSummary").eq(1).realClick();

    cy.get(".uitkAccordionSection")
      .eq(1)
      .should("not.have.class", "uitkAccordionSection-expanded");

    cy.get(".uitkAccordionSection .uitkAccordionSummary").eq(1).realClick();

    cy.get(".uitkAccordionSection")
      .eq(1)
      .should("have.class", "uitkAccordionSection-expanded");

    cy.get(".uitkAccordionSection .uitkAccordionSummary")
      .eq(1)
      .focus()
      .realPress("Enter");

    cy.get(".uitkAccordionSection")
      .eq(1)
      .should("not.have.class", "uitkAccordionSection-expanded");
  });

  it("should be expanded when passing expanded and NOT collapse on click or key press", () => {
    panelsData.push({
      summary: "My fourth Panel",
      expanded: true,
      content: <div>My fourth panel content</div>,
    });
    cy.mount(<AccordionExample />);

    cy.get(".uitkAccordionSection")
      .eq(3)
      .should("have.class", "uitkAccordionSection-expanded");

    cy.get(".uitkAccordionSection .uitkAccordionSummary").eq(3).realClick();

    cy.get(".uitkAccordionSection")
      .eq(3)
      .should("have.class", "uitkAccordionSection-expanded");

    cy.get(".uitkAccordionSection .uitkAccordionSummary").eq(3).realClick();

    cy.get(".uitkAccordionSection")
      .eq(3)
      .should("have.class", "uitkAccordionSection-expanded");

    cy.get(".uitkAccordionSection .uitkAccordionSummary")
      .eq(3)
      .focus()
      .realPress("Enter");

    cy.get(".uitkAccordionSection")
      .eq(3)
      .should("have.class", "uitkAccordionSection-expanded");
  });
  it("should not be focusable when passing disabled", () => {
    cy.mount(<AccordionExample />);

    cy.get(".uitkAccordionSection")
      .eq(2)
      .should("have.class", "uitkAccordionSection-disabled");
  });
});
describe("GIVEN AccordionDetails", () => {
  describe("WHEN preventUnmountOnCollapse is false", () => {
    beforeEach(() => {
      const onChangeSpy = cy.spy().as("onChange");
      cy.mount(<AccordionExample onChange={onChangeSpy} />);
    });
    it("THEN it should render in collapsed state", () => {
      cy.get(".uitkAccordionSection .uitkAccordionSummary")
        .first()
        .should("have.attr", "aria-expanded", "false");
    });
    it("THEN it should not render the details", () => {
      cy.get(".uitkAccordionSection .uitkAccordionDetails")
        .first()
        .should("not.contain", "My first panel content Link 1");
    });

    describe("AND WHEN the summary is clicked", () => {
      beforeEach(() => {
        cy.get(".uitkAccordionSection .uitkAccordionSummary")
          .first()
          .realClick();
      });

      it("THEN should render in expanded state", () => {
        cy.get(".uitkAccordionSection .uitkAccordionSummary")
          .first()
          .should("have.attr", "aria-expanded", "true");
        cy.get("@onChange").should("be.calledOnceWith", true);
      });

      describe("AND WHEN the summary is clicked again", () => {
        beforeEach(() => {
          cy.get(".uitkAccordionSection .uitkAccordionSummary")
            .first()
            .realClick();
        });

        it("THEN should render is collapsed state", () => {
          cy.get(".uitkAccordionSection .uitkAccordionSummary")
            .first()
            .should("have.attr", "aria-expanded", "false");
          cy.get("@onChange").should("be.calledTwice");
        });
      });
    });
  });
  describe("WHEN preventUnmountOnCollapse is true", () => {
    beforeEach(() => {
      const onChangeSpy = cy.spy().as("onChange");
      cy.mount(
        <AccordionExample
          preventUnmountOnCollapse={true}
          onChange={onChangeSpy}
        />
      );
    });
    it("THEN it should render in collapsed state", () => {
      cy.get(".uitkAccordionSection .uitkAccordionSummary")
        .first()
        .should("have.attr", "aria-expanded", "false");
    });
    it("THEN it should render the details", () => {
      cy.get(".uitkAccordionSection .uitkAccordionDetails")
        .first()
        .should("contain", "My first panel content Link 1");
    });
  });
});
// let renderResult: RenderResult;

// const expectExpandedSections = (expected: number[]) => {
//   const s = new Set(expected);
//   for (let i of Array(sectionCount).keys()) {
//     const summary = screen.getByText(`AccordionSummary${i}`);
//     expect(summary).toHaveAttribute(
//       "aria-expanded",
//       s.has(i) ? "true" : "false"
//     );
//   }
// };

// const expectOnChangeLastCalled = (expected: number[]) => {
//   expect(onChangeSpy).toHaveBeenLastCalledWith(
//     expected.map((index) => `section-${index}`)
//   );
// };

// const getSummary = (i: number) => screen.getByText(`AccordionSummary${i}`);

// const clickSummary = (i: number) => fireEvent.click(getSummary(i));

// describe("WHEN it is used in uncontrolled mode", () => {
// beforeEach(() => {
//   jest.resetAllMocks();
//   renderResult = render(
//     <AccordionExample onChange={onChangeSpy} maxExpandedItems={2} />
//   );
// });

// describe("WHEN user expands up to maxExpandedItems sections", () => {
//   beforeEach(() => {
//     clickSummary(0);
//     clickSummary(1);
//   });

// it("THEN sections should expand", () => {
// cy.mount();
// for (let i of Array(sectionCount).keys()) {
//   const summary = screen.getByText(`AccordionSummary${i}`);
//   expect(summary).toHaveAttribute(
//     "aria-expanded",
//     s.has(i) ? "true" : "false"
//   );
// }
//     expect(onChangeSpy).toHaveBeenCalledTimes(2);
//     expectExpandedSections([0, 1]);
//     expectOnChangeLastCalled([0, 1]);
// });

//   describe("AND WHEN user keeps opening more sections", () => {
//     beforeEach(() => {
//       clickSummary(2);
//     });

//     it("THEN panels should begin collapsing starting from the ones opened first", () => {
//       expectExpandedSections([1, 2]);
//       expectOnChangeLastCalled([1, 2]);
//     });
// });

//   describe("AND WHEN user changes maxExpandedItems to a lower number", () => {
//     beforeEach(() => {
//       renderResult.rerender(
//         <AccordionExample onChange={onChangeSpy} maxExpandedItems={1} />
//       );
//     });

//     it("THEN oldest panels should close", () => {
//       expectExpandedSections([1]);
//       expectOnChangeLastCalled([1]);
//     });
//   });
// });
// });

// describe("WHEN it is used in controlled mode", () => {
//   const expandedSectionIds = ["section-0", "section-2"];

//   beforeEach(() => {
//     jest.resetAllMocks();
//     renderResult = render(
//       <AccordionExample
//         expandedSectionIds={expandedSectionIds}
//         onChange={onChangeSpy}
//       />
//     );
//   });

//   it("THEN sections with specified IDs should be expanded", () => {
//     expectExpandedSections([0, 2]);
//     expect(onChangeSpy).toHaveBeenCalledTimes(0);
//   });

//   describe("THEN user expands sections", () => {
//     beforeEach(() => {
//       clickSummary(1);
//     });

//     it("THEN onChange event should be raised but expanded actions remain the same", () => {
//       expect(onChangeSpy).toHaveBeenCalledTimes(1);
//       expectExpandedSections([0, 2]);
//     });

//     describe("AND WHEN expandedSectionIds prop changes", () => {
//       beforeEach(() => {
//         const newExpandedSectionIds = ["section-1"];
//         renderResult.rerender(
//           <AccordionExample
//             expandedSectionIds={newExpandedSectionIds}
//             onChange={onChangeSpy}
//           />
//         );
//       });

//       it("THEN expanded sections should change", () => {
//         expectExpandedSections([1]);
//       });
//     });
//   });
// });

// describe("WHEN expanded prop is set directly on accordion sections", () => {
//   beforeEach(() => {
//     jest.resetAllMocks();
//     renderResult = render(
//       <Accordion onChange={onChangeSpy}>
//         {renderControlledSections(3, [1])}
//       </Accordion>
//     );
//   });

//   it("THEN sections with expanded property set to true should be expanded", () => {
//     expectExpandedSections([1]);
//   });

//   it("THEN expanded property set on sections should have priority over accordion's properties", () => {
//     renderResult.rerender(
//       <Accordion expandedSectionIds={["section-0", "section-1"]}>
//         {renderControlledSections(3, [2])}
//       </Accordion>
//     );

//     expectExpandedSections([2]);
//   });
// });
// });
