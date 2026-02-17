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

export default {
  title: "Lab/Rating",
  component: Rating,
  args: {
    onChange: fn(),
  },
} as Meta<typeof Rating>;

export const Default: StoryFn<typeof Rating> = () => {
  return <Rating defaultValue={3} />;
};

export const ReadOnly: StoryFn<typeof Rating> = () => {
  return <Rating readOnly defaultValue={3} />;
};

export const Disabled: StoryFn<typeof Rating> = () => {
  return <Rating disabled defaultValue={3} />;
};

export const VisualLabel: StoryFn<typeof Rating> = () => {
  const labels = ["Poor", "Fair", "Good", "Very good", "Excellent"];
  return (
    <FlexLayout direction="column" gap={3}>
      <Rating
        defaultValue={4}
        getVisibleLabel={(value, max) => `${value}/${max}`}
      />
      <Rating
        defaultValue={4}
        getVisibleLabel={(value) => labels[value - 1] || "No rating"}
        getLabel={(value) => labels[value - 1]}
      />
      <Rating
        labelPlacement="left"
        defaultValue={4}
        getVisibleLabel={(value) => labels[value - 1] || "No rating"}
        getLabel={(value) => labels[value - 1]}
        className="custom-rating-width"
      />
      <style>
        {".custom-rating-width .saltRating-label { min-width: 9ch; }"}
      </style>
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
        defaultValue={1}
        onChange={(event, value) => console.log(event, value)}
      />
      <Rating
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
        value={value}
        max={5}
        onChange={(event, value) => setValue(value)}
        getLabel={(value) => `${value} Heart${value > 1 ? "s" : ""}`}
      />
    </SemanticIconProvider>
  );
};

export const ClearSelection: StoryFn<typeof Rating> = () => {
  const [value, setValue] = useState<number>(3);

  return (
    <StackLayout direction="row" gap={1}>
      <Rating
        value={value}
        onChange={(event, newValue) => setValue(newValue)}
      />
      <Button
        sentiment="accented"
        appearance="transparent"
        onClick={() => setValue(0)}
      >
        clear
      </Button>
    </StackLayout>
  );
};
