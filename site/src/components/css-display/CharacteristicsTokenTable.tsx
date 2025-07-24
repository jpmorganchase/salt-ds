import {
  FlowLayout,
  SaltProvider,
  SaltProviderNext,
  Spinner,
  StackLayout,
} from "@salt-ds/core";
import { useEffect, useState } from "react";
import { CopyToClipboard } from "../copy-to-clipboard";
import { Code } from "../mdx/code";
import { Table, Thead, Tr } from "../mdx/table";
import { BlockView } from "./BlockView";
import styles from "./CharacteristicsTokenTable.module.css";

const groupByType = (data: CssVariableData) => {
  const groupedData: { [key: string]: CssVariableData } = {};

  const regex = /--salt-(\w+)/;

  for (const [name, value] of Object.entries(data)) {
    const match = regex.exec(name);
    if (match?.[1]) {
      const groupName = match[1];
      if (!groupedData[groupName]) {
        groupedData[groupName] = {};
      }
      groupedData[groupName][name] = value;
    }
  }

  return groupedData;
};

type CssVariableData = {
  [key: string]: string;
};

export const CharacteristicsTokenTable = ({
  group,
  themeNext,
}: {
  group: string;
  themeNext: boolean;
}) => {
  const [cssVariablesData, setCssVariablesData] =
    useState<CssVariableData | null>(null);

  useEffect(() => {
    const fetchJsonData = async () => {
      const data = themeNext
        ? await import("./cssCharacteristics-next.json")
        : await import("./cssCharacteristics.json");
      const groupedData = groupByType(data.default);
      if (groupedData[group]) {
        setCssVariablesData(groupedData[group]);
      } else {
        console.error(`Group "${group}" not found in the data.`);
      }
    };

    fetchJsonData();
  }, [group, themeNext]);

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

  const ChosenProvider = themeNext ? SaltProviderNext : SaltProvider;

  return (
    <Table>
      <Thead>
        <Tr>
          <th>Preview</th>
          <th>Token name & token value</th>
        </Tr>
      </Thead>
      <tbody>
        {Object.entries(cssVariablesData).map(([name, value]) => (
          <Tr key={name}>
            <td>
              <ChosenProvider theme="">
                <BlockView name={name} />
              </ChosenProvider>
            </td>
            <td>
              <StackLayout gap={0} align="start">
                <FlowLayout align="center" gap={1}>
                  <CopyToClipboard value={name} />
                </FlowLayout>
                <Code>{value}</Code>
              </StackLayout>
            </td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
};
