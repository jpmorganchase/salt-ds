import { Avatar, AvatarGroup } from "@salt-ds/core";
import { SaltShakerIcon } from "@salt-ds/icons";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";
import persona1 from "../assets/avatar.png";

export default {
  title: "Core/Avatar/Avatar QA",
  component: Avatar,
} as Meta<typeof Avatar>;

export const AllVariantsGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={500} width={1000} {...props}>
    <Avatar size={1} name="Alex Brailescu" src={persona1} />
    <Avatar size={2} src="bad_url" name="Peter Piper" />
    <Avatar size={3} src="bad_url" />
    <Avatar size={3} fallbackIcon={<SaltShakerIcon />} />
    <Avatar name="Peter Piper" color="category-1" />
    <Avatar name="Peter Piper" color="category-2" />
    <Avatar name="Peter Piper" color="category-3" />
    <Avatar name="Peter Piper" color="category-4" />
    <Avatar name="Peter Piper" color="category-5" />
    <Avatar name="Peter Piper" color="category-6" />
    <Avatar name="Peter Piper" color="category-7" />
    <Avatar name="Peter Piper" color="category-8" />
    <Avatar name="Peter Piper" color="category-9" />
    <Avatar name="Peter Piper" color="category-10" />
    <Avatar name="Peter Piper" color="category-11" />
    <Avatar name="Peter Piper" color="category-12" />
    <Avatar name="Peter Piper" color="category-13" />
    <Avatar name="Peter Piper" color="category-14" />
    <Avatar name="Peter Piper" color="category-15" />
    <Avatar name="Peter Piper" color="category-16" />
    <Avatar name="Peter Piper" color="category-17" />
    <Avatar name="Peter Piper" color="category-18" />
    <Avatar name="Peter Piper" color="category-19" />
    <Avatar name="Peter Piper" color="category-20" />
  </QAContainer>
);

AllVariantsGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};

export const AvatarGroupGrid: StoryFn<QAContainerProps> = (props) => (
  <QAContainer height={600} width={1000} cols={1} itemPadding={12} {...props}>
    {/* Within max: renders every Avatar, no overflow */}
    <AvatarGroup max={5}>
      <Avatar name="Alex Brailescu" src={persona1} />
      <Avatar name="Peter Piper" color="category-2" />
      <Avatar name="John Doe" color="category-3" />
    </AvatarGroup>

    {/* Exceeds max: default overflow indicator */}
    <AvatarGroup max={3}>
      <Avatar name="Alex Brailescu" src={persona1} />
      <Avatar name="Peter Piper" color="category-2" />
      <Avatar name="John Doe" color="category-3" />
      <Avatar name="Jane Doe" color="category-4" />
      <Avatar name="Lizzy Lee" color="category-5" />
    </AvatarGroup>

    {/* Overlap scales with size */}
    <AvatarGroup max={3} size={1}>
      <Avatar name="Alex Brailescu" src={persona1} />
      <Avatar name="Peter Piper" color="category-2" />
      <Avatar name="John Doe" color="category-3" />
      <Avatar name="Jane Doe" color="category-4" />
    </AvatarGroup>
    <AvatarGroup max={3} size={2}>
      <Avatar name="Alex Brailescu" src={persona1} />
      <Avatar name="Peter Piper" color="category-2" />
      <Avatar name="John Doe" color="category-3" />
      <Avatar name="Jane Doe" color="category-4" />
    </AvatarGroup>
    <AvatarGroup max={3} size={4}>
      <Avatar name="Alex Brailescu" src={persona1} />
      <Avatar name="Peter Piper" color="category-2" />
      <Avatar name="John Doe" color="category-3" />
      <Avatar name="Jane Doe" color="category-4" />
    </AvatarGroup>

    {/* Per-Avatar size override is preserved */}
    <AvatarGroup max={3} size={3}>
      <Avatar name="Alex Brailescu" src={persona1} />
      <Avatar name="Peter Piper" color="category-2" size={1} />
      <Avatar name="John Doe" color="category-3" />
    </AvatarGroup>

    {/* Custom overflow via renderOverflow */}
    <AvatarGroup
      max={2}
      size={3}
      renderOverflow={({ count, size }) => (
        <Avatar color="category-7" size={size} name={`${count} more`}>
          {`+${count}`}
        </Avatar>
      )}
    >
      <Avatar name="Alex Brailescu" src={persona1} />
      <Avatar name="Peter Piper" color="category-2" />
      <Avatar name="John Doe" color="category-3" />
      <Avatar name="Jane Doe" color="category-4" />
    </AvatarGroup>
  </QAContainer>
);

AvatarGroupGrid.parameters = {
  chromatic: {
    disableSnapshot: false,
  },
};
