import { H2, Spinner, StackLayout, Text } from "@salt-ds/core";
import { ColorBlock } from "docs/components/ColorBlock";
import { useEffect, useState } from "react";
import { Table } from "../mdx/table";
import styles from "./AccordianView.module.css";

type CssVariableData = Record<string, string>;

const foundationColors = [
  "black",
  "white",
  "red",
  "orange",
  "green",
  "teal",
  "blue",
  "purple",
  "gray",
];

const categoricalColors = [
  "cobalt",
  "cider",
  "plum",
  "aqua",
  "slate",
  "rose",
  "olive",
  "salmon",
  "indigo",
  "jade",
  "citrine",
  "autumn",
  "lavender",
  "ocean",
  "smoke",
  "fuchsia",
  "lime",
  "fur",
  "violet",
  "forest",
];

const ColorTable = ({ data }: { data: CssVariableData }) => {
  return (
    <Table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.viewColumn}>Preview</th>
          <th>Name</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(data).map(([name, value]) => (
          <tr key={name}>
            <td className={styles.viewColumn}>
              <ColorBlock hideToken colorVar={name} />
            </td>
            <td>
              <Text styleAs="code">{name}</Text>
            </td>
            <td>
              <Text styleAs="code">{value}</Text>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export const FoundationColorView = () => {
  const [foundationData, setFoundationData] = useState<CssVariableData | null>(
    null
  );
  const [categoricalData, setCategoricalData] =
    useState<CssVariableData | null>(null);

  useEffect(() => {
    const fetchJsonData = () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const data = require("./cssFoundations.json") as CssVariableData;
      const colorKeys = Object.keys(data).filter((x) =>
        new RegExp(`^--salt-color-\\w+(-\\d+)?$`).test(x)
      );
      console.log({ data, colorKeys });

      const foundationRegex = new RegExp(foundationColors.join("|"));
      setFoundationData(
        colorKeys
          .filter((x) => foundationRegex.test(x))
          .reduce<CssVariableData>((prev, current) => {
            prev[current] = data[current];
            return prev;
          }, {})
      );
      const categoricalRegex = new RegExp(categoricalColors.join("|"));
      setCategoricalData(
        colorKeys
          .filter((x) => categoricalRegex.test(x))
          .reduce<CssVariableData>((prev, current) => {
            prev[current] = data[current];
            return prev;
          }, {})
      );
    };

    void fetchJsonData();
  }, []);

  if (foundationData === null || categoricalData === null) {
    return <Spinner />;
  }

  return (
    <StackLayout>
      <H2>Foundation</H2>
      <ColorTable data={foundationData} />
      <H2>Categorical</H2>
      <ColorTable data={categoricalData} />
    </StackLayout>
  );
};
