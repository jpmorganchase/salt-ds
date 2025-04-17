import type { FC } from "react";
import { SaltProvider } from "..";
import { ColorBlock } from "./style-blocks/ColorBlock";
import { CursorBlock } from "./style-blocks/CursorBlock";
import { FontSizeBlock } from "./style-blocks/FontSizeBlock";
import { FontWeightBlock } from "./style-blocks/FontWeightBlock";
import { LetterSpacingBlock } from "./style-blocks/LetterSpacingBlock";
import { LineBlock } from "./style-blocks/LineBlock";
import { OutlineBlock } from "./style-blocks/OutlineBlock";
import { ShadowBlockCell } from "./style-blocks/ShadowBlock";
import { TextBlock } from "./style-blocks/TextBlock";
import { SaltProviderNext } from "@salt-ds/core";

const color = [
  "background",
  "foreground",
  "color",
  "palette",
  "borderColor",
  "outlineColor",
  "indicator",
];

const fontSize = ["fontSize", "minHeight"];
const fontWeight = ["fontWeight"];
const cursor = ["cursor"];
const letters = ["letterSpacing"];
const border = ["borderStyle", "borderWidth", "outlineWidth", "outlineStyle"];
const text = ["fontStyle"];
const outline = ["outline"];
const shadow = ["shadow"];
const align = ["textAlign"];
const textDecoration = ["textDecoration"];
const transform = ["textTransform"];
const fontFamily = ["fontFamily"];
const lineHeight = ["lineHeight"];

export const BlockView: FC<{ name: string }> = ({ name }) => {
  switch (true) {
    case color.some((c) => name.includes(c)):
      return <ColorBlock hideToken colorVar={name} />;
    case fontSize.some((fs) => name.includes(fs)):
      return <FontSizeBlock hideToken fontSize={name} />;
    case fontWeight.some((fw) => name.includes(fw)):
      return <FontWeightBlock hideToken fontWeight={name} />;
    case cursor.some((fw) => name.includes(fw)):
      return <CursorBlock hideToken cursor={name} />;
    case letters.some((fw) => name.includes(fw)):
      return <LetterSpacingBlock hideToken letterSpacing={name} />;
    case border.some((fw) => name.includes(fw)):
      return <LineBlock hideToken token={name} lineStyle={name} />;
    case text.some((fw) => name.includes(fw)):
      return <TextBlock fontSize={name} />;
    case outline.some((fw) => name.includes(fw)):
      return <OutlineBlock outline={name} />;
    case shadow.some((fw) => name.includes(fw)):
      return <ShadowBlockCell shadowVar={name} />;
    case align.some((fw) => name.includes(fw)):
      return <TextBlock textAlign={name} />;
    case textDecoration.some((fw) => name.includes(fw)):
      return <TextBlock textDecoration={name} />;
    case transform.some((fw) => name.includes(fw)):
      return <TextBlock textTransform={name} />;
    case fontFamily.some((fw) => name.includes(fw)):
      return <TextBlock fontFamily={name} />;
    case lineHeight.some((fw) => name.includes(fw)):
      return <TextBlock lineHeight={name} />;
    default:
      return <p>{name}</p>;
  }
};

export const LegacyThemedBlockView: FC<{ name: string }> = ({ name }) => {
  return (
    <SaltProvider>
      <BlockView name={name} />
    </SaltProvider>
  );
};

export const NextThemedBlockView: FC<{ name: string }> = ({ name }) => {
  return (
    <SaltProviderNext>
      <BlockView name={name} />
    </SaltProviderNext>
  );
};
