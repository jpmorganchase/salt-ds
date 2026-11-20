import { renderProps } from "@salt-ds/core";
import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  createRef,
  forwardRef,
} from "react";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

const Button = (props: ComponentPropsWithoutRef<"button">) => (
  <button {...props} />
);

async function expectTestButton() {
  const button = page.getByRole("button", { name: "Button Children" });
  await expect.element(button).toBeInTheDocument();
  await expect.element(button).toHaveClass("test-class");
}

describe("renderProps function", () => {
  it("merges props into a rendered JSX element", async () => {
    await render(
      renderProps(Button, {
        render: <Button>Button Children</Button>,
        className: "test-class",
      }),
    );
    await expectTestButton();
  });

  it("calls a render function with the remaining props", async () => {
    await render(
      renderProps(Button, {
        render: (props: { className: string }) => (
          <Button className={props.className}>Button Children</Button>
        ),
        className: "test-class",
      }),
    );
    await expectTestButton();
  });

  it("renders the default component without a render prop", async () => {
    await render(
      renderProps("button", {
        className: "test-class",
        children: "Button Children",
      }),
    );
    await expectTestButton();
  });

  it("throws without a type or render prop", () => {
    expect(() =>
      renderProps(null, {
        className: "test-class",
        children: "Button Children",
      }),
    ).toThrow("Type or render should be provided");
  });

  it("renders JSX when the default type is null", async () => {
    await render(
      renderProps(null, {
        render: <Button>Button Children</Button>,
        className: "test-class",
      }),
    );
    await expectTestButton();
  });

  it("calls a render function when the default type is null", async () => {
    await render(
      renderProps(null, {
        render: (props: { className: string }) => (
          <Button className={props.className}>Button Children</Button>
        ),
        className: "test-class",
      }),
    );
    await expectTestButton();
  });

  it("shallow-merges style objects", async () => {
    await render(
      renderProps(Button, {
        render: (
          <Button style={{ padding: 8, color: "red" }}>Button Children</Button>
        ),
        style: { margin: 4, color: "blue" },
      }),
    );
    const style = getComputedStyle(page.getByRole("button").element());
    expect(style.margin).toBe("4px");
    expect(style.padding).toBe("8px");
    expect(style.color).toBe("rgb(255, 0, 0)");
  });

  it("preserves host CSS custom properties", async () => {
    await render(
      renderProps(Button, {
        render: (
          <Button style={{ padding: 8 }} data-testid="render-target">
            Button Children
          </Button>
        ),
        style: { "--my-var": "42" } as CSSProperties,
      }),
    );
    const style =
      page.getByTestId("render-target").element().getAttribute("style") ?? "";
    expect(style).toContain("--my-var");
    expect(style).toContain("padding");
  });

  it("sets both the component's ref and the render element's ref", async () => {
    const RenderButton = forwardRef<
      HTMLButtonElement,
      ComponentPropsWithoutRef<"button">
    >(function RenderButton(props, ref) {
      return <button ref={ref} {...props} />;
    });
    const ComponentWithRenderProp = forwardRef<
      HTMLButtonElement,
      ComponentPropsWithoutRef<"button"> & {
        render?: Parameters<typeof renderProps>[1]["render"];
      }
    >(function ComponentWithRenderProp(props, ref) {
      return renderProps("button", { ...props, ref });
    });
    const componentRef = createRef<HTMLButtonElement>();
    const renderRef = createRef<HTMLButtonElement>();

    await render(
      <ComponentWithRenderProp
        ref={componentRef}
        render={<RenderButton ref={renderRef}>Button Children</RenderButton>}
      />,
    );

    const button = await page
      .getByRole("button", { name: "Button Children" })
      .element();
    expect(componentRef.current).toBe(button);
    expect(renderRef.current).toBe(button);
  });
});
