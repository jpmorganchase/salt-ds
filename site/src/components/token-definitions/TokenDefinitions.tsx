import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionGroup,
  AccordionHeader,
  AccordionPanel,
  Banner,
  BannerContent,
  Button,
  Link,
  Spinner,
  Tooltip,
} from "@salt-ds/core";
import { CopyIcon } from "@salt-ds/icons";
import { Table } from "../mdx/table";
import styles from "./TokenDefinitions.module.css";
import definitions from "./definitions";
import { BlockView } from "./BlockView";

type CssVariableData = Record<string, string>;

const handleCopyToClipboard = (text: string) => {
  const textField = document.createElement("textarea");
  textField.innerText = text;
  document.body.appendChild(textField);
  textField.select();
  document.execCommand("copy");
  textField.remove();
};

function UsageAccordion(props: {
  groupName: string;
  groupData: CssVariableData;
}) {
  const { groupName, groupData } = props;
  return (
    <Accordion
      key={`${groupName}-usage`}
      value={`${groupName}-usage`}
      className={styles.usageAccordion}
    >
      <AccordionHeader>
        <h3>Usage</h3>
      </AccordionHeader>
      <AccordionPanel>
        <Table className={styles.table}>
          <thead>
            <tr>
              <th>Component name</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(groupData.usage).map((component) => {
              return (
                <tr key={component}>
                  <td>{component}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </AccordionPanel>
    </Accordion>
  );
}

export const TokenDefinitions: React.FC = () => {
  const [cssVariablesData, setCssVariablesData] =
    useState<CssVariableData | null>(null);
  const [usageData, setUsageData] = useState<CssVariableData | null>(null);

  useEffect(() => {
    const fetchJsonData = () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
        const tokenData: CssVariableData | null = require("./cssVariables.json");
        setCssVariablesData(tokenData);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
        const usageData: CssVariableData | null = require("./usage.json");
        setUsageData(usageData);
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

  const groupByType = () => {
    const groupedData: Record<string, CssVariableData> = {};

    const regex = /--salt-(\w+)/;

    Object.entries(cssVariablesData).forEach(([name, value]) => {
      const match = regex.exec(name);
      if (match?.[1]) {
        const groupName = match[1];
        if (!groupedData[groupName]) {
          groupedData[groupName] = {};
        }
        groupedData[groupName][name] = value;
      }
    });

    usageData &&
      Object.entries(usageData).forEach(([name, components]) => {
        if (groupedData[name]) {
          groupedData[name].usage = components;
        }
      });

    return groupedData;
  };

  const groupedData = groupByType();

  return (
    <AccordionGroup>
      {Object.entries(groupedData).map(([groupName, groupData]) => (
        <Accordion key={groupName} value={groupName}>
          <AccordionHeader>
            <h3>{groupName.charAt(0).toUpperCase() + groupName.slice(1)}</h3>
          </AccordionHeader>
          <AccordionPanel>
            <p className={styles.description}>
              {
                definitions.find(
                  (obj: { key: string }) => obj.key === groupName
                )?.value
              }
            </p>
            <Table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.viewColumn}>View</th>
                  <th>Name</th>
                  <th>Default Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupData).map(([name, value]) => (
                  <>
                    {name !== "usage" && (
                      <tr key={name}>
                        <td className={styles.viewColumn}>
                          <BlockView name={name} />
                        </td>
                        <td>
                          <Tooltip
                            className={styles.tooltip}
                            content={<BlockView name={name} />}
                          >
                            <Link className={styles.tooltip}> {name}</Link>
                          </Tooltip>
                          <div className={styles.hideView}>
                            {name}
                            <Button
                              aria-label="Copy to clipboard"
                              className={styles.alignButton}
                              onClick={() => handleCopyToClipboard(name)}
                              variant="secondary"
                            >
                              <CopyIcon />
                            </Button>
                          </div>
                        </td>
                        <td>{value}</td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </Table>
            {groupData.usage && (
              <UsageAccordion groupName={groupName} groupData={groupData} />
            )}
          </AccordionPanel>
        </Accordion>
      ))}
    </AccordionGroup>
  );
};

export default TokenDefinitions;
