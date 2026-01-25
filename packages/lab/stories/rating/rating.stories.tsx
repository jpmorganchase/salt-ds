import {
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  SemanticIconProvider,
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

export const Basic: StoryFn<typeof Rating> = (args) => {
  return <Rating {...args} />;
};

export const ClearSelection: StoryFn<typeof Rating> = (args) => {
  const [rating1, setRating1] = useState(3);
  const [rating2, setRating2] = useState(3);
  return (
    <FlexLayout direction="column" gap={3}>
      <FormField labelPlacement="top">
        <FormFieldLabel>Click to clear selection</FormFieldLabel>
        <Rating
          defaultValue={rating1}
          enableDeselect
          onChange={(event, value) => {
            console.log(event, value);
            setRating1(value);
          }}
          {...args}
        />
      </FormField>
      <FormField labelPlacement="top">
        <FormFieldLabel>Prevent Clearing Selection</FormFieldLabel>
        <Rating
          defaultValue={rating2}
          enableDeselect={false}
          onChange={(event, value) => {
            console.log(event, value);
            setRating2(value);
          }}
          {...args}
        />
      </FormField>
    </FlexLayout>
  );
};

export const VisualLabel: StoryFn<typeof Rating> = (args) => {
  const labels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];
  return (
    <FlexLayout direction="column" gap={2}>
      <Rating
        labelPlacement="right"
        getLabel={(value) => labels[value - 1] || "No rating"}
        {...args}
      />
      <Rating
        labelPlacement="top"
        getLabel={(value) => labels[value - 1] || "No rating"}
        {...args}
      />
      <Rating
        labelPlacement="left"
        getLabel={(value) => labels[value - 1] || "No rating"}
        {...args}
      />
      <Rating
        labelPlacement="bottom"
        getLabel={(value) => labels[value - 1] || "No rating"}
        {...args}
      />
      <Rating
        defaultValue={4}
        getLabel={(value, max) => `${value}/${max}`}
        {...args}
      />
    </FlexLayout>
  );
};

export const FormFieldSupport: StoryFn<typeof Rating> = (args) => {
  const labels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];
  return (
    <FormField labelPlacement="top">
      <FormFieldLabel color="secondary">Overall Experience</FormFieldLabel>
      <Rating
        getLabel={(value) => labels[value - 1] || "No rating"}
        {...args}
      />
      <FormFieldHelperText>
        Please rate your overall experience with our service. Select the number
        of stars that best reflects your satisfaction.
      </FormFieldHelperText>
    </FormField>
  );
};

export const CustomIcons: StoryFn<typeof Rating> = () => {
  const [value, setValue] = useState(3);

  return (
    <FlexLayout direction="column" gap={3}>
      <FormField labelPlacement="top">
        <FormFieldLabel>Decreased increments</FormFieldLabel>
        <Rating
          defaultValue={2}
          max={3}
          onChange={(event, value) => console.log(event, value)}
        />
      </FormField>
      <FormField labelPlacement="top">
        <FormFieldLabel>Increased increments</FormFieldLabel>
        <Rating
          defaultValue={7}
          max={10}
          onChange={(event, value) => console.log(event, value)}
        />
      </FormField>
      <FormField labelPlacement="top">
        <FormFieldLabel>Custom icon</FormFieldLabel>
        <SemanticIconProvider
          iconMap={{
            FavoriteEmptyIcon: LikeIcon,
            FavoriteSolidIcon: LikeSolidIcon,
            FavoriteStrongIcon: LikeIcon,
          }}
        >
          <Rating
            value={value}
            max={6}
            onChange={(event, value) => setValue(value)}
          />
        </SemanticIconProvider>
      </FormField>
    </FlexLayout>
  );
};

export const Disabled: StoryFn<typeof Rating> = (args) => {
  return <Rating disabled defaultValue={3} {...args} />;
};

export const ReadOnly: StoryFn<typeof Rating> = (args) => {
  return <Rating readOnly defaultValue={3} {...args} />;
};
