import React from "react";
import { render } from "@testing-library/react";

import { MetricHeader } from "../../metric";

describe("MetricHeader", () => {
  it("should display title", () => {
    const { queryByTestId } = render(<MetricHeader title="Revenue YTD" />);

    const element = queryByTestId("metric-title");
    expect(element).not.toBeNull();
    expect(element).toHaveTextContent("Revenue YTD");

    expect(queryByTestId("metric-subtitle")).toBeNull();
  });

  it("should display subtitle if provided", () => {
    const { queryByTestId } = render(
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
    );

    const element = queryByTestId("metric-subtitle");
    expect(element).not.toBeNull();
    expect(element).toHaveTextContent("Total Value");
  });

  it("should render subtitle as a link if required", () => {
    const { container } = render(
      <MetricHeader
        SubtitleLinkProps={{
          href: "https://google.com",
        }}
        subtitle="Total Value"
        title="Revenue YTD"
      />
    );

    const element = container.querySelector("a");
    expect(element).not.toBeNull();
    expect(element).toHaveTextContent("Total Value");
  });
});
