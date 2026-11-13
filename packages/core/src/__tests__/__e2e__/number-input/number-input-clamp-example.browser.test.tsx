import { AriaAnnouncerContext } from "@salt-ds/core";
import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";
import { ClampBehavior } from "../../../../../../site/src/examples/number-input/ClampBehavior";

async function renderExample() {
  const announce = vi.fn();
  await renderWithSalt(
    <AriaAnnouncerContext.Provider value={{ announce }}>
      <ClampBehavior />
      <button type="button">After</button>
    </AriaAnnouncerContext.Provider>,
  );
  return {
    announce,
    input: page.getByRole("spinbutton"),
    after: page.getByRole("button", { name: "After", exact: true }),
  };
}

describe("Number Input clamp example", () => {
  it.each([
    { boundary: "5", outside: "9" },
    { boundary: "0", outside: "-1" },
  ])(
    "announces every correction back to the $boundary boundary",
    async ({ boundary, outside }) => {
      const { announce, input, after } = await renderExample();

      // First commit the boundary itself. A later clamp back to this number
      // does not trigger NumberInput's onNumberChange callback.
      await input.fill(boundary);
      await after.click();
      expect(announce).not.toHaveBeenCalled();

      for (let attempt = 1; attempt <= 2; attempt += 1) {
        await input.fill(outside);
        expect(announce).toHaveBeenCalledTimes(attempt - 1);
        await after.click();

        await expect.element(input).toHaveValue(boundary);
        expect(announce).toHaveBeenCalledTimes(attempt);
        expect(announce).toHaveBeenLastCalledWith(
          `${outside} is outside the range 0 to 5, so the value was set to ${boundary}`,
          { duration: 1000 },
        );
      }
    },
  );

  it("does not announce typing or in-range decimal values as clamping", async () => {
    const { announce, input, after } = await renderExample();

    await input.fill("4");
    expect(announce).not.toHaveBeenCalled();
    await after.click();
    await expect.element(input).toHaveValue("4");
    expect(announce).not.toHaveBeenCalled();

    await input.fill("2.5");
    expect(announce).not.toHaveBeenCalled();
    await after.click();
    await expect.element(input).toHaveValue("2.5");
    expect(announce).not.toHaveBeenCalled();
  });
});
