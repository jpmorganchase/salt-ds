import {
  FlexLayout,
  FormField,
  FormFieldHelperText,
  FormFieldLabel,
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
  return (
    <FlexLayout direction="column" gap={3}>
      <FormField labelPlacement="top">
        <FormFieldLabel>Click to clear selection</FormFieldLabel>
        <Rating
          value={3}
          enableDeselect={true}
          onChange={(event, value) => console.log(event, value)}
          {...args}
        />
      </FormField>
      <FormField labelPlacement="top">
        <FormFieldLabel>Prevent Clearing Selection</FormFieldLabel>
        <Rating
          value={3}
          enableDeselect={false}
          onChange={(event, value) => console.log(event, value)}
          {...args}
        />
      </FormField>
    </FlexLayout>
  );
};

export const VisualLabel: StoryFn<typeof Rating> = (args) => {
  return (
    <FlexLayout direction="column" gap={2}>
      <Rating
        labelPosition="right"
        semanticLabels={["Poor", "Fair", "Good", "Very Good", "Excellent"]}
        {...args}
      />
      <Rating
        value={4}
        semanticLabels={(value, max) => `${value}/${max}`}
        {...args}
      />
    </FlexLayout>
  );
};

export const FormFieldSupport: StoryFn<typeof Rating> = (args) => {
  return (
    <FormField labelPlacement="top">
      <FormFieldLabel color="secondary">Overall Experience</FormFieldLabel>
      <Rating
        semanticLabels={["Poor", "Fair", "Good", "Very Good", "Excellent"]}
        {...args}
      />
      <FormFieldHelperText>
        Please rate your overall experience with our service. Select the number
        of stars that best reflects your satisfaction.
      </FormFieldHelperText>
    </FormField>
  );
};

export const CustomIcons: StoryFn<typeof Rating> = ({ onChange, ...args }) => {
  const [value, setValue] = useState(3);

  return (
    <FlexLayout direction="column" gap={3}>
      <FormField labelPlacement="top">
        <FormFieldLabel>Decreased increments</FormFieldLabel>
        <Rating
          max={3}
          onChange={(event, value) => console.log(event, value)}
          {...args}
        />
      </FormField>
      <FormField labelPlacement="top">
        <FormFieldLabel>Increased increments</FormFieldLabel>
        <Rating
          value={7}
          max={10}
          onChange={(event, value) => console.log(event, value)}
          {...args}
        />
      </FormField>
      <FormField labelPlacement="top">
        <FormFieldLabel>Custom icon</FormFieldLabel>
        <Rating
          outlinedIcon={<LikeIcon />}
          filledIcon={<LikeSolidIcon />}
          emptyIcon={<LikeIcon />}
          value={value}
          max={6}
          onChange={(event, value) => setValue(value)}
          {...args}
        />
      </FormField>
    </FlexLayout>
  );
};

export const Disabled: StoryFn<typeof Rating> = (args) => {
  return <Rating disabled value={3} {...args} />;
};

export const ReadOnly: StoryFn<typeof Rating> = (args) => {
  return <Rating readOnly value={3} {...args} />;
};
