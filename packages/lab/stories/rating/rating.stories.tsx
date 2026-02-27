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
import { Rating, type RatingProps } from "@salt-ds/lab";
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

const Template: StoryFn<typeof Rating> = (args) => <Rating {...args} />;

export const Default = Template.bind({});

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};

export const ReadOnly = Template.bind({});
ReadOnly.args = {
  readOnly: true,
};

export const Controlled: StoryFn<typeof Rating> = (args) => {
  const [value, setValue] = useState(0);

  const handleChange: RatingProps["onChange"] = (event, newValue) => {
    setValue(newValue);
    args.onChange?.(event, newValue);
  };

  return <Rating {...args} value={value} onChange={handleChange} />;
};

export const VisualLabel: StoryFn<typeof Rating> = (args) => {
  const labels = ["Poor", "Fair", "Good", "Very good", "Excellent"];
  return (
    <StackLayout>
      <Rating
        {...args}
        aria-label="Rating"
        defaultValue={4}
        getVisibleLabel={(value, max) => `${value}/${max}`}
        className="custom-rating-width"
      />
      <Rating
        {...args}
        aria-label="Rating"
        defaultValue={4}
        getVisibleLabel={(value) => labels[value - 1] || "No rating"}
        getLabel={(value) => labels[value - 1]}
        className="custom-rating-width"
      />
      <Rating
        {...args}
        aria-label="Rating"
        labelPlacement="left"
        defaultValue={4}
        getVisibleLabel={(value) => labels[value - 1] || "No rating"}
        getLabel={(value) => labels[value - 1]}
        className="custom-rating-width"
      />
    </StackLayout>
  );
};

export const FormFieldSupport: StoryFn<typeof FormField> = (args) => {
  const labels = ["Poor", "Fair", "Good", "Very good", "Excellent"];
  return (
    <FormField {...args} labelPlacement="top" style={{ width: "225px" }}>
      <FormFieldLabel>Form field label</FormFieldLabel>
      <Rating
        getVisibleLabel={(value) => labels[value - 1] || "No rating"}
        getLabel={(value) => labels[value - 1]}
        defaultValue={3}
      />
      <FormFieldHelperText>Helper text</FormFieldHelperText>
    </FormField>
  );
};

export const CustomIncrements: StoryFn<typeof Rating> = (args) => {
  return (
    <FlexLayout direction="column" gap={3}>
      <Rating
        {...args}
        aria-label="Rating"
        defaultValue={1}
        onChange={(event, value) => console.log(event, value)}
      />
      <Rating
        {...args}
        aria-label="Rating"
        defaultValue={7}
        max={10}
        onChange={(event, value) => console.log(event, value)}
      />
    </FlexLayout>
  );
};

export const CustomIcons: StoryFn<typeof Rating> = (args) => {
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
        {...args}
      />
    </SemanticIconProvider>
  );
};

export const ClearSelection: StoryFn<typeof Rating> = (args) => {
  const [value, setValue] = useState(3);
  const [cleared, setCleared] = useState(false);

  return (
    <StackLayout direction="row" align="end" gap={1}>
      <FormField>
        <FormFieldLabel aria-live="polite">
          Rating {cleared && <span className="srOnly">was cleared</span>}
        </FormFieldLabel>
        <Rating
          {...args}
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
