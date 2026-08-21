import { composeStories } from "@storybook/react-vite";
import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import * as layerStories from "~stories/layer-layout/layer-layout.stories";
import { renderWithSalt } from "../render";

const { Default, Top, Right, Left, Bottom } = composeStories(layerStories);

function layerElement() {
  return document.querySelector<HTMLElement>(".saltLayerLayout");
}

async function openLayer(Story = Default, props = {}) {
  await renderWithSalt(<Story {...props} />);
  await page.getByRole("button", { name: /Open Layer/i }).click();
  await expect.poll(layerElement).not.toBeNull();
  return layerElement() as HTMLElement;
}

afterEach(() => page.viewport(1280, 1024));

describe("GIVEN a LayerLayout", () => {
  it("shows a scrim by default", async () => {
    await openLayer();
    expect(document.querySelector(".saltScrim")).not.toBeNull();
  });

  it("can disable its scrim", async () => {
    await openLayer(Default, { disableScrim: true });
    expect(document.querySelector(".saltScrim")).toBeNull();
  });

  it("defaults to the center position", async () => {
    expect(await openLayer()).toHaveClass("saltLayerLayout-center");
  });

  it.each([
    [Top, "top"],
    [Right, "right"],
    [Left, "left"],
    [Bottom, "bottom"],
  ] as const)("positions a layer on the %s edge", async (Story, property) => {
    const layer = await openLayer(Story);
    expect(getComputedStyle(layer)[property]).toBe("0px");
  });

  it("is full-screen on a small viewport by default", async () => {
    await page.viewport(700, 900);
    expect(await openLayer()).toHaveClass("saltLayerLayout-fullScreen");
  });

  it.each([
    [961, "md"],
    [1821, "xl"],
  ] as const)(
    "supports a %s full-screen breakpoint",
    async (width, breakpoint) => {
      await page.viewport(width, 900);
      const layer = await openLayer(Default, {
        fullScreenAtBreakpoint: breakpoint,
      });
      expect(layer).toHaveClass("saltLayerLayout-fullScreen");
    },
  );

  it("runs an exit animation when closed", async () => {
    const layer = await openLayer();
    let sawExitAnimation = layer.classList.contains(
      "saltLayerLayout-exit-animation",
    );
    const observer = new MutationObserver(() => {
      sawExitAnimation ||= layer.classList.contains(
        "saltLayerLayout-exit-animation",
      );
    });
    observer.observe(layer, { attributeFilter: ["class"] });
    await page.getByRole("button", { name: /Close Layer/i }).click();
    await expect.poll(() => sawExitAnimation).toBe(true);
    await expect.poll(layerElement).toBeNull();
    observer.disconnect();
  });

  it("can close in full-screen mode", async () => {
    await page.viewport(700, 900);
    expect(await openLayer()).toHaveClass("saltLayerLayout-fullScreen");
    await page.getByRole("button", { name: /Close Layer/i }).click();
    await expect.poll(layerElement).toBeNull();
  });
});
