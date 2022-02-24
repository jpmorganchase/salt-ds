import React, { FC } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionDetailsProps,
  AccordionSection,
  AccordionSectionProps,
  AccordionSummary,
} from "../../accordion";
import { fireEvent, render, screen } from "@testing-library/react";

interface DetailsSpyProps {
  onMount: () => void;
  onUnmount: () => void;
  onUpdated: () => void;
}

class DetailsSpy extends React.Component<DetailsSpyProps> {
  render() {
    return <p>Detailed text</p>;
  }

  componentDidMount() {
    this.props.onMount();
  }

  componentDidUpdate() {
    this.props.onUpdated();
  }

  componentWillUnmount() {
    this.props.onUnmount();
  }
}

const AccordionExample: FC<
  DetailsSpyProps &
    Pick<AccordionSectionProps, "onChange"> &
    Pick<AccordionDetailsProps, "preventUnmountOnCollapse">
> = ({ onChange, preventUnmountOnCollapse, ...restProps }) => {
  return (
    <Accordion>
      <AccordionSection onChange={onChange}>
        <AccordionSummary>Summary Text</AccordionSummary>
        <AccordionDetails preventUnmountOnCollapse={preventUnmountOnCollapse}>
          <DetailsSpy {...restProps} />
        </AccordionDetails>
      </AccordionSection>
    </Accordion>
  );
};

describe("GIVEN an AccordionSection", () => {
  const onChangeSpy = jest.fn();
  const onDetailsMount = jest.fn();
  const onDetailsUnmount = jest.fn();
  const onDetailsUpdate = jest.fn();

  describe("WHEN preventUnmountOnCollapse is false", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      render(
        <AccordionExample
          onChange={onChangeSpy}
          onMount={onDetailsMount}
          onUnmount={onDetailsUnmount}
          onUpdated={onDetailsUpdate}
        />
      );
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("THEN it should render in collapsed state", () => {
      const summary = screen.getByRole("button");
      expect(summary).toHaveAttribute("aria-expanded", "false");
    });

    it("THEN it should not render the details", () => {
      expect(onDetailsMount).toHaveBeenCalledTimes(0);
    });

    describe("AND WHEN the summary is clicked", () => {
      beforeEach(() => {
        const summary = screen.getByRole("button");
        fireEvent.click(summary);
        jest.runAllTimers();
      });

      it("THEN should render in expanded state", () => {
        const summary = screen.getByRole("button");
        expect(summary).toHaveAttribute("aria-expanded", "true");
        expect(onChangeSpy).toHaveBeenCalledTimes(1);
        expect(onChangeSpy).toHaveBeenLastCalledWith(true);
      });

      it("THEN should mount the details only once", () => {
        const summary = screen.getByRole("button");
        expect(onDetailsMount).toHaveBeenCalledTimes(1);
        expect(onDetailsUnmount).toHaveBeenCalledTimes(0);
      });

      describe("AND WHEN the summary is clicked again", () => {
        beforeEach(() => {
          const summary = screen.getByRole("button");
          fireEvent.click(summary);
          jest.runAllTimers();
        });

        it("THEN should render is collapsed state", () => {
          const summary = screen.getByRole("button");
          expect(summary).toHaveAttribute("aria-expanded", "false");
          expect(onChangeSpy).toHaveBeenCalledTimes(2);
          expect(onChangeSpy).toHaveBeenLastCalledWith(false);
        });

        it("THEN should unmount the details", () => {
          expect(onDetailsUnmount).toHaveBeenCalledTimes(1);
        });
      });
    });
  });

  describe("WHEN preventUnmountOnCollapse is true", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      render(
        <AccordionExample
          preventUnmountOnCollapse={true}
          onChange={onChangeSpy}
          onMount={onDetailsMount}
          onUnmount={onDetailsUnmount}
          onUpdated={onDetailsUpdate}
        />
      );
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("THEN it should render in collapsed state", () => {
      const summary = screen.getByRole("button");
      expect(summary).toHaveAttribute("aria-expanded", "false");
    });

    it("THEN it should render the details", () => {
      expect(onDetailsMount).toHaveBeenCalledTimes(1);
    });

    describe("AND WHEN the summary is clicked", () => {
      beforeEach(() => {
        const summary = screen.getByRole("button");
        fireEvent.click(summary);
        jest.runAllTimers();
      });

      it("THEN should render in expanded state", () => {
        const summary = screen.getByRole("button");
        expect(summary).toHaveAttribute("aria-expanded", "true");
        expect(onChangeSpy).toHaveBeenCalledTimes(1);
        expect(onChangeSpy).toHaveBeenLastCalledWith(true);
      });

      it("THEN should not remount the details", () => {
        const summary = screen.getByRole("button");
        expect(onDetailsMount).toHaveBeenCalledTimes(1);
        expect(onDetailsUnmount).toHaveBeenCalledTimes(0);
      });

      describe("AND WHEN the summary is clicked again", () => {
        beforeEach(() => {
          const summary = screen.getByRole("button");
          fireEvent.click(summary);
          jest.runAllTimers();
        });

        it("THEN should render is collapsed state", () => {
          const summary = screen.getByRole("button");
          expect(summary).toHaveAttribute("aria-expanded", "false");
          expect(onChangeSpy).toHaveBeenCalledTimes(2);
          expect(onChangeSpy).toHaveBeenLastCalledWith(false);
        });

        it("THEN should keep the details mounted", () => {
          expect(onDetailsUnmount).toHaveBeenCalledTimes(0);
        });
      });
    });
  });
});
