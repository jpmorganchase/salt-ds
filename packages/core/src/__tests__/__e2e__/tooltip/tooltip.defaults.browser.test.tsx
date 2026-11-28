import { Button, Tooltip } from "@salt-ds/core";
import {
  ComponentDefaultsProvider,
  type ComponentDefaultsRegistry,
} from "@salt-ds/styles";
import { describe, expect, it } from "vitest";
import { renderWithSalt } from "~browser-test-utils/render";

describe("GIVEN Tooltip defaults", () => {
  it("SHOULD apply provider hideArrow when unset", async () => {
    const defaults: ComponentDefaultsRegistry = {
      saltTooltip: { props: { hideArrow: true } },
    };

    await renderWithSalt(
      <ComponentDefaultsProvider value={defaults}>
        <Tooltip open content="Tip">
          <Button>Trigger</Button>
        </Tooltip>
      </ComponentDefaultsProvider>,
    );

    expect(document.querySelector(".saltTooltip-arrow")).toBeNull();
  });
});
