import { Avatar, FlowLayout, Label, StackLayout } from "@salt-ds/core";
import type { ReactElement } from "react";

const sizes = [1, 2, 4] as const;

export const Sizes = (): ReactElement => {
  return (
    <FlowLayout gap={7} align="end">
      {sizes.map((size) => (
        <StackLayout key={size} align="center">
          <Avatar key={size} size={size} />
          <Label>Size: {size}x</Label>
        </StackLayout>
      ))}
    </FlowLayout>
  );
};
