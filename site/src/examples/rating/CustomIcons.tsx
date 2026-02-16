import { SemanticIconProvider } from "@salt-ds/core";
import { LikeIcon, LikeSolidIcon } from "@salt-ds/icons";
import { Rating } from "@salt-ds/lab";
import { type ReactElement, useState } from "react";

export const CustomIcons = (): ReactElement => {
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
      />
    </SemanticIconProvider>
  );
};
