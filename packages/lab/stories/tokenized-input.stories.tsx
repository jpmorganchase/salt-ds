import { TokenizedInput } from "@brandname/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Lab/Tokenized Input",
  component: TokenizedInput,
} as ComponentMeta<typeof TokenizedInput>;

export const Default: ComponentStory<typeof TokenizedInput> = () => {
  const handleChange = (selectedItems: unknown) => {
    console.log("selection changed", selectedItems);
  };
  return (
    // Background color for debug purposes only
    <div style={{ background: "aliceblue", width: 300 }}>
      <TokenizedInput
        onChange={handleChange}
        style={{ maxWidth: 292 }}
        initialSelectedItems={[
          "abc",
          "defghi",
          "jklm",
          "nopqrstu",
          "vwexyz",
          "very looooooooooong looooooooooong long pill",
        ]}
      />
    </div>
  );
};
