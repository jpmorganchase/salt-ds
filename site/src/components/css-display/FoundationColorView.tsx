import { SaltProvider, Spinner, Text } from "@salt-ds/core";
import { useEffect, useState } from "react";
import { Table } from "../mdx/table";
import styles from "./AccordionView.module.css";
import { ColorBlock } from "./style-blocks/ColorBlock";

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
              <SaltProvider theme="">
                <ColorBlock hideToken colorVar={name} />
              </SaltProvider>
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

export const FoundationColorView = ({
  group,
}: {
  group: "foundation" | "categorical";
}) => {
  const [data, setData] = useState<CssVariableData | null>(null);

  useEffect(() => {
    const fetchJsonData = async () => {
      const data = (await import("./cssFoundations.json"))
        .default as CssVariableData;
      const colorKeys = Object.keys(data).filter((x) =>
        /^--salt-color-\w+(-\d+)?$/.test(x),
      );
      const regex = new RegExp(
        (group === "categorical" ? categoricalColors : foundationColors).join(
          "|",
        ),
      );
      setData(
        colorKeys
          .filter((x) => regex.test(x))
          .reduce<CssVariableData>((prev, current) => {
            prev[current] = data[current];
            return prev;
          }, {}),
      );
    };

    fetchJsonData();
  }, [group]);

  if (data === null) {
    return <Spinner />;
  }

  return <ColorTable data={data} />;
};
