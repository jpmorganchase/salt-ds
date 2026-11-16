import { Button, StackLayout, ToggleButton, Tooltip } from "@salt-ds/core";
import {
  CheckmarkIcon,
  CloseIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "@salt-ds/icons";
import type { Meta } from "@storybook/react-vite";
import { type KeyboardEvent, useState } from "react";

export default {
  title: "Patterns/Decision Button Group",
} as Meta;

export const Default = () => {
  return (
    <StackLayout
      direction={{ xs: "column", sm: "row" }}
      gap={1}
      role="group"
      aria-label="Expense request decision"
    >
      <Button appearance="bordered" sentiment="negative">
        <CloseIcon aria-hidden />
        Reject
      </Button>
      <Button appearance="bordered" sentiment="positive">
        <CheckmarkIcon aria-hidden />
        Approve
      </Button>
    </StackLayout>
  );
};

type Decision = "reject" | "approve";

const arrowSteps: Record<string, number> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

export const Selectable = () => {
  const [decision, setDecision] = useState<Decision>("reject");

  // Radio behaviour: arrows move focus and select, wrapping at the ends.
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const step = arrowSteps[event.key];
    if (!step || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    const radios = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]'),
    );
    const current = radios.indexOf(event.target as HTMLButtonElement);
    const next = radios[(current + step + radios.length) % radios.length];
    next.focus();
    setDecision(next.value as Decision);
  };

  return (
    <StackLayout
      direction={{ xs: "column", sm: "row" }}
      gap={1}
      role="radiogroup"
      aria-label="Expense request decision"
      onKeyDown={handleKeyDown}
    >
      <ToggleButton
        appearance="bordered"
        sentiment="negative"
        value="reject"
        role="radio"
        aria-checked={decision === "reject"}
        // biome-ignore lint/a11y/useValidAriaValues: undefined removes the aria-pressed ToggleButton sets, which radios must not have.
        aria-pressed={undefined}
        tabIndex={decision === "reject" ? 0 : -1}
        selected={decision === "reject"}
        onChange={() => setDecision("reject")}
      >
        <CloseIcon aria-hidden />
        Reject
      </ToggleButton>
      <ToggleButton
        appearance="bordered"
        sentiment="positive"
        value="approve"
        role="radio"
        aria-checked={decision === "approve"}
        // biome-ignore lint/a11y/useValidAriaValues: undefined removes the aria-pressed ToggleButton sets, which radios must not have.
        aria-pressed={undefined}
        tabIndex={decision === "approve" ? 0 : -1}
        selected={decision === "approve"}
        onChange={() => setDecision("approve")}
      >
        <CheckmarkIcon aria-hidden />
        Approve
      </ToggleButton>
    </StackLayout>
  );
};

type Rating = "like" | "dislike";

export const OptionalSelection = () => {
  const [rating, setRating] = useState<Rating | undefined>();

  const toggle = (value: Rating) =>
    setRating((current) => (current === value ? undefined : value));

  return (
    <StackLayout
      direction={{ xs: "column", sm: "row" }}
      gap={1}
      role="group"
      aria-label="Rate this response"
    >
      <Tooltip content="Dislike" placement="top">
        <ToggleButton
          aria-label="Dislike"
          appearance="bordered"
          sentiment="negative"
          value="dislike"
          selected={rating === "dislike"}
          onChange={() => toggle("dislike")}
        >
          <ThumbsDownIcon aria-hidden />
        </ToggleButton>
      </Tooltip>
      <Tooltip content="Like" placement="top">
        <ToggleButton
          aria-label="Like"
          appearance="bordered"
          sentiment="positive"
          value="like"
          selected={rating === "like"}
          onChange={() => toggle("like")}
        >
          <ThumbsUpIcon aria-hidden />
        </ToggleButton>
      </Tooltip>
    </StackLayout>
  );
};
