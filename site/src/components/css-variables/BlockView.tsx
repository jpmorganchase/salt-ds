import {
  ColorBlock,
  FontSizeBlock,
  FontWeightBlock,
  CursorBlock,
  LetterSpacingBlock,
  LineBlock,
  TextBlock,
  OutlineBlock,
  ShadowBlockCell,
} from "docs/components";

const color: string[] = new Array(
  "background",
  "foreground",
  "color",
  "palette",
  "borderColor",
  "outlineColor",
  "indicator"
);

const fontSize: string[] = new Array("fontSize", "minHeight");
const fontWeight: string[] = new Array("fontWeight");
const cursor: string[] = new Array("cursor");
const letters: string[] = new Array("letterSpacing");
const border: string[] = new Array(
  "borderStyle",
  "borderWidth",
  "outlineWidth",
  "outlineStyle"
);
const text: string[] = new Array("fontStyle");
const outline: string[] = new Array("outline");
const shadow: string[] = new Array("shadow");
const align: string[] = new Array("textAlign");
const textDecoration: string[] = new Array("textDecoration");
const transform: string[] = new Array("textTransform");
const fontFamily: string[] = new Array("fontFamily");
const lineHeight: string[] = new Array("lineHeight");

export const BlockView: React.FC<{ name: string }> = ({ name }) => {
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
