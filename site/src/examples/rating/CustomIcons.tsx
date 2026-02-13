import {
  FlexLayout,
  FormField,
  FormFieldLabel,
  SemanticIconProvider,
} from "@salt-ds/core";
import { LikeIcon, LikeSolidIcon } from "@salt-ds/icons";
import { Rating } from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

export const CustomIcons = (): ReactElement => {
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
            RatingIcon: LikeIcon,
            RatingSelectedIcon: LikeSolidIcon,
            RatingUnselectingIcon: LikeIcon,
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
