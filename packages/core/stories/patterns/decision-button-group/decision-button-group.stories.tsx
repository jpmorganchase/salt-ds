import { Button, StackLayout, ToggleButton, Tooltip } from "@salt-ds/core";
import {
  CheckmarkIcon,
  CloseIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "@salt-ds/icons";
import type { Meta } from "@storybook/react-vite";
import { useState } from "react";

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

export const Selectable = () => {
  const [decision, setDecision] = useState<Decision | undefined>();

  const toggle = (value: Decision) =>
    setDecision((current) => (current === value ? undefined : value));

  return (
    <StackLayout
      direction={{ xs: "column", sm: "row" }}
      gap={1}
      role="group"
      aria-label="Expense request decision"
    >
      <ToggleButton
        appearance="bordered"
        sentiment="negative"
        value="reject"
        selected={decision === "reject"}
        onChange={() => toggle("reject")}
      >
        <CloseIcon aria-hidden />
        Reject
      </ToggleButton>
      <ToggleButton
        appearance="bordered"
        sentiment="positive"
        value="approve"
        selected={decision === "approve"}
        onChange={() => toggle("approve")}
      >
        <CheckmarkIcon aria-hidden />
        Approve
      </ToggleButton>
    </StackLayout>
  );
};

type Rating = "like" | "dislike";

export const WithTooltip = () => {
  const [rating, setRating] = useState<Rating | undefined>();

  const toggle = (value: Rating) =>
    setRating((current) => (current === value ? undefined : value));

  return (
    <StackLayout
      direction={{ xs: "column", sm: "row" }}
      gap={1}
      role="group"
      aria-label="Rate the response"
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
