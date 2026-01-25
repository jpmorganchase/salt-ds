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
        <Rating max={3} onChange={(event, value) => console.log(value)} />
      </FormField>
      <FormField labelPlacement="top">
        <FormFieldLabel>Increased increments</FormFieldLabel>
        <Rating
          defaultValue={7}
          max={10}
          onChange={(event, value) => console.log(value)}
        />
      </FormField>
      <FormField labelPlacement="top">
        <FormFieldLabel>Custom icon</FormFieldLabel>
        <Rating
          strongIcon={<LikeIcon />}
          filledIcon={<LikeSolidIcon />}
          emptyIcon={<LikeIcon />}
          defaultValue={value}
          max={6}
          onChange={(event, value) => setValue(value)}
        />
      </FormField>
    </FlexLayout>
  );
};
