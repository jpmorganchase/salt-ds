import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionPanel,
  Banner,
  BannerContent,
  capitalize,
  Spinner,
} from "@salt-ds/core";
import { TokenTable } from "./TokenTable";
import { tokenDescriptions, groupByType } from "./utils";

import styles from "./CSSVariables.module.css";

export type CSSVariableData = Record<string, string>;

export const CSSVariables: React.FC<{
  value: "characteristics" | "deprecated" | "foundations" | "palette";
}> = ({ value }) => {
  const [tokenData, setTokenData] = useState<CSSVariableData | null>(null);

  useEffect(() => {
    const fetchJsonData = async () => {
      try {
        const data =
          (await require(`./json/${value}Variables.json`)) as CSSVariableData;
        setTokenData(data);
      } catch (err) {
        <Banner>
          <BannerContent>Failed to load tokens.</BannerContent>
        </Banner>;
      }
    };

    fetchJsonData();
  }, [value]);

  if (!tokenData) {
    return (
      <Spinner
        aria-label="loading"
        className={styles.loading}
        role="status"
        size="large"
      />
    );
  }

  let groupedTokens;

  if (value === "palette") {
    groupedTokens = groupByType(tokenData, /--salt-palette-(\w+)/);
  } else {
    groupedTokens = groupByType(tokenData, /--salt-(\w+)/);
  }

  return (
    <>
      {Object.entries(groupedTokens).map(([groupName, groupData]) => {
        const tokenValue = tokenDescriptions.find(
          (obj: { key: string }) => obj.key === groupName
        )?.value;
        return (
          <Accordion key={groupName} value={groupName}>
            <AccordionHeader>
              <h3>{capitalize(groupName)}</h3>
            </AccordionHeader>
            <AccordionPanel>
              {value === "characteristics" && tokenValue && (
                <p className={styles.description}>{tokenValue}</p>
              )}
              <TokenTable data={groupData} />
            </AccordionPanel>
          </Accordion>
        );
      })}
    </>
  );
};

export default CSSVariables;
