import {
  Accordion,
  AccordionHeader,
  AccordionPanel,
  type AccordionProps,
} from "@salt-ds/core";
import { Component, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "../render";

interface DetailsSpyProps {
  children?: ReactNode;
  onMount?: () => void;
  onUnmount?: () => void;
  onUpdated?: () => void;
}

class DetailsSpy extends Component<DetailsSpyProps> {
  componentDidMount() {
    this.props.onMount?.();
  }

  componentDidUpdate() {
    this.props.onUpdated?.();
  }

  componentWillUnmount() {
    this.props.onUnmount?.();
  }

  render() {
    return <p>Detailed text</p>;
  }
}

type AccordionExampleProps = Pick<AccordionProps, "onToggle"> & DetailsSpyProps;

function AccordionExample({
  onToggle,
  onMount,
  onUnmount,
  onUpdated,
}: AccordionExampleProps) {
  return (
    <Accordion onToggle={onToggle}>
      <AccordionHeader>Summary Text</AccordionHeader>
      <AccordionPanel>
        <DetailsSpy
          onMount={onMount}
          onUnmount={onUnmount}
          onUpdated={onUpdated}
        />
      </AccordionPanel>
    </Accordion>
  );
}

describe("GIVEN an Accordion", () => {
  it("renders collapsed", async () => {
    await renderWithSalt(<AccordionExample />);
    await expect
      .element(page.getByRole("button"))
      .toHaveAttribute("aria-expanded", "false");
  });

  it("does not focus collapsed content", async () => {
    await renderWithSalt(
      <div>
        <button type="button">start</button>
        <Accordion value="example">
          <AccordionHeader>Summary Text</AccordionHeader>
          <AccordionPanel>
            <button type="button">do not receive focus</button>
          </AccordionPanel>
        </Accordion>
        <button type="button">end</button>
      </div>,
    );

    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "start" }))
      .toHaveFocus();
    await userEvent.tab();
    await userEvent.tab();
    await expect
      .element(page.getByRole("button", { name: "end" }))
      .toHaveFocus();
  });

  it("renders the details", async () => {
    const onMount = vi.fn();
    await renderWithSalt(<AccordionExample onMount={onMount} />);
    await page.getByRole("button").click();
    expect(onMount).toHaveBeenCalledOnce();
  });

  it("expands and calls onToggle", async () => {
    const onToggle = vi.fn();
    await renderWithSalt(<AccordionExample onToggle={onToggle} />);
    const button = page.getByRole("button");

    await button.click();
    await expect.element(button).toHaveAttribute("aria-expanded", "true");
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("does not remount details on expansion", async () => {
    const onMount = vi.fn();
    const onUnmount = vi.fn();
    await renderWithSalt(
      <AccordionExample onMount={onMount} onUnmount={onUnmount} />,
    );
    await page.getByRole("button").click();
    expect(onMount).toHaveBeenCalledOnce();
    expect(onUnmount).not.toHaveBeenCalled();
  });

  it("collapses when clicked again", async () => {
    const onToggle = vi.fn();
    await renderWithSalt(<AccordionExample onToggle={onToggle} />);
    const button = page.getByRole("button");

    await button.click();
    await button.click();
    await expect.element(button).toHaveAttribute("aria-expanded", "false");
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it("keeps details mounted after collapse", async () => {
    const onUnmount = vi.fn();
    await renderWithSalt(<AccordionExample onUnmount={onUnmount} />);
    const button = page.getByRole("button");
    await button.click();
    await button.click();
    expect(onUnmount).not.toHaveBeenCalled();
  });

  it("supports custom header and panel ids", async () => {
    await renderWithSalt(
      <Accordion value="example" expanded>
        <AccordionHeader id="custom-header-id">Summary Text</AccordionHeader>
        <AccordionPanel id="custom-panel-id">Panel content</AccordionPanel>
      </Accordion>,
    );
    const button = page.getByRole("button");
    const region = page.getByRole("region");

    await expect.element(button).toHaveAttribute("id", "custom-header-id");
    await expect
      .element(region)
      .toHaveAttribute("aria-labelledby", "custom-header-id");
    await expect.element(region).toHaveAttribute("id", "custom-panel-id");
    await expect
      .element(button)
      .toHaveAttribute("aria-controls", "custom-panel-id");
  });
});
