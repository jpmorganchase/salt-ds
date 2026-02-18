import { SemanticIconProvider } from "@salt-ds/core";
import { LikeIcon, LikeSolidIcon } from "@salt-ds/icons";
import { Rating } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab/Rating/Rating QA",
  component: Rating,
} as Meta<typeof Rating>;

export const ExamplesGrid: StoryFn<QAContainerProps> = () => {
  return (
    <QAContainer itemPadding={4}>
      <Rating defaultValue={3} />
      <Rating defaultValue={3} disabled />
      <Rating defaultValue={3} readOnly />
      <Rating
        defaultValue={3}
        readOnly
        getVisibleLabel={(value, max) => `${value}/${max}`}
      />
      <Rating defaultValue={3} max={10} />
      <SemanticIconProvider
        iconMap={{
          RatingIcon: LikeIcon,
          RatingSelectedIcon: LikeSolidIcon,
          RatingUnselectingIcon: LikeIcon,
        }}
      >
        <Rating defaultValue={3} />
      </SemanticIconProvider>
    </QAContainer>
  );
};

ExamplesGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
