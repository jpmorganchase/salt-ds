import { describe, expect, it } from "vitest";
import { act, renderWithSalt } from "~browser-test-utils/render";
import { useOverflowLayoutState } from "../../../tabs/internal/overflow/useOverflowLayoutState";

type LayoutState = ReturnType<typeof useOverflowLayoutState>;

const noop = () => undefined;

function setup() {
  let latest: LayoutState | undefined;

  function Harness({ hiddenValues }: { hiddenValues: string[] }) {
    latest = useOverflowLayoutState({
      exitOverflowMenu: noop,
      hiddenValues,
      menuOpen: true,
      overflowMenuOpen: true,
      visibleValues: ["a"],
    });
    return null;
  }

  return {
    Harness,
    getState: () => {
      if (!latest) throw new Error("Harness has not rendered");
      return latest;
    },
  };
}

describe("useOverflowLayoutState", () => {
  it("keeps the active overflow position across renders after the active tab is removed", async () => {
    const { Harness, getState } = setup();
    const { rerender } = await renderWithSalt(
      <Harness hiddenValues={["b", "c", "d"]} />,
    );

    await act(() => {
      getState().tabListLayoutContext.setOverflowActiveValue("c");
    });
    expect(getState().resolvedOverflowActiveValue).toBe("c");

    await rerender(<Harness hiddenValues={["b", "d"]} />);
    expect(getState().resolvedOverflowActiveValue).toBe("d");

    // Hidden values are a new array on every render, so a further render
    // must not fall back to the first overflow tab.
    await rerender(<Harness hiddenValues={["b", "d"]} />);
    expect(getState().resolvedOverflowActiveValue).toBe("d");
  });

  it("keeps the previous position when the last overflow tab is removed", async () => {
    const { Harness, getState } = setup();
    const { rerender } = await renderWithSalt(
      <Harness hiddenValues={["b", "c", "d"]} />,
    );

    await act(() => {
      getState().tabListLayoutContext.setOverflowActiveValue("d");
    });

    await rerender(<Harness hiddenValues={["b", "c"]} />);
    await rerender(<Harness hiddenValues={["b", "c"]} />);
    expect(getState().resolvedOverflowActiveValue).toBe("c");
  });
});
