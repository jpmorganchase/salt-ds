import {
  Button,
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  SemanticIconProvider,
  StackLayout,
} from "@salt-ds/core";
import { LikeIcon, LikeSolidIcon } from "@salt-ds/icons";
import { Rating } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import "./rating.stories.css";

export default {
  title: "Lab/Rating",
  component: Rating,
  args: {
    onChange: fn(),
  },
} as Meta<typeof Rating>;

export const Default: StoryFn<typeof Rating> = () => {
  return <Rating aria-label="Rating" defaultValue={3} />;
};

export const ReadOnly: StoryFn<typeof Rating> = () => {
  const labels = ["Poor", "Fair", "Good", "Very good", "Excellent"];
  return (
    <StackLayout>
      <FormField>
        <FormFieldLabel>Rating (Read-only)</FormFieldLabel>
        <Rating readOnly defaultValue={3} />
      </FormField>
      <Rating
        aria-label="Rating (Read-only)"
        readOnly
        defaultValue={3}
        getVisibleLabel={(value) => labels[value - 1] || "No rating"}
        getLabel={(value) => labels[value - 1]}
      />
    </StackLayout>
  );
};

export const Disabled: StoryFn<typeof Rating> = () => {
  return <Rating aria-label="Rating" disabled defaultValue={3} />;
};

export const VisualLabel: StoryFn<typeof Rating> = () => {
  const labels = ["Poor", "Fair", "Good", "Very good", "Excellent"];
  return (
    <FlexLayout direction="column" gap={3}>
      <Rating
        aria-label="Rating"
        defaultValue={4}
        getVisibleLabel={(value, max) => `${value}/${max}`}
      />
      <Rating
        aria-label="Rating"
        defaultValue={4}
        getVisibleLabel={(value) => labels[value - 1] || "No rating"}
        getLabel={(value) => labels[value - 1]}
      />
      <Rating
        aria-label="Rating"
        labelPlacement="left"
        defaultValue={4}
        getVisibleLabel={(value) => labels[value - 1] || "No rating"}
        getLabel={(value) => labels[value - 1]}
        className="custom-rating-width"
      />
    </FlexLayout>
  );
};

export const FormFieldSupport: StoryFn<typeof Rating> = () => {
  const labels = ["Poor", "Fair", "Good", "Very good", "Excellent"];
  return (
    <FormField labelPlacement="top" style={{ width: "225px" }}>
      <FormFieldLabel>Form field label</FormFieldLabel>
      <Rating
        getVisibleLabel={(value) => labels[value - 1] || "No rating"}
        getLabel={(value) => labels[value - 1]}
      />
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </FormField>
  );
};

export const CustomIncrements: StoryFn<typeof Rating> = () => {
  return (
    <FlexLayout direction="column" gap={3}>
      <Rating
        aria-label="Rating"
        defaultValue={1}
        onChange={(event, value) => console.log(event, value)}
      />
      <Rating
        aria-label="Rating"
        defaultValue={7}
        max={10}
        onChange={(event, value) => console.log(event, value)}
      />
    </FlexLayout>
  );
};

export const CustomIcons: StoryFn<typeof Rating> = () => {
  const [value, setValue] = useState(3);

  return (
    <SemanticIconProvider
      iconMap={{
        RatingIcon: LikeIcon,
        RatingSelectedIcon: LikeSolidIcon,
        RatingUnselectingIcon: LikeIcon,
      }}
    >
      <Rating
        aria-label="Rating"
        value={value}
        max={5}
        onChange={(_event, value) => setValue(value)}
        getLabel={(value) => `${value} Heart${value > 1 ? "s" : ""}`}
      />
    </SemanticIconProvider>
  );
};

export const ClearSelection: StoryFn<typeof Rating> = () => {
  const [value, setValue] = useState<number>(3);
  const [cleared, setCleared] = useState(false);

  return (
    <StackLayout direction="row" align="end" gap={1}>
      <FormField>
        <FormFieldLabel aria-live="polite">
          Rating {cleared && <span className="srOnly">was cleared</span>}
        </FormFieldLabel>
        <Rating
          value={value}
          onChange={(_event, newValue) => {
            setValue(newValue);
            setCleared(false);
          }}
        />
      </FormField>
      <Button
        sentiment="accented"
        appearance="transparent"
        onClick={() => {
          setValue(0);
          setCleared(true);
        }}
        aria-label="Clear rating"
      >
        Clear
      </Button>
    </StackLayout>
  );
};
