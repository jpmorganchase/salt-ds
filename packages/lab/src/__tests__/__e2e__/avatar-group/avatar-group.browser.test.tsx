import { Avatar } from "@salt-ds/core";
import { AvatarGroup, AvatarGroupCount } from "@salt-ds/lab";
import { composeStories } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { checkAccessibility } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";
import * as avatarGroupStories from "~stories/avatar-group/avatar-group.stories";

const composedStories = composeStories(avatarGroupStories);
const { RenderProp } = composedStories;

describe("Given an AvatarGroup", () => {
  checkAccessibility(composedStories);

  it("should not apply the group role when rendered as a button", async () => {
    await renderWithSalt(
      <RenderProp
        render={<button type="button" aria-label="Team members" />}
      />,
    );

    await expect
      .element(page.getByRole("button", { name: "Team members" }))
      .toBeInTheDocument();
    await expect.element(page.getByRole("group")).not.toBeInTheDocument();
  });

  it("should render the count as a visible label with a default accessible name", async () => {
    await renderWithSalt(
      <AvatarGroup>
        <Avatar name="Alex Brailescu" />
        <Avatar name="Peter Piper" />
        <AvatarGroupCount count={2} />
      </AvatarGroup>,
    );

    await expect.element(page.getByText("+2")).toBeVisible();
    await expect
      .element(page.getByRole("img", { name: "2 more" }))
      .toBeVisible();
  });

  it("should allow the count's visible label and accessible name to be overridden", async () => {
    await renderWithSalt(
      <AvatarGroupCount count={3} aria-label="3 more team members">
        3+
      </AvatarGroupCount>,
    );

    await expect.element(page.getByText("3+")).toBeVisible();
    await expect
      .element(page.getByRole("img", { name: "3 more team members" }))
      .toBeVisible();
  });

  it("should be focusable and activatable when rendered as a button", async () => {
    const clickSpy = vi.fn();

    await renderWithSalt(
      <RenderProp
        render={
          <button type="button" aria-label="Team members" onClick={clickSpy} />
        }
      />,
    );

    const group = page.getByRole("button", { name: "Team members" });

    await userEvent.tab();
    await expect.element(group).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it("should pass its children to a `render` function", async () => {
    const renderSpy = vi.fn(({ children }: { children?: ReactNode }) => (
      <section data-testid="custom-group">{children}</section>
    ));

    await renderWithSalt(
      <AvatarGroup render={renderSpy}>
        <Avatar name="Alex Brailescu" />
        <AvatarGroupCount count={1} />
      </AvatarGroup>,
    );

    const customGroup = page.getByTestId("custom-group");
    await expect
      .element(customGroup.getByRole("img", { name: "Alex Brailescu" }))
      .toBeVisible();
    await expect.element(customGroup.getByText("+1")).toBeVisible();
  });
});
