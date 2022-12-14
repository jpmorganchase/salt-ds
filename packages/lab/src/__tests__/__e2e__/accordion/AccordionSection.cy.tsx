import {
  Accordion,
  AccordionDetails,
  AccordionDetailsProps,
  AccordionSection,
  AccordionSectionProps,
  AccordionSummary,
} from "@salt-ds/lab";
import { Component, ReactNode } from "react";

interface DetailsSpyProps {
  children?: ReactNode;
  onMount?: () => void;
  onUnmount?: () => void;
  onUpdated?: () => void;
}

class DetailsSpy extends Component<DetailsSpyProps> {
  render() {
    return <p>Detailed text</p>;
  }

  componentDidMount() {
    this.props.onMount?.();
  }

  componentDidUpdate() {
    this.props.onUpdated?.();
  }

  componentWillUnmount() {
    this.props.onUnmount?.();
  }
}

type AccordionExampleProps = Pick<AccordionSectionProps, "onChange"> &
  Pick<AccordionDetailsProps, "preventUnmountOnCollapse"> &
  DetailsSpyProps;

const AccordionExample = ({
  onChange,
  preventUnmountOnCollapse,
  onMount,
  onUnmount,
  onUpdated,
}: AccordionExampleProps) => {
  return (
    <Accordion>
      <AccordionSection onChange={onChange}>
        <AccordionSummary>Summary Text</AccordionSummary>
        <AccordionDetails preventUnmountOnCollapse={preventUnmountOnCollapse}>
          <DetailsSpy
            onMount={onMount}
            onUnmount={onUnmount}
            onUpdated={onUpdated}
          >
            <div data-testid="details-content" />
          </DetailsSpy>
        </AccordionDetails>
      </AccordionSection>
    </Accordion>
  );
};

describe("GIVEN an AccordionSection", () => {
  describe("WHEN preventUnmountOnCollapse is false", () => {
    it("THEN it should render in collapsed state", () => {
      cy.mount(<AccordionExample />);

      cy.findByRole("button").should("have.attr", "aria-expanded", "false");
    });

    it("THEN it should not render the details", () => {
      cy.mount(<AccordionExample />);

      cy.findByTestId("details-content").should("not.exist");
    });

    describe("AND WHEN the summary is clicked", () => {
      it("THEN should render in expanded state", () => {
        const changeSpy = cy.stub().as("changeSpy");
        cy.mount(<AccordionExample onChange={changeSpy} />);
        cy.findByRole("button").realClick();

        cy.findByRole("button").should("have.attr", "aria-expanded", "true");
        cy.get("@changeSpy")
          .should("have.been.calledOnce")
          .and("be.calledWith", true);
      });

      it("THEN should mount the details only once", () => {
        const mountSpy = cy.stub().as("mountSpy");
        const unmountSpy = cy.stub().as("unmountSpy");
        cy.mount(
          <AccordionExample onMount={mountSpy} onUnmount={unmountSpy} />
        );
        cy.findByRole("button").realClick();
        cy.get("@mountSpy").should("have.been.calledOnce");
        cy.get("@unmountSpy").should("not.have.been.called");
      });

      describe("AND WHEN the summary is clicked again", () => {
        it("THEN should render in collapsed state", () => {
          const changeSpy = cy.stub().as("changeSpy");
          cy.mount(<AccordionExample onChange={changeSpy} />);
          cy.findByRole("button").realClick();
          cy.findByRole("button").realClick();

          cy.findByRole("button").should("have.attr", "aria-expanded", "false");
          cy.get("@changeSpy")
            .should("have.been.calledTwice")
            .and("have.been.calledWith", false);
        });

        it("THEN should unmount the details", () => {
          const unmountSpy = cy.stub().as("unmountSpy");
          cy.mount(<AccordionExample onUnmount={unmountSpy} />);
          cy.findByRole("button").realClick();
          cy.findByRole("button").realClick();

          cy.get("@unmountSpy").should("have.been.calledOnce");
        });
      });
    });
  });

  describe("WHEN preventUnmountOnCollapse is true", () => {
    it("THEN it should render in collapsed state", () => {
      cy.mount(<AccordionExample preventUnmountOnCollapse />);

      cy.findByRole("button").should("have.attr", "aria-expanded", "false");
    });

    it("THEN it should render the details", () => {
      const mountSpy = cy.stub().as("mountSpy");
      cy.mount(
        <AccordionExample preventUnmountOnCollapse onMount={mountSpy} />
      );
      cy.findByRole("button").realClick();

      cy.get("@mountSpy").should("have.been.calledOnce");
    });

    describe("AND WHEN the summary is clicked", () => {
      it("THEN should render in expanded state", () => {
        const changeSpy = cy.stub().as("changeSpy");
        cy.mount(
          <AccordionExample preventUnmountOnCollapse onChange={changeSpy} />
        );

        cy.findByRole("button").realClick();
        cy.findByRole("button").should("have.attr", "aria-expanded", "true");

        cy.get("@changeSpy")
          .should("have.been.calledOnce")
          .and("have.been.calledWith", true);
      });

      it("THEN should not remount the details", () => {
        const mountSpy = cy.stub().as("mountSpy");
        const unmountSpy = cy.stub().as("unmountSpy");
        cy.mount(
          <AccordionExample
            preventUnmountOnCollapse
            onMount={mountSpy}
            onUnmount={unmountSpy}
          />
        );

        cy.findByRole("button").realClick();
        cy.findByRole("button").should("have.attr", "aria-expanded", "true");

        cy.get("@mountSpy").should("have.been.calledOnce");
        cy.get("@unmountSpy").should("not.have.been.called");
      });

      describe("AND WHEN the summary is clicked again", () => {
        it("THEN should render is collapsed state", () => {
          const changeSpy = cy.stub().as("changeSpy");
          cy.mount(
            <AccordionExample preventUnmountOnCollapse onChange={changeSpy} />
          );

          cy.findByRole("button").realClick();
          cy.findByRole("button").realClick();

          cy.findByRole("button").should("have.attr", "aria-expanded", "false");

          cy.get("@changeSpy")
            .should("have.been.calledTwice")
            .and("have.been.calledWith", false);
        });

        it("THEN should keep the details mounted", () => {
          const unmountSpy = cy.stub().as("unmountSpy");
          cy.mount(
            <AccordionExample preventUnmountOnCollapse onUnmount={unmountSpy} />
          );

          cy.findByRole("button").realClick();
          cy.findByRole("button").realClick();

          cy.get("@unmountSpy").should("not.have.been.called");
        });
      });
    });
  });
});
