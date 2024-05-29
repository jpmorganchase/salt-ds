import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionPanel,
  Banner,
  BannerContent,
  Button,
  Link,
  Spinner,
  Tooltip,
} from "@salt-ds/core";
import { ColorBlock } from "docs/components/ColorBlock";
import { FontSizeBlock } from "docs/components/FontSizeBlock";
import { FontWeightBlock } from "docs/components/FontWeightBlock";
import { CursorBlock } from "docs/components/CursorBlock";
import { LetterSpacingBlock } from "docs/components/LetterSpacingBlock";
import { LineBlock } from "docs/components/LineBlock";
import { TextBlock } from "docs/components/TextBlock";
import { OutlineBlock } from "docs/components/OutlineBlock";
import { ShadowBlockCell } from "docs/components/ShadowBlock";
import { Table } from "../mdx/table";
import { Heading4 } from "../mdx/h4";
import styles from "./AccordianView.module.css";
import chars from "./descriptions";
import { CopyIcon } from "@salt-ds/icons";

type CssVariableData = {
  [key: string]: string;
};

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

const BlockView: React.FC<{ name: string }> = ({ name }) => {
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
  const textField = document.createElement("textarea");
  textField.innerText = text;
  document.body.appendChild(textField);
  textField.select();
  document.execCommand("copy");
  textField.remove();
};

export const AccordionView: React.FC<{ value: string }> = ({ value }) => {
  const [cssVariablesData, setCssVariablesData] =
    useState<CssVariableData | null>(null);

  useEffect(() => {
    const fetchJsonData = async () => {
      try {
        const data = require("./cssCharacteristics.json");
        setCssVariablesData(data);
      } catch (err) {
        <Banner>
          <BannerContent>Failed to load characteristic data</BannerContent>
        </Banner>;
      }
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
      if (match && match[1]) {
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
            <h3> {groupName.charAt(0).toUpperCase() + groupName.slice(1)}</h3>
          </AccordionHeader>
          <AccordionPanel>
            <p className={styles.description}>
              {
                chars.find((obj: { key: string }) => obj.key === groupName)
                  ?.value
              }
            </p>

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
                      <BlockView name={name} />
                    </td>
                    <td>
                      <Tooltip
                        className={styles.tooltip}
                        content={
                          <>
                            {" "}
                            <BlockView name={name} />
                          </>
                        }
                        onOpenChange={function _l() {}}
                      >
                        <Link className={styles.tooltip}> {name}</Link>
                      </Tooltip>

                      <div className={styles.hideView}>
                        {name}{" "}
                        <Button
                          className={styles.alignButton}
                          variant="secondary"
                          onClick={() => handleCopyToClipboard(name)}
                          aria-label="Copy to clipboard"
                        >
                          <CopyIcon />
                        </Button>{" "}
                      </div>
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
