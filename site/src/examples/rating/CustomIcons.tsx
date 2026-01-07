import { FlexLayout, FormField, FormFieldLabel } from "@salt-ds/core";
import { LikeIcon, LikeSolidIcon } from "@salt-ds/icons";
import { Rating } from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

export const CustomIcons = (): ReactElement => {
  const [value, setValue] = useState(3);
  return (
    <FlexLayout direction="column" gap={3}>
      <FormField labelPlacement="top">
        <FormFieldLabel>Decreased increments</FormFieldLabel>
        <Rating max={3} onValueChange={(value) => console.log(value)} />
      </FormField>
      <FormField labelPlacement="top">
        <FormFieldLabel>Increased increments</FormFieldLabel>
        <Rating
          value={7}
          max={10}
          onValueChange={(value) => console.log(value)}
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
          onValueChange={setValue}
        />
      </FormField>
    </FlexLayout>
  );
};
