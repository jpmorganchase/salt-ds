import { AudioPlayer } from "@salt-ds/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Lab/AudioPlayer",
  component: AudioPlayer,
} as ComponentMeta<typeof AudioPlayer>;

export const Default: ComponentStory<typeof AudioPlayer> = () => {
  return <AudioPlayer title="title" src="" />;
};
