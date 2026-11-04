import { Button, ButtonGroup, ToggleButton } from "@salt-ds/core";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useState } from "react";

export default {
  title: "Core/Button Group",
  component: ButtonGroup,
} as Meta<typeof ButtonGroup>;

export const Default: StoryFn<typeof ButtonGroup> = (args) => {
  return (
    <ButtonGroup {...args}>
      <Button>Yes</Button>
      <Button>No</Button>
    </ButtonGroup>
  );
};

export const Rating: StoryFn<typeof ButtonGroup> = (args) => {
  const [selected, setSelected] = useState<"reject" | "approve" | null>(null);

  return (
    <ButtonGroup {...args}>
      <ToggleButton
        sentiment="negative"
        value="reject"
        selected={selected === "reject"}
        onChange={() =>
          setSelected((prev) => (prev === "reject" ? null : "reject"))
        }
      >
        Reject
      </ToggleButton>
      <ToggleButton
        sentiment="positive"
        value="approve"
        selected={selected === "approve"}
        onChange={() =>
          setSelected((prev) => (prev === "approve" ? null : "approve"))
        }
      >
        Approve
      </ToggleButton>
    </ButtonGroup>
  );
};

export const RatingWithDescription: StoryFn<typeof ButtonGroup> = (args) => {
  const [selected, setSelected] = useState<"reject" | "approve" | null>(null);

  return (
    <ButtonGroup
      aria-description="Selecting an option deselects the other"
      {...args}
    >
      <ToggleButton
        sentiment="negative"
        value="reject"
        selected={selected === "reject"}
        onChange={() =>
          setSelected((prev) => (prev === "reject" ? null : "reject"))
        }
      >
        Reject
      </ToggleButton>
      <ToggleButton
        sentiment="positive"
        value="approve"
        selected={selected === "approve"}
        onChange={() =>
          setSelected((prev) => (prev === "approve" ? null : "approve"))
        }
      >
        Approve
      </ToggleButton>
    </ButtonGroup>
  );
};
