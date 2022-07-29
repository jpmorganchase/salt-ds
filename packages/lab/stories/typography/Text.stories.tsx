import { ComponentMeta, ComponentStory } from "@storybook/react";

import { Text } from "@jpmorganchase/uitk-lab";

export default {
  title: "Lab/Typography",
  component: Text,
} as ComponentMeta<typeof Text>;

//********** Div ***********/

const TextExample: ComponentStory<typeof Text> = () => {
  return (
    <>
      <Text>Text component - This is an example of text content.</Text>
      <Text>
        Text component
        <strong> emphasis strong</strong>
      </Text>
      <Text>
        Text component
        <small> emphasis small</small>
      </Text>
    </>
  );
};

export const TextComponent = TextExample.bind({});
