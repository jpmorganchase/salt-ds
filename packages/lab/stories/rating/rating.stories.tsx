import {
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
  SemanticIconProvider,
  Text,
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

export const Basic: StoryFn<typeof Rating> = () => {
  return (
    <FormField>
      <FormFieldLabel color="secondary">Rate your experience</FormFieldLabel>
      <Rating />
    </FormField>
  );
};

export const VisualLabel: StoryFn<typeof Rating> = () => {
  const labels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];
  return (
    <FlexLayout direction="column" gap={3}>
      <FormField>
        <FormFieldLabel>Product quality</FormFieldLabel>
        <Rating getLabel={(value) => labels[value - 1] || "No rating"} />
      </FormField>
      <FormField>
        <FormFieldLabel>Customer service</FormFieldLabel>
        <Rating defaultValue={4} getLabel={(value, max) => `${value}/${max}`} />
      </FormField>
      <FormField>
        <FormFieldLabel>Select rating</FormFieldLabel>
        <Rating
          labelPlacement="left"
          getLabel={(value) => labels[value - 1] || "No rating"}
          labelProps={{ style: { minWidth: "15ch" } }}
        />
        <Text style={{ maxWidth: "450px" }}>
          When using labels with `labelPlacement` set to 'left', set a minimum
          width on the label container using the `labelProps` with inline
          styles. This prevents layout shifts as the label text changes between
          different rating values.
        </Text>
      </FormField>
    </FlexLayout>
  );
};

export const FormFieldSupport: StoryFn<typeof Rating> = () => {
  const labels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];
  return (
    <FormField labelPlacement="top">
      <FormFieldLabel color="secondary">Overall Experience</FormFieldLabel>
      <Rating getLabel={(value) => labels[value - 1] || "No rating"} />
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
            max={5}
            onChange={(event, value) => setValue(value)}
          />
        </SemanticIconProvider>
      </FormField>
    </FlexLayout>
  );
};

export const Disabled: StoryFn<typeof Rating> = () => {
  return (
    <FormField>
      <FormFieldLabel>Disabled example</FormFieldLabel>
      <Rating disabled defaultValue={3} />
    </FormField>
  );
};

export const ReadOnly: StoryFn<typeof Rating> = () => {
  return (
    <FormField>
      <FormFieldLabel>Read-only example</FormFieldLabel>
      <Rating readOnly defaultValue={3} />
    </FormField>
  );
};
