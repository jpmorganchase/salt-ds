import {Meta, StoryFn} from "@storybook/react";
import {
  TokenizedInputNext
} from "../../src/tokenized-input-next/TokenizedInputNext";
import {TokenizedInput} from "../../src";

export default {
  title: "Lab/Tokenized Input Next",
  component: TokenizedInputNext,
} as Meta<typeof TokenizedInputNext>;


export const Default: StoryFn<typeof TokenizedInput> = () => {
  const handleChange = (selectedItems: unknown) => {
    console.log("selection changed", selectedItems);
  };
  return (
    // Background color for debug purposes only
    <div
      style={{
        // background: "aliceblue",
        // width: "calc(100vw - 40px)",
        // height: "50vh",
        // display: "flex",
        // justifyContent: "center",
      }}
    >
      <TokenizedInputNext
        onChange={handleChange}
        style={{ width: 292 }}
        initialSelectedItems={[
          "",
          "Tokyo",
          "Delhi",
          "Shanghai",
          "São Paulo",
          "Taumatawhakatangihangakoauauotamateaturipukakapikimaungahoronukupokaiwhenuakitanatahu",
        ]}
      />
    </div>
  );
};
export const Controlled: StoryFn<typeof TokenizedInputNext> = () => {
  return <TokenizedInputNext style={{ width: '250px', maxWidth: '250px'}}></TokenizedInputNext>
}
