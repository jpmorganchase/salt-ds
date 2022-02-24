import React from "react";
import { render } from "@testing-library/react";

import { MetricContextProvider } from "../../metric/internal/MetricContext";
import { MetricContent } from "../../metric";

describe("MetricContent", () => {
  it("should display value", () => {
    const { queryByTestId } = render(<MetricContent value="$801.9B" />);

    const element = queryByTestId("metric-value");
    expect(element).not.toBeNull();
    expect(element).toHaveTextContent("$801.9B");

    expect(queryByTestId("metric-subvalue")).toBeNull();
  });

  it("should display subvalue if provided", () => {
    const { queryByTestId } = render(
      <MetricContent subvalue="-10.1 (-1.23%)" value="$801.9B" />
    );

    const element = queryByTestId("metric-subvalue");
    expect(element).not.toBeNull();
    expect(element).toHaveTextContent("-10.1 (-1.23%)");
  });

  describe("When the indicator is required", () => {
    it("should render as an icon", () => {
      const { getByTestId } = render(
        <MetricContextProvider
          value={{
            showIndicator: true,
            indicatorPosition: "end",
            direction: "down",
          }}
        >
          <MetricContent value="$801.9B" />
        </MetricContextProvider>
      );

      expect(getByTestId(/Icon/i)).toBeInTheDocument();
    });

    ["up", "down"].forEach((direction) =>
      it(`should display correct icon for "${direction}" direction`, () => {
        const { getByTestId } = render(
          <MetricContextProvider
            value={{
              direction,
              showIndicator: true,
              indicatorPosition: "end",
            }}
          >
            <MetricContent value="$801.9B" />
          </MetricContextProvider>
        );

        expect(
          getByTestId(direction === "up" ? /ArrowUpIcon/i : /ArrowDownIcon/i)
        ).toBeInTheDocument();
      })
    );
  });
});
