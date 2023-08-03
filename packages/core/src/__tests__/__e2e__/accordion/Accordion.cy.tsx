import {
  AccordionPanel,
  Accordion,
  AccordionProps,
  AccordionHeader,
} from "@salt-ds/core";
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

type AccordionExampleProps = Pick<AccordionProps, "onToggle"> & DetailsSpyProps;

const AccordionExample = ({
  onToggle,
  onMount,
  onUnmount,
  onUpdated,
}: AccordionExampleProps) => {
  return (
    <Accordion onToggle={onToggle} value="example">
      <AccordionHeader>Summary Text</AccordionHeader>
      <AccordionPanel>
        <DetailsSpy
          onMount={onMount}
          onUnmount={onUnmount}
          onUpdated={onUpdated}
        >
          <div data-testid="details-content" />
        </DetailsSpy>
      </AccordionPanel>
    </Accordion>
  );
};

describe("GIVEN an Accordion", () => {
  it("THEN it should render in collapsed state", () => {
    cy.mount(<AccordionExample />);

    cy.findByRole("button").should("have.attr", "aria-expanded", "false");
  });

  it("SHOULD not allow content to be focused in collapsed state", () => {
    cy.mount(
      <div>
        <button>start</button>
        <Accordion value="example">
          <AccordionHeader>Summary Text</AccordionHeader>
          <AccordionPanel>
            <button>do not receive focus</button>
          </AccordionPanel>
        </Accordion>
        <button>end</button>
      </div>
    );

    cy.realPress("Tab");
    cy.findByRole("button", { name: "start" }).should("have.focus");
    cy.realPress("Tab");
    cy.realPress("Tab");
    cy.findByRole("button", { name: "end" }).should("have.focus");
  });

  it("THEN it should render the details", () => {
    const mountSpy = cy.stub().as("mountSpy");
    cy.mount(<AccordionExample onMount={mountSpy} />);
    cy.findByRole("button").realClick();

    cy.get("@mountSpy").should("have.been.calledOnce");
  });

  describe("AND WHEN the summary is clicked", () => {
    it("THEN should render in expanded state", () => {
      const toggleSpy = cy.stub().as("toggleSpy");
      cy.mount(<AccordionExample onToggle={toggleSpy} />);

      cy.findByRole("button").realClick();
      cy.findByRole("button").should("have.attr", "aria-expanded", "true");

      cy.get("@toggleSpy").should("have.been.calledOnce");
    });

    it("THEN should not remount the details", () => {
      const mountSpy = cy.stub().as("mountSpy");
      const unmountSpy = cy.stub().as("unmountSpy");
      cy.mount(<AccordionExample onMount={mountSpy} onUnmount={unmountSpy} />);

      cy.findByRole("button").realClick();
      cy.findByRole("button").should("have.attr", "aria-expanded", "true");

      cy.get("@mountSpy").should("have.been.calledOnce");
      cy.get("@unmountSpy").should("not.have.been.called");
    });

    describe("AND WHEN the summary is clicked again", () => {
      it("THEN should render is collapsed state", () => {
        const toggleSpy = cy.stub().as("toggleSpy");
        cy.mount(<AccordionExample onToggle={toggleSpy} />);

        cy.findByRole("button").realClick();
        cy.findByRole("button").realClick();

        cy.findByRole("button").should("have.attr", "aria-expanded", "false");

        cy.get("@toggleSpy").should("have.been.calledTwice");
      });

      it("THEN should keep the details mounted", () => {
        const unmountSpy = cy.stub().as("unmountSpy");
        cy.mount(<AccordionExample onUnmount={unmountSpy} />);

        cy.findByRole("button").realClick();
        cy.findByRole("button").realClick();

        cy.get("@unmountSpy").should("not.have.been.called");
      });
    });
  });
});
