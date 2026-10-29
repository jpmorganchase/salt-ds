import { SemanticIconProvider, useIcon } from "@salt-ds/core";
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DoubleChevronDownIcon,
  DoubleChevronUpIcon,
  SuccessCircleSolidIcon,
  UserIcon,
} from "@salt-ds/icons";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

function TestComponent() {
  const icons = useIcon();
  return (
    <div>
      <icons.ExpandIcon data-testid="ChevronDownIcon" />
      <icons.CollapseIcon data-testid="ChevronUpIcon" />
      <icons.SuccessIcon data-testid="SuccessCircleSolidIcon" />
      <icons.CalendarIcon data-testid="CalendarIcon" />
      <icons.UserIcon data-testid="UserIcon" />
    </div>
  );
}

const iconTestIds = [
  "ChevronDownIcon",
  "SuccessCircleSolidIcon",
  "CalendarIcon",
  "UserIcon",
];

describe("SemanticIconProvider", () => {
  it("uses default icons without an override provider", async () => {
    await renderWithSalt(<TestComponent />);
    for (const testId of iconTestIds) {
      await expect.element(page.getByTestId(testId)).toBeInTheDocument();
    }
  });

  it("supports overriding only specific icons", async () => {
    await renderWithSalt(
      <SemanticIconProvider
        iconMap={{
          CollapseIcon: DoubleChevronUpIcon,
          ExpandIcon: DoubleChevronDownIcon,
        }}
      >
        <TestComponent />
      </SemanticIconProvider>,
    );

    await expect
      .element(page.getByTestId("ChevronDownIcon"))
      .toHaveAttribute("aria-label", "double chevron down");
    await expect
      .element(page.getByTestId("ChevronUpIcon"))
      .toHaveAttribute("aria-label", "double chevron up");
    for (const testId of [
      "SuccessCircleSolidIcon",
      "CalendarIcon",
      "UserIcon",
    ]) {
      await expect.element(page.getByTestId(testId)).toBeInTheDocument();
    }
  });

  it("supports overriding all icons", async () => {
    await renderWithSalt(
      <SemanticIconProvider
        iconMap={{
          CollapseIcon: ChevronDownIcon,
          ExpandIcon: ChevronUpIcon,
          SuccessIcon: UserIcon,
          CalendarIcon: SuccessCircleSolidIcon,
          UserIcon: CalendarIcon,
        }}
      >
        <TestComponent />
      </SemanticIconProvider>,
    );

    for (const [testId, label] of [
      ["ChevronDownIcon", "chevron up"],
      ["ChevronUpIcon", "chevron down"],
      ["SuccessCircleSolidIcon", "user"],
      ["CalendarIcon", "success circle solid"],
      ["UserIcon", "calendar"],
    ]) {
      await expect
        .element(page.getByTestId(testId))
        .toHaveAttribute("aria-label", label);
    }
  });
});
