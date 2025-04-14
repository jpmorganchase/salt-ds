import {
  Accordion,
  AccordionHeader,
  AccordionPanel,
  Button,
  SaltProvider,
  Spinner,
  Text,
} from "@salt-ds/core";
import { CopyIcon } from "@salt-ds/icons";
import { type FC, useEffect, useState } from "react";
import { Table } from "../mdx/table";
import styles from "./AccordionView.module.css";
import chars from "./descriptions";
import { ColorBlock } from "./style-blocks/ColorBlock";
import { CursorBlock } from "./style-blocks/CursorBlock";
import { FontSizeBlock } from "./style-blocks/FontSizeBlock";
import { FontWeightBlock } from "./style-blocks/FontWeightBlock";
import { LetterSpacingBlock } from "./style-blocks/LetterSpacingBlock";
import { LineBlock } from "./style-blocks/LineBlock";
import { OutlineBlock } from "./style-blocks/OutlineBlock";
import { ShadowBlockCell } from "./style-blocks/ShadowBlock";
import { TextBlock } from "./style-blocks/TextBlock";

type CssVariableData = {
  [key: string]: string;
};

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

const BlockView: FC<{ name: string }> = ({ name }) => {
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

const handleCopyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).catch(() => {});
};

export const AccordionView: FC<{ value: string }> = ({ value }) => {
  const [cssVariablesData, setCssVariablesData] =
    useState<CssVariableData | null>(null);

  useEffect(() => {
    const fetchJsonData = async () => {
      const data = await import("./cssCharacteristics.json");
      setCssVariablesData(data.default);
    };

    fetchJsonData();
  }, []);

  if (!cssVariablesData) {
    return (
      <Spinner
        className={styles.loading}
        aria-label="loading"
        role="status"
        size="large"
      />
    );
  }

  const groupByType = (data: CssVariableData) => {
    const groupedData: { [key: string]: CssVariableData } = {};

    const regex = /--salt-(\w+)/;

    Object.entries(data).forEach(([name, value]) => {
      const match = regex.exec(name);
      if (match?.[1]) {
        const groupName = match[1];
        if (!groupedData[groupName]) {
          groupedData[groupName] = {};
        }
        groupedData[groupName][name] = value;
      }
    });

    return groupedData;
  };

  const groupedData = groupByType(cssVariablesData);

  return (
    <div>
      {Object.entries(groupedData).map(([groupName, groupData]) => (
        <Accordion key={groupName} value={groupName}>
          <AccordionHeader>
            <h3 className={styles.heading}>
              {" "}
              {groupName.charAt(0).toUpperCase() + groupName.slice(1)}
            </h3>
          </AccordionHeader>
          <AccordionPanel>
            <Text className={styles.description}>
              {
                chars.find((obj: { key: string }) => obj.key === groupName)
                  ?.value
              }
            </Text>

            <Table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.viewColumn}>View</th>
                  <th>Name</th>
                  <th> Default Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupData).map(([name, value]) => (
                  <tr key={name}>
                    <td className={styles.viewColumn}>
                      <SaltProvider theme="">
                        <BlockView name={name} />
                      </SaltProvider>
                    </td>
                    <td>
                      {name}&nbsp;
                      <Button
                        className={styles.alignButton}
                        sentiment="neutral"
                        appearance="transparent"
                        onClick={() => handleCopyToClipboard(name)}
                        aria-label="Copy to clipboard"
                      >
                        <CopyIcon />
                      </Button>
                    </td>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </AccordionPanel>
        </Accordion>
      ))}
    </div>
  );
};

export default AccordionView;
